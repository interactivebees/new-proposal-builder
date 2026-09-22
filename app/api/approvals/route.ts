import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await prisma.approvalRequest.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        proposal: { select: { id: true, title: true, clientName: true, opportunityValue: true, status: true } },
        requester: { select: { name: true, email: true } },
        reviewer: { select: { name: true, email: true } }
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching approval requests:', error)
    return NextResponse.json({ error: 'Failed to fetch approval requests' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { proposalId, stepName, comments, assignedTo } = body

    if (!proposalId) {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 })
    }

    // Create approval request
    const approval = await prisma.approvalRequest.create({
      data: {
        proposalId,
        requestedBy: session.user.id,
        assignedTo: assignedTo || undefined,
        stepName: stepName || 'Technical Review',
        comments: comments || 'Submitted for approval',
        status: 'PENDING'
      }
    })

    // Update proposal status to IN_REVIEW or PENDING_APPROVAL
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'PENDING_APPROVAL' }
    })

    return NextResponse.json(approval, { status: 201 })
  } catch (error) {
    console.error('Error submitting approval:', error)
    return NextResponse.json({ error: 'Failed to submit approval' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, status, comments } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Approval Request ID and status are required' }, { status: 400 })
    }

    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status,
        comments,
        assignedTo: session.user.id,
        updatedAt: new Date()
      },
      include: { proposal: true }
    })

    // Update underlying proposal status
    let propStatus = 'IN_REVIEW'
    if (status === 'APPROVED') propStatus = 'APPROVED'
    if (status === 'REJECTED') propStatus = 'REJECTED'

    await prisma.proposal.update({
      where: { id: updated.proposalId },
      data: {
        status: propStatus,
        approvedBy: status === 'APPROVED' ? session.user.id : undefined,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
        rejectionReason: status === 'REJECTED' ? comments : undefined
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 })
  }
}
