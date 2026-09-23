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
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        creator: true
      }
    })

    if (!template) {
      return new NextResponse('Template not found', { status: 404 })
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

    // Extract sections
    let sectionsArray: any[] = []
    if (template.sections) {
      const secData = template.sections as any
      if (Array.isArray(secData)) {
        sectionsArray = secData
      } else if (secData.sections && Array.isArray(secData.sections)) {
        sectionsArray = secData.sections
      }
    }

    // Construct a dummy proposal object
    const dummyProposal = {
      id: template.id,
      title: template.name,
      clientName: 'Template Preview Client',
      clientCompany: 'Preview Company Ltd.',
      clientEmail: 'preview@example.com',
      clientLogoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAxNTAgNjAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NDc0OGIiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNsaWVudCBMb2dvPC90ZXh0Pjwvc3ZnPg==',
      content: {
        sections: sectionsArray
      },
      creator: {
        name: template.creator?.name || (session.user as any)?.name || 'Admin'
      },
      pricingItems: []
    }

    // Load images
    const images = await loadAllImages(settings, dummyProposal as any)

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date())

    const html = renderProposalToHTML(dummyProposal as any, settings, images, { mode: 'preview', formattedDate })

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    })
  } catch (error) {
    console.error('Template preview error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
