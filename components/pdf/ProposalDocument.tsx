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

// Helper to parse styles from HTML inline styles
const parseStyles = (styleString: string): any => {
  const styles: any = {}
  const colorMatch = styleString.match(/color:\s*([^;]+)/i)
  const bgMatch = styleString.match(/background-color:\s*([^;]+)/i)
  const sizeMatch = styleString.match(/font-size:\s*([^;]+)/i)
  const alignMatch = styleString.match(/text-align:\s*([^;]+)/i)

  if (colorMatch) {
    const color = colorMatch[1].trim()
    if (color.startsWith('#')) {
      const rgb = hexToRgb(color)
      if (rgb) styles.color = rgb
    }
  }

  if (bgMatch) {
    const bgColor = bgMatch[1].trim()
    if (bgColor.startsWith('#')) {
      const rgb = hexToRgb(bgColor)
      if (rgb) styles.background = rgb
    }
  }

  if (sizeMatch) {
    const size = sizeMatch[1].trim().toLowerCase()
    if (size.endsWith('px')) {
      const px = parseFloat(size)
      styles.fontSize = Math.round(px * 0.75)
    } else if (size.endsWith('pt')) {
      styles.fontSize = parseFloat(size)
    }
  }

  if (alignMatch) {
    const align = alignMatch[1].trim().toLowerCase()
    if (align === 'center') styles.align = 'center'
    else if (align === 'right') styles.align = 'right'
    else if (align === 'justify') styles.align = 'justify'
  }

  return styles
}

// Parse HTML content to extract formatting
const parseHtmlContent = (html: string): any[] => {
  const elements: any[] = []
  if (!html) return elements

  const cleanHtml = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  // Simple block element parsing
  const blocks = cleanHtml.split(/(?=<[hpoqbt])/i)
  
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    // Detect block type
    if (trimmed.startsWith('<h1')) {
      const content = trimmed.replace(/<h1[^>]*>/i, '').replace(/<\/h1>/i, '')
      const styleMatch = trimmed.match(/style="([^"]*)"/i)
      const styles = styleMatch ? parseStyles(styleMatch[1]) : {}
      elements.push({ type: 'heading', level: 1, text: content, styles: { ...styles, fontSize: 24 } })
    } else if (trimmed.startsWith('<h2')) {
      const content = trimmed.replace(/<h2[^>]*>/i, '').replace(/<\/h2>/i, '')
      const styleMatch = trimmed.match(/style="([^"]*)"/i)
      const styles = styleMatch ? parseStyles(styleMatch[1]) : {}
      elements.push({ type: 'heading', level: 2, text: content, styles: { ...styles, fontSize: 20 } })
    } else if (trimmed.startsWith('<h3')) {
      const content = trimmed.replace(/<h3[^>]*>/i, '').replace(/<\/h3>/i, '')
      const styleMatch = trimmed.match(/style="([^"]*)"/i)
      const styles = styleMatch ? parseStyles(styleMatch[1]) : {}
      elements.push({ type: 'heading', level: 3, text: content, styles: { ...styles, fontSize: 16 } })
    } else if (trimmed.startsWith('<p')) {
      const content = trimmed.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, '')
      const styleMatch = trimmed.match(/style="([^"]*)"/i)
      const styles = styleMatch ? parseStyles(styleMatch[1]) : {}
      elements.push({ type: 'paragraph', text: content, styles: { ...styles, fontSize: 11 } })
    } else if (trimmed.startsWith('<blockquote')) {
      const content = trimmed.replace(/<blockquote[^>]*>/i, '').replace(/<\/blockquote>/i, '')
      elements.push({ type: 'blockquote', text: content, styles: { fontSize: 11 } })
    } else if (trimmed.startsWith('<pre')) {
      const content = trimmed.replace(/<pre[^>]*>/i, '').replace(/<\/pre>/i, '')
      elements.push({ type: 'code', text: content, styles: { fontSize: 10 } })
    } else if (trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
      const items = trimmed.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
      const listType = trimmed.startsWith('<ol') ? 'ordered' : 'bullet'
      const listItems = items.map(item => 
        item.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '').trim()
      )
      elements.push({ type: 'list', listType, items: listItems, styles: { fontSize: 11 } })
    } else if (trimmed.startsWith('<table')) {
      const rows = parseTable(trimmed)
      if (rows.length > 0) {
        elements.push({ type: 'table', rows })
      }
    } else if (trimmed.startsWith('<div')) {
      const content = trimmed.replace(/<div[^>]*>/i, '').replace(/<\/div>/i, '')
      if (content.trim()) {
        const styleMatch = trimmed.match(/style="([^"]*)"/i)
        const styles = styleMatch ? parseStyles(styleMatch[1]) : {}
        elements.push({ type: 'paragraph', text: content, styles: { ...styles, fontSize: 11 } })
      }
    } else {
      const text = trimmed.replace(/<[^>]*>/g, '').trim()
      if (text) {
        elements.push({ type: 'paragraph', text, styles: { fontSize: 11 } })
      }
    }
  }

  return elements
}

// Parse HTML table
const parseTable = (html: string): any[] => {
  const rows: any[] = []
  const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []
  
  for (const tr of trMatches) {
    const cells: any[] = []
    const tdMatches = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || []
    
    for (const td of tdMatches) {
      const content = td.replace(/<t[dh][^>]*>/gi, '').replace(/<\/t[dh]>/gi, '').trim()
      cells.push({ text: content })
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
    switch (element.type) {
      case 'heading':
        const headingStyle = element.level === 1 
          ? styles.sectionTitle 
          : element.level === 2 
            ? styles.subSectionTitle 
            : styles.subSubTitle
        return (
          <Text key={index} style={[headingStyle, element.styles]}>
            {element.text}
          </Text>
        )
      case 'paragraph':
        return (
          <Text key={index} style={[styles.paragraph, element.styles]}>
            {element.text}
          </Text>
        )
      case 'blockquote':
        return (
          <Text key={index} style={[styles.quote, element.styles]}>
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
            {element.items?.map((item: string, i: number) => (
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
                      {cell.text}
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