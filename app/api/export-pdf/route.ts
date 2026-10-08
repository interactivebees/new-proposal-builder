import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(req: NextRequest) {
  try {
    const { html, headerHtml, footerHtml, fontFamily, pageSettings } = await req.json()

    if (!html) {
      return NextResponse.json({ error: 'No HTML content provided' }, { status: 400 })
    }

    const defaultFont = fontFamily && fontFamily !== 'Default font' ? fontFamily.split(',')[0].replace(/['"]/g, '').trim() : 'Arial'

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <style>
              body { 
                  font-family: '${defaultFont}', sans-serif; 
                  font-size: 16px;
                  color: #000000;
                  line-height: 1.5;
                  margin: 0;
                  padding: 0;
              }
              p { margin: 0 0 10px 0; }
              table { border-collapse: collapse; width: 100%; }
              td, th { border: 1px solid black; padding: 4px; }
              img { max-width: 100%; height: auto; }
              .ProseMirror { outline: none; }
          </style>
      </head>
      <body>
          ${html}
      </body>
      </html>
    `

    let browser = null
    try {
      const executablePath = process.env.CHROMIUM_PATH || undefined
      
      if (executablePath) {
        browser = await puppeteer.launch({
          executablePath,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
      } else {
        browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true,
        })
      }

      const page = await browser.newPage()
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' })
      await page.emulateMediaType('print')

      const getMargin = (side: 'top' | 'bottom' | 'left' | 'right') => {
        if (pageSettings && pageSettings.margin && pageSettings.unit) {
          return `${pageSettings.margin[side]}${pageSettings.unit}`
        }
        return '2cm'
      }

      const pdf = await page.pdf({
        format: pageSettings?.format || 'A4',
        printBackground: true,
        displayHeaderFooter: (headerHtml || footerHtml) ? true : false,
        margin: {
          top: getMargin('top'),
          bottom: getMargin('bottom'),
          left: getMargin('left'),
          right: getMargin('right'),
        },
        headerTemplate: headerHtml ? `<div style="font-family: '${defaultFont}', sans-serif; width: 100%; font-size: 10px; margin: 0 ${getMargin('left')};">${headerHtml}</div>` : '<div></div>',
        footerTemplate: footerHtml ? `<div style="font-family: '${defaultFont}', sans-serif; width: 100%; text-align: center; font-size: 10px; margin: 0 ${getMargin('left')};">${footerHtml}</div>` : '<div></div>',
      })

      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Document.pdf"'
        }
      })
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  } catch (error) {
    console.error('Error in Standalone PDF Export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
