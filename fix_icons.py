lines = open('components/DocxEditor.tsx', encoding='utf-8').read().splitlines()

for i, line in enumerate(lines):
    if '<Settings className="w-4 h-4" />' in line:
        lines[i] = ''
    elif '<FileText className="w-4 h-4" />' in line and 'title="Copy / Transfer"' in line:
        lines[i] = ''
    elif '<Sun className="w-4 h-4" />' in line:
        lines[i] = ''

with open('components/DocxEditor.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(lines))
