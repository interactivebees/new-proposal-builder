import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch summary of pricing items across active proposals
    const pricingItems = await prisma.pricingItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        proposal: { select: { id: true, title: true, clientName: true } }
      }
    })

    return NextResponse.json(pricingItems)
  } catch (error) {
    console.error('Error fetching pricing items:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing items' }, { status: 500 })
  }
}
