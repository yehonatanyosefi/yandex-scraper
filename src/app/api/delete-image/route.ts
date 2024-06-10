// src/app/api/delete-image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
	const { src } = await req.json()

	if (!src || typeof src !== 'string') {
		console.error('Source parameter is missing or invalid')
		return NextResponse.json({ error: 'Source is required' }, { status: 400 })
	}

	try {
		const filePath = path.join(process.cwd(), 'public', src)
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath)
		} else {
			console.error('File does not exist:', filePath)
			return NextResponse.json({ error: 'File does not exist' }, { status: 404 })
		}

		return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 })
	} catch (error) {
		console.error(`Error deleting image "${src}":`, error)
		return NextResponse.json({ error: (error as Error).message }, { status: 500 })
	}
}
