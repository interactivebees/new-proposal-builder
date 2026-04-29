import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const formatTextForPdf = (text: string, maxWidth: number, doc: jsPDF): string[] => {
  const lines: string[] = []
  const paragraphs = text.split('\n\n')
  
  for (const para of paragraphs) {
    const wrapped = doc.splitTextToSize(para, maxWidth)
    lines.push(...wrapped)
  }
  
  return lines
}

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

    const creatorName = proposal.creator?.name || session.user.name || 'N/A'
    const companyName = companySettings?.companyName || 'N/A'

    const content = proposal.content as any
    const sections = content?.sections?.length > 0 
      ? content.sections
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((section: any) => ({
            title: section.title || '',
            content: stripHtml(section.content?.html || section.content || '')
          }))
      : []

    const total = proposal.pricingItems?.reduce((sum: number, item: any) => sum + item.cost, 0) || 0

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date())

    doc.setFontSize(10)
    doc.setTextColor(102, 102, 102)
    doc.text(companyName, pageWidth - margin, yPosition, { align: 'right' })
    yPosition += 15

    doc.setFontSize(28)
    doc.setTextColor(0, 0, 0)
    doc.text(proposal.title, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    doc.setFontSize(14)
    doc.text('Submitted to:', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 7

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(proposal.clientName || 'N/A', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 7

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(proposal.clientCompany || 'N/A', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 6

    if (proposal.clientAddress) {
      doc.setFontSize(10)
      doc.setTextColor(102, 102, 102)
      doc.text(proposal.clientAddress, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 6
    }
    yPosition += 10

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Submitted by:', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 7

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(creatorName, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 7

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(companyName, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    for (const section of sections) {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin
      }

      doc.text(section.title, margin, yPosition)
      yPosition += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const lines = formatTextForPdf(section.content, contentWidth, doc)
      
      for (const line of lines) {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += 5
      }
      yPosition += 10
    }

    if (proposal.pricingItems && proposal.pricingItems.length > 0) {
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = margin
      }

      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('Pricing Breakdown', margin, yPosition)
      yPosition += 10

      doc.setFillColor(245, 245, 245)
      doc.rect(margin, yPosition - 3, contentWidth, proposal.pricingItems.length * 8 + 15, 'F')

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      for (const item of proposal.pricingItems) {
        doc.text(`${item.serviceDescription}`, margin + 2, yPosition)
        doc.text(`$${item.cost.toLocaleString()} ${item.frequency || 'one-time'}`, pageWidth - margin - 2, yPosition, { align: 'right' })
        yPosition += 8
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Total:', margin + 2, yPosition)
      doc.text(`$${total.toLocaleString()}`, pageWidth - margin - 2, yPosition, { align: 'right' })
    }

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(153, 153, 153)
      doc.text(formattedDate, margin, pageHeight - 10)
      doc.text(proposal.title.substring(0, 50), pageWidth / 2, pageHeight - 10, { align: 'center' })
      doc.text(String(i), pageWidth - margin, pageHeight - 10, { align: 'right' })
    }

    const pdfBuffer = doc.output('arraybuffer')
    const uint8Array = new Uint8Array(pdfBuffer)

    const sanitizedFilename = proposal.title.replace(/[^a-zA-Z0-9\s-]/g, '_').replace(/\s+/g, '_').substring(0, 100)

    return new NextResponse(uint8Array, {
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