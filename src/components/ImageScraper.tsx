// src/components/ImageScraper.tsx

'use client'

// Imports
import { useState, useEffect } from 'react'
import ImageGrid from '@/components/ImageGrid'
import EnlargedImageModal from '@/components/EnlargedImageModal'
import { useImageScraper } from '@/hooks/useImageScraper'
import { useEnlargedImage } from '@/hooks/useEnlargedImage'

export default function ImageScraper() {
	const [query, setQuery] = useState('')
	const [filter, setFilter] = useState('')
	const { images, loading, error, fetchAndSetImages, handleScrape, handleDelete } = useImageScraper()
	const { enlargedImage, handleEnlarge, handleCloseEnlarged, handlePrev, handleNext } =
		useEnlargedImage(images)

	// useEffect(() => {
	// 	fetchAndSetImages()
	// 	const interval = setInterval(fetchAndSetImages, 5 * 1000)
	// 	return () => clearInterval(interval)
	// }, [fetchAndSetImages])

	return (
		<div className="container mx-auto p-4">
			<div className="sticky top-0 z-50 bg-background">
				<h1 className="text-2xl font-bold mb-4">Image Scraper</h1>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Enter search query"
					className="border border-gray-300 rounded p-2 mb-4 w-full"
				/>
				<button
					onClick={() => handleScrape(query)}
					disabled={loading}
					className="bg-blue-500 text-white rounded p-2 disabled:bg-blue-300">
					{loading ? 'Scraping...' : 'Scrape Images'}
				</button>
				{/* <input
					type="text"
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					placeholder="Filter by folder"
					className="border border-gray-300 rounded p-2 mb-4 w-full"
				/> */}
				{error && <div className="text-red-500 mt-4">{error}</div>}
			</div>
			{/* <ImageGrid images={images} filter={filter} onDelete={handleDelete} onEnlarge={handleEnlarge} /> */}
			{enlargedImage && (
				<EnlargedImageModal
					src={enlargedImage.src}
					onClose={handleCloseEnlarged}
					onPrev={handlePrev}
					onNext={handleNext}
				/>
			)}
		</div>
	)
}
