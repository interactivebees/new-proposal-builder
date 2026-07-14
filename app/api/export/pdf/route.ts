import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderProposalToHTML, loadAllImages } from '@/lib/proposalRenderer'
import puppeteer from 'puppeteer'

// POST /api/export/pdf - Export proposal as PDF using Puppeteer
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

    // Load all images as base64
    const images = await loadAllImages(settings, proposal as any)

    // Generate formatted date
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date())

    // Generate HTML with all images embedded
    const html = renderProposalToHTML(proposal as any, settings, images, { mode: 'pdf', formattedDate })

    let browser = null
    try {
      const executablePath = process.env.CHROMIUM_PATH || undefined
      
      if (executablePath) {
        browser = await puppeteer.launch({
          executablePath,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
      } else {
        browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true,
        })
      }

      const page = await browser.newPage()
      
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      await page.emulateMediaType('screen')

      // Inject page size via CSS (not via Puppeteer margins to avoid double margins)
      await page.evaluate(() => {
        const style = document.createElement('style')
        style.textContent = `
          @page {
            size: A4;
            margin: 0;
          }
        `
        document.head.appendChild(style)
      })

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        margin: {
          top: 15,
          bottom: 25,
          left: 20,
          right: 20,
        },
        footerTemplate: `<div style="width: 100%; font-size: 10px; display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 8px; margin: 0 20px;">
          <span>${formattedDate}</span>
          <span>${proposal.title}</span>
          <span class="pageNumber"></span>
        </div>`,
        headerTemplate: `<div style="width: 100%; font-size: 10px; display: none;"></div>`,
      })

      const sanitizedFilename = proposal.title.replace(/[^a-zA-Z0-9\s-]/g, '_').replace(/\s+/g, '_').substring(0, 100)

      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${sanitizedFilename}.pdf"`
        }
      })

    } finally {
      if (browser) {
        await browser.close()
      }
    }

  } catch (error) {
    console.error('Error exporting PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 })
  }
}