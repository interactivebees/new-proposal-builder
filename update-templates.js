const fs = require('fs')

function updateTemplateNew() {
  const file = 'app/dashboard/templates/new/page.tsx'
  let code = fs.readFileSync(file, 'utf8')
  
  if (!code.includes('GlobalHeaderFooterEditor')) {
    code = code.replace(
      'const SectionEditor = dynamic(() => import(\'@/components/SectionEditor\'), {',
      'const GlobalHeaderFooterEditor = dynamic(() => import(\'@/components/GlobalHeaderFooterEditor\'), { ssr: false })\n\nconst SectionEditor = dynamic(() => import(\'@/components/SectionEditor\'), {'
    )
    
    code = code.replace(
      'const [sections, setSections] = useState',
      'const [header, setHeader] = useState(\'\')\n  const [footer, setFooter] = useState(\'\')\n  const [sections, setSections] = useState'
    )
    
    code = code.replace(
      'body: JSON.stringify({ name, category, content: { sections } })',
      'body: JSON.stringify({ name, category, content: { sections, header, footer } })'
    )
    
    code = code.replace(
      '<SectionEditor sections={sections} onChange={setSections} />',
      `<GlobalHeaderFooterEditor type="header" content={header} onChange={setHeader} />
          <SectionEditor sections={sections} onChange={setSections} />
          <GlobalHeaderFooterEditor type="footer" content={footer} onChange={setFooter} />`
    )
    
    fs.writeFileSync(file, code)
    console.log('Updated templates/new')
  }
}

function updateTemplateEdit() {
  const file = 'app/dashboard/templates/[id]/edit/page.tsx'
  let code = fs.readFileSync(file, 'utf8')
  
  if (!code.includes('GlobalHeaderFooterEditor')) {
    code = code.replace(
      'const SectionEditor = dynamic(() => import(\'@/components/SectionEditor\'), {',
      'const GlobalHeaderFooterEditor = dynamic(() => import(\'@/components/GlobalHeaderFooterEditor\'), { ssr: false })\n\nconst SectionEditor = dynamic(() => import(\'@/components/SectionEditor\'), {'
    )
    
    code = code.replace(
      'const [sections, setSections] = useState',
      'const [header, setHeader] = useState(\'\')\n  const [footer, setFooter] = useState(\'\')\n  const [sections, setSections] = useState'
    )
    
    code = code.replace(
      'setSections(data.content?.sections || [])',
      'setSections(data.content?.sections || [])\n        setHeader(data.content?.header || \'\')\n        setFooter(data.content?.footer || \'\')'
    )
    
    code = code.replace(
      'content: { sections }',
      'content: { sections, header, footer }'
    )
    
    code = code.replace(
      '<SectionEditor sections={sections} onChange={setSections} />',
      `<GlobalHeaderFooterEditor type="header" content={header} onChange={setHeader} />
          <SectionEditor sections={sections} onChange={setSections} />
          <GlobalHeaderFooterEditor type="footer" content={footer} onChange={setFooter} />`
    )
    
    fs.writeFileSync(file, code)
    console.log('Updated templates/edit')
  }
}

updateTemplateNew()
updateTemplateEdit()
