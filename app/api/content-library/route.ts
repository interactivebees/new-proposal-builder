import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.contentLibraryItem.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { creator: { select: { name: true } } }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching content library:', error)
    return NextResponse.json({ error: 'Failed to fetch content library' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, category, content, tags } = body

    if (!title || !category || !content) {
      return NextResponse.json({ error: 'Title, category, and content are required' }, { status: 400 })
    }

    const item = await prisma.contentLibraryItem.create({
      data: {
        title,
        category,
        content,
        tags,
        createdBy: session.user.id
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating content library item:', error)
    return NextResponse.json({ error: 'Failed to create content library item' }, { status: 500 })
  }
}
