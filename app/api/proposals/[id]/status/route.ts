import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/proposals/[id]/status - Update proposal status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await req.json()

    // Validate status
    const validStatuses = ['DRAFT', 'IN_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { createdBy: true, status: true }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Check permissions
    const canUpdate = 
      proposal.createdBy === session.user.id ||
      session.user.role === 'OWNER' ||
      (session.user.role === 'BUSINESS_EXPERT' && ['IN_REVIEW', 'PENDING_APPROVAL'].includes(status))

    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update status
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: { 
        status,
        // If approved, set approver and approval date
        ...(status === 'APPROVED' && {
          approvedBy: session.user.id,
          approvedAt: new Date()
        })
      },
      include: {
        creator: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(updatedProposal)
  } catch (error) {
    console.error('Error updating proposal status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
