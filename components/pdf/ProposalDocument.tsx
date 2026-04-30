import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff2', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.woff2', fontWeight: 'bold' }
  ]
})

interface Section {
  title?: string
  content?: {
    html?: string
    json?: any
  }
  order?: number
}

interface Content {
  sections?: Section[]
}

// Helper to convert hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

// Parse color from style string
const parseColor = (style: string): { r: number; g: number; b: number } | undefined => {
  const colorMatch = style.match(/color:\s*([^;]+)/i)
  if (!colorMatch) return undefined
  
  const color = colorMatch[1].trim()
  if (color.startsWith('#')) {
    return hexToRgb(color) || undefined
  }
  
  // Handle rgb() format
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    }
  }
  
  return undefined
}

// Parse background color for highlights
const parseBackgroundColor = (style: string): string | undefined => {
  const bgMatch = style.match(/background-color:\s*([^;]+)/i)
  if (!bgMatch) return undefined
  
  const bgColor = bgMatch[1].trim()
  if (bgColor.startsWith('#')) {
    return bgColor.replace('#', '')
  }
  
  // Handle rgb() format
  const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
    return (r + g + b).toUpperCase()
  }
  
  // Named colors
  const colorMap: Record<string, string> = {
    'yellow': 'FFFF00',
    'green': '00FF00',
    'blue': '0000FF',
    'red': 'FF0000',
    'orange': 'FFA500'
  }
  return colorMap[bgColor.toLowerCase()]
}

// Parse font size from style
const parseFontSize = (style: string): number | undefined => {
  const sizeMatch = style.match(/font-size:\s*([^;]+)/i)
  if (!sizeMatch) return undefined
  
  const size = sizeMatch[1].trim().toLowerCase()
  if (size.endsWith('px')) {
    return Math.round(parseFloat(size) * 0.75) // Convert px to pt
  }
  if (size.endsWith('pt')) {
    return parseFloat(size)
  }
  if (size.endsWith('em')) {
    return Math.round(parseFloat(size) * 12) // Base 12pt
  }
  return undefined
}

// Parse text alignment
const parseAlignment = (style: string): 'left' | 'center' | 'right' | 'justify' | undefined => {
  const alignMatch = style.match(/text-align:\s*([^;]+)/i)
  if (!alignMatch) return undefined
  
  const align = alignMatch[1].trim().toLowerCase()
  if (align === 'center') return 'center'
  if (align === 'right') return 'right'
  if (align === 'justify') return 'justify'
  return 'left'
}

// Parse inline formatting from HTML
interface TextRun {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  color?: { r: number; g: number; b: number }
  fontSize?: number
  highlight?: string
}

const parseInlineFormatting = (html: string): TextRun[] => {
  const runs: TextRun[] = []
  
  if (!html || !html.trim()) return runs
  
  // Decode HTML entities
  let text = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  // Process the HTML to extract formatted text runs
  // Split by formatting tags while preserving the formatting
  
  // Pattern to match inline elements with their content
  const inlinePattern = /<(strong|b|em|i|u|s|strike|span|mark)(?:\s+[^>]*)?>([\s\S]*?)<\/\1>|<([^>\/]+)(?:\s+[^>]*)?\/>|<([^>\/]+)(?:\s+[^>]*)?>([^<]*)/gi
  
  let lastIndex = 0
  let match
  
  while ((match = inlinePattern.exec(text)) !== null) {
    // Add any plain text before this match
    const beforeText = text.slice(lastIndex, match.index).replace(/<[^>]+>/g, '').trim()
    if (beforeText && runs.length > 0) {
      runs[runs.length - 1].text += beforeText
    } else if (beforeText) {
      runs.push({ text: beforeText })
    }
    
    if (match[1]) {
      // Matched an inline element like <strong>text</strong>
      const tag = match[1].toLowerCase()
      const content = match[2] || ''
      
      const run: TextRun = { text: content.replace(/<[^>]+>/g, '') }
      
      switch (tag) {
        case 'strong':
        case 'b':
          run.bold = true
          break
        case 'em':
        case 'i':
          run.italic = true
          break
        case 'u':
          run.underline = true
          break
        case 's':
        case 'strike':
          run.strike = true
          break
        case 'span':
        case 'mark':
          // Parse inline styles
          const styleMatch = match[0].match(/style="([^"]*)"/i)
          if (styleMatch) {
            const style = styleMatch[1]
            run.color = parseColor(style)
            run.fontSize = parseFontSize(style)
            run.highlight = parseBackgroundColor(style)
          }
          if (tag === 'mark' && !run.highlight) {
            run.highlight = 'FFFF00' // Default yellow
          }
          break
      }
      
      if (run.text) runs.push(run)
    }
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  const remaining = text.slice(lastIndex).replace(/<[^>]+>/g, '').trim()
  if (remaining) {
    if (runs.length > 0) {
      runs[runs.length - 1].text += ' ' + remaining
    } else {
      runs.push({ text: remaining })
    }
  }
  
  // If no runs found, try to extract plain text
  if (runs.length === 0) {
    const plainText = text.replace(/<[^>]+>/g, '').trim()
    if (plainText) {
      runs.push({ text: plainText })
    }
  }
  
  return runs
}

// Parse block-level elements
interface BlockElement {
  type: 'heading' | 'paragraph' | 'blockquote' | 'code' | 'list' | 'table'
  level?: number
  text?: string
  runs?: TextRun[]
  listType?: 'ordered' | 'bullet'
  listItems?: string[]
  rows?: any[]
  styles?: any
}

const parseHtmlContent = (html: string): BlockElement[] => {
  const elements: BlockElement[] = []
  if (!html) return elements
  
  // Clean up HTML
  let text = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  
  // Split by block elements
  const blockRegex = /<(h[1-3]|p|blockquote|pre|ul|ol|table|div)(?:\s+[^>]*)?>([\s\S]*?)<\/\1>/gi
  
  let lastIndex = 0
  let match
  
  while ((match = blockRegex.exec(text)) !== null) {
    const tag = match[1].toLowerCase()
    const content = match[2]
    const fullMatch = match[0]
    
    // Get inline styles from the tag
    const styleMatch = fullMatch.match(/style="([^"]*)"/i)
    const blockStyles = styleMatch ? {
      align: parseAlignment(styleMatch[1])
    } : {}
    
    switch (tag) {
      case 'h1':
        elements.push({
          type: 'heading',
          level: 1,
          text: content.replace(/<[^>]+>/g, '').trim(),
          runs: parseInlineFormatting(content),
          styles: { fontSize: 24, bold: true, ...blockStyles }
        })
        break
      case 'h2':
        elements.push({
          type: 'heading',
          level: 2,
          text: content.replace(/<[^>]+>/g, '').trim(),
          runs: parseInlineFormatting(content),
          styles: { fontSize: 20, bold: true, ...blockStyles }
        })
        break
      case 'h3':
        elements.push({
          type: 'heading',
          level: 3,
          text: content.replace(/<[^>]+>/g, '').trim(),
          runs: parseInlineFormatting(content),
          styles: { fontSize: 16, bold: true, ...blockStyles }
        })
        break
      case 'p':
      case 'div':
        if (content.replace(/<[^>]+>/g, '').trim()) {
          elements.push({
            type: 'paragraph',
            text: content.replace(/<[^>]+>/g, '').trim(),
            runs: parseInlineFormatting(content),
            styles: { fontSize: 11, ...blockStyles }
          })
        }
        break
      case 'blockquote':
        elements.push({
          type: 'blockquote',
          text: content.replace(/<[^>]+>/g, '').trim(),
          runs: parseInlineFormatting(content),
          styles: { fontSize: 11 }
        })
        break
      case 'pre':
        elements.push({
          type: 'code',
          text: content.replace(/<[^>]+>/g, '').trim(),
          styles: { fontSize: 10 }
        })
        break
      case 'ul':
        const ulItems = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
        elements.push({
          type: 'list',
          listType: 'bullet',
          listItems: ulItems.map(item => item.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '').replace(/<[^>]+>/g, '').trim())
        })
        break
      case 'ol':
        const olItems = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
        elements.push({
          type: 'list',
          listType: 'ordered',
          listItems: olItems.map(item => item.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '').replace(/<[^>]+>/g, '').trim())
        })
        break
      case 'table':
        const rows = parseTableContent(content)
        if (rows.length > 0) {
          elements.push({ type: 'table', rows })
        }
        break
    }
    
    lastIndex = match.index + match[0].length
  }
  
  // Handle any remaining text that isn't wrapped in blocks
  const remaining = text.slice(lastIndex).replace(/<[^>]+>/g, '').trim()
  if (remaining && remaining.length > 0) {
    elements.push({
      type: 'paragraph',
      text: remaining,
      runs: parseInlineFormatting(remaining),
      styles: { fontSize: 11 }
    })
  }
  
  return elements
}

// Parse table with inline formatting in cells
const parseTableContent = (html: string): any[] => {
  const rows: any[] = []
  const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []
  
  for (const tr of trMatches) {
    const cells: any[] = []
    const tdMatches = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || []
    
    for (const td of tdMatches) {
      const cellContent = td.replace(/<t[dh][^>]*>/i, '').replace(/<\/t[dh]>/gi, '')
      cells.push({
        text: cellContent.replace(/<[^>]+>/g, '').trim(),
        runs: parseInlineFormatting(cellContent)
      })
    }
    
    if (cells.length > 0) {
      rows.push(cells)
    }
  }
  
  return rows
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc'
  },
  headerText: {
    fontSize: 10,
    color: '#666666'
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000000'
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold'
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.5
  },
  section: {
    marginBottom: 15
  },
  clientSection: {
    textAlign: 'center',
    marginBottom: 25
  },
  clientLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5
  },
  clientName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold'
  },
  clientCompany: {
    fontSize: 14,
    marginBottom: 5
  },
  clientAddress: {
    fontSize: 10,
    color: '#666666'
  },
  subSectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
    marginBottom: 5
  },
  subSubTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 4
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: '#cccccc',
    paddingLeft: 10,
    marginVertical: 8,
    fontStyle: 'italic'
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 10,
    backgroundColor: '#f5f5f5',
    padding: 8
  },
  pricingSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#cccccc'
  },
  pricingTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10
  },
  pricingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee'
  },
  pricingDescription: {
    flex: 1
  },
  pricingCost: {
    textAlign: 'right'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    fontFamily: 'Helvetica-Bold'
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#000000'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  tableCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000'
  },
  tableHeader: {
    backgroundColor: '#e5e7eb'
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 10
  },
  bullet: {
    width: 15
  },
  listText: {
    flex: 1
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#999999'
  }
})

interface ProposalDocumentProps {
  proposal: {
    title: string
    content: any
    clientName?: string | null
    clientCompany?: string | null
    clientAddress?: string | null
    pricingItems?: Array<{
      serviceDescription: string
      cost: number
      frequency?: string | null
    }>
    creator?: {
      name?: string | null
    }
  }
  companySettings: {
    companyName?: string | null
  } | null
}

// Render formatted text runs
const renderFormattedText = (runs: TextRun[], baseStyle: any) => {
  if (!runs || runs.length === 0) return null
  
  return runs.map((run, index) => {
    const runStyle: any = {}
    
    if (run.bold) runStyle.fontFamily = 'Helvetica-Bold'
    if (run.italic) runStyle.fontStyle = 'italic'
    if (run.underline) runStyle.textDecoration = 'underline'
    if (run.strike) runStyle.textDecoration = 'line-through'
    if (run.color) runStyle.color = run.color
    if (run.fontSize) runStyle.fontSize = run.fontSize
    if (run.highlight) runStyle.background = run.highlight
    
    return (
      <Text key={index} style={[baseStyle, runStyle]}>
        {run.text}
      </Text>
    )
  })
}

// PDF Document Component
export const ProposalDocument = ({ proposal, companySettings }: ProposalDocumentProps) => {
  const content: Content = proposal.content as Content
  const sections = content?.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)) || []

  const creatorName = proposal.creator?.name || 'N/A'
  const companyName = companySettings?.companyName || 'N/A'

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date())

  const renderElement = (element: any, index: number) => {
    const baseStyle = element.styles || {}
    const alignment = baseStyle.align
    
    switch (element.type) {
      case 'heading':
        const headingStyle = element.level === 1 
          ? styles.sectionTitle 
          : element.level === 2 
            ? styles.subSectionTitle 
            : styles.subSubTitle
        return (
          <Text key={index} style={[headingStyle, { fontSize: baseStyle.fontSize }]}>
            {element.text}
          </Text>
        )
      case 'paragraph':
        return (
          <Text key={index} style={[styles.paragraph, { fontSize: baseStyle.fontSize || 11 }]}>
            {element.runs && element.runs.length > 0 
              ? renderFormattedText(element.runs, { fontSize: baseStyle.fontSize || 11 })
              : element.text
            }
          </Text>
        )
      case 'blockquote':
        return (
          <Text key={index} style={[styles.quote, { fontSize: baseStyle.fontSize || 11 }]}>
            {element.text}
          </Text>
        )
      case 'code':
        return (
          <Text key={index} style={styles.code}>
            {element.text}
          </Text>
        )
      case 'list':
        return (
          <View key={index} style={{ marginBottom: 8 }}>
            {element.listItems?.map((item: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>
                  {element.listType === 'ordered' ? `${i + 1}.` : '•'}
                </Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )
      case 'table':
        return (
          <View key={index} style={styles.table}>
            {element.rows?.map((row: any[], rowIndex: number) => (
              <View
                key={rowIndex}
                style={rowIndex === 0 ? [styles.tableRow, styles.tableHeader] : styles.tableRow}
              >
                {row.map((cell: any, cellIndex: number) => (
                  <View
                    key={cellIndex}
                    style={cellIndex === (row.length - 1) ? styles.tableCell : [styles.tableCell, { borderRightWidth: 0 }]}
                  >
                    <Text style={rowIndex === 0 ? { fontFamily: 'Helvetica-Bold' } : {}}>
                      {cell.runs && cell.runs.length > 0
                        ? renderFormattedText(cell.runs, { fontSize: 10 })
                        : cell.text
                      }
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )
      default:
        return null
    }
  }

  const renderContent = (sectionContent: any) => {
    if (!sectionContent) return null

    const html = typeof sectionContent === 'string' 
      ? sectionContent 
      : sectionContent.html || ''

    return parseHtmlContent(html)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>{companyName}</Text>
          <Text style={styles.headerText}>{formattedDate}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{proposal.title}</Text>

        {/* Client Info */}
        {(proposal.clientName || proposal.clientCompany) && (
          <View style={styles.clientSection}>
            <Text style={styles.clientLabel}>Submitted to:</Text>
            <Text style={styles.clientName}>{proposal.clientName || 'N/A'}</Text>
            <Text style={styles.clientCompany}>{proposal.clientCompany || ''}</Text>
            {proposal.clientAddress && (
              <Text style={styles.clientAddress}>{proposal.clientAddress}</Text>
            )}
          </View>
        )}

        {/* Submitted by */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>Submitted by:</Text>
          <Text style={styles.clientName}>{creatorName}</Text>
          <Text style={styles.clientCompany}>{companyName}</Text>
        </View>

        {/* Content Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.title && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            {renderContent(section.content)?.map((element, ei) => renderElement(element, ei))}
          </View>
        ))}

        {/* Pricing Section */}
        {proposal.pricingItems && proposal.pricingItems.length > 0 && (
          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Pricing Breakdown</Text>
            {proposal.pricingItems.map((item: any, idx: number) => (
              <View key={idx} style={styles.pricingItem}>
                <Text style={styles.pricingDescription}>{item.serviceDescription}</Text>
                <Text style={styles.pricingCost}>
                  ${item.cost.toLocaleString()} {item.frequency || 'one-time'}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text>Total:</Text>
              <Text>
                ${proposal.pricingItems.reduce((sum: number, item: any) => sum + item.cost, 0).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{proposal.title}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}