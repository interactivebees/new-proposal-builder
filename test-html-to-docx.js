const fs = require('fs');
const HTMLtoDOCX = require('html-to-docx');

async function generate() {
  const htmlString = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Cambria', serif; }
            h1 { text-align: center; font-size: 24pt; line-height: 1.2; }
            p { text-align: center; }
            img { width: 300px; height: 150px; display: block; margin: 0 auto; }
        </style>
    </head>
    <body>
        <h1>Proposal for Development</h1>
        <p>Testing html-to-docx</p>
    </body>
    </html>
  `;
  const fileBuffer = await HTMLtoDOCX(htmlString, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });
  fs.writeFileSync('test-html-to-docx.docx', fileBuffer);
  console.log("Done");
}

generate().catch(console.error);
