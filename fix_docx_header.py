import re

with open('app/api/export/docx/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

helper_func = """
    const processHtmlBlockAsync = async (html: string): Promise<(Paragraph | Table)[]> => {
      const children: (Paragraph | Table)[] = [];
      const imgRegex = /<img([^>]*)>/gi
      let imgMatch
      let remainingHtml = html;
      while ((imgMatch = imgRegex.exec(html)) !== null) {
        const imgAttrs = imgMatch[1]
        const srcMatch = imgAttrs.match(/src="([^"]*)"/)
        const widthMatch = imgAttrs.match(/width="(\d+)"/) || imgAttrs.match(/style="[^"]*width:\s*(\d+)px/i)
        const heightMatch = imgAttrs.match(/height="(\d+)"/)
        const alignMatch = imgAttrs.match(/data-align="([^"]+)"/)
        
        if (srcMatch) {
          const imgSrc = srcMatch[1]
          let width = widthMatch ? parseInt(widthMatch[1]) : 400
          if (width > 600) width = 600
          const height = heightMatch ? parseInt(heightMatch[1]) : Math.round(width * 0.75)
          
          const alignValue = alignMatch ? alignMatch[1] : 'center'
          let alignment: any = AlignmentType.CENTER
          if (alignValue === 'left') alignment = AlignmentType.LEFT
          else if (alignValue === 'right') alignment = AlignmentType.RIGHT

          const imgBuffer = await loadImage(imgSrc)
          if (imgBuffer) {
            children.push(new Paragraph({
              children: [
                new ImageRun({
                  data: imgBuffer,
                  transformation: { width, height },
                  type: 'png'
                })
              ],
              alignment: alignment,
              spacing: { after: 200 }
            }))
          }
        }
        remainingHtml = remainingHtml.replace(imgMatch[0], '');
      }
      
      const parsedParagraphs = htmlToParagraphs(remainingHtml);
      children.push(...parsedParagraphs);
      return children;
    };

    // ################### DOCUMENT ASSEMBLY ######################
"""

content = content.replace("    // ################### DOCUMENT ASSEMBLY ######################", helper_func)

header_logic_target = """    const headerChildren: Paragraph[] = []

    if (companyLogoBuffer) {
      const logoSize = calculateImageSize(companyLogoBuffer)
      headerChildren.push(new Paragraph({
        children: [
          new ImageRun({
            data: companyLogoBuffer,
            transformation: { width: logoSize.width, height: logoSize.height },
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
    }"""

new_header_logic = """    const proposalContent = proposal.content as any;
    let customHeaderHtml = '';
    let customFooterHtml = '';
    if (proposalContent?.sections && Array.isArray(proposalContent.sections)) {
      for (const sec of proposalContent.sections) {
        if (sec.content?.header && !customHeaderHtml) customHeaderHtml = sec.content.header;
        if (sec.content?.footer && !customFooterHtml) customFooterHtml = sec.content.footer;
      }
    } else if (proposalContent?.header || proposalContent?.footer) {
      customHeaderHtml = proposalContent.header || '';
      customFooterHtml = proposalContent.footer || '';
    }

    let headerChildren: (Paragraph | Table)[] = []
    
    if (customHeaderHtml) {
      headerChildren = await processHtmlBlockAsync(customHeaderHtml);
    } else {
      if (companyLogoBuffer) {
        const logoSize = calculateImageSize(companyLogoBuffer)
        headerChildren.push(new Paragraph({
          children: [
            new ImageRun({
              data: companyLogoBuffer,
              transformation: { width: logoSize.width, height: logoSize.height },
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
    }"""

content = content.replace(header_logic_target, new_header_logic)

footer_logic_target = """    const footerAccentColor = '8E5B5B'
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
    ]"""

new_footer_logic = """    const footerAccentColor = '8E5B5B'
    let footerParagraphs: (Paragraph | Table)[] = [];
    
    if (customFooterHtml) {
      footerParagraphs = await processHtmlBlockAsync(customFooterHtml);
    } else {
      footerParagraphs = [
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
    }"""

content = content.replace(footer_logic_target, new_footer_logic)

with open('app/api/export/docx/route.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
