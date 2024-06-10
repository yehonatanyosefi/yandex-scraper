// src/app/api/scrape/scraping.ts

import { Page } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import {
	downloadImage,
	delay,
	handleImageError,
	getNextIndex,
	waitForAnySelector,
	sanitizeQuery,
} from './backendUtils'

// Helper function to add timeout to a promise
const promiseWithTimeout = <T>(promise: Promise<T>, timeout: number): Promise<T> => {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error('Operation timed out'))
		}, timeout)

		promise
			.then((value) => {
				clearTimeout(timer)
				resolve(value)
			})
			.catch((err) => {
				clearTimeout(timer)
				reject(err)
			})
	})
}

// Function to extract and download image URL
export const extractAndDownloadImage = async (
	imageUrl: string,
	outputDir: string,
	nextIndex: number
): Promise<string | null> => {
	try {
		const urlObject = new URL(imageUrl)
		const imgUrl = urlObject.searchParams.get('img_url')

		if (imgUrl) {
			const decodedImgUrl = decodeURIComponent(imgUrl)
			const filepath = path.join(outputDir, `${nextIndex}.jpg`)
			await downloadImage(decodedImgUrl, filepath)
			return `/images/${path.basename(outputDir)}/${nextIndex}.jpg`
		} else {
			console.log('Image URL not found in the query string')
		}
	} catch (error) {
		handleImageError(error, imageUrl)
		return null
	}
	return null
}

// Function to scrape images for a given query
export const scrapeImagesForQuery = async (
	page: Page,
	query: string,
	logFilePath: string
): Promise<string[]> => {
	const sanitizedQuery = sanitizeQuery(query)
	const url = `https://yandex.ru/images/search?text=${encodeURIComponent(sanitizedQuery)}&isize=large`
	const imageUrls: string[] = []

	try {
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
		)
		await page.goto(url, { waitUntil: 'networkidle2', timeout: 60 * 1000 })
		await waitForAnySelector(page, ['.SerpItem a.Link', 'a.ContentImage-Cover'], { timeout: 30 * 1000 })

		const urls = await page.evaluate(() => {
			const links = Array.from(document.querySelectorAll('.SerpItem a.Link'))
			const linksBackup = Array.from(document.querySelectorAll('.ContentImage-Cover'))
			const validLinks = links.length > 0 ? links : linksBackup
			const filteredLinks = validLinks.filter(
				(link) =>
					(link as HTMLAnchorElement).href.includes('pos=') &&
					!(link as HTMLAnchorElement).href.includes('source=related')
			)
			return filteredLinks.map((link) => (link as HTMLAnchorElement).href)
		})

		const outputDir = path.join(process.cwd(), 'public', 'images', sanitizedQuery)

		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}

		let nextIndex = getNextIndex(outputDir)
		const seenDomains = new Set<string>()

		const promises = urls.reduce((acc, url, index) => {
			const domain = new URL(url).hostname
			if (seenDomains.has(domain)) {
				acc.push(delay(200).then(() => extractAndDownloadImage(url, outputDir, nextIndex + index)))
			} else {
				acc.push(extractAndDownloadImage(url, outputDir, nextIndex + index))
			}
			seenDomains.add(domain)
			return acc
		}, [] as Promise<string | null>[])
		try {
			const results = await promiseWithTimeout(Promise.allSettled(promises), 30000)

			results.forEach((result) => {
				if (result.status === 'fulfilled' && result.value) {
					imageUrls.push(result.value)
				} else if (result.status === 'rejected') {
					console.error('Image download failed:', (result as PromiseRejectedResult).reason)
				}
			})
		} catch (error) {
			console.error('TIMEOUT -- Image download failed after 30 seconds.')
		}

		await fs.promises.appendFile(logFilePath, `Completed query: ${sanitizedQuery}\n`)
	} catch (error) {
		console.error(`Error scraping images for "${sanitizedQuery}":`, error)
		await fs.promises.appendFile(logFilePath, `Errored query: ${sanitizedQuery}\n`)
	}

	return imageUrls
}
