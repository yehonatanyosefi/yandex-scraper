// src/hooks/useImageScraper.ts

import { useState, useCallback } from 'react'

interface ImageResponse {
	images: string[]
}

export const useImageScraper = () => {
	const [images, setImages] = useState<{ [key: string]: string[] }>({})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchImages = useCallback(async () => {
		try {
			const response = await fetch('/api/list-images')
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data: ImageResponse = await response.json()
			const categorizedImages: { [key: string]: string[] } = {}

			data.images.forEach((imagePath: string) => {
				const parts = imagePath.split('/')
				const folder = parts[parts.length - 2]
				if (!categorizedImages[folder]) {
					categorizedImages[folder] = []
				}
				categorizedImages[folder].push(imagePath)
			})

			return categorizedImages
		} catch (err) {
			throw err
		}
	}, [])

	const fetchAndSetImages = useCallback(async () => {
		try {
			const categorizedImages = await fetchImages()
			setImages(categorizedImages)
		} catch (err) {
			setError((err as Error).message || 'An unexpected error occurred')
		}
	}, [fetchImages])

	const handleScrape = useCallback(
		async (query: string) => {
			setLoading(true)
			setError(null)

			try {
				const response = await fetch('/api/scrape', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ query }),
				})

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				const data: ImageResponse = await response.json()
				const categorizedImages = { ...images }

				data.images.forEach((imagePath: string) => {
					const parts = imagePath.split('/')
					const folder = parts[parts.length - 2]
					if (!categorizedImages[folder]) {
						categorizedImages[folder] = []
					}
					categorizedImages[folder].push(imagePath)
				})

				setImages(categorizedImages)
			} catch (err) {
				setError((err as Error).message || 'An unexpected error occurred')
			} finally {
				setLoading(false)
			}
		},
		[images]
	)

	const handleDelete = useCallback(
		async (src: string, folder: string, index: number) => {
			try {
				const response = await fetch('/api/delete-image', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ src }),
				})

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				const updatedImages = { ...images }
				updatedImages[folder].splice(index, 1)
				setImages(updatedImages)
			} catch (err) {
				setError((err as Error).message || 'An unexpected error occurred')
			}
		},
		[images]
	)

	return {
		images,
		loading,
		error,
		fetchAndSetImages,
		handleScrape,
		handleDelete,
	}
}
