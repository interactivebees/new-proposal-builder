import re

with open('components/DocxEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove Settings icon button
content = content.replace('<button type="button" className="p-1.5 rounded hover:bg-slate-100" title="Star / Action"><Settings className="w-4 h-4" /></button>', '')

# Remove FileText icon button
content = content.replace('<button type="button" className="p-1.5 rounded hover:bg-slate-100" title="Copy / Transfer"><FileText className="w-4 h-4" /></button>', '')

# Remove Sun icon button
content = content.replace('<button type="button" className="p-1.5 rounded hover:bg-slate-100"><Sun className="w-4 h-4" /></button>', '')

with open('components/DocxEditor.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)
