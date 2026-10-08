const fs = require('fs');
const HTMLtoDOCX = require('html-to-docx');

async function generate() {
  const htmlString = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"></head>
    <body>
        <h1 style="text-align: center;">Proposal for Development</h1>
        <p style="text-align: center;">Testing html-to-docx inline</p>
    </body>
    </html>
  `;
  const fileBuffer = await HTMLtoDOCX(htmlString, null, {
  });
  fs.writeFileSync('test-inline-docx.docx', fileBuffer);
  console.log("Done");
}
generate().catch(console.error);
