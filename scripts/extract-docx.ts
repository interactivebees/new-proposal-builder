import mammoth from 'mammoth'
import * as fs from 'fs'
import * as path from 'path'

async function extractDocx() {
  const docxPath = path.join(process.cwd(), 'Proposal_for_Century Ply — Warranty Portal Scope of Work.docx')
  
  try {
    const result = await mammoth.convertToHtml({ path: docxPath })
    const html = result.value
    const messages = result.messages
    
    console.log('=== EXTRACTED HTML CONTENT ===\n')
    console.log(html)
    console.log('\n=== MESSAGES ===')
    console.log(messages)
    
    // Save to file for easier viewing
    const outputPath = path.join(process.cwd(), 'extracted-proposal.html')
    fs.writeFileSync(outputPath, html)
    console.log(`\n✅ Content saved to: ${outputPath}`)
    
    // Also save as JSON for easier parsing
    const jsonPath = path.join(process.cwd(), 'extracted-proposal.json')
    fs.writeFileSync(jsonPath, JSON.stringify({ html, messages }, null, 2))
    console.log(`✅ JSON saved to: ${jsonPath}`)
    
  } catch (error) {
    console.error('Error extracting document:', error)
    process.exit(1)
  }
}

extractDocx()
