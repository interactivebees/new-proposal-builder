import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.contentLibraryItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const body = await req.json()
    const { title, category, content, tags } = body

    const item = await prisma.contentLibraryItem.update({
      where: { id },
      data: {
        title,
        category,
        content,
        tags
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating content item:', error)
    return NextResponse.json({ error: 'Failed to update content item' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.contentLibraryItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content item:', error)
    return NextResponse.json({ error: 'Failed to delete content item' }, { status: 500 })
  }
}
