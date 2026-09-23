import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderProposalToHTML, loadAllImages } from '@/lib/proposalRenderer'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        creator: true,
        pricingItems: true
      }
    })

    if (!proposal) {
      return new NextResponse('Proposal not found', { status: 404 })
    }

    const companySettings = await prisma.companySetting.findUnique({
      where: { userId: session.user.id }
    })

    const settings = {
      companyName: companySettings?.companyName || (session.user as any)?.companyName,
      logoUrl: companySettings?.logoUrl,
      address: companySettings?.address,
      website: companySettings?.website,
      phone: companySettings?.phone,
      email: companySettings?.email,
      footerText: null,
      primaryColor: null,
    }

    // Load images if possible (some might fail but it will still return HTML)
    const images = await loadAllImages(settings, proposal as any)

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date())

    const html = renderProposalToHTML(proposal as any, settings, images, { mode: 'preview', formattedDate })

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    })
  } catch (error) {
    console.error('Preview error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
