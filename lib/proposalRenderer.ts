import { readFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import http from 'http'

export interface CompanySettings {
  companyName?: string | null
  logoUrl?: string | null
  address?: string | null
  website?: string | null
  phone?: string | null
  email?: string | null
  footerText?: string | null
  primaryColor?: string | null
}

export interface Section {
  id?: string
  title?: string
  content?: any
  order?: number
}

export interface ProposalData {
  id: string
  title: string
  clientName?: string | null
  clientCompany?: string | null
  clientEmail?: string | null
  clientAddress?: string | null
  clientLogoUrl?: string | null
  content: {
    sections?: Section[]
  }
  creator?: {
    name?: string
  }
  pricingItems?: Array<{
    id: string
    serviceDescription: string
    cost: number
    frequency?: string
  }>
}

export interface ImageAssets {
  logoBase64?: string
  clientLogoBase64?: string
  contentImages?: Record<string, string>
}

const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
  try {
    if (!imageUrl) return null

    if (imageUrl.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', imageUrl)
      const buffer = readFileSync(filePath)
      const base64 = buffer.toString('base64')
      const ext = imageUrl.split('.').pop()?.toLowerCase() || 'png'
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/png'
      return `data:${mimeType};base64,${base64}`
    } else if (imageUrl.startsWith('http')) {
      return new Promise((resolve) => {
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

export async function loadAllImages(
  settings: CompanySettings,
  proposal: ProposalData
): Promise<ImageAssets> {
  const images: ImageAssets = {
    contentImages: {}
  }

  if (settings.logoUrl) {
    images.logoBase64 = await loadImageAsBase64(settings.logoUrl) || undefined
  }

  if (proposal.clientLogoUrl) {
    images.clientLogoBase64 = await loadImageAsBase64(proposal.clientLogoUrl) || undefined
  }

  if (proposal.content?.sections) {
    for (const section of proposal.content.sections) {
      const html = section.content?.html || section.content
      if (typeof html === 'string') {
        const imgMatches = html.match(/<img[^>]+src="([^"]+)"/gi)
        if (imgMatches) {
          for (const match of imgMatches) {
            const srcMatch = match.match(/src="([^"]+)"/)
            if (srcMatch && srcMatch[1] && !images.contentImages![srcMatch[1]]) {
              const base64 = await loadImageAsBase64(srcMatch[1])
              if (base64) {
                images.contentImages![srcMatch[1]] = base64
              }
            }
          }
        }
      }
    }
  }

  return images
}

const replaceImagesWithBase64 = (html: string, contentImages: Record<string, string>): string => {
  let result = html
  for (const [url, base64] of Object.entries(contentImages)) {
    if (url && base64) {
      result = result.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), base64)
    }
  }
  return result
}

export function renderProposalToHTML(
  proposal: ProposalData,
  settings: CompanySettings,
  images: ImageAssets,
  options: { mode: 'preview' | 'pdf' | 'docx'; formattedDate?: string }
): string {
  const content = proposal.content
  const sectionsArray = content?.sections || []
  const sections = sectionsArray.length > 0
    ? sectionsArray.sort((a: Section, b: Section) => (a.order || 0) - (b.order || 0))
    : []

  const generateSectionHTML = (section: Section): string => {
    if (!section.content) return ''
    
    let sectionContent = section.content?.html || section.content
    if (!sectionContent) return ''
    
    if (typeof sectionContent === 'string' && images.contentImages) {
      sectionContent = replaceImagesWithBase64(sectionContent, images.contentImages)
    }
    
    return sectionContent
  }

  const sectionsHTML = sections
    .map((section: Section) => {
      const html = generateSectionHTML(section)
      return html ? `
        <div class="section">
          <h2 class="section-title">${section.title || ''}</h2>
          <div class="section-content">${html}</div>
        </div>
      ` : ''
    })
    .join('')

  const logoImg = images.logoBase64 
    ? `<img src="${images.logoBase64}" alt="${settings.companyName || ''}" class="header-logo" />`
    : ''

  const clientLogoImg = images.clientLogoBase64
    ? `<img src="${images.clientLogoBase64}" alt="${proposal.clientCompany || ''}" class="client-logo" />`
    : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${proposal.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
      background: #ffffff;
    }
    
    .document-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 25mm;
      padding-bottom: 50mm;
      min-height: 297mm;
    }
    
    .header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .header-logo {
      max-width: 120px;
      max-height: 40px;
      object-fit: contain;
    }
    
    .company-name {
      font-weight: bold;
      font-size: 14pt;
    }
    
    .cover-page {
      text-align: center;
      padding-top: 30mm;
      padding-bottom: 25px;
      margin-bottom: 25px;
      page-break-after: always;
    }
    
    .proposal-title {
      font-size: 28pt;
      font-weight: bold;
      margin-bottom: 15px;
    }
    
    .title-line {
      border-bottom: 2px solid #000000;
      margin: 10px 40px 25px 40px;
    }
    
    .client-logo-container {
      margin: 15px 0;
    }
    
    .client-logo {
      max-width: 150px;
      max-height: 60px;
      object-fit: contain;
    }
    
    .submitted-to {
      margin-top: 20px;
    }
    
    .submitted-to h3 {
      font-size: 12pt;
      color: #666666;
      margin-bottom: 8px;
    }
    
    .client-name {
      font-size: 18pt;
      font-weight: bold;
    }
    
    .client-company {
      font-size: 14pt;
    }
    
    .client-address {
      font-size: 10pt;
      color: #666666;
      margin-top: 5px;
    }
    
    .submitted-by {
      margin-top: 25px;
    }
    
    .submitted-by h3 {
      font-size: 12pt;
      color: #666666;
      margin-bottom: 8px;
    }
    
    .creator-name {
      font-size: 18pt;
      font-weight: bold;
    }
    
    .creator-company {
      font-size: 14pt;
    }
    
    .section {
      margin-top: 25px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #cccccc;
    }
    
    .section-content {
      font-size: 12pt;
      line-height: 1.6;
    }
    
    .section-content p {
      margin-bottom: 10px;
    }
    
    .section-content h1,
    .section-content h2,
    .section-content h3 {
      margin-top: 15px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    
    .section-content h1 {
      font-size: 22pt;
    }
    
    .section-content h2 {
      font-size: 18pt;
    }
    
    .section-content h3 {
      font-size: 14pt;
    }
    
    .section-content ul,
    .section-content ol {
      margin-left: 20px;
      margin-bottom: 10px;
    }
    
    .section-content li {
      margin-bottom: 5px;
    }
    
    .section-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    
    .section-content table th,
    .section-content table td {
      border: 1px solid #000000;
      padding: 8px 12px;
      text-align: left;
    }
    
    .section-content table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    .section-content table tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    .section-content img {
      max-width: 100%;
      height: auto;
      margin: 10px 0;
    }
    
    .pricing-table {
      margin-top: 25px;
      padding: 15px;
      background-color: #f9f9f9;
      border: 1px solid #dddddd;
    }
    
    .pricing-title {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 15px;
    }
    
    .pricing-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #dddddd;
    }
    
    .pricing-description {
      flex: 1;
    }
    
    .pricing-cost {
      font-weight: bold;
    }
    
    .pricing-total {
      display: flex;
      justify-content: space-between;
      padding-top: 10px;
      font-size: 14pt;
      font-weight: bold;
    }
    
    .footer {
      position: fixed;
      bottom: 10mm;
      left: 20mm;
      right: 20mm;
      padding-top: 10px;
      border-top: 1px solid #cccccc;
      font-size: 9pt;
      color: #999999;
      text-align: center;
    }
    
    .footer-left {
      position: absolute;
      left: 0;
      text-align: left;
    }
    
    .footer-center {
      text-align: center;
    }
    
    .footer-right {
      position: absolute;
      right: 0;
      text-align: right;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .footer {
        position: fixed;
      }
    }
  </style>
<head>
<body>
  <div class="document-container">
    <div class="header">
      <div class="header-right">
        ${logoImg}
      </div>
    </div>

    <div class="cover-page">
      <h1 class="proposal-title">${proposal.title}</h1>
      <div class="title-line"></div>
      
      ${clientLogoImg ? `<div class="client-logo-container">${clientLogoImg}</div>` : ''}
      
      <div class="submitted-to">
        <h3>Submitted to:</h3>
        <p class="client-name">${proposal.clientName || 'N/A'}</p>
        <p class="client-company">${proposal.clientCompany || 'N/A'}</p>
        ${proposal.clientAddress ? `<p class="client-address">${proposal.clientAddress}</p>` : ''}
      </div>

      <div class="submitted-by">
        <h3>Submitted by:</h3>
        <p class="creator-name">${proposal.creator?.name || 'N/A'}</p>
        <p class="creator-company">${settings.companyName || 'N/A'}</p>
      </div>
    </div>

    ${sectionsHTML}

    ${
      proposal.pricingItems && proposal.pricingItems.length > 0
        ? `
    <div class="pricing-table">
      <h2 class="pricing-title">Pricing Breakdown</h2>
      ${proposal.pricingItems.map((item: any) => `
        <div class="pricing-item">
          <span class="pricing-description">${item.serviceDescription}</span>
          <span class="pricing-cost">$${item.cost.toLocaleString()} ${item.frequency || 'one-time'}</span>
        </div>
      `).join('')}
      <div class="pricing-total">
        <span>Total:</span>
        <span>$${proposal.pricingItems.reduce((sum: number, item: any) => sum + item.cost, 0).toLocaleString()}</span>
      </div>
    </div>
        ` : ''
    }

    ${options.mode !== 'pdf' && options.mode !== 'docx' ? `
    <div class="footer">
      <div class="footer-left">${settings.companyName || ''}</div>
      <div class="footer-center"></div>
      <div class="footer-right"></div>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `.trim()
}

export function resolveVariables(
  html: string,
  variables: Record<string, string>
): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}`)
}