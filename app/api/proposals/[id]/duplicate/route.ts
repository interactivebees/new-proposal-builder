import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/proposals/[id]/duplicate - Duplicate proposal for new client
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SALES_TEAM and OWNER can duplicate proposals
    if (session.user.role === 'BUSINESS_EXPERT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { clientName, clientCompany, clientEmail, clientAddress, clientLogoUrl, title } = body

    // Get original proposal
    const originalProposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        pricingItems: true
      }
    })

    if (!originalProposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Check access to original proposal
    const hasAccess = 
      originalProposal.createdBy === session.user.id ||
      session.user.role === 'OWNER'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create new proposal with same content but new client info
    const newProposal = await prisma.proposal.create({
      data: {
        title: title || `${originalProposal.title} (Copy)`,
        templateId: originalProposal.templateId,
        content: originalProposal.content as any,
        clientName: clientName || null,
        clientCompany: clientCompany || null,
        clientEmail: clientEmail || null,
        clientAddress: clientAddress || null,
        clientLogoUrl: clientLogoUrl || null,
        status: 'DRAFT',
        createdBy: session.user.id
      }
    })

    // Duplicate pricing items
    if (originalProposal.pricingItems.length > 0) {
      await prisma.pricingItem.createMany({
        data: originalProposal.pricingItems.map((item: any) => ({
          proposalId: newProposal.id,
          serviceDescription: item.serviceDescription,
          cost: item.cost,
          frequency: item.frequency,
          orderIndex: item.orderIndex
        }))
      })
    }

    // Fetch the complete new proposal
    const completeProposal = await prisma.proposal.findUnique({
      where: { id: newProposal.id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        pricingItems: true
      }
    })

    return NextResponse.json(completeProposal, { status: 201 })
  } catch (error) {
    console.error('Error duplicating proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
