import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, TabStopType, Header, Footer, PageNumber } from 'docx'

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

    const companySettings = await prisma.companySetting.findUnique({
      where: { userId: session.user.id }
    })

    const hasAccess =
      proposal.createdBy === session.user.id ||
      session.user.role === 'OWNER' ||
      session.user.role === 'BUSINESS_EXPERT'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // #region ############# HELPER FUNCTIONS (Existing) #############
    const loadImage = async (imageUrl: string): Promise<Buffer | null> => {
      try {
        if (imageUrl.startsWith('/uploads/')) {
          const filePath = join(process.cwd(), 'public', imageUrl)
          return readFileSync(filePath)
        } else if (imageUrl.startsWith('http')) {
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
    
    const getFontFamily = (styleAttr: string): string | undefined => {
        const match = styleAttr.match(/font-family:\s*"?([^;""]+)"?/i);
        return match ? match[1].trim() : undefined;
    };

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

    const getFontSize = (styleAttr: string): number | undefined => {
      const match = styleAttr.match(/font-size:\s*([^;]+)/i)
      if (!match) return undefined
      const raw = match[1].trim().toLowerCase()
      const parseValue = (value: string) => {
        const num = parseFloat(value)
        if (Number.isNaN(num)) return undefined
        return num
      }

      if (raw.endsWith('px')) {
        const px = parseValue(raw.replace('px', ''))
        if (px === undefined) return undefined
        return Math.round(px * 1.5)
      }

      if (raw.endsWith('pt')) {
        const pt = parseValue(raw.replace('pt', ''))
        if (pt === undefined) return undefined
        return Math.round(pt * 2)
      }

      const numeric = parseValue(raw)
      if (numeric !== undefined) {
        return Math.round(numeric * 1.5)
      }
      return undefined
    }

    const getColor = (styleAttr: string): string | undefined => {
      const match = styleAttr.match(/color:\s*([^;]+)/i)
      if (match) {
        const colorValue = match[1].trim()
        if (colorValue.toLowerCase().startsWith('rgb')) {
          return rgbToHex(colorValue)
        }
        return colorValue.replace('#', '').toUpperCase()
      }
      return undefined
    }
    // #endregion ######################################################


    // #region ############# ADVANCED HTML PARSING ENGINE #############
    interface HtmlNode {
        tag?: string;
        text?: string;
        attributes: { [key: string]: string };
        children: HtmlNode[];
    }

    const parseAttributes = (attrString: string): { [key: string]: string } => {
        const attributes: { [key: string]: string } = {};
        const attrRegex = /([a-z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi;
        let match;
        while ((match = attrRegex.exec(attrString))) {
            attributes[match[1].toLowerCase()] = match[2] || match[3] || match[4];
        }
        return attributes;
    };

    const parseHtmlToNodes = (html: string): HtmlNode[] => {
        const stack: HtmlNode[] = [{ attributes: {}, children: [] }];
        const tagRegex = /<(\/)?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
        let match;
        while ((match = tagRegex.exec(html)) !== null) {
            const [, isClosing, tagName, attrText, text] = match;
            if (text) {
                stack[stack.length - 1].children.push({ text, attributes: {}, children: [] });
            } else if (tagName) {
                if (isClosing) {
                    if (stack.length > 1) {
                        const closedNode = stack.pop()!;
                        stack[stack.length - 1].children.push(closedNode);
                    }
                } else {
                    const attributes = parseAttributes(attrText);
                    const newNode: HtmlNode = { tag: tagName.toLowerCase(), attributes, children: [] };
                    stack.push(newNode);
                }
            }
        }
        while (stack.length > 1) {
            const node = stack.pop()!;
            stack[stack.length - 1].children.push(node);
        }
        return stack[0].children;
    };

    const parseInlineNodes = (nodes: HtmlNode[]): TextRun[] => {
        const runs: TextRun[] = [];
        const buildRuns = (node: HtmlNode, formatting: any = {}) => {
            if (node.text) {
                const decodedText = node.text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                if (decodedText) {
                    runs.push(new TextRun({ text: decodedText, ...formatting }));
                }
                return;
            }
            const newFormatting = { ...formatting };
            switch (node.tag) {
                case 'strong': case 'b': newFormatting.bold = true; break;
                case 'em': case 'i': newFormatting.italics = true; break;
                case 'u': newFormatting.underline = {}; break;
                case 's': newFormatting.strike = true; break;
                case 'span':
                case 'mark': {
                    const style = node.attributes.style || '';
                    const textColor = getColor(style);
                    if (textColor) newFormatting.color = textColor;
                    const fontSize = getFontSize(style);
                    if (fontSize) newFormatting.size = fontSize;
                    const fontFamily = getFontFamily(style);
                    if (fontFamily) newFormatting.font = fontFamily;
                    const bgMatch = style.match(/background-color:\s*([^;]+)/i);
                    if (node.tag === 'mark' || bgMatch) {
                        let highlightColor = 'yellow';
                        if (bgMatch) {
                            const bgColor = bgMatch[1].trim();
                            const hexColor = bgColor.toLowerCase().startsWith('rgb') ? rgbToHex(bgColor) : bgColor.replace('#', '');
                            if (hexColor) highlightColor = hexColor;
                        }
                        newFormatting.highlight = highlightColor;
                    }
                    break;
                }
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

    const parseTable = (tableHtml: string): Table | null => {
        try {
            const rows: TableRow[] = [];
            const trMatches = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
            if (!trMatches) return null;
            trMatches.forEach(trHtml => {
                const cells: TableCell[] = [];
                const cellRegex = /<(th|td)([^>]*)>([\s\S]*?)<\/\1>/gi;
                let cellMatch: RegExpExecArray | null;
                while ((cellMatch = cellRegex.exec(trHtml)) !== null) {
                    const [, cellTag, attrText = '', innerHtml = '' ] = cellMatch;
                    const isHeader = cellTag.toLowerCase() === 'th';
                    const attributes = parseAttributes(attrText);
                    const colspan = attributes.colspan ? parseInt(attributes.colspan, 10) : undefined;
                    const rowspan = attributes.rowspan ? parseInt(attributes.rowspan, 10) : undefined;

                    const cellNodes = parseHtmlToNodes(innerHtml);
                    const runs = parseInlineNodes(cellNodes);
                    const cellOptions: any = {
                        children: [new Paragraph({ children: runs, spacing: { before: 100, after: 100 } })],
                        shading: isHeader ? { fill: 'E5E7EB' } : undefined,
                        margins: { top: 200, bottom: 200, left: 200, right: 200 },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                            left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                            right: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
                        }
                    };

                    if (colspan && colspan > 1) {
                        cellOptions.columnSpan = colspan;
                    }
                    if (rowspan && rowspan > 1) {
                        cellOptions.rowSpan = rowspan;
                    }

                    cells.push(new TableCell(cellOptions));
                }
                if (cells.length > 0) rows.push(new TableRow({ children: cells }));
            });

            if (rows.length === 0) return null;
            return new Table({
                rows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                    bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                    left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                    right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
                }
            });
        } catch (error) {
            console.error('Error parsing table:', error);
            return null;
        }
    };

    const htmlToParagraphs = (html: string): (Paragraph | Table)[] => {
        const elements: (Paragraph | Table)[] = [];
        const hasVisibleText = (nodes: HtmlNode[]): boolean => {
            for (const node of nodes) {
                if (node.text && node.text.trim().length > 0) return true;
                if (node.children && hasVisibleText(node.children)) return true;
            }
            return false;
        };

        const processNodes = (nodes: HtmlNode[], listLevel: number = -1) => {
            for (const node of nodes) {
                const style = node.attributes.style || '';
                const alignment = getAlignment(style);

                switch (node.tag) {
                    case 'p':
                        if (hasVisibleText(node.children)) {
                            const pRuns = parseInlineNodes(node.children);
                            elements.push(new Paragraph({ children: pRuns, alignment, spacing: { after: 150 } }));
                        }
                        break;
                    
                    case 'h1': case 'h2': case 'h3':
                        if (hasVisibleText(node.children)) {
                            const headingRuns = parseInlineNodes(node.children);
                            if (headingRuns.length > 0) {
                                elements.push(new Paragraph({
                                    children: headingRuns,
                                    alignment,
                                    spacing: { before: 300, after: 150 }
                                }));
                            }
                        }
                        break;

                    case 'ol': case 'ul':
                        const isOrdered = node.tag === 'ol';
                        const listItems = node.children.filter(child => child.tag === 'li');
                        const currentLevel = listLevel + 1;
                        for (const li of listItems) {
                            const contentNodes = li.children.filter(c => c.tag !== 'ol' && c.tag !== 'ul');
                            const nestedListNodes = li.children.filter(c => c.tag === 'ol' || c.tag === 'ul');
                            let nodesForRuns: HtmlNode[] = (contentNodes.length === 1 && contentNodes[0].tag === 'p') ? contentNodes[0].children : contentNodes;
                            
                            if (hasVisibleText(nodesForRuns)) {
                                 const liRuns = parseInlineNodes(nodesForRuns);
                                 const tabStopPositions = [720, 1440, 2160, 2880];
                                 const tabStopPosition = tabStopPositions[currentLevel] || tabStopPositions[tabStopPositions.length - 1];
                                 elements.push(new Paragraph({
                                     children: liRuns,
                                     numbering: { reference: isOrdered ? 'ordered-list' : 'unordered-list', level: currentLevel },
                                     tabStops: [{ type: TabStopType.LEFT, position: tabStopPosition }],
                                     spacing: { after: 80 }
                                 }));
                            }
                            if (nestedListNodes.length > 0) processNodes(nestedListNodes, currentLevel);
                        }
                        break;
                }
            }
        };
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
    // #endregion #############################################################


    const tiptapJsonToHtml = (json: any): string => {
      if (!json || typeof json !== 'object') return ''
      if (Array.isArray(json)) return json.map(node => tiptapJsonToHtml(node)).join('');
      const { type, content, attrs, marks, text } = json;
      if (type === 'text') {
        let html = text || '';
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (marks && Array.isArray(marks)) {
          marks.forEach((mark: any) => {
            switch (type) {
              case 'bold': html = `<strong>${html}</strong>`; break;
              case 'italic': html = `<em>${html}</em>`; break;
              case 'underline': html = `<u>${html}</u>`; break;
              case 'strike': html = `<s>${html}</s>`; break;
              case 'code': html = `<code>${html}</code>`; break;
              case 'textStyle': {
                let style = '';
                if (mark.attrs?.color) style += `color: ${mark.attrs.color};`;
                if (mark.attrs?.fontFamily) style += `font-family: ${mark.attrs.fontFamily};`;
                if (mark.attrs?.fontSize) style += `font-size: ${mark.attrs.fontSize};`;
                if (style) html = `<span style="${style}">${html}</span>`;
                break;
              }
              case 'highlight':
                const bgColor = mark.attrs?.color || 'yellow';
                html = `<mark style="background-color: ${bgColor}">${html}</mark>`;
                break;
            }
          });
        }
        return html;
      }
      const childrenHtml = content ? tiptapJsonToHtml(content) : '';
      switch (type) {
        case 'doc': return childrenHtml;
        case 'paragraph': {
          const style = attrs?.textAlign ? ` style="text-align: ${attrs.textAlign}"` : '';
          return `<p${style}>${childrenHtml || ''}</p>`;
        }
        case 'heading': {
          const level = attrs?.level || 1;
          const style = attrs?.textAlign ? ` style="text-align: ${attrs.textAlign}"` : '';
          return `<h${level}${style}>${childrenHtml}</h${level}>`;
        }
        case 'bulletList': return `<ul>${childrenHtml}</ul>`;
        case 'orderedList': return `<ol>${childrenHtml}</ol>`;
        case 'listItem': {
            if (!content || content.length === 0) return '<li><p></p></li>';
            let itemHtml = '';
            for (const child of content) {
                if (child.type === 'paragraph' || child.type === 'bulletList' || child.type === 'orderedList') {
                     itemHtml += tiptapJsonToHtml(child);
                }
            }
            return `<li>${itemHtml}</li>`;
        }
        case 'table': return `<table><tbody>${childrenHtml}</tbody></table>`;
        case 'tableRow': return `<tr>${childrenHtml}</tr>`;
        case 'tableCell': {
          const colspan = attrs?.colspan && attrs.colspan > 1 ? ` colspan="${attrs.colspan}"` : ''
          const rowspan = attrs?.rowspan && attrs.rowspan > 1 ? ` rowspan="${attrs.rowspan}"` : ''
          return `<td${colspan}${rowspan}>${childrenHtml || '<p></p>'}</td>`
        }
        case 'tableHeader': {
          const colspan = attrs?.colspan && attrs.colspan > 1 ? ` colspan="${attrs.colspan}"` : ''
          const rowspan = attrs?.rowspan && attrs.rowspan > 1 ? ` rowspan="${attrs.rowspan}"` : ''
          return `<th${colspan}${rowspan}>${childrenHtml || '<p></p>'}</th>`
        }
        default: return childrenHtml;
      }
    };


    // ################### DOCUMENT ASSEMBLY ######################
    const docChildren: (Paragraph | Table)[] = []
    const sessionCompanyName = (session.user as { companyName?: string })?.companyName
    const companyLogoBuffer = companySettings?.logoUrl ? await loadImage(companySettings.logoUrl) : null

    const headerChildren: Paragraph[] = []

    if (companyLogoBuffer) {
      headerChildren.push(new Paragraph({
        children: [
          new ImageRun({
            data: companyLogoBuffer,
            transformation: { width: 120, height: 40 },
            type: 'png'
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
        border: {
          top: { style: BorderStyle.NONE, size: 0 },
          bottom: { style: BorderStyle.NONE, size: 0 },
          left: { style: BorderStyle.NONE, size: 0 },
          right: { style: BorderStyle.NONE, size: 0 }
        }
      }))
    } else if (companySettings?.companyName || sessionCompanyName) {
      headerChildren.push(new Paragraph({
        children: [
          new TextRun({ text: companySettings?.companyName || sessionCompanyName || '', bold: true })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0 }
      }))
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date())

    const footerAccentColor = '8E5B5B'
    const footerParagraphs: Paragraph[] = [
      new Paragraph({
        border: {
          top: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
        },
        spacing: { after: 120 }
      }),
      new Paragraph({
        tabStops: [
          { type: TabStopType.LEFT, position: 0 },
          { type: TabStopType.CENTER, position: 5400 },
          { type: TabStopType.RIGHT, position: 10500 }
        ],
        children: [
          new TextRun({ text: formattedDate, size: 20 }),
          new TextRun({ text: '\t' }),
          new TextRun({ text: proposal.title.length > 50 ? proposal.title.substring(0, 47) + '...' : proposal.title, size: 20, bold: true }),
          new TextRun({ text: '\t' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 20 })
        ],
        spacing: { before: 0 }
      })
    ]

    if (proposal.clientLogoUrl) {
      const logoBuffer = await loadImage(proposal.clientLogoUrl)
      if (logoBuffer) {
        docChildren.push(new Paragraph({
          children: [
            new ImageRun({
              data: logoBuffer,
              transformation: { width: 150, height: 75 },
              type: 'png'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }));
      }
    }

    // Cover Page Title
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: proposal.title, bold: true, color: '000000', size: 40 })],
      alignment: AlignmentType.CENTER, 
      spacing: { after: 300, before: 800 }
    }));

    // Add horizontal line under title
    docChildren.push(new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' }
      },
      spacing: { after: 600 }
    }));

    // Submitted to section
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: 'Submitted to:', bold: true, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }));

    docChildren.push(new Paragraph({
      children: [new TextRun({ text: proposal.clientName || 'N/A', bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }));

    docChildren.push(new Paragraph({
      children: [new TextRun({ text: proposal.clientCompany || 'N/A', size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 }
    }));

    if (proposal.clientAddress) {
      docChildren.push(new Paragraph({
        children: [new TextRun({ text: proposal.clientAddress, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }));
    }

    // Submitted by section
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: 'Submitted by:', bold: true, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }));

    const creatorName = proposal.creator?.name || session.user.name || 'N/A';
    const companyName = companySettings?.companyName || sessionCompanyName || 'N/A';
    
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: creatorName, bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }));

    docChildren.push(new Paragraph({
      children: [new TextRun({ text: companyName, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 }
    }));

    // Page break before content
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: '', break: 2 })],
      pageBreakBefore: true
    }));

    const content = proposal.content as any
    if (content?.sections && Array.isArray(content.sections)) {
      content.sections
        .sort((a: any, b: any) => a.order - b.order)
        .forEach((section: any) => {
          docChildren.push(new Paragraph({ 
            children: [new TextRun({ text: section.title, bold: true, color: '000000', size: 24 })],
            spacing: { before: 200, after: 100 } 
          }));
          const sectionContent = section.content?.html || section.content || '';
          const htmlContent = typeof sectionContent === 'object' ? tiptapJsonToHtml(sectionContent) : sectionContent;
          const sectionParagraphs = htmlToParagraphs(htmlContent);
          docChildren.push(...sectionParagraphs);
        });
    }

    if (proposal.pricingItems && proposal.pricingItems.length > 0) {
      docChildren.push(new Paragraph({ 
        children: [new TextRun({ text: 'Pricing Breakdown', bold: true, color: '000000', size: 24 })],
        spacing: { before: 200, after: 100 } 
      }));
      proposal.pricingItems.forEach((item: any) => {
        docChildren.push(new Paragraph({ children: [new TextRun({ text: `${item.serviceDescription}: $${item.cost.toLocaleString()} ${item.frequency || 'one-time'}`, break: 1 })] }));
      });
      const total = proposal.pricingItems.reduce((sum: number, item: any) => sum + item.cost, 0);
      docChildren.push(new Paragraph({ children: [new TextRun({ text: `Total: $${total.toLocaleString()}`, bold: true, break: 1 })], spacing: { before: 200 } }));
    }

    // ################### DOCUMENT CREATION ######################
    const doc = new Document({
      numbering: {
        config: [
            {
                reference: 'ordered-list',
                levels: [
                    { level: 0, format: 'decimal', text: '%1.\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
                    { level: 1, format: 'decimal', text: '%2.\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
                    { level: 2, format: 'decimal', text: '%3.\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 2160, hanging: 360 } } } },
                ],
            },
            {
                reference: 'unordered-list',
                levels: [
                    { level: 0, format: 'bullet', text: '•\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
                    { level: 1, format: 'bullet', text: '•\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
                    { level: 2, format: 'bullet', text: '•\t', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 2160, hanging: 360 } } } },
                ],
            },
        ],
      },
      sections: [{
        children: docChildren,
        properties: {
          page: {
            margin: {
              top: 720,
              right: 1080,
              bottom: 720,
              left: 1080,
              header: 360,
              footer: 360
            }
          }
        },
        headers: headerChildren.length > 0 ? { default: new Header({ children: headerChildren }) } : undefined,
        footers: { default: new Footer({ children: footerParagraphs }) }
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const sanitizedFilename = proposal.title.replace(/[^a-zA-Z0-9\s-]/g, '_').replace(/\s+/g, '_').substring(0, 100);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${sanitizedFilename}.docx"`
      }
    });

  } catch (error) {
    console.error('Error exporting DOCX:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}