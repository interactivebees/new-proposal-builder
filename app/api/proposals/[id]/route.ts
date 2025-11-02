import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProposalSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.any().optional(),
  clientName: z.string().optional(),
  clientCompany: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientAddress: z.string().optional(),
  clientLogoUrl: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT']).optional()
})

// GET /api/proposals/[id] - Get single proposal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        },
        template: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        pricingItems: {
          orderBy: { orderIndex: 'asc' }
        },
        images: true,
        shares: {
          include: {
            sharedWith: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = 
      proposal.createdBy === session.user.id ||
      session.user.role === 'OWNER' ||
      session.user.role === 'BUSINESS_EXPERT' ||
      proposal.shares.some((share: any) => share.sharedWithUserId === session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/proposals/[id] - Update proposal
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { shares: true }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Check edit permissions
    const canEdit = 
      proposal.createdBy === session.user.id ||
      session.user.role === 'OWNER' ||
      proposal.shares.some(
        (share: any) => share.sharedWithUserId === session.user.id && share.permission === 'EDIT'
      )

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = updateProposalSchema.parse(body)

    // Create version history before updating
    await prisma.versionHistory.create({
      data: {
        proposalId: id,
        contentSnapshot: proposal.content as any,
        changedBy: session.user.id,
        changeDescription: 'Proposal updated'
      }
    })

    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: validatedData,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(updatedProposal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/proposals/[id] - Delete proposal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const proposal = await prisma.proposal.findUnique({
      where: { id }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Only creator or owner can delete
    if (proposal.createdBy !== session.user.id && session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.proposal.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Proposal deleted successfully' })
  } catch (error) {
    console.error('Error deleting proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
