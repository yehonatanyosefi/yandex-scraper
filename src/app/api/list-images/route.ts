// src/app/api/list-images/route.ts

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const getAllImages = (dirPath: string, basePath: string): string[] => {
	let results: string[] = []
	const list = fs.readdirSync(dirPath)

	list.forEach((file) => {
		const filePath = path.join(dirPath, file)
		const stat = fs.statSync(filePath)

		if (stat && stat.isDirectory()) {
			results = results.concat(getAllImages(filePath, path.join(basePath, file)))
		} else {
			results.push(path.join(basePath, file).replace(/\\/g, '/'))
		}
	})

	return results
}

export async function GET() {
	try {
		const imagesDir = path.join(process.cwd(), 'public', 'images')
		const images = getAllImages(imagesDir, '/images')
		return NextResponse.json({ images }, { status: 200 })
	} catch (error) {
		console.error('Error listing images:', error)
		return NextResponse.json({ error: (error as Error).message }, { status: 500 })
	}
}
