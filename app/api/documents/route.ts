import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/documents - List all documents for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }
    if (status) where.status = status

    const documents = await prisma.document.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/documents - Create a new document
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, content, contentJson } = body

    // Count words from HTML content
    const plainText = (content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = plainText ? plainText.split(' ').length : 0

    const document = await prisma.document.create({
      data: {
        title: title || 'Untitled Document',
        content: content || '',
        contentJson: contentJson ? JSON.stringify(contentJson) : null,
        wordCount,
        userId: session.user.id,
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
