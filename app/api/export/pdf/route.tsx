import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { ProposalDocument } from '@/components/pdf/ProposalDocument'

// POST /api/export/pdf - Export proposal as PDF
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { proposalId } = await req.json()

    if (!proposalId) {
      return NextResponse.json({ error: 'Proposal ID required' }, { status: 400 })
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        creator: true,
        pricingItems: true
      }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const hasAccess =
      proposal.createdBy === session.user.id ||
      session.user.role === 'OWNER' ||
      session.user.role === 'BUSINESS_EXPERT'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const companySettings = await prisma.companySetting.findUnique({
      where: { userId: session.user.id }
    })

    // Generate PDF using @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      <ProposalDocument proposal={proposal} companySettings={companySettings} />
    )

    const sanitizedFilename = proposal.title.replace(/[^a-zA-Z0-9\s-]/g, '_').replace(/\s+/g, '_').substring(0, 100)

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizedFilename}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error exporting PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 })
  }
}