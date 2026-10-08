'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Extension, Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import OrderedList from '@tiptap/extension-ordered-list'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CustomImage } from './CustomImage'

const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listType: {
        default: '1-a-i',
        parseHTML: element => element.getAttribute('data-list-type') || '1-a-i',
        renderHTML: attributes => {
          if (attributes.listType === '1-a-i') return {}
          return { 'data-list-type': attributes.listType }
        }
      }
    }
  }
})

import { useEffect, useState, useRef } from 'react'
import { 
  Bold, Italic, Strikethrough, Code, Link as LinkIcon, Image as ImageIcon, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Minus, Plus, ChevronDown, Grid3X3, IndentDecrease, IndentIncrease,
  Type, Heading1, Heading2, Heading3, Heading4, Search, Settings, 
  FileText, LayoutTemplate, MoreHorizontal, Sun, Moon, SplitSquareVertical,
  Scissors, Trash2, Pencil, SeparatorHorizontal,
  Undo, Redo, Printer, RemoveFormatting, ArrowUpDown, GripHorizontal, Download, Loader2
} from 'lucide-react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType
      unsetLineHeight: () => ReturnType
    }
    pageBreak: {
      setPageBreak: () => ReturnType
    }
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

interface Word365EditorProps {
  content: any
  onChange: (content: any) => void
  readOnly?: boolean
}

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() { return { types: ['paragraph', 'heading'] } },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            }
          }
        }
      }
    ]
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }) => {
        return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }))
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every((type: string) => commands.resetAttributes(type, 'lineHeight'))
      }
    }
  }
})

const Indent = Extension.create({
  name: 'indent',
  addOptions() { return { types: ['paragraph', 'heading'], minLevel: 0, maxLevel: 8 } },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => parseInt(element.style.paddingLeft || '0', 10) / 40 || 0,
            renderHTML: attributes => {
              if (!attributes.indent) return {}
              return { style: `padding-left: ${attributes.indent * 40}px` }
            }
          }
        }
      }
    ]
  },
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        let updated = false
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const indent = node.attrs.indent || 0
            if (indent < this.options.maxLevel) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: indent + 1 })
              updated = true
            }
          }
        })
        if (dispatch && updated) dispatch(tr)
        return updated
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        let updated = false
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const indent = node.attrs.indent || 0
            if (indent > this.options.minLevel) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: indent - 1 })
              updated = true
            }
          }
        })
        if (dispatch && updated) dispatch(tr)
        return updated
      }
    }
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('table')) return false; // Let table handle its own tabbing
        if (this.editor.isActive('bulletList') || this.editor.isActive('orderedList')) {
          return this.editor.chain().sinkListItem('listItem').run();
        }
        return this.editor.chain().indent().run();
      },
      'Shift-Tab': () => {
        if (this.editor.isActive('table')) return false;
        if (this.editor.isActive('bulletList') || this.editor.isActive('orderedList')) {
          return this.editor.chain().liftListItem('listItem').run();
        }
        return this.editor.chain().outdent().run();
      },
    }
  }
})

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            }
          }
        }
      }
    ]
  },
  addCommands() {
    return {
      setFontSize: size => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
    }
  }
})

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  parseHTML() {
    return [{ tag: 'div[data-type="page-break"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      mergeAttributes(HTMLAttributes, { 
        'data-type': 'page-break', 
        class: 'page-break my-8 border-b-2 border-dashed border-slate-300 w-full relative before:content-["Page_Break"] before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:bg-white before:px-2 before:text-[10px] before:text-slate-400 before:font-bold before:tracking-wider before:uppercase' 
      })
    ]
  },
  addCommands() {
    return {
      setPageBreak: () => ({ chain }) => {
        return chain().insertContent({ type: this.name }).run()
      },
    }
  },
})

const EditorBubbleMenu = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  return (
    <BubbleMenu 
      editor={editor} 
      options={{ placement: 'top' }} 
      shouldShow={({ editor }: any) => editor.isActive('table') || editor.isActive('image')}
    >
          <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-xl rounded-lg p-1.5 z-50">
            {editor.isActive('image') ? (
              <>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { align: 'left' }).run(); }} className={`px-2 py-1.5 rounded transition-colors ${editor.isActive('image', { align: 'left' }) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`} title="Align Left">
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { align: 'center' }).run(); }} className={`px-2 py-1.5 rounded transition-colors ${editor.isActive('image', { align: 'center' }) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`} title="Align Center">
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { align: 'right' }).run(); }} className={`px-2 py-1.5 rounded transition-colors ${editor.isActive('image', { align: 'right' }) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`} title="Align Right">
                  <AlignRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }} className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Insert column left">
                  <span className="text-[11px] font-bold">+ Col Left</span>
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }} className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Insert column right">
                  <span className="text-[11px] font-bold">+ Col Right</span>
                </button>
                
                <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }} className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Insert row above">
                  <span className="text-[11px] font-bold">+ Row Up</span>
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }} className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Insert row below">
                  <span className="text-[11px] font-bold">+ Row Down</span>
                </button>
                
                <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().mergeCells().run(); }} className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors ${editor.can().mergeCells() ? 'hover:bg-slate-100 text-slate-600' : 'text-slate-300 cursor-not-allowed'}`} title="Merge selected cells" disabled={!editor.can().mergeCells()}>
                  <span className="text-[11px] font-bold">Merge</span>
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().splitCell().run(); }} className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors ${editor.can().splitCell() ? 'hover:bg-slate-100 text-slate-600' : 'text-slate-300 cursor-not-allowed'}`} title="Split cell" disabled={!editor.can().splitCell()}>
                  <span className="text-[11px] font-bold">Split</span>
                </button>
                
                <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }} className="flex items-center gap-1 p-1.5 px-2 hover:bg-red-50 text-red-600 rounded transition-colors" title="Delete column">
                  <span className="text-[11px] font-bold">Del Col</span>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }} className="flex items-center gap-1 p-1.5 px-2 hover:bg-red-50 text-red-600 rounded transition-colors" title="Delete row">
                  <span className="text-[11px] font-bold">Del Row</span>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }} className="flex items-center gap-1 p-1.5 px-2 hover:bg-red-50 text-red-600 rounded transition-colors" title="Delete table">
                  <span className="text-[11px] font-bold">Del Table</span>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        
    </BubbleMenu>
  );
};

export default function StandaloneDocxEditor({ content, onChange, readOnly = false }: Word365EditorProps) {
  const [selectedFont, setSelectedFont] = useState('Default font')
  const [selectedFontSize, setSelectedFontSize] = useState('16')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [fontSearch, setFontSearch] = useState('')
  const [zoom, setZoom] = useState(100)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [tableHover, setTableHover] = useState({ r: 0, c: 0 })
  const [, forceUpdate] = useState(0)
  const [settingsTab, setSettingsTab] = useState<'document' | 'headers'>('document')
  const [isExporting, setIsExporting] = useState(false)
  const [activeEditorName, setActiveEditorName] = useState<'body' | 'header' | 'footer'>('body')
  const [pageSettings, setPageSettings] = useState({
    format: 'A4',
    unit: 'cm',
    width: 21,
    height: 29.7,
    orientation: 'portrait',
    marginTop: 2.54,
    marginBottom: 2.54,
    marginLeft: 2.54,
    marginRight: 2.54,
    headerDistance: 1.25,
    footerDistance: 1.25,
  })
  
  const toolbarRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  const getExtensions = (placeholderText: string) => [
    StarterKit.configure({ 
      heading: { levels: [1, 2, 3, 4] },
      orderedList: false // Disable the default OrderedList
    }),
    CustomOrderedList,
    Placeholder.configure({ placeholder: placeholderText }),
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: true }),
    Underline,
    CustomImage.configure({ allowBase64: true }),
    TextStyle,
    FontSize,
    LineHeight,
    Indent,
    FontFamily.configure({ types: ['textStyle'] }),
    Color,
    Table.configure({ resizable: true, HTMLAttributes: { class: 'border-collapse border border-slate-300' } }),
    TableRow, TableHeader, TableCell,
    PageBreak
  ]

  const sharedEditorProps = {
    handlePaste: (view: any, event: any) => {
      const clipboardData = event.clipboardData
      if (!clipboardData) return false

      const files = Array.from(clipboardData.files || []) as File[]
      const items = Array.from(clipboardData.items || []) as any[]
      
      const imageFiles: File[] = []
      
      files.forEach(file => {
        if (file.type.startsWith('image/')) imageFiles.push(file)
      })
      
      if (imageFiles.length === 0) {
        items.forEach(item => {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) imageFiles.push(file)
          }
        })
      }

      if (imageFiles.length > 0) {
        event.preventDefault()
        
        imageFiles.forEach(file => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const src = e.target?.result as string
            const { schema } = view.state
            const node = schema.nodes.image.create({ src })
            const transaction = view.state.tr.replaceSelectionWith(node)
            view.dispatch(transaction)
          }
          reader.readAsDataURL(file)
        })
        return true
      }
      return false
    },
    handleDrop: (view: any, event: any, _slice: any, moved: any) => {
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0]
        if (file.type.indexOf('image') === 0) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const src = e.target?.result as string
            const { schema } = view.state
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
            if (coordinates) {
              const node = schema.nodes.image.create({ src })
              const transaction = view.state.tr.insert(coordinates.pos, node)
              view.dispatch(transaction)
            }
          }
          reader.readAsDataURL(file)
          return true
        }
      }
      return false
    },
    transformPastedHTML: (html: string) => {
      try {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        let modified = false;
        
        // Fix 1: MS Word fake paragraphs
        const paragraphs = Array.from(temp.querySelectorAll('p, div'));
        paragraphs.forEach(p => {
          const style = p.getAttribute('style') || '';
          const className = p.className || '';
          if (style.includes('mso-list:') || className.includes('MsoListParagraph')) {
            modified = true;
            const markerSpan = Array.from(p.querySelectorAll('span')).find(s => (s.getAttribute('style') || '').includes('mso-list:Ignore'));
            let isOrdered = true;
            if (markerSpan) {
              const text = markerSpan.innerText.trim();
              if (/^[^a-zA-Z0-9]/.test(text)) isOrdered = false;
              markerSpan.remove();
            }
            const levelMatch = style.match(/level(\d+)/);
            const level = levelMatch ? parseInt(levelMatch[1], 10) : 1;
            const li = document.createElement('li');
            li.innerHTML = p.innerHTML;
            li.setAttribute('data-level', level.toString());
            li.setAttribute('data-list-type', isOrdered ? 'ol' : 'ul');
            p.parentNode?.replaceChild(li, p);
          }
        });

        // Fix 2: Flattened sibling <ol> / <ul> or <li> with margin-left (Google Docs / WPS Office)
        const allLis = Array.from(temp.querySelectorAll('li'));
        allLis.forEach(li => {
          if (!li.hasAttribute('data-level')) {
            let indentPx = 0;
            const getMargin = (el: HTMLElement | null) => {
               if (!el) return 0;
               let m = el.style.marginLeft || el.style.paddingLeft;
               if (!m) return 0;
               let val = parseFloat(m);
               if (m.includes('pt')) val *= 1.333;
               if (m.includes('in')) val *= 96;
               if (m.includes('cm')) val *= 37.8;
               return val;
            };
            indentPx += getMargin(li);
            if (li.parentElement) indentPx += getMargin(li.parentElement);
            
            let level = 1;
            if (indentPx > 10) level = Math.round(indentPx / 36) + 1;
            
            li.setAttribute('data-level', level.toString());
            li.setAttribute('data-list-type', li.parentElement?.nodeName.toLowerCase() === 'ul' ? 'ul' : 'ol');
          }
          modified = true;
        });

        if (!modified) return html;

        // Pass 2: Reconstruct tree
        let i = 0;
        while (i < temp.childNodes.length) {
          let child = temp.childNodes[i] as HTMLElement;
          
          if (child && (child.nodeName === 'LI' || child.nodeName === 'OL' || child.nodeName === 'UL')) {
            let group: HTMLElement[] = [];
            while (child && (child.nodeName === 'LI' || child.nodeName === 'OL' || child.nodeName === 'UL')) {
              if (child.nodeName === 'LI') {
                 group.push(child);
              } else {
                 Array.from(child.querySelectorAll('li')).forEach(li => group.push(li));
              }
              let next = child.nextSibling as HTMLElement;
              temp.removeChild(child);
              child = next;
            }
            
            if (group.length > 0) {
              let rootType = group[0].getAttribute('data-list-type') || 'ol';
              let listRoot = document.createElement(rootType);
              let stack = [ { el: listRoot, level: 1 } ];
              
              group.forEach(li => {
                let level = parseInt(li.getAttribute('data-level') || '1', 10);
                let type = li.getAttribute('data-list-type') || 'ol';
                
                while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                  stack.pop();
                }
                
                let parent = stack[stack.length - 1].el;
                
                if (level > stack[stack.length - 1].level) {
                  let newList = document.createElement(type);
                  if (parent.lastElementChild && parent.lastElementChild.nodeName === 'LI') {
                    parent.lastElementChild.appendChild(newList);
                  } else {
                    parent.appendChild(newList);
                  }
                  stack.push({ el: newList, level: level });
                  parent = newList;
                }
                
                parent.appendChild(li);
              });
              
              temp.insertBefore(listRoot, temp.childNodes[i]);
            }
          }
          i++;
        }
        
        return temp.innerHTML;
      } catch (e) {
        console.error('List Paste parsing error', e);
        return html;
      }
    }
  }

  const editorsRef = useRef({ main: null as any, header: null as any, footer: null as any })

  const triggerChange = () => {
    isInternalChange.current = true
    if (onChange) {
      onChange({ 
        html: editorsRef.current.main?.getHTML() || '', 
        json: editorsRef.current.main?.getJSON() || {},
        headerHtml: editorsRef.current.header?.getHTML() || '',
        headerJson: editorsRef.current.header?.getJSON() || {},
        footerHtml: editorsRef.current.footer?.getHTML() || '',
        footerJson: editorsRef.current.footer?.getJSON() || {}
      })
    }
  }

  const defaultHeaderHtml = `
    <table style="width: 100%;">
      <tbody>
        <tr>
          <td style="width: 50%;"><p>Non-disclosure agreement</p></td>
          <td style="width: 50%;"><p style="text-align: right"><strong>Tiptap</strong> DOCX EDITOR</p></td>
        </tr>
      </tbody>
    </table>
  `

  const defaultFooterHtml = `
    <table style="width: 100%;">
      <tbody>
        <tr>
          <td style="width: 33.33%;"><p>Tiptap @2026</p></td>
          <td style="width: 33.33%;"><p style="text-align: center">Confidential</p></td>
          <td style="width: 33.33%;"><p style="text-align: right">1 of 5</p></td>
        </tr>
      </tbody>
    </table>
  `

  const editor = useEditor({
    extensions: getExtensions('Start typing your document...'),
    content: content?.html || (typeof content === 'string' ? content : ''),
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: sharedEditorProps,
    onCreate: ({ editor }) => { editorsRef.current.main = editor },
    onUpdate: ({ editor }) => { editorsRef.current.main = editor; triggerChange() },
  })

  const headerEditor = useEditor({
    extensions: getExtensions('Type header here...'),
    content: content?.headerHtml || defaultHeaderHtml,
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: sharedEditorProps,
    onCreate: ({ editor }) => { editorsRef.current.header = editor },
    onUpdate: ({ editor }) => { editorsRef.current.header = editor; triggerChange() },
  })

  const footerEditor = useEditor({
    extensions: getExtensions('Type footer here...'),
    content: content?.footerHtml || defaultFooterHtml,
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: sharedEditorProps,
    onCreate: ({ editor }) => { editorsRef.current.footer = editor },
    onUpdate: ({ editor }) => { editorsRef.current.footer = editor; triggerChange() },
  })

  const currentEditor = activeEditorName === 'header' ? headerEditor 
                      : activeEditorName === 'footer' ? footerEditor 
                      : editor

  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleExportPdf = async () => {
    if (!editor) return
    setIsExportingPdf(true)
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: editor.getHTML(),
          headerHtml: headerEditor?.getHTML(),
          footerHtml: footerEditor?.getHTML(),
          fontFamily: selectedFont === 'Default font' ? 'Arial' : selectedFont.split(',')[0].replace(/['"]/g, '').trim(),
          pageSettings
        })
      })

      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Document.pdf'
      a.click()
    } catch (error) {
      console.error(error)
      alert('Failed to export PDF')
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleExportDocx = async () => {
    if (!editor) return
    setIsExporting(true)
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: editor.getHTML(),
          headerHtml: headerEditor?.getHTML(),
          footerHtml: footerEditor?.getHTML(),
          fontFamily: selectedFont === 'Default font' ? 'Arial' : selectedFont.split(',')[0].replace(/['"]/g, '').trim(),
          pageSettings
        })
      })

      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Document.docx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error(error)
      alert('Failed to export DOCX')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    
    const newMainHtml = content?.html || (typeof content === 'string' ? content : '')
    if (editor && editor.getHTML() !== newMainHtml) {
      editor.commands.setContent(newMainHtml)
    }

    const newHeaderHtml = content?.headerHtml || defaultHeaderHtml
    if (headerEditor && headerEditor.getHTML() !== newHeaderHtml) {
      headerEditor.commands.setContent(newHeaderHtml)
    }

    const newFooterHtml = content?.footerHtml || defaultFooterHtml
    if (footerEditor && footerEditor.getHTML() !== newFooterHtml) {
      footerEditor.commands.setContent(newFooterHtml)
    }
  }, [content, editor, headerEditor, footerEditor])

  useEffect(() => {
    if (editor) editor.setEditable(!readOnly)
    if (headerEditor) headerEditor.setEditable(!readOnly)
    if (footerEditor) footerEditor.setEditable(!readOnly)
  }, [readOnly, editor, headerEditor, footerEditor])

  useEffect(() => {
    if (!currentEditor) return
    const updateState = () => {
      const currentSize = currentEditor.getAttributes('textStyle').fontSize || '16px'
      setSelectedFontSize(currentSize.replace('px', ''))
      const currentFont = currentEditor.getAttributes('textStyle').fontFamily || 'Default font'
      setSelectedFont(currentFont)
      forceUpdate(n => n + 1)
    }
    currentEditor.on('selectionUpdate', updateState)
    currentEditor.on('transaction', updateState)
    return () => {
      currentEditor.off('selectionUpdate', updateState)
      currentEditor.off('transaction', updateState)
    }
  }, [currentEditor])

  if (!editor) return null

  const fontSizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36']
  
  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#6b7280' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ]

  const highlightColors = [
    { name: 'None', value: 'transparent' },
    { name: 'Light Gray', value: '#f3f4f6' },
    { name: 'Light Red', value: '#fee2e2' },
    { name: 'Light Orange', value: '#ffedd5' },
    { name: 'Light Yellow', value: '#fef9c3' },
    { name: 'Light Green', value: '#dcfce7' },
    { name: 'Light Blue', value: '#dbeafe' },
    { name: 'Light Purple', value: '#f3e8ff' },
    { name: 'Light Pink', value: '#fce7f3' },
  ]

  const fontCategories = [
    { title: 'Default', fonts: [{ name: 'Default font', family: 'inherit', desc: 'Use document default' }] },
    { title: 'Recommended', fonts: [
      { name: 'Carlito', family: 'Carlito, sans-serif', desc: 'Calibri-like' },
      { name: 'Source Sans 3', family: '"Source Sans 3", sans-serif', desc: 'Aptos-like' },
      { name: 'Noto Sans', family: '"Noto Sans", sans-serif', desc: 'Helvetica-like' }
    ]},
    { title: 'Office classics', fonts: [
      { name: 'Arimo', family: 'Arimo, sans-serif', desc: 'Arial-like' },
      { name: 'Arial', family: 'Arial, sans-serif', desc: 'Standard' },
      { name: 'Times New Roman', family: '"Times New Roman", serif', desc: 'Standard serif' }
    ]}
  ]

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name)
  }

  const applyFont = (family: string, name: string) => {
    setSelectedFont(name)
    if (family === 'inherit') {
      currentEditor?.chain().focus().unsetFontFamily().run()
    } else {
      currentEditor?.chain().focus().setFontFamily(family).run()
    }
    setActiveDropdown(null)
  }

  const applyFontSize = (size: string) => {
    setSelectedFontSize(size)
    currentEditor?.chain().focus().setFontSize(`${size}px`).run()
    setActiveDropdown(null)
  }

  return (
    <div className={`flex flex-col items-center w-full rounded-xl border shadow-inner min-h-[600px] transition-colors editor-page-container ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#f8f9fa] border-slate-200'}`} style={{ zoom: zoom / 100 }}>
      {!readOnly && (
        <div className={`w-full shadow-sm border-b rounded-t-xl sticky top-0 z-50 flex justify-center transition-colors no-print ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`} ref={toolbarRef} style={{ zoom: 100 / zoom }}>
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 max-w-5xl w-full">
            
            {/* Zoom */}
            <div className="flex items-center gap-0.5 mr-2 text-xs font-medium">
              <button type="button" onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Minus className="w-3.5 h-3.5" /></button>
              <span className="w-10 text-center">{zoom}%</span>
              <button type="button" onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Plus className="w-3.5 h-3.5" /></button>
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            {/* Heading Dropdown */}
            <div className="relative">
              <button type="button" onClick={() => toggleDropdown('heading')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm hover:bg-slate-100 transition-colors ${activeDropdown === 'heading' ? 'bg-slate-100' : ''}`}>
                <span className="w-16 text-left truncate">
                  {currentEditor?.isActive('heading', { level: 1 }) ? 'Heading 1' : 
                   currentEditor?.isActive('heading', { level: 2 }) ? 'Heading 2' : 
                   currentEditor?.isActive('heading', { level: 3 }) ? 'Heading 3' : 
                   currentEditor?.isActive('heading', { level: 4 }) ? 'Heading 4' : 'Text'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {activeDropdown === 'heading' && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1.5 flex flex-col gap-0.5">
                  <button type="button" onClick={() => { currentEditor?.chain().focus().setParagraph().run(); setActiveDropdown(null); }} className={`flex items-center gap-3 px-3 py-1.5 text-sm hover:bg-slate-50 ${currentEditor?.isActive('paragraph') ? 'bg-slate-50 text-blue-600' : ''}`}>
                    <Type className="w-4 h-4 text-slate-400" /> <span>Text</span>
                  </button>
                  <button type="button" onClick={() => { currentEditor?.chain().focus().toggleHeading({ level: 1 }).run(); setActiveDropdown(null); }} className={`flex items-center gap-3 px-3 py-1.5 text-sm hover:bg-slate-50 ${currentEditor?.isActive('heading', { level: 1 }) ? 'bg-slate-50 text-blue-600' : ''}`}>
                    <Heading1 className="w-4 h-4 text-slate-400" /> <span>Heading 1</span>
                  </button>
                  <button type="button" onClick={() => { currentEditor?.chain().focus().toggleHeading({ level: 2 }).run(); setActiveDropdown(null); }} className={`flex items-center gap-3 px-3 py-1.5 text-sm hover:bg-slate-50 ${currentEditor?.isActive('heading', { level: 2 }) ? 'bg-slate-50 text-blue-600' : ''}`}>
                    <Heading2 className="w-4 h-4 text-slate-400" /> <span>Heading 2</span>
                  </button>
                  <button type="button" onClick={() => { currentEditor?.chain().focus().toggleHeading({ level: 3 }).run(); setActiveDropdown(null); }} className={`flex items-center gap-3 px-3 py-1.5 text-sm hover:bg-slate-50 ${currentEditor?.isActive('heading', { level: 3 }) ? 'bg-slate-50 text-blue-600' : ''}`}>
                    <Heading3 className="w-4 h-4 text-slate-400" /> <span>Heading 3</span>
                  </button>
                  <button type="button" onClick={() => { currentEditor?.chain().focus().toggleHeading({ level: 4 }).run(); setActiveDropdown(null); }} className={`flex items-center gap-3 px-3 py-1.5 text-sm hover:bg-slate-50 ${currentEditor?.isActive('heading', { level: 4 }) ? 'bg-slate-50 text-blue-600' : ''}`}>
                    <Heading4 className="w-4 h-4 text-slate-400" /> <span>Heading 4</span>
                  </button>
                </div>
              )}
            </div>

            {/* Font Family Dropdown */}
            <div className="relative">
              <button type="button" onClick={() => toggleDropdown('font')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm hover:bg-slate-100 transition-colors ${activeDropdown === 'font' ? 'bg-slate-100' : ''}`}>
                <span className="w-20 text-left truncate">{selectedFont}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {activeDropdown === 'font' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 flex flex-col max-h-[400px] overflow-y-auto">
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search fonts" 
                      className="w-full pl-8 pr-3 py-1.5 border border-purple-200 rounded-md text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      value={fontSearch}
                      onChange={e => setFontSearch(e.target.value)}
                    />
                  </div>
                  {fontCategories.map(cat => {
                    const filteredFonts = cat.fonts.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase()))
                    if (filteredFonts.length === 0) return null
                    return (
                      <div key={cat.title} className="mb-2">
                        <div className="text-xs font-bold text-slate-800 px-2 py-1">{cat.title}</div>
                        {filteredFonts.map(font => (
                          <button 
                            key={font.name} 
                            type="button" 
                            onClick={() => applyFont(font.family, font.name)}
                            className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded flex flex-col group"
                          >
                            <span className="text-sm text-slate-800">{font.name}</span>
                            <span className="text-xs text-slate-400">{font.desc}</span>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Font Size Dropdown */}
            <div className="relative">
              <button type="button" onClick={() => toggleDropdown('size')} className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm hover:bg-slate-100 transition-colors ${activeDropdown === 'size' ? 'bg-slate-100' : ''}`}>
                <span className="w-5 text-center">{selectedFontSize}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {activeDropdown === 'size' && (
                <div className="absolute top-full left-0 mt-1 w-16 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 flex flex-col max-h-60 overflow-y-auto">
                  {fontSizes.map(size => (
                    <button key={size} type="button" onClick={() => applyFontSize(size)} className={`px-3 py-1 text-sm hover:bg-slate-50 ${selectedFontSize === size ? 'bg-slate-50 text-blue-600 font-medium' : ''}`}>
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            {/* Basic Formatting */}
            <button type="button" onClick={() => currentEditor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive('bold') ? 'bg-slate-200 text-slate-900' : ''}`}><Bold className="w-4 h-4" /></button>
            <button type="button" onClick={() => currentEditor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive('italic') ? 'bg-slate-200 text-slate-900' : ''}`}><Italic className="w-4 h-4" /></button>
            <button type="button" onClick={() => currentEditor?.chain().focus().toggleStrike().run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive('strike') ? 'bg-purple-100 text-purple-700' : ''}`}><Strikethrough className="w-4 h-4" /></button>
            <button type="button" onClick={() => currentEditor?.chain().focus().toggleCode().run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive('code') ? 'bg-slate-200 text-slate-900' : ''}`}><Code className="w-4 h-4" /></button>
            
            {/* Color Picker Dropdown */}
            <div className="relative">
              <button type="button" onClick={() => toggleDropdown('color')} className={`flex items-center justify-center p-1.5 rounded hover:bg-slate-100 transition-colors ${activeDropdown === 'color' ? 'bg-slate-100' : ''}`}>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-serif text-[11px] font-bold leading-none" style={{ color: currentEditor?.getAttributes('textStyle').color || '#64748b' }}>A</span>
                  <div className="w-3.5 h-[3px] rounded-full" style={{ backgroundColor: currentEditor?.getAttributes('textStyle').color || '#cbd5e1' }}></div>
                </div>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
              </button>
              {activeDropdown === 'color' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
                  <div className="mb-3">
                    <div className="text-xs font-bold text-slate-800 mb-2">Text Color</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {textColors.map(color => (
                        <button key={color.name} type="button" onClick={() => { currentEditor?.chain().focus().setColor(color.value).run(); setActiveDropdown(null); }} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:scale-110 transition-transform" style={{ color: color.value, borderColor: color.value }}>
                          <span className="font-serif text-[10px] font-bold">A</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 mb-2">Highlight Color</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {highlightColors.map(color => (
                        <button key={color.name} type="button" onClick={() => { 
                          if (color.value === 'transparent') {
                            currentEditor?.chain().focus().unsetHighlight().run();
                          } else {
                            currentEditor?.chain().focus().toggleHighlight({ color: color.value }).run();
                          }
                          setActiveDropdown(null); 
                        }} className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform flex items-center justify-center" style={{ backgroundColor: color.value === 'transparent' ? '#fff' : color.value }}>
                          {color.value === 'transparent' && <span className="text-[10px] text-slate-400">/</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button type="button" onClick={() => { const url = window.prompt('URL'); if (url) currentEditor?.chain().focus().setLink({ href: url }).run(); }} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive('link') ? 'bg-slate-200' : ''}`}><LinkIcon className="w-4 h-4" /></button>
            <button type="button" onClick={() => { const url = window.prompt('Image URL'); if (url) currentEditor?.chain().focus().setImage({ src: url }).run(); }} className="p-1.5 rounded hover:bg-slate-100"><ImageIcon className="w-4 h-4" /></button>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            {/* Basic Format Icons matching Tiptap DOCX exactly */}
            <button type="button" onClick={() => currentEditor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive('bulletList') ? 'bg-slate-200' : ''}`}><List className="w-4 h-4" /></button>
            {/* Ordered List with Theme Dropdown */}
            <div className="relative flex items-center">
              <button 
                type="button" 
                onClick={() => currentEditor?.chain().focus().toggleOrderedList().run()} 
                className={`p-1.5 rounded-l hover:bg-slate-100 ${currentEditor?.isActive('orderedList') ? 'bg-slate-200' : ''}`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => toggleDropdown('orderedListTheme')} 
                className={`p-1 rounded-r border-l border-slate-200 transition-colors ${activeDropdown === 'orderedListTheme' ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              {activeDropdown === 'orderedListTheme' && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 grid grid-cols-2 gap-2 w-44">
                  <button 
                    onClick={() => { currentEditor?.chain().focus().updateAttributes('orderedList', { listType: '1-a-i' }).run(); setActiveDropdown(null) }} 
                    className={`flex flex-col text-left p-2 border hover:bg-slate-50 rounded ${currentEditor?.isActive('orderedList', { listType: '1-a-i' }) ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                  >
                    <span className="text-xs font-bold text-slate-700">1.</span>
                    <span className="text-[10px] ml-2 text-slate-500">a.</span>
                    <span className="text-[10px] ml-4 text-slate-500">i.</span>
                  </button>
                  <button 
                    onClick={() => { currentEditor?.chain().focus().updateAttributes('orderedList', { listType: 'A-a-i' }).run(); setActiveDropdown(null) }} 
                    className={`flex flex-col text-left p-2 border hover:bg-slate-50 rounded ${currentEditor?.isActive('orderedList', { listType: 'A-a-i' }) ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                  >
                    <span className="text-xs font-bold text-slate-700">A.</span>
                    <span className="text-[10px] ml-2 text-slate-500">a.</span>
                    <span className="text-[10px] ml-4 text-slate-500">i.</span>
                  </button>
                  <button 
                    onClick={() => { currentEditor?.chain().focus().updateAttributes('orderedList', { listType: 'I-A-1' }).run(); setActiveDropdown(null) }} 
                    className={`flex flex-col text-left p-2 border hover:bg-slate-50 rounded ${currentEditor?.isActive('orderedList', { listType: 'I-A-1' }) ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                  >
                    <span className="text-xs font-bold text-slate-700">I.</span>
                    <span className="text-[10px] ml-2 text-slate-500">A.</span>
                    <span className="text-[10px] ml-4 text-slate-500">1.</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button type="button" onClick={() => {
              if (currentEditor?.isActive('bulletList') || currentEditor?.isActive('orderedList')) {
                currentEditor.chain().focus().liftListItem('listItem').run()
              } else {
                currentEditor?.chain().focus().outdent().run()
              }
            }} className="p-1.5 rounded hover:bg-slate-100 text-slate-700" title="Decrease Indent"><IndentDecrease className="w-4 h-4" /></button>
            <button type="button" onClick={() => {
              if (currentEditor?.isActive('bulletList') || currentEditor?.isActive('orderedList')) {
                currentEditor.chain().focus().sinkListItem('listItem').run()
              } else {
                currentEditor?.chain().focus().indent().run()
              }
            }} className="p-1.5 rounded hover:bg-slate-100 text-slate-700" title="Increase Indent"><IndentIncrease className="w-4 h-4" /></button>
            
            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            {/* Alignment Dropdown */}
            <div className="relative flex items-center">
              <button type="button" onClick={() => toggleDropdown('align')} className={`flex items-center p-1.5 rounded transition-colors ${activeDropdown === 'align' ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-100 text-slate-700'}`} title="Text Alignment">
                {(currentEditor?.isActive('image') ? currentEditor?.isActive('image', { align: 'center' }) : currentEditor?.isActive({ textAlign: 'center' })) ? <AlignCenter className="w-4 h-4" /> :
                 (currentEditor?.isActive('image') ? currentEditor?.isActive('image', { align: 'right' }) : currentEditor?.isActive({ textAlign: 'right' })) ? <AlignRight className="w-4 h-4" /> :
                 (currentEditor?.isActive('image') ? false : currentEditor?.isActive({ textAlign: 'justify' })) ? <AlignJustify className="w-4 h-4" /> :
                 <AlignLeft className="w-4 h-4" />}
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
              </button>
              {activeDropdown === 'align' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 flex px-1 gap-1">
                  <button type="button" onClick={() => { 
                    if (currentEditor?.isActive('image')) { currentEditor.chain().focus().updateAttributes('image', { align: 'left' }).run() } 
                    else { currentEditor?.chain().focus().setTextAlign('left').run() } 
                    setActiveDropdown(null) 
                  }} className={`p-1.5 rounded hover:bg-slate-50 ${(currentEditor?.isActive('image') ? currentEditor?.isActive('image', { align: 'left' }) : currentEditor?.isActive({ textAlign: 'left' })) ? 'bg-purple-50 text-purple-600' : 'text-slate-700'}`}><AlignLeft className="w-4 h-4" /></button>
                  
                  <button type="button" onClick={() => { 
                    if (currentEditor?.isActive('image')) { currentEditor.chain().focus().updateAttributes('image', { align: 'center' }).run() } 
                    else { currentEditor?.chain().focus().setTextAlign('center').run() } 
                    setActiveDropdown(null) 
                  }} className={`p-1.5 rounded hover:bg-slate-50 ${(currentEditor?.isActive('image') ? currentEditor?.isActive('image', { align: 'center' }) : currentEditor?.isActive({ textAlign: 'center' })) ? 'bg-purple-50 text-purple-600' : 'text-slate-700'}`}><AlignCenter className="w-4 h-4" /></button>
                  
                  <button type="button" onClick={() => { 
                    if (currentEditor?.isActive('image')) { currentEditor.chain().focus().updateAttributes('image', { align: 'right' }).run() } 
                    else { currentEditor?.chain().focus().setTextAlign('right').run() } 
                    setActiveDropdown(null) 
                  }} className={`p-1.5 rounded hover:bg-slate-50 ${(currentEditor?.isActive('image') ? currentEditor?.isActive('image', { align: 'right' }) : currentEditor?.isActive({ textAlign: 'right' })) ? 'bg-purple-50 text-purple-600' : 'text-slate-700'}`}><AlignRight className="w-4 h-4" /></button>
                  
                  <button type="button" onClick={() => { 
                    if (!currentEditor?.isActive('image')) { currentEditor?.chain().focus().setTextAlign('justify').run() } 
                    setActiveDropdown(null) 
                  }} className={`p-1.5 rounded hover:bg-slate-50 ${(currentEditor?.isActive('image') ? false : currentEditor?.isActive({ textAlign: 'justify' })) ? 'bg-purple-50 text-purple-600' : 'text-slate-700'}`}><AlignJustify className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            {/* Line Height Dropdown */}
            <div className="relative">
              <button type="button" onClick={() => toggleDropdown('lineHeight')} className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${activeDropdown === 'lineHeight' ? 'bg-slate-100' : ''}`} title="Line Spacing">
                <ArrowUpDown className="w-4 h-4 text-slate-700" />
              </button>
              {activeDropdown === 'lineHeight' && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 flex flex-col">
                  {['1.0', '1.15', '1.5', '2.0', '2.5', '3.0'].map(lh => (
                    <button key={lh} type="button" onClick={() => { currentEditor?.chain().focus().setLineHeight(lh).run(); setActiveDropdown(null) }} className={`px-3 py-1.5 text-sm text-left hover:bg-slate-50 ${currentEditor?.isActive('textStyle', { lineHeight: lh }) ? 'bg-slate-50 text-blue-600 font-medium' : ''}`}>
                      {lh}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button type="button" onClick={() => currentEditor?.chain().focus().setPageBreak().run()} className="p-1.5 rounded hover:bg-slate-100 text-slate-700" title="Page Break">
              <SeparatorHorizontal className="w-4 h-4" />
            </button>

            <button type="button" onClick={() => currentEditor?.chain().focus().clearNodes().unsetAllMarks().run()} className="p-1.5 rounded hover:bg-slate-100 text-slate-700" title="Clear Formatting">
              <RemoveFormatting className="w-4 h-4" />
            </button>

            {/* Right side items */}
            <div className="ml-auto flex items-center gap-0.5">
              
              <div className="relative">
                <button type="button" onClick={() => toggleDropdown('settings')} className={`p-1.5 rounded transition-colors ${activeDropdown === 'settings' ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-100 text-slate-500'}`} title="Document Settings">
                  <LayoutTemplate className="w-4 h-4" />
                </button>
                {activeDropdown === 'settings' && (
                  <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-800 text-left">
                    <div className="flex border-b border-slate-100">
                      <button type="button" onClick={() => setSettingsTab('document')} className={`flex-1 py-2 text-xs font-bold ${settingsTab === 'document' ? 'text-slate-800 border-b-2 border-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Document</button>
                      <button type="button" onClick={() => setSettingsTab('headers')} className={`flex-1 py-2 text-xs font-bold ${settingsTab === 'headers' ? 'text-slate-800 border-b-2 border-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Headers & footers</button>
                      <button type="button" className="px-3 hover:bg-slate-50 text-slate-400 font-bold" onClick={() => setActiveDropdown(null)}>✕</button>
                    </div>
                    
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                      {settingsTab === 'document' ? (
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs font-bold mb-2">Page format</div>
                            <div className="flex gap-2 mb-2">
                              <select className="flex-1 border border-slate-200 rounded p-1 text-sm bg-white outline-none focus:border-purple-500" value={pageSettings.format} onChange={e => setPageSettings(p => ({ ...p, format: e.target.value }))}>
                                <option>A4</option><option>Letter</option><option>Legal</option>
                              </select>
                              <select className="flex-1 border border-slate-200 rounded p-1 text-sm bg-white outline-none focus:border-purple-500" value={pageSettings.unit} onChange={e => setPageSettings(p => ({ ...p, unit: e.target.value }))}>
                                <option value="cm">Centimeter</option><option value="in">Inch</option><option value="px">Pixel</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1"><label className="text-[10px] text-slate-500">Width</label><div className="flex items-center border border-slate-200 rounded px-2 focus-within:border-purple-500"><input type="number" step="0.1" className="w-full text-sm p-1 outline-none" value={pageSettings.width} onChange={e => setPageSettings(p => ({ ...p, width: parseFloat(e.target.value) || 0 }))}/><span className="text-xs text-slate-400">{pageSettings.unit}</span></div></div>
                              <div className="flex-1"><label className="text-[10px] text-slate-500">Height</label><div className="flex items-center border border-slate-200 rounded px-2 focus-within:border-purple-500"><input type="number" step="0.1" className="w-full text-sm p-1 outline-none" value={pageSettings.height} onChange={e => setPageSettings(p => ({ ...p, height: parseFloat(e.target.value) || 0 }))}/><span className="text-xs text-slate-400">{pageSettings.unit}</span></div></div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold mb-2">Page margins</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><label className="text-[10px] text-slate-500">Top</label><div className="flex items-center border border-slate-200 rounded px-2 focus-within:border-purple-500"><input type="number" step="0.1" className="w-full text-sm p-1 outline-none" value={pageSettings.marginTop} onChange={e => setPageSettings(p => ({ ...p, marginTop: parseFloat(e.target.value) || 0 }))}/><span className="text-xs text-slate-400">{pageSettings.unit}</span></div></div>
                              <div><label className="text-[10px] text-slate-500">Bottom</label><div className="flex items-center border border-slate-200 rounded px-2 focus-within:border-purple-500"><input type="number" step="0.1" className="w-full text-sm p-1 outline-none" value={pageSettings.marginBottom} onChange={e => setPageSettings(p => ({ ...p, marginBottom: parseFloat(e.target.value) || 0 }))}/><span className="text-xs text-slate-400">{pageSettings.unit}</span></div></div>
                              <div><label className="text-[10px] text-slate-500">Left</label><div className="flex items-center border border-slate-200 rounded px-2 focus-within:border-purple-500"><input type="number" step="0.1" className="w-full text-sm p-1 outline-none" value={pageSettings.marginLeft} onChange={e => setPageSettings(p => ({ ...p, marginLeft: parseFloat(e.target.value) || 0 }))}/><span className="text-xs text-slate-400">{pageSettings.unit}</span></div></div>
                              <div><label className="text-[10px] text-slate-500">Right</label><div className="flex items-center border border-slate-200 rounded px-2 focus-within:border-purple-500"><input type="number" step="0.1" className="w-full text-sm p-1 outline-none" value={pageSettings.marginRight} onChange={e => setPageSettings(p => ({ ...p, marginRight: parseFloat(e.target.value) || 0 }))}/><span className="text-xs text-slate-400">{pageSettings.unit}</span></div></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs font-bold mb-2">Layout</div>
                            <label className="flex items-center gap-2 text-sm text-slate-600 mb-1"><input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" /> Different first page</label>
                            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" /> Different odd and even pages</label>
                          </div>
                          <div>
                            <div className="text-xs font-bold mb-2">Distance to page edge</div>
                            <div className="space-y-2">
                              <div><label className="text-[10px] text-slate-500">Header distance from top</label><div className="flex items-center border border-slate-200 rounded px-2 focus-within:border-purple-500"><input type="number" step="0.1" className="w-full text-sm p-1 outline-none" value={pageSettings.headerDistance} onChange={e => setPageSettings(p => ({ ...p, headerDistance: parseFloat(e.target.value) || 0 }))}/><span className="text-xs text-slate-400">{pageSettings.unit}</span></div></div>
                              <div><label className="text-[10px] text-slate-500">Footer distance from bottom</label><div className="flex items-center border border-slate-200 rounded px-2 focus-within:border-purple-500"><input type="number" step="0.1" className="w-full text-sm p-1 outline-none" value={pageSettings.footerDistance} onChange={e => setPageSettings(p => ({ ...p, footerDistance: parseFloat(e.target.value) || 0 }))}/><span className="text-xs text-slate-400">{pageSettings.unit}</span></div></div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold mb-2">Page numbers</div>
                            <div className="flex flex-col gap-1">
                              <button className="text-left px-3 py-1.5 text-sm bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 text-slate-600"># Insert page number</button>
                              <button className="text-left px-3 py-1.5 text-sm bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 text-slate-600">## Insert total pages</button>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button className="flex-1 py-1.5 text-sm border border-slate-200 rounded hover:bg-slate-50 font-medium text-slate-700" onClick={() => { setActiveEditorName('header'); headerEditor?.commands.focus(); setActiveDropdown(null); }}>Header</button>
                            <button className="flex-1 py-1.5 text-sm border border-slate-200 rounded hover:bg-slate-50 font-medium text-slate-700" onClick={() => { setActiveEditorName('footer'); footerEditor?.commands.focus(); setActiveDropdown(null); }}>Footer</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-px h-5 bg-slate-200 mx-1"></div>

              <button type="button" onClick={() => currentEditor?.chain().focus().undo().run()} disabled={!currentEditor?.can().undo()} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-50" title="Undo"><Undo className="w-4 h-4" /></button>
              <button type="button" onClick={() => currentEditor?.chain().focus().redo().run()} disabled={!currentEditor?.can().redo()} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-50" title="Redo"><Redo className="w-4 h-4" /></button>
              
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              
              <button type="button" onClick={() => window.print()} className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="Print"><Printer className="w-4 h-4" /></button>
              
              <button 
                type="button" 
                onClick={handleExportDocx} 
                disabled={isExporting || isExportingPdf}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-50 font-semibold text-xs" 
                title="Export to DOCX"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'DOCX'}
              </button>
              
              <button 
                type="button" 
                onClick={handleExportPdf} 
                disabled={isExporting || isExportingPdf}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-50 font-semibold text-xs" 
                title="Export to PDF"
              >
                {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : 'PDF'}
              </button>
              
              <div className="w-px h-5 bg-slate-200 mx-1"></div>

              <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 rounded hover:bg-slate-100 ${isDarkMode ? 'text-blue-500 bg-blue-50' : 'text-slate-500'}`} title="Toggle Theme">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorBubbleMenu editor={editor} />

      <div className={`shadow-md border flex flex-col mx-auto relative group transition-colors editor-page-container ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} style={{ width: `${pageSettings.width}${pageSettings.unit}`, minHeight: `${pageSettings.height}${pageSettings.unit}`, marginTop: '2rem', marginBottom: '2rem' }}>
        
        {/* Header Region */}
        <div 
          className={`relative w-full transition-colors ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} ${activeEditorName === 'header' ? 'border-b-2 border-purple-500 is-active-region' : 'border-b border-transparent'}`}
          style={{ paddingTop: `${pageSettings.headerDistance}${pageSettings.unit}`, paddingLeft: `${pageSettings.marginLeft}${pageSettings.unit}`, paddingRight: `${pageSettings.marginRight}${pageSettings.unit}`, paddingBottom: '0.5cm' }}
          onClick={() => { if (!readOnly) setActiveEditorName('header'); headerEditor?.commands.focus() }}
        >
          {activeEditorName === 'header' && !readOnly && (
            <div className="absolute -bottom-[11px] left-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-r z-10 pointer-events-none">Page header</div>
          )}
          <EditorContent 
            editor={headerEditor} 
            className={`w-full focus:outline-none tiptap-docx-editor-content header-footer-editor min-h-[40px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            style={{ fontFamily: selectedFont === 'Default font' ? 'inherit' : selectedFont }}
          />
        </div>

        {/* Main Body Region */}
        <div 
          className="w-full flex-grow transition-colors relative"
          style={{ paddingTop: '0.5cm', paddingBottom: '0.5cm', paddingLeft: `${pageSettings.marginLeft}${pageSettings.unit}`, paddingRight: `${pageSettings.marginRight}${pageSettings.unit}` }}
          onClick={() => { if (!readOnly) setActiveEditorName('body'); editor?.commands.focus() }}
        >
          <EditorContent 
            editor={editor} 
            className={`w-full flex-grow focus:outline-none tiptap-docx-editor-content min-h-[400px] ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}
            style={{ fontFamily: selectedFont === 'Default font' ? 'inherit' : selectedFont }}
          />
        </div>

        {/* Footer Region */}
        <div 
          className={`relative w-full transition-colors ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} ${activeEditorName === 'footer' ? 'border-t-2 border-purple-500 is-active-region' : 'border-t border-transparent'}`}
          style={{ paddingBottom: `${pageSettings.footerDistance}${pageSettings.unit}`, paddingLeft: `${pageSettings.marginLeft}${pageSettings.unit}`, paddingRight: `${pageSettings.marginRight}${pageSettings.unit}`, paddingTop: '0.5cm' }}
          onClick={() => { if (!readOnly) setActiveEditorName('footer'); footerEditor?.commands.focus() }}
        >
          {activeEditorName === 'footer' && !readOnly && (
            <div className="absolute -top-[11px] left-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-r z-10 pointer-events-none">Page footer</div>
          )}
          <EditorContent 
            editor={footerEditor} 
            className={`w-full focus:outline-none tiptap-docx-editor-content header-footer-editor min-h-[40px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            style={{ fontFamily: selectedFont === 'Default font' ? 'inherit' : selectedFont }}
          />
        </div>
      </div>

      <style jsx global>{`
        .tiptap-docx-editor-content .ProseMirror { 
          outline: none; 
          min-height: 100%; 
          overflow-x: auto;
          max-width: 100%;
        }
        /* Make first and last elements flush with padding to allow perfect distance shifting */
        .tiptap-docx-editor-content .ProseMirror > *:first-child { margin-top: 0 !important; }
        .tiptap-docx-editor-content .ProseMirror > *:last-child { margin-bottom: 0 !important; }

        .tiptap-docx-editor-content .ProseMirror table .selectedCell {
          background-color: rgba(200, 200, 255, 0.4) !important;
          caret-color: transparent;
        }
        .tiptap-docx-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd; content: attr(data-placeholder); float: left; height: 0; pointer-events: none;
        }
        .tiptap-docx-editor-content .ProseMirror h1 { font-size: 2.5em; font-weight: bold; margin: 0.5em 0; line-height: 1.2; }
        .tiptap-docx-editor-content .ProseMirror h2 { font-size: 2em; font-weight: bold; margin: 0.5em 0; line-height: 1.3; }
        .tiptap-docx-editor-content .ProseMirror h3 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; line-height: 1.4; }
        .tiptap-docx-editor-content .ProseMirror h4 { font-size: 1.25em; font-weight: bold; margin: 0.5em 0; line-height: 1.4; }
        .tiptap-docx-editor-content .ProseMirror p { margin: 0.5em 0; line-height: 1.6; }
        .tiptap-docx-editor-content .ProseMirror ul, .tiptap-docx-editor-content .ProseMirror ol { padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap-docx-editor-content .ProseMirror ul { list-style-type: disc; }
        .tiptap-docx-editor-content .ProseMirror ol { list-style-type: decimal; }
        .tiptap-docx-editor-content .ProseMirror li { margin: 0.25em 0; }
        .tiptap-docx-editor-content .ProseMirror code { background-color: #f1f5f9; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
        
        .tiptap-docx-editor-content .ProseMirror table { border-collapse: collapse; width: 100%; margin: 1em 0; table-layout: fixed; overflow: hidden; }
        .tiptap-docx-editor-content .ProseMirror table td, .tiptap-docx-editor-content .ProseMirror table th { border: 1px solid #cbd5e1; padding: 8px 12px; vertical-align: top; min-width: 100px; position: relative; box-sizing: border-box; }
        
        /* Layout tables default to transparent borders so they don't jump, but remain hidden */
        .tiptap-docx-editor-content.header-footer-editor .ProseMirror table td, 
        .tiptap-docx-editor-content.header-footer-editor .ProseMirror table th {
          border: 1px dashed transparent;
          border-collapse: collapse;
          padding: 4px 8px;
        }

        /* Show the dashed layout grid ONLY when the region is being actively edited */
        .is-active-region .tiptap-docx-editor-content.header-footer-editor .ProseMirror table td,
        .is-active-region .tiptap-docx-editor-content.header-footer-editor .ProseMirror table th {
          border: 1px dashed #cbd5e1;
        }

        .tiptap-docx-editor-content .ProseMirror table td > *, .tiptap-docx-editor-content .ProseMirror table th > * { margin-bottom: 0; }
        .tiptap-docx-editor-content .ProseMirror table th { background-color: #f8fafc; font-weight: bold; text-align: left; }
        .tiptap-docx-editor-content .ProseMirror table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #3b82f6;
          pointer-events: none;
          z-index: 20;
        }

        @media print {
          body, html { background: white !important; }
          .no-print, aside, header { display: none !important; }
          
          /* Hide dashed borders when printing */
          .tiptap-docx-editor-content.header-footer-editor .ProseMirror table td, 
          .tiptap-docx-editor-content.header-footer-editor .ProseMirror table th {
            border: none !important;
          }

          .editor-page-container {
            zoom: 1 !important;
            min-height: auto !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          .editor-page-container > div {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
