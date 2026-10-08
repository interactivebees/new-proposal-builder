import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import HTMLtoDOCX from 'html-to-docx'

export async function POST(req: NextRequest) {
  try {
    const { html, headerHtml, footerHtml, fontFamily } = await req.json()

    if (!html) {
      return NextResponse.json({ error: 'No HTML content provided' }, { status: 400 })
    }

    // We wrap the HTML in a container that explicitly sets the font and margins
    const defaultFont = fontFamily && fontFamily !== 'Default font' ? fontFamily.split(',')[0].replace(/['"]/g, '').trim() : 'Arial'
    
    // Convert TipTap HTML into a complete HTML document with inline styles
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <style>
              body { 
                  font-family: '${defaultFont}', sans-serif; 
                  font-size: 12pt;
                  color: #000000;
                  line-height: 1.15;
              }
              p { margin: 0 0 10pt 0; }
              table { border-collapse: collapse; width: 100%; }
              td, th { border: 1px solid black; padding: 4px; }
              img { max-width: 100%; }
              h1, h2, h3, h4, h5, h6 { margin-top: 12pt; margin-bottom: 6pt; line-height: 1.2; }
          </style>
      </head>
      <body>
          ${html}
      </body>
      </html>
    `

    // Generate the DOCX buffer using html-to-docx
    const fileBuffer = await HTMLtoDOCX(fullHtml, headerHtml ? `<div style="font-family: '${defaultFont}';">${headerHtml}</div>` : null, {
      table: { row: { cantSplit: true } },
      footer: footerHtml ? true : false, // html-to-docx can generate page numbers natively
      pageNumber: true,
      margins: {
        top: 720,
        right: 1080,
        bottom: 720,
        left: 1080,
        header: 200,
        footer: 360
      }
    }, footerHtml ? `<div style="font-family: '${defaultFont}'; text-align: center; width: 100%;">${footerHtml}</div>` : undefined)

    const uint8Array = new Uint8Array(fileBuffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Document.docx"'
      }
    })
  } catch (error) {
    console.error('Error in Standalone DOCX Export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

