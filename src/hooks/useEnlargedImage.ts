// src/hooks/useEnlargedImage.ts

import { useState, useCallback, MouseEvent } from 'react'

interface EnlargedImageState {
	src: string
	folder: string
	index: number
}

export const useEnlargedImage = (images: { [key: string]: string[] }) => {
	const [enlargedImage, setEnlargedImage] = useState<EnlargedImageState | null>(null)

	const handleEnlarge = useCallback((src: string, folder: string, index: number) => {
		setEnlargedImage({ src, folder, index })
	}, [])

	const handleCloseEnlarged = useCallback(() => {
		setEnlargedImage(null)
	}, [])

	const handlePrev = useCallback(
		(ev: MouseEvent<HTMLButtonElement>) => {
			ev.stopPropagation()
			if (enlargedImage) {
				const { folder, index } = enlargedImage
				const newIndex = (index - 1 + images[folder].length) % images[folder].length
				setEnlargedImage({ src: images[folder][newIndex], folder, index: newIndex })
			}
		},
		[enlargedImage, images]
	)

	const handleNext = useCallback(
		(ev: MouseEvent<HTMLButtonElement>) => {
			ev.stopPropagation()
			if (enlargedImage) {
				const { folder, index } = enlargedImage
				const newIndex = (index + 1) % images[folder].length
				setEnlargedImage({ src: images[folder][newIndex], folder, index: newIndex })
			}
		},
		[enlargedImage, images]
	)

	return {
		enlargedImage,
		handleEnlarge,
		handleCloseEnlarged,
		handlePrev,
		handleNext,
	}
}
