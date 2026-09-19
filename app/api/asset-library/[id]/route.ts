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
    const body = await req.json()
    const { title, category, fileUrl, tags } = body

    const item = await prisma.assetLibraryItem.update({
      where: { id },
      data: {
        title,
        category,
        fileUrl,
        tags
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating asset item:', error)
    return NextResponse.json({ error: 'Failed to update asset item' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.assetLibraryItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting asset item:', error)
    return NextResponse.json({ error: 'Failed to delete asset item' }, { status: 500 })
  }
}
