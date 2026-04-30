import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { ProposalDocument } from '@/components/pdf/ProposalDocument'
import { readFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import http from 'http'

// Helper to load image as base64
const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
  try {
    if (!imageUrl) return null
    
    if (imageUrl.startsWith('/uploads/')) {
      // Local file
      const filePath = join(process.cwd(), 'public', imageUrl)
      const buffer = readFileSync(filePath)
      const base64 = buffer.toString('base64')
      const ext = imageUrl.split('.').pop()?.toLowerCase() || 'png'
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/png'
      return `data:${mimeType};base64,${base64}`
    } else if (imageUrl.startsWith('http')) {
      // External URL - fetch and convert to base64
      return new Promise((resolve, reject) => {
        const protocol = imageUrl.startsWith('https') ? https : http
        protocol.get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            resolve(null)
            return
          }
          const chunks: Buffer[] = []
          response.on('data', (chunk) => chunks.push(chunk))
          response.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks)
              const base64 = buffer.toString('base64')
              const contentType = response.headers['content-type'] || 'image/jpeg'
              resolve(`data:${contentType};base64,${base64}`)
            } catch (e) {
              resolve(null)
            }
          })
          response.on('error', () => resolve(null))
        }).on('error', () => resolve(null))
      })
    }
    return null
  } catch (error) {
    console.error('Error loading image:', error)
    return null
  }
}

// Extract all image URLs from proposal content
const extractImageUrls = (content: any): string[] => {
  const urls = new Set<string>()
  
  const extractFromHtml = (html: string) => {
    if (!html) return
    const imgMatches = html.match(/<img[^>]+src="([^"]+)"/gi)
    if (imgMatches) {
      imgMatches.forEach((match) => {
        const srcMatch = match.match(/src="([^"]+)"/)
        if (srcMatch && srcMatch[1]) {
          urls.add(srcMatch[1])
        }
      })
    }
  }
  
  if (content?.sections) {
    content.sections.forEach((section: any) => {
      if (section.content?.html) {
        extractFromHtml(section.content.html)
      }
    })
  }
  
  return Array.from(urls)
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

    // Pre-load images from content
    const imageUrls = extractImageUrls(proposal.content)
    const loadedImages: Record<string, string> = {}
    
    for (const url of imageUrls) {
      const base64 = await loadImageAsBase64(url)
      if (base64) {
        loadedImages[url] = base64
      }
    }

    // Pre-load company logo
    let companyLogoBase64: string | null = null
    if (companySettings?.logoUrl) {
      companyLogoBase64 = await loadImageAsBase64(companySettings.logoUrl)
    }

    // Pre-load client logo
    let clientLogoBase64: string | null = null
    if (proposal.clientLogoUrl) {
      clientLogoBase64 = await loadImageAsBase64(proposal.clientLogoUrl)
    }

    // Generate PDF using @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      <ProposalDocument 
        proposal={proposal} 
        companySettings={companySettings}
        images={loadedImages}
        companyLogo={companyLogoBase64}
        clientLogo={clientLogoBase64}
      />
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