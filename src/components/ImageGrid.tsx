// src/components/ImageGrid.tsx

'use client'

import { memo } from 'react'
import Image from 'next/image'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

interface ImageGridProps {
	images: { [key: string]: string[] }
	filter: string
	onDelete: (src: string, folder: string, index: number) => void
	onEnlarge: (src: string, folder: string, index: number) => void
}

const ImageGrid = memo(({ images, filter, onDelete, onEnlarge }: ImageGridProps) => {
	const filteredImages = Object.keys(images)
		.filter((folder) => folder.includes(filter))
		.reduce((acc, key) => {
			acc[key] = images[key]
			return acc
		}, {} as { [key: string]: string[] })

	return (
		<div className="flex-grow overflow-hidden">
			<AutoSizer>
				{({ height, width }: { height: number; width: number }) => (
					<List
						height={height}
						itemCount={Object.keys(filteredImages).length}
						itemSize={400}
						width={width}>
						{({ index, style }: { index: number; style: React.CSSProperties }) => {
							const folder = Object.keys(filteredImages)[index]
							return (
								<div key={folder} style={style}>
									<h2 className="text-xl font-semibold mt-4 mb-2">{folder}</h2>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[calc(100vh-150px)] overflow-auto">
										{filteredImages[folder].map((src, imgIndex) => (
											<div
												key={src}
												className="relative h-full w-full flex rounded-lg bg-foreground items-center justify-center self-center">
												<Image
													src={src}
													alt={`Scraped image ${imgIndex}`}
													width={250}
													height={250}
													className="w-full h-fit cursor-pointer object-cover shadow-md rounded-sm"
													onClick={() => onEnlarge(src, folder, imgIndex)}
												/>
												<button
													onClick={() => onDelete(src, folder, imgIndex)}
													className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
													X
												</button>
											</div>
										))}
									</div>
								</div>
							)
						}}
					</List>
				)}
			</AutoSizer>
		</div>
	)
})

ImageGrid.displayName = 'ImageGrid'
export default ImageGrid
