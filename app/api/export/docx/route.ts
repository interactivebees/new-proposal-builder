import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx'
import { readFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import http from 'http'

// POST /api/export/docx - Export proposal as DOCX
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

    // Check access
    const hasAccess = 
      proposal.createdBy === session.user.id ||
      session.user.role === 'OWNER' ||
      session.user.role === 'BUSINESS_EXPERT'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Helper function to load image from URL or local path
    const loadImage = async (imageUrl: string): Promise<Buffer | null> => {
      try {
        if (imageUrl.startsWith('/uploads/')) {
          // Local file
          const filePath = join(process.cwd(), 'public', imageUrl)
          return readFileSync(filePath)
        } else if (imageUrl.startsWith('http')) {
          // Remote URL
          return new Promise((resolve, reject) => {
            const protocol = imageUrl.startsWith('https') ? https : http
            protocol.get(imageUrl, (response) => {
              const chunks: Buffer[] = []
              response.on('data', (chunk) => chunks.push(chunk))
              response.on('end', () => resolve(Buffer.concat(chunks)))
              response.on('error', reject)
            })
          })
        }
        return null
      } catch (error) {
        console.error('Error loading image:', error)
        return null
      }
    }

    // Helper function to parse HTML and create formatted paragraphs
    const htmlToParagraphs = (html: string): Paragraph[] => {
      const paragraphs: Paragraph[] = []
      
      // Split by major tags
      const sections = html.split(/(<h[1-3][^>]*>.*?<\/h[1-3]>|<p[^>]*>.*?<\/p>|<ul[^>]*>.*?<\/ul>|<ol[^>]*>.*?<\/ol>|<blockquote[^>]*>.*?<\/blockquote>)/gi)
      
      sections.forEach(section => {
        if (!section.trim()) return
        
        // Headings
        if (section.match(/<h1[^>]*>/i)) {
          const text = section.replace(/<[^>]+>/g, '').trim()
          if (text) {
            paragraphs.push(new Paragraph({
              text,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }))
          }
        } else if (section.match(/<h2[^>]*>/i)) {
          const text = section.replace(/<[^>]+>/g, '').trim()
          if (text) {
            paragraphs.push(new Paragraph({
              text,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }))
          }
        } else if (section.match(/<h3[^>]*>/i)) {
          const text = section.replace(/<[^>]+>/g, '').trim()
          if (text) {
            paragraphs.push(new Paragraph({
              text,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            }))
          }
        }
        // Lists
        else if (section.match(/<ul[^>]*>/i)) {
          const items = section.match(/<li[^>]*>(.*?)<\/li>/gi) || []
          items.forEach(item => {
            const text = item.replace(/<[^>]+>/g, '').trim()
            if (text) {
              paragraphs.push(new Paragraph({
                text: `• ${text}`,
                spacing: { after: 100 },
                indent: { left: 400 }
              }))
            }
          })
        } else if (section.match(/<ol[^>]*>/i)) {
          const items = section.match(/<li[^>]*>(.*?)<\/li>/gi) || []
          items.forEach((item, index) => {
            const text = item.replace(/<[^>]+>/g, '').trim()
            if (text) {
              paragraphs.push(new Paragraph({
                text: `${index + 1}. ${text}`,
                spacing: { after: 100 },
                indent: { left: 400 }
              }))
            }
          })
        }
        // Blockquote
        else if (section.match(/<blockquote[^>]*>/i)) {
          const text = section.replace(/<[^>]+>/g, '').trim()
          if (text) {
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({
                  text: `"${text}"`,
                  italics: true
                })
              ],
              spacing: { after: 200 },
              indent: { left: 720, right: 720 }
            }))
          }
        }
        // Regular paragraph
        else if (section.match(/<p[^>]*>/i)) {
          const text = section.replace(/<[^>]+>/g, '').trim()
          if (text) {
            paragraphs.push(new Paragraph({
              text,
              spacing: { after: 150 }
            }))
          }
        }
      })
      
      return paragraphs
    }

    // Build document children
    const docChildren: any[] = []

    // Add client logo if exists
    if (proposal.clientLogoUrl) {
      try {
        const logoBuffer = await loadImage(proposal.clientLogoUrl)
        if (logoBuffer) {
          docChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoBuffer,
                  transformation: {
                    width: 150,
                    height: 75
                  },
                  type: 'png'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            })
          )
        }
      } catch (error) {
        console.error('Error adding logo to document:', error)
      }
    }

    // Title
    docChildren.push(
      new Paragraph({
        text: proposal.title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    )

    // Client Information
    docChildren.push(
      new Paragraph({
        text: 'Client Information',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 }
      })
    )

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Client: ${proposal.clientName || 'N/A'}`,
            break: 1
          }),
          new TextRun({
            text: `Company: ${proposal.clientCompany || 'N/A'}`,
            break: 1
          }),
          new TextRun({
            text: `Email: ${proposal.clientEmail || 'N/A'}`,
            break: 1
          }),
          new TextRun({
            text: `Address: ${proposal.clientAddress || 'N/A'}`,
            break: 1
          })
        ],
        spacing: { after: 400 }
      })
    )

    // Add sections if they exist
    const content = proposal.content as any
    if (content?.sections && Array.isArray(content.sections)) {
      content.sections
        .sort((a: any, b: any) => a.order - b.order)
        .forEach((section: any) => {
          // Section title
          docChildren.push(
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            })
          )

          // Section content - use advanced HTML parser
          const sectionParagraphs = htmlToParagraphs(section.content?.html || '')
          docChildren.push(...sectionParagraphs)
        })
    }

    // Add pricing items if they exist
    if (proposal.pricingItems && proposal.pricingItems.length > 0) {
      docChildren.push(
        new Paragraph({
          text: 'Pricing Breakdown',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      )

      proposal.pricingItems.forEach((item: any) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${item.serviceDescription}: $${item.cost.toLocaleString()} ${item.frequency || 'one-time'}`,
                break: 1
              })
            ]
          })
        )
      })

      // Total
      const total = proposal.pricingItems.reduce((sum: number, item: any) => sum + item.cost, 0)
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Total: $${total.toLocaleString()}`,
              bold: true,
              break: 1
            })
          ],
          spacing: { before: 200 }
        })
      )
    }

    // Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren
      }]
    })

    const buffer = await Packer.toBuffer(doc)

    // Sanitize filename to remove special characters
    const sanitizedFilename = proposal.title
      .replace(/[^a-zA-Z0-9\s-]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 100)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${sanitizedFilename}.docx"`
      }
    })
  } catch (error) {
    console.error('Error exporting DOCX:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
