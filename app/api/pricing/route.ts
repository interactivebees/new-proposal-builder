import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const skip = (page - 1) * limit

    const [pricingItems, totalCount] = await Promise.all([
      prisma.pricingItem.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
        include: {
          proposal: { select: { id: true, title: true, clientName: true } }
        }
      }),
      prisma.pricingItem.count()
    ])

    return NextResponse.json({ data: pricingItems, total: totalCount, page, limit })
  } catch (error) {
    console.error('Error fetching pricing items:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing items' }, { status: 500 })
  }
}
