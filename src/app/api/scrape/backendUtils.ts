// src/app/api/scrape/backendUtils.ts

import { Page } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

// Helper function to sanitize file paths
export const sanitizeQuery = (query: string): string => {
	// Define a regex pattern to match invalid file name characters
	const invalidCharacters = /[<>:"\/\\|?*\x00-\x1F]/g
	// Replace invalid characters with an underscore
	return query.replace(invalidCharacters, '')
}

export const downloadImage = async (url: string, filepath: string) => {
	// Fetch the image
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`)
	}

	// Convert the response to an ArrayBuffer and then to a Buffer
	const arrayBuffer = await response.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)

	// Write the buffer to a file
	fs.writeFileSync(filepath, buffer)
}

// Function to add delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Function to handle image extraction errors
export const handleImageError = (error: unknown, imageUrl: string) => {
	if (error instanceof Error) {
		const message = error.message.toLowerCase()
		switch (true) {
			case message.includes('forbidden'):
				console.error('Forbidden')
				break
			case message.includes('expired'):
				console.error('Expired')
				break
			case message.includes('enotfound'):
				console.error('Not Found')
				break
			case message.includes('service unavailable'):
				console.error('Service Unavailable')
				break
			case message.includes('internal server error'):
				console.error('Internal Server Error')
				break
			case message.includes('bad request'):
				console.error('Bad Request')
				break
			case message.includes('econnrefused'):
				console.error('Connection Refused')
				break
			case message.includes('eai_again'):
				console.error('Temporary failure in name resolution')
				break
			case message.includes('etimedout'):
				console.error('Connection Timed Out')
				break
			case message.includes('enetworkdown'):
				console.error('Network Down')
				break
			case message.includes('enetworkunreachable'):
				console.error('Network Unreachable')
				break
			case message.includes('failed'):
				if (message.includes('getaddrinfo eai_again')) {
					console.error('Network error: Temporary failure in name resolution')
				} else if (message.includes('network')) {
					console.error('Network Error')
				} else {
					console.error('Request Failed')
				}
				break
			default:
				console.error(`Image URL "${imageUrl}" Error:`)
				console.error(error.message)
				break
		}
	} else {
		console.error(`Error extracting high-resolution image for "${imageUrl}".`)
		console.error('Unknown Error:', error)
	}
}

// Function to get the next index for image naming
export const getNextIndex = (outputDir: string) => {
	const files = fs.readdirSync(outputDir)
	const indices = files.map((file) => parseInt(path.basename(file, '.jpg'))).filter((num) => !isNaN(num))
	return indices.length > 0 ? Math.max(...indices) + 1 : 0
}

// Custom function to wait for either of the selectors to appear
export const waitForAnySelector = async (page: Page, selectors: string[], options: any = {}) => {
	return new Promise<void>((resolve, reject) => {
		let resolved = false
		const promises = selectors.map((selector) =>
			page
				.waitForSelector(selector, options)
				.then(() => {
					if (!resolved) {
						resolved = true
						resolve()
					}
				})
				.catch(() => {})
		)
		Promise.allSettled(promises).then((results) => {
			if (!resolved) {
				reject(new Error('None of the selectors were found'))
			}
		})
	})
}
