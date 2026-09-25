'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Extension } from '@tiptap/core'
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
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CustomImage } from './CustomImage'

import { useEffect, useState, useRef } from 'react'
import { 
  Bold, Italic, Strikethrough, Code, Link as LinkIcon, Image as ImageIcon, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Minus, Plus, ChevronDown, Grid3X3, IndentDecrease, IndentIncrease,
  Type, Heading1, Heading2, Heading3, Heading4, Search, Settings, 
  FileText, LayoutTemplate, MoreHorizontal, Sun, Moon, SplitSquareVertical,
  Scissors, Trash2
} from 'lucide-react'

interface Word365EditorProps {
  content: any
  onChange: (content: any) => void
  readOnly?: boolean
}

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

export default function DocxEditor({ content, onChange, readOnly = false }: Word365EditorProps) {
  const [selectedFont, setSelectedFont] = useState('Default font')
  const [selectedFontSize, setSelectedFontSize] = useState('16')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [fontSearch, setFontSearch] = useState('')
  const [zoom, setZoom] = useState(100)
  const [tableHover, setTableHover] = useState({ r: 0, c: 0 })
  const [, forceUpdate] = useState(0)
  const [settingsTab, setSettingsTab] = useState<'document' | 'headers'>('headers')
  const [activeEditorName, setActiveEditorName] = useState<'body'>('body')
  
  const toolbarRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  const getExtensions = (placeholderText: string) => [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
    Placeholder.configure({ placeholder: placeholderText }),
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: true }),
    Underline,
    CustomImage,
    TextStyle,
    FontSize,
    FontFamily.configure({ types: ['textStyle'] }),
    Color,
    Table.configure({ resizable: true, HTMLAttributes: { class: 'border-collapse border border-slate-300' } }),
    TableRow, TableHeader, TableCell
  ]

  const sharedEditorProps = {
    handlePaste: (view: any, event: any) => {
      const items = Array.from(event.clipboardData?.items || [])
      for (const item of items) {
        if ((item as any).type.indexOf('image') === 0) {
          const file = (item as any).getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const src = e.target?.result as string
              const { schema } = view.state
              const node = schema.nodes.image.create({ src })
              const transaction = view.state.tr.replaceSelectionWith(node)
              view.dispatch(transaction)
            }
            reader.readAsDataURL(file)
            return true
          }
        }
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
    }
  }

  const editor = useEditor({
    extensions: getExtensions('Start typing your document...'),
    content: content?.html || '',
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: sharedEditorProps,
    onUpdate: () => {
      isInternalChange.current = true
      onChange({ html: editor?.getHTML() || '', json: editor?.getJSON() || {} })
    },
  })

  const currentEditor = editor

  useEffect(() => {
    if (editor && content?.html && !isInternalChange.current) {
      if (editor.getHTML() !== content.html) {
        editor.commands.setContent(content.html)
      }
    }
    isInternalChange.current = false
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [readOnly, editor])

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
    <div className="bg-[#f8f9fa] flex flex-col items-center w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner min-h-[600px]" style={{ zoom: zoom / 100 }}>
      {!readOnly && (
        <div className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50 flex justify-center" ref={toolbarRef} style={{ zoom: 100 / zoom }}>
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 text-slate-700 max-w-5xl w-full">
            
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

            {/* Table Dropdown */}
            <div className="relative">
              <button type="button" onClick={() => toggleDropdown('table')} className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${activeDropdown === 'table' ? 'bg-slate-100' : ''}`} title="Table">
                <Grid3X3 className="w-4 h-4" />
              </button>
              {activeDropdown === 'table' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-3">
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    {tableHover.r > 0 ? `${tableHover.c}x${tableHover.r} Table` : 'Insert Table'}
                  </div>
                  <div className="flex flex-col gap-0.5 mb-2" onMouseLeave={() => setTableHover({ r: 0, c: 0 })}>
                    {Array.from({ length: 10 }).map((_, rIndex) => (
                      <div key={rIndex} className="flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, cIndex) => {
                          const r = rIndex + 1
                          const c = cIndex + 1
                          const isSelected = r <= tableHover.r && c <= tableHover.c
                          return (
                            <button
                              key={cIndex}
                              type="button"
                              onMouseEnter={() => setTableHover({ r, c })}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                currentEditor?.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: false }).run();
                                setActiveDropdown(null);
                                setTableHover({ r: 0, c: 0 });
                              }}
                              className={`w-4 h-4 border ${isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                  
                  {currentEditor?.isActive('table') && (
                    <>
                      <div className="h-px bg-slate-200 my-3 mx-1"></div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); currentEditor?.chain().focus().addColumnBefore().run(); setActiveDropdown(null); }} className="px-2 py-1.5 text-xs hover:bg-slate-50 text-left rounded border border-transparent hover:border-slate-200" disabled={!currentEditor?.can().addColumnBefore()}>
                          Add Col Before
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); currentEditor?.chain().focus().addColumnAfter().run(); setActiveDropdown(null); }} className="px-2 py-1.5 text-xs hover:bg-slate-50 text-left rounded border border-transparent hover:border-slate-200" disabled={!currentEditor?.can().addColumnAfter()}>
                          Add Col After
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); currentEditor?.chain().focus().addRowBefore().run(); setActiveDropdown(null); }} className="px-2 py-1.5 text-xs hover:bg-slate-50 text-left rounded border border-transparent hover:border-slate-200" disabled={!currentEditor?.can().addRowBefore()}>
                          Add Row Before
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); currentEditor?.chain().focus().addRowAfter().run(); setActiveDropdown(null); }} className="px-2 py-1.5 text-xs hover:bg-slate-50 text-left rounded border border-transparent hover:border-slate-200" disabled={!currentEditor?.can().addRowAfter()}>
                          Add Row After
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); currentEditor?.chain().focus().deleteColumn().run(); setActiveDropdown(null); }} className="px-2 py-1.5 text-xs hover:bg-red-50 text-left text-red-600 rounded border border-transparent hover:border-red-100" disabled={!currentEditor?.can().deleteColumn()}>
                          Delete Col
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); currentEditor?.chain().focus().deleteRow().run(); setActiveDropdown(null); }} className="px-2 py-1.5 text-xs hover:bg-red-50 text-left text-red-600 rounded border border-transparent hover:border-red-100" disabled={!currentEditor?.can().deleteRow()}>
                          Delete Row
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); currentEditor?.chain().focus().deleteTable().run(); setActiveDropdown(null); }} className="col-span-2 px-2 py-1.5 text-xs hover:bg-red-50 text-center text-red-600 font-bold rounded mt-1 border border-red-200" disabled={!currentEditor?.can().deleteTable()}>
                          Delete Table
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button type="button" onClick={() => currentEditor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive('bulletList') ? 'bg-slate-200' : ''}`}><List className="w-4 h-4" /></button>
            <button type="button" onClick={() => currentEditor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive('orderedList') ? 'bg-slate-200' : ''}`}><ListOrdered className="w-4 h-4" /></button>
            
            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button type="button" className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><IndentDecrease className="w-4 h-4" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><IndentIncrease className="w-4 h-4" /></button>
            
            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button type="button" onClick={() => currentEditor?.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive({ textAlign: 'left' }) ? 'bg-slate-200' : ''}`}><AlignLeft className="w-4 h-4" /></button>
            <button type="button" onClick={() => currentEditor?.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive({ textAlign: 'center' }) ? 'bg-slate-200' : ''}`}><AlignCenter className="w-4 h-4" /></button>
            <button type="button" onClick={() => currentEditor?.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive({ textAlign: 'right' }) ? 'bg-slate-200' : ''}`}><AlignRight className="w-4 h-4" /></button>
            <button type="button" onClick={() => currentEditor?.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded hover:bg-slate-100 ${currentEditor?.isActive({ textAlign: 'justify' }) ? 'bg-slate-200' : ''}`}><AlignJustify className="w-4 h-4" /></button>
            
            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button type="button" onClick={() => currentEditor?.chain().focus().setHardBreak().run()} className="p-1.5 rounded hover:bg-slate-100 flex items-center justify-center relative group" title="Insert page break (Command+Enter)">
              <SplitSquareVertical className="w-4 h-4" />
              <div className="absolute top-full mt-1 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                Insert page break<br/><span className="text-slate-400">Command+Enter</span>
              </div>
            </button>
            
            

            {/* Right side items */}
            <div className="ml-auto flex items-center gap-1">
              
              
              <div className="relative">
                <button type="button" onClick={() => toggleDropdown('settings')} className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${activeDropdown === 'settings' ? 'bg-slate-100' : ''}`} title="Document Settings">
                  <LayoutTemplate className="w-4 h-4" />
                </button>
                {activeDropdown === 'settings' && (
                  <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                      <button 
                        type="button"
                        onClick={() => setSettingsTab('document')}
                        className={`flex-1 py-2 text-xs font-medium ${settingsTab === 'document' ? 'font-bold text-slate-800 border-b-2 border-purple-500 bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        Document
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSettingsTab('headers')}
                        className={`flex-1 py-2 text-xs font-medium ${settingsTab === 'headers' ? 'font-bold text-slate-800 border-b-2 border-purple-500 bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        Headers & footers
                      </button>
                      <button className="p-2 hover:bg-slate-100" onClick={() => setActiveDropdown(null)}>X</button>
                    </div>
                    
                    {settingsTab === 'document' ? (
                      <div className="p-4 text-xs text-slate-500 text-center">
                        Document layout settings coming soon.
                      </div>
                    ) : (
                      <div className="p-4 text-xs text-slate-500 text-center">
                        Header and footer settings have been moved to the document level.
                      </div>
                    )}
                  </div>
                )}
              </div>

              
            </div>
          </div>
        </div>
      )}

      <EditorBubbleMenu editor={editor} />

      <div className="w-[calc(100%-2rem)] md:w-[816px] max-w-full my-6 p-12 bg-white shadow-sm border border-slate-200 min-h-[500px] h-auto flex flex-col mx-auto relative group">
        <EditorContent 
          editor={editor} 
          className={`w-full flex-grow focus:outline-none tiptap-docx-editor-content`}
          style={{ fontFamily: selectedFont === 'Default font' ? 'inherit' : selectedFont }}
        />
      </div>

      <style jsx global>{`
        .tiptap-docx-editor-content .ProseMirror { 
          outline: none; 
          min-height: 100%; 
          overflow-x: auto;
          max-width: 100%;
        }
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
      `}</style>
    </div>
  )
}