import { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, TabStopType, ShadingType } from 'docx'
import { readFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import http from 'http'
import sizeOf from 'image-size'
// #region ############# HELPER FUNCTIONS (Existing) #############
    export const loadImage = async (imageUrl: string): Promise<Buffer | null> => {
      try {
        if (!imageUrl) return null
        if (imageUrl.startsWith('data:')) {
          const base64Data = imageUrl.split(',')[1]
          if (base64Data) return Buffer.from(base64Data, 'base64')
          return null
        }
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

    export const getImageDimensions = (buffer: Buffer): { width: number; height: number } | null => {
      try {
        const dimensions = sizeOf(buffer)
        if (dimensions && dimensions.width && dimensions.height) {
          return { width: dimensions.width, height: dimensions.height }
        }
        return null
      } catch (e) {
        return null
      }
    }

    export const calculateImageSize = (buffer: Buffer): { width: number; height: number } => {
      const dims = getImageDimensions(buffer)
      
      if (!dims || !dims.width || !dims.height) {
        return { width: 120, height: 40 }
      }
      
      const MAX_WIDTH = 150
      const MAX_HEIGHT = 60
      
      let width = dims.width
      let height = dims.height
      
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width)
        width = MAX_WIDTH
      }
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height)
        height = MAX_HEIGHT
      }
      
      return { width, height }
    }

    export const calculateClientLogoSize = (buffer: Buffer): { width: number; height: number } => {
      const dims = getImageDimensions(buffer)
      
      if (!dims || !dims.width || !dims.height) {
        return { width: 150, height: 75 }
      }
      
      const MAX_WIDTH = 250
      const MAX_HEIGHT = 100
      
      let width = dims.width
      let height = dims.height
      
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width)
        width = MAX_WIDTH
      }
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height)
        height = MAX_HEIGHT
      }
      
      return { width, height }
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
        return match ? match[1].split(',')[0].replace(/['"]/g, '').trim() : undefined;
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
        const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
        
        let match;
        while ((match = tagRegex.exec(html)) !== null) {
            const [, isClosing, tagName, attrText, text] = match;
            if (text) {
                stack[stack.length - 1].children.push({ text, attributes: {}, children: [] });
            } else if (tagName) {
                const lowerTag = tagName.toLowerCase();
                if (isClosing) {
                    // Find the matching tag in the stack
                    let matchIndex = stack.length - 1;
                    while (matchIndex > 0 && stack[matchIndex].tag !== lowerTag) {
                        matchIndex--;
                    }
                    if (matchIndex > 0) {
                        // Pop everything up to and including the matching tag
                        while (stack.length > matchIndex) {
                            const closedNode = stack.pop()!;
                            stack[stack.length - 1].children.push(closedNode);
                        }
                    }
                } else {
                    const attributes = parseAttributes(attrText);
                    const newNode: HtmlNode = { tag: lowerTag, attributes, children: [] };
                    
                    if (voidElements.has(lowerTag) || attrText.trim().endsWith('/')) {
                        stack[stack.length - 1].children.push(newNode);
                    } else {
                        stack.push(newNode);
                    }
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
                case 'br': runs.push(new TextRun({ break: 1, ...newFormatting })); break;
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
                        let hexColor = 'FFFF00';
                        if (bgMatch) {
                            const bgColor = bgMatch[1].trim();
                            const parsedHex = bgColor.toLowerCase().startsWith('rgb') ? rgbToHex(bgColor) : bgColor.replace('#', '');
                            if (parsedHex && parsedHex.toLowerCase() !== 'transparent') {
                                hexColor = parsedHex.toUpperCase();
                            } else if (parsedHex && parsedHex.toLowerCase() === 'transparent') {
                                hexColor = '';
                            }
                        }
                        if (hexColor) {
                            newFormatting.shading = {
                                type: ShadingType.CLEAR,
                                fill: hexColor
                            };
                        }
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
    const parseTable = (tableHtml: string, noBorders = false): Table | null => {
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
                    const noBorderStyle = { style: BorderStyle.NONE, size: 0, color: 'auto' };
                    const cellOptions: any = {
                        children: [new Paragraph({ children: runs, spacing: { before: 100, after: 100 } })],
                        shading: (!noBorders && isHeader) ? { fill: 'E5E7EB' } : undefined,
                        margins: { top: 200, bottom: 200, left: 200, right: 200 },
                        borders: noBorders ? {
                            top: noBorderStyle,
                            bottom: noBorderStyle,
                            left: noBorderStyle,
                            right: noBorderStyle
                        } : {
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
            const noBorderStyle = { style: BorderStyle.NONE, size: 0, color: 'auto' };
            return new Table({
                rows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: noBorders ? {
                    top: noBorderStyle,
                    bottom: noBorderStyle,
                    left: noBorderStyle,
                    right: noBorderStyle,
                    insideHorizontal: noBorderStyle,
                    insideVertical: noBorderStyle
                } : {
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

    const htmlToParagraphs = (html: string, noBorders = false, compact = false): (Paragraph | Table)[] => {
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
                            elements.push(new Paragraph({ children: pRuns, alignment, spacing: compact ? { before: 0, after: 0 } : { after: 150 } }));
                        }
                        break;
                    
                    case 'h1': case 'h2': case 'h3':
                        if (hasVisibleText(node.children)) {
                            const headingRuns = parseInlineNodes(node.children);
                            if (headingRuns.length > 0) {
                                const level = node.tag === 'h1' ? HeadingLevel.HEADING_1 : node.tag === 'h2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
                                elements.push(new Paragraph({
                                    children: headingRuns,
                                    heading: level,
                                    alignment,
                                    spacing: compact ? { before: 0, after: 0 } : { before: 300, after: 150 }
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

                    default:
                        // Recurse into generic containers (div, section, article, etc.)
                        if (node.children && node.children.length > 0) {
                            // If this node is NOT a block container (like a stray text node or inline element at the root),
                            // we should ideally wrap it in a paragraph. But typically TipTap wraps everything in <p>.
                            // We will recurse into it.
                            processNodes(node.children, listLevel);
                        } else if (node.text && node.text.trim()) {
                            // Raw text node at the root level without a container
                            const runs = parseInlineNodes([node]);
                            elements.push(new Paragraph({ children: runs, alignment, spacing: compact ? { before: 0, after: 0 } : { after: 150 } }));
                        }
                        break;
                }
            }
        };
        const sections = html.split(/(<table[^>]*>[\s\S]*?<\/table>)/gi);
        for (const section of sections) {
            if (section.trim().startsWith('<table')) {
                const table = parseTable(section, noBorders);
                if (table) elements.push(table);
            } else if (section.trim()) {
                const nodes = parseHtmlToNodes(section);
                processNodes(nodes);
            }
        }
        return elements;
    };
    // #endregion #############################################################


    export const tiptapJsonToHtml = (json: any): string => {
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



    export const processHtmlBlockAsync = async (html: string, noBorders = false, compact = false): Promise<(Paragraph | Table)[]> => {
      const children: (Paragraph | Table)[] = [];
      const imgRegex = /<img([^>]*)>/gi;
      let lastIndex = 0;
      let imgMatch;
      
      while ((imgMatch = imgRegex.exec(html)) !== null) {
        const beforeHtml = html.substring(lastIndex, imgMatch.index);
        if (beforeHtml.trim()) {
          children.push(...htmlToParagraphs(beforeHtml, noBorders, compact));
        }
        lastIndex = imgRegex.lastIndex;

        const imgAttrs = imgMatch[1];
        const srcMatch = imgAttrs.match(/src="([^"]*)"/);
        const widthMatch = imgAttrs.match(/width="(\d+)"/) || imgAttrs.match(/style="[^"]*width:\s*(\d+)px/i);
        const heightMatch = imgAttrs.match(/height="(\d+)"/);
        const alignMatch = imgAttrs.match(/data-align="([^"]+)"/);
        
        if (srcMatch) {
          const imgSrc = srcMatch[1];
          let width = widthMatch ? parseInt(widthMatch[1]) : 0;
          let height = heightMatch ? parseInt(heightMatch[1]) : 0;
          
          const alignValue = alignMatch ? alignMatch[1] : 'center';
          let alignment: any = AlignmentType.CENTER;
          if (alignValue === 'left') alignment = AlignmentType.LEFT;
          else if (alignValue === 'right') alignment = AlignmentType.RIGHT;

          const imgBuffer = await loadImage(imgSrc);
          if (imgBuffer) {
            const dims = getImageDimensions(imgBuffer);
            if (dims && dims.width && dims.height) {
              if (!width && !height) {
                width = dims.width > 600 ? 600 : dims.width;
                height = Math.round((width * dims.height) / dims.width);
              } else if (width && !height) {
                width = width > 600 ? 600 : width;
                height = Math.round((width * dims.height) / dims.width);
              } else if (!width && height) {
                width = Math.round((height * dims.width) / dims.height);
                width = width > 600 ? 600 : width;
              } else {
                width = width > 600 ? 600 : width;
              }
            } else {
              width = width || 400;
              height = height || Math.round(width * 0.75);
              width = width > 600 ? 600 : width;
            }

            children.push(new Paragraph({
              children: [
                new ImageRun({
                  data: imgBuffer,
                  transformation: { width, height },
                  type: 'png'
                })
              ],
              alignment: alignment,
              spacing: compact ? { before: 0, after: 0 } : { after: 200 }
            }));
          }
        }
      }
      
      const remainingHtml = html.substring(lastIndex);
      if (remainingHtml.trim()) {
        children.push(...htmlToParagraphs(remainingHtml, noBorders, compact));
      }
      
      return children;
    };

    






