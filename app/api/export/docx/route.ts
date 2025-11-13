import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, TabStopType } from 'docx'
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
                const cellMatches = trHtml.match(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi);
                if (!cellMatches) return;
                cellMatches.forEach(cellHtml => {
                    const isHeader = cellHtml.startsWith('<th');
                    let content = cellHtml.replace(/<\/?t[hd][^>]*>/gi, '');
                    const cellNodes = parseHtmlToNodes(content);
                    const runs = parseInlineNodes(cellNodes);
                    cells.push(
                        new TableCell({
                            children: [new Paragraph({ children: runs })],
                            shading: isHeader ? { fill: 'E5E7EB' } : undefined,
                            margins: { top: 100, bottom: 100, left: 150, right: 150 }
                        })
                    );
                });
                if (cells.length > 0) rows.push(new TableRow({ children: cells }));
            });
            if (rows.length === 0) return null;
            return new Table({
                rows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                    left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                    right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }
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
                                    heading: node.tag === 'h1' ? HeadingLevel.HEADING_1 : node.tag === 'h2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
                                    alignment,
                                    spacing: { before: 200, after: 100 }
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
            switch (mark.type) {
              case 'bold': html = `<strong>${html}</strong>`; break;
              case 'italic': html = `<em>${html}</em>`; break;
              case 'underline': html = `<u>${html}</u>`; break;
              case 'strike': html = `<s>${html}</s>`; break;
              case 'code': html = `<code>${html}</code>`; break;
              case 'textStyle': {
                let style = '';
                if (mark.attrs?.color) style += `color: ${mark.attrs.color};`;
                if (mark.attrs?.fontFamily) style += `font-family: ${mark.attrs.fontFamily};`;
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
        case 'tableCell': return `<td>${childrenHtml || '<p></p>'}</td>`;
        case 'tableHeader': return `<th>${childrenHtml || '<p></p>'}</th>`;
        default: return childrenHtml;
      }
    };


    // ################### DOCUMENT ASSEMBLY ######################
    const docChildren: any[] = []

    if (proposal.clientLogoUrl) {
      const logoBuffer = await loadImage(proposal.clientLogoUrl)
      if (logoBuffer) {
        docChildren.push(new Paragraph({
          children: [
            new ImageRun({
              data: logoBuffer,
              transformation: { width: 150, height: 75 },
              type: 'png' // [FIXED] Added the required 'type' property
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }));
      }
    }

    docChildren.push(new Paragraph({ text: proposal.title, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }));
    docChildren.push(new Paragraph({ text: 'Client Information', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }));
    docChildren.push(new Paragraph({
      children: [
        new TextRun({ text: `Client: ${proposal.clientName || 'N/A'}`, break: 1 }),
        new TextRun({ text: `Company: ${proposal.clientCompany || 'N/A'}`, break: 1 }),
        new TextRun({ text: `Email: ${proposal.clientEmail || 'N/A'}`, break: 1 }),
        new TextRun({ text: `Address: ${proposal.clientAddress || 'N/A'}`, break: 1 })
      ],
      spacing: { after: 400 }
    }));

    const content = proposal.content as any
    if (content?.sections && Array.isArray(content.sections)) {
      content.sections
        .sort((a: any, b: any) => a.order - b.order)
        .forEach((section: any) => {
          docChildren.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
          const sectionContent = section.content?.html || section.content || '';
          const htmlContent = typeof sectionContent === 'object' ? tiptapJsonToHtml(sectionContent) : sectionContent;
          const sectionParagraphs = htmlToParagraphs(htmlContent);
          docChildren.push(...sectionParagraphs);
        });
    }

    if (proposal.pricingItems && proposal.pricingItems.length > 0) {
      docChildren.push(new Paragraph({ text: 'Pricing Breakdown', heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
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
        properties: {},
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