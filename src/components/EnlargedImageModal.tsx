// src/components/EnlargedImageModal.tsx

'use client'

// Imports
import { memo, MouseEvent } from 'react'
import Image from 'next/image'

interface EnlargedImageModalProps {
	src: string
	onClose: () => void
	onPrev: (ev: MouseEvent<HTMLButtonElement>) => void
	onNext: (ev: MouseEvent<HTMLButtonElement>) => void
}

const EnlargedImageModal = memo(({ src, onClose, onPrev, onNext }: EnlargedImageModalProps) => (
	<div
		className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
		onClick={onClose}>
		<div className="relative bg-white p-4 rounded-lg shadow-lg max-w-[95vw] max-h-[95vh]">
			<button
				onClick={onPrev}
				className="absolute left-1/2 transform -translate-x-full bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center">
				&lt;
			</button>
			<button
				onClick={onNext}
				className="absolute right-1/2 transform translate-x-full bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center">
				&gt;
			</button>
			<Image
				src={src}
				alt="Enlarged image"
				width={1024}
				height={1024}
				className="object-contain max-w-[90vw] max-h-[90vh]"
			/>
		</div>
	</div>
))

EnlargedImageModal.displayName = 'EnlargedImageModal'
export default EnlargedImageModal
