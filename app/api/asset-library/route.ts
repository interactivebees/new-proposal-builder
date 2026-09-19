import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.assetLibraryItem.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: { uploader: { select: { name: true } } }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching asset library:', error)
    return NextResponse.json({ error: 'Failed to fetch asset library' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, category, fileUrl, fileSize, fileType, tags } = body

    if (!title || !category || !fileUrl) {
      return NextResponse.json({ error: 'Title, category, and file URL are required' }, { status: 400 })
    }

    const item = await prisma.assetLibraryItem.create({
      data: {
        title,
        category,
        fileUrl,
        fileSize: fileSize || 1024,
        fileType: fileType || 'image/png',
        tags,
        uploadedBy: session.user.id
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating asset item:', error)
    return NextResponse.json({ error: 'Failed to create asset item' }, { status: 500 })
  }
}
