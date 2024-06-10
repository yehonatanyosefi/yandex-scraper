// src/app/api/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { delay } from './backendUtils'
import { scrapeImagesForQuery } from './scraping'
import path from 'path'

// Function to scrape images for multiple queries
const scrapeImages = async (queries: string[]) => {
	const browser = await puppeteer.launch({ headless: true })
	const page = await browser.newPage()
	const allImageUrls: string[] = []
	const logFilePath = path.join(process.cwd(), 'scrape_log.txt')

	for (let index = 0; index < queries.length; index++) {
		const query = queries[index]
		try {
			console.log(`Scraping query #${index}: ${query}`)
			const imageUrls = await scrapeImagesForQuery(page, query, logFilePath)
			allImageUrls.push(...imageUrls)
			console.log(`Finished scraping for query #${index}: ${query}. Awaiting a bit before next one.`)
		} catch (error) {
			console.error(`!!!Error in query #${index} "${query}":`, error)
			await delay(2000)
		} finally {
			// Small delay between queries to avoid overwhelming the server
			await delay(2000)
		}
	}

	await page.close()
	await browser.close()
	return allImageUrls
}

export async function POST(req: NextRequest) {
	const { query } = await req.json()

	if (!query || typeof query !== 'string') {
		console.error('Query parameter is missing or invalid')
		return NextResponse.json({ error: 'Query is required' }, { status: 400 })
	}

	const queries = query.split(',').map((q) => q.trim())
	console.log(`Starting to scrape queries:`, queries)

	try {
		const images = await scrapeImages(queries)
		return NextResponse.json({ images }, { status: 200 })
	} catch (error) {
		console.error(`Error in scrapeHandler for query "${query}":`, error)
		return NextResponse.json({ error: (error as Error).message }, { status: 500 })
	}
}
