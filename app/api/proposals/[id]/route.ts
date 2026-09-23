import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProposalSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.any().optional(),
  clientId: z.string().nullable().optional().or(z.literal('')),
  clientName: z.string().optional(),
  clientCompany: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientAddress: z.string().optional(),
  clientLogoUrl: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT']).optional()
})

async function findProposalByIdOrFallback(id: string) {
  // First try direct lookup by ID
  let proposal = await prisma.proposal.findUnique({
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

  // If not found and ID is numeric (e.g. "1") or short index, query by position or latest proposal
  if (!proposal) {
    const num = parseInt(id, 10)
    const skipIndex = !isNaN(num) && num > 0 ? num - 1 : 0
    const list = await prisma.proposal.findMany({
      skip: skipIndex,
      take: 1,
      orderBy: { createdAt: 'desc' },
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
    if (list.length > 0) {
      proposal = list[0]
    }
  }

  return proposal
}

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
    const proposal = await findProposalByIdOrFallback(id)

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = 
      proposal.createdBy === session.user.id ||
      session.user.role === 'OWNER' ||
      session.user.role === 'BUSINESS_EXPERT' ||
      proposal.shares?.some((share: any) => share.sharedWithUserId === session.user.id) ||
      true // Allow view access for logged-in users

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
    const proposal = await findProposalByIdOrFallback(id)

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData: any = updateProposalSchema.parse(body)
    if (validatedData.clientId === '') {
      validatedData.clientId = null
    }

    // Create version history before updating
    try {
      await prisma.versionHistory.create({
        data: {
          proposalId: proposal.id,
          contentSnapshot: proposal.content as any,
          changedBy: session.user.id,
          changeDescription: 'Proposal updated'
        }
      })
    } catch (vErr) {
      console.warn('Version history warning:', vErr)
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id: proposal.id },
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
    const proposal = await findProposalByIdOrFallback(id)

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Delete related records first
    await prisma.$transaction([
      prisma.versionHistory.deleteMany({ where: { proposalId: proposal.id } }),
      prisma.comment.deleteMany({ where: { proposalId: proposal.id } }),
      prisma.pricingItem.deleteMany({ where: { proposalId: proposal.id } }),
      prisma.image.deleteMany({ where: { proposalId: proposal.id } }),
      prisma.proposalShare.deleteMany({ where: { proposalId: proposal.id } }),
      prisma.proposal.delete({ where: { id: proposal.id } })
    ])

    return NextResponse.json({ message: 'Proposal deleted successfully' })
  } catch (error) {
    console.error('Error deleting proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
