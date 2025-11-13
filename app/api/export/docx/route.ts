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




    // A simple node type for our parsed HTML
    interface HtmlNode {
      tag?: string;
      text?: string;
      children: HtmlNode[];
    }

    // Helper function to parse inline nodes (strong, em, text, etc.) into docx TextRuns
    const parseInlineNodes = (nodes: HtmlNode[]): TextRun[] => {
      const runs: TextRun[] = [];

      const buildRuns = (node: HtmlNode, formatting: any = {}) => {
        if (node.text) {
          // Decode HTML entities that might be present
          const decodedText = node.text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          if (decodedText) {
            runs.push(new TextRun({ text: decodedText, ...formatting }));
          }
          return;
        }

        const newFormatting = { ...formatting };
        switch (node.tag) {
          case 'strong':
          case 'b':
            newFormatting.bold = true;
            break;
          case 'em':
          case 'i':
            newFormatting.italics = true;
            break;
          case 'u':
            newFormatting.underline = {};
            break;
          case 's':
            newFormatting.strike = true;
            break;
        }

        for (const child of node.children) {
          buildRuns(child, newFormatting);
        }
      };

      for (const node of nodes) {
        buildRuns(node);
      }

      return runs;
    };



    // A lightweight HTML parser that creates a structured node tree (DOM)
    const parseHtmlToNodes = (html: string): HtmlNode[] => {
      const stack: HtmlNode[] = [{ children: [] }]; // Start with a root node
      // This regex captures opening tags, closing tags, and text content
      const tagRegex = /<(\/)?([a-zA-Z0-9]+)[^>]*>|([^<]+)/g;
      let match;

      while ((match = tagRegex.exec(html)) !== null) {
        const [fullMatch, isClosing, tagName, text] = match;

        if (text) {
          // It's a text node, add it to the current parent
          stack[stack.length - 1].children.push({ text, children: [] });
        } else if (tagName) {
          if (isClosing) {
            // Closing tag: pop the current node and attach it to its parent
            if (stack.length > 1) {
              const closedNode = stack.pop()!;
              stack[stack.length - 1].children.push(closedNode);
            }
          } else {
            // Opening tag: create a new node and push it to the stack
            const newNode: HtmlNode = { tag: tagName.toLowerCase(), children: [] };
            stack.push(newNode);
          }
        }
      }

      // Consolidate any unclosed tags back into the root
      while (stack.length > 1) {
        const node = stack.pop()!;
        stack[stack.length - 1].children.push(node);
      }

      return stack[0].children;
    };





























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

    // Helper function to extract text alignment from style attribute
    const getAlignment = (styleAttr: string): typeof AlignmentType[keyof typeof AlignmentType] => {
      if (styleAttr.includes('text-align: center') || styleAttr.includes('text-align:center')) {
        return AlignmentType.CENTER
      } else if (styleAttr.includes('text-align: right') || styleAttr.includes('text-align:right')) {
        return AlignmentType.RIGHT
      } else if (styleAttr.includes('text-align: justify') || styleAttr.includes('text-align:justify')) {
        return AlignmentType.JUSTIFIED
      }
      return AlignmentType.LEFT
    }

    // Helper function to extract font family from style
    const getFontFamily = (styleAttr: string): string | undefined => {
      const match = styleAttr.match(/font-family:\s*["']?([^;"']+)["']?/i)
      return match ? match[1].trim() : undefined
    }

    // Helper function to convert RGB to hex
    const rgbToHex = (rgb: string): string | undefined => {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i)
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0')
        const g = parseInt(match[2]).toString(16).padStart(2, '0')
        const b = parseInt(match[3]).toString(16).padStart(2, '0')
        return (r + g + b).toUpperCase()
      }
      return undefined
    }

    // Helper function to extract color from style
    const getColor = (styleAttr: string): string | undefined => {
      const match = styleAttr.match(/color:\s*([^;]+)/i)
      if (match) {
        const colorValue = match[1].trim()

        // Handle RGB format
        if (colorValue.toLowerCase().startsWith('rgb')) {
          return rgbToHex(colorValue)
        }

        // Handle hex format
        const color = colorValue.replace('#', '').toUpperCase()
        return color
      }
      return undefined
    }

    // Helper function to parse inline HTML and create TextRuns with formatting
    const parseInlineHTML = (html: string): TextRun[] => {
      const runs: TextRun[] = []

      const processText = (text: string, formatting: any = {}) => {
        if (!text) return
        runs.push(new TextRun({
          text: text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          ...formatting
        }))
      }

      // Extract text with formatting
      const extractFormatting = (htmlStr: string, baseFormatting: any = {}): void => {
        const tagRegex = /<(strong|b|em|i|u|s|mark|code|span)([^>]*)>(.*?)<\/\1>|([^<]+)/gi
        let match

        while ((match = tagRegex.exec(htmlStr)) !== null) {
          const tag = match[1]
          const attrs = match[2] || ''
          const content = match[3]
          const plainText = match[4]

          if (plainText) {
            processText(plainText, baseFormatting)
          } else if (content !== undefined) {
            const formatting = { ...baseFormatting }

            if (tag === 'strong' || tag === 'b') {
              formatting.bold = true
            } else if (tag === 'em' || tag === 'i') {
              formatting.italics = true
            } else if (tag === 'u') {
              formatting.underline = {}
            } else if (tag === 's') {
              formatting.strike = true
            } else if (tag === 'mark') {
              formatting.highlight = 'yellow'
              const style = attrs.match(/style="([^"]*)"/)?.[1] || ''
              const bgMatch = style.match(/background-color:\s*([^;]+)/i)
              if (bgMatch) {
                const bgColor = bgMatch[1].trim()
                if (bgColor.toLowerCase().startsWith('rgb')) {
                  const hexColor = rgbToHex(bgColor)
                  if (hexColor) formatting.highlight = hexColor
                } else {
                  formatting.highlight = bgColor.replace('#', '').toUpperCase()
                }
              }
            } else if (tag === 'code') {
              formatting.font = 'Courier New'
            } else if (tag === 'span') {
              const style = attrs.match(/style="([^"]*)"/)?.[1] || ''
              const fontFamily = getFontFamily(style)
              const color = getColor(style)
              if (fontFamily) formatting.font = fontFamily
              if (color) formatting.color = color
            }

            // Recursively process nested tags
            if (content.includes('<')) {
              extractFormatting(content, formatting)
            } else {
              processText(content, formatting)
            }
          }
        }
      }

      // Remove outer tags and process
      const cleaned = html.replace(/<br\s*\/?>/gi, '\n')
      extractFormatting(cleaned)

      // If no runs were created, just add plain text
      if (runs.length === 0 && html.trim()) {
        const plainText = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
        if (plainText) {
          runs.push(new TextRun({ text: plainText }))
        }
      }

      return runs
    }

    // Helper function to parse HTML tables
    const parseTable = (tableHtml: string): Table | null => {
      try {
        const rows: TableRow[] = []

        // Extract all tr elements
        const trMatches = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi)
        if (!trMatches) return null

        trMatches.forEach(trHtml => {
          const cells: TableCell[] = []

          // Extract th and td elements
          const cellMatches = trHtml.match(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi)
          if (!cellMatches) return

          cellMatches.forEach(cellHtml => {
            const isHeader = cellHtml.startsWith('<th')
            let content = cellHtml.replace(/<\/?t[hd][^>]*>/gi, '')
            content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1')
            const runs = parseInlineHTML(content)

            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: runs.length > 0 ? runs : [new TextRun({ text: content.replace(/<[^>]+>/g, '').trim() })]
                  })
                ],
                shading: isHeader ? {
                  fill: 'E5E7EB',
                  color: 'auto',
                  type: 'clear'
                } : undefined,
                margins: {
                  top: 100,
                  bottom: 100,
                  left: 150,
                  right: 150
                }
              })
            )
          })

          if (cells.length > 0) {
            rows.push(new TableRow({ children: cells }))
          }
        })

        if (rows.length === 0) return null

        return new Table({
          rows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }
          }
        })
      } catch (error) {
        console.error('Error parsing table:', error)
        return null
      }
    }

    // Helper function to convert TipTap JSON to HTML
    const tiptapJsonToHtml = (json: any): string => {
      if (!json || typeof json !== 'object') return ''

      // Handle array of nodes
      if (Array.isArray(json)) {
        return json.map(node => tiptapJsonToHtml(node)).join('')
      }

      const { type, content, attrs, marks, text } = json

      // Handle text nodes
      if (type === 'text') {
        let html = text || ''

        // Escape only the special HTML characters that could break HTML structure
        // but keep the text readable
        html = html.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')

        // Apply marks (formatting)
        if (marks && Array.isArray(marks)) {
          marks.forEach((mark: any) => {
            switch (mark.type) {
              case 'bold':
                html = `<strong>${html}</strong>`
                break
              case 'italic':
                html = `<em>${html}</em>`
                break
              case 'underline':
                html = `<u>${html}</u>`
                break
              case 'strike':
                html = `<s>${html}</s>`
                break
              case 'code':
                html = `<code>${html}</code>`
                break
              case 'link':
                const href = (mark.attrs?.href || '#').replace(/"/g, '&quot;')
                html = `<a href="${href}">${html}</a>`
                break
              case 'textStyle':
                let style = ''
                if (mark.attrs?.color) {
                  style += `color: ${mark.attrs.color};`
                }
                if (mark.attrs?.fontFamily) {
                  style += `font-family: ${mark.attrs.fontFamily};`
                }
                if (style) {
                  html = `<span style="${style}">${html}</span>`
                }
                break
              case 'highlight':
                const bgColor = mark.attrs?.color || 'yellow'
                html = `<mark style="background-color: ${bgColor}">${html}</mark>`
                break
            }
          })
        }

        return html
      }

      // Handle block nodes
      const childrenHtml = content ? tiptapJsonToHtml(content) : ''

      switch (type) {
        case 'doc':
          return childrenHtml

        case 'paragraph':
          const alignment = attrs?.textAlign
          const style = alignment ? ` style="text-align: ${alignment}"` : ''
          return `<p${style}>${childrenHtml}</p>`

        case 'heading':
          const level = attrs?.level || 1
          return `<h${level}>${childrenHtml}</h${level}>`

        case 'bulletList':
          return `<ul>${childrenHtml}</ul>`

        case 'orderedList':
          const start = attrs?.start && attrs.start !== 1 ? ` start="${attrs.start}"` : ''
          return `<ol${start}>${childrenHtml}</ol>`

        case 'listItem':
          // Process list item content differently to handle nested lists properly
          if (!content || content.length === 0) {
            return '<li></li>'
          }

          let itemHtml = ''

          for (const child of content) {
            if (child.type === 'bulletList' || child.type === 'orderedList') {
              // Nested list - add it directly
              itemHtml += tiptapJsonToHtml(child)
            } else if (child.type === 'paragraph') {
              // For paragraphs inside list items, extract just the content without <p> tags
              const paraContent = child.content ? tiptapJsonToHtml(child.content) : ''
              itemHtml += paraContent
            } else {
              itemHtml += tiptapJsonToHtml(child)
            }
          }

          return `<li>${itemHtml}</li>`

        case 'blockquote':
          return `<blockquote>${childrenHtml}</blockquote>`

        case 'codeBlock':
          return `<pre><code>${childrenHtml}</code></pre>`

        case 'horizontalRule':
          return '<hr/>'

        case 'hardBreak':
          return '<br/>'

        case 'table':
          return `<table>${childrenHtml}</table>`

        case 'tableRow':
          return `<tr>${childrenHtml}</tr>`

        case 'tableCell':
          return `<td>${childrenHtml}</td>`

        case 'tableHeader':
          return `<th>${childrenHtml}</th>`

        case 'image':
          const src = attrs?.src || ''
          const alt = attrs?.alt || ''
          const title = attrs?.title || ''
          return `<img src="${src}" alt="${alt}" title="${title}"/>`

        default:
          return childrenHtml
      }
    }

    // [UPDATED] Helper function to parse HTML and create formatted paragraphs with full formatting support
    // Helper function to parse HTML and create formatted paragraphs with full formatting support
    // [FINAL VERSION] Helper function to parse HTML and create formatted paragraphs
    const htmlToParagraphs = (html: string): (Paragraph | Table)[] => {
      const elements: (Paragraph | Table)[] = [];

      const processNodes = (nodes: HtmlNode[], level: number = -1) => {
        for (const node of nodes) {
          switch (node.tag) {
            case 'p':
              const pRuns = parseInlineNodes(node.children);
              if (pRuns.length > 0) {
                elements.push(new Paragraph({ children: pRuns, spacing: { after: 150 } }));
              }
              break;

            case 'ol':
            case 'ul':
              const isOrdered = node.tag === 'ol';
              const listItems = node.children.filter(child => child.tag === 'li');

              for (const li of listItems) {
                // Separate the direct content of the <li> from any nested lists inside it
                const contentNodes = li.children.filter(c => c.tag !== 'ol' && c.tag !== 'ul');
                const nestedListNodes = li.children.filter(c => c.tag === 'ol' || c.tag === 'ul');

                // The text of a list item is often inside a `<p>` tag. We need to get the content from inside that paragraph.
                let nodesForRuns: HtmlNode[] = [];
                if (contentNodes.length === 1 && contentNodes[0].tag === 'p') {
                  nodesForRuns = contentNodes[0].children;
                } else {
                  nodesForRuns = contentNodes; // Fallback for `<li>text</li>`
                }

                const liRuns = parseInlineNodes(nodesForRuns);
                if (liRuns.length > 0) {
                  elements.push(new Paragraph({
                    children: liRuns,
                    numbering: {
                      reference: isOrdered ? 'ordered-list' : 'unordered-list',
                      level: level + 1, // Increment the level for correct indentation
                    },
                    spacing: { after: 80 }
                  }));
                }

                // Now, recursively process any nested lists found inside this <li>
                if (nestedListNodes.length > 0) {
                  processNodes(nestedListNodes, level + 1);
                }
              }
              break;

            // Add other block-level tags like h1, h2, etc., if needed
            case 'h1':
            case 'h2':
            case 'h3':
              const headingRuns = parseInlineNodes(node.children);
              if (headingRuns.length > 0) {
                elements.push(new Paragraph({
                  children: headingRuns,
                  heading: node.tag === 'h1' ? HeadingLevel.HEADING_1 : node.tag === 'h2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
                  spacing: { before: 200, after: 100 }
                }));
              }
              break;
          }
        }
      };

      // We can still split by tables first, as they are distinct blocks
      const sections = html.split(/(<table[^>]*>[\s\S]*?<\/table>)/gi);

      for (const section of sections) {
        if (section.trim().startsWith('<table')) {
          const table = parseTable(section);
          if (table) elements.push(table);
        } else if (section.trim()) {
          const nodes = parseHtmlToNodes(section);
          processNodes(nodes);
        }
      }

      return elements;
    };

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

          // Section content - convert TipTap JSON to HTML first if needed
          const sectionContent = section.content?.html || section.content || ''
          let htmlContent = ''

          // Check if content is TipTap JSON or HTML string
          if (typeof sectionContent === 'object') {
            // It's TipTap JSON, convert to HTML first
            htmlContent = tiptapJsonToHtml(sectionContent)
          } else {
            // It's already HTML string
            htmlContent = sectionContent
          }

          const sectionParagraphs = htmlToParagraphs(htmlContent)
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

    // [UPDATED] Create DOCX document with numbering styles defined
    // Create DOCX document
    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'ordered-list',
            levels: [
              {
                level: 0,
                format: 'decimal',
                text: '%1.',
                alignment: AlignmentType.START,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
              },
              {
                level: 1,
                format: 'decimal', // Use decimal for level 1
                text: '%2.',
                alignment: AlignmentType.START,
                style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
              },
              {
                level: 2,
                format: 'decimal', // Use decimal for level 2
                text: '%3.',
                alignment: AlignmentType.START,
                style: { paragraph: { indent: { left: 2160, hanging: 360 } } },
              },
              {
                level: 3,
                format: 'decimal', // Use decimal for level 3
                text: '%4.',
                alignment: AlignmentType.START,
                style: { paragraph: { indent: { left: 2880, hanging: 360 } } },
              },
            ],
          },
          {
            reference: 'unordered-list',
            levels: [
              {
                level: 0,
                format: 'bullet',
                text: '•',
                alignment: AlignmentType.START,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
              },
              {
                level: 1,
                format: 'bullet',
                text: '•',
                alignment: AlignmentType.START,
                style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
              },
              {
                level: 2,
                format: 'bullet',
                text: '▪',
                alignment: AlignmentType.START,
                style: { paragraph: { indent: { left: 2160, hanging: 360 } } },
              },
            ],
          },
        ],
      },
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