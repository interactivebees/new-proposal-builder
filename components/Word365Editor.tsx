'use client'

import { useEditor, EditorContent } from '@tiptap/react'
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
import { useEffect, useState } from 'react'

interface Word365EditorProps {
  content: any
  onChange: (content: any) => void
  readOnly?: boolean
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle']
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`
              }
            }
          }
        }
      }
    ]
  },
  addCommands() {
    return {
      setFontSize:
        size => ({ chain }) =>
          chain()
            .setMark('textStyle', { fontSize: size })
            .run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
    }
  }
})

export default function Word365Editor({ content, onChange, readOnly = false }: Word365EditorProps) {
  const [selectedFont, setSelectedFont] = useState('Arial')
  const [selectedFontSize, setSelectedFontSize] = useState('default')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false
      }),
      Placeholder.configure({
        placeholder: 'Start typing your document...'
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline'
        }
      }),
      // Underline already in StarterKit
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Highlight.configure({
        multicolor: true
      }),
      TextStyle,
      FontSize,
      FontFamily.configure({
        types: ['textStyle']
      }),
      Color,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300'
        }
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: content?.html || '',
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange({
        html: editor.getHTML(),
        json: editor.getJSON()
      })
    }
  })

  useEffect(() => {
    if (editor && content?.html && editor.getHTML() !== content.html) {
      editor.commands.setContent(content.html)
    }
  }, [content, editor])

  const fonts = [
    'Arial',
    'Times New Roman',
    'Calibri',
    'Georgia',
    'Verdana',
    'Courier New',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Palatino'
  ]

  const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px']

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#808080'
  ]

  const highlightColors = [
    '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#0000FF', '#FF0000',
    '#FFA500', '#90EE90', '#ADD8E6', '#FFB6C1', '#DDA0DD', '#F0E68C'
  ]

  const applyFont = (font: string) => {
    setSelectedFont(font)
    if (!editor) return
    editor.chain().focus().setFontFamily(font).run()
  }

  const applyFontSize = (size: string) => {
    setSelectedFontSize(size)
    if (!editor) return
    if (size === 'default') {
      editor.chain().focus().unsetFontSize().run()
      return
    }
    editor.chain().focus().setFontSize(size).run()
  }

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly)
  }, [readOnly, editor])

  useEffect(() => {
    if (!editor) return
    const updateFontSizeState = () => {
      const current = editor.getAttributes('textStyle').fontSize || 'default'
      setSelectedFontSize(current)
    }
    editor.on('selectionUpdate', updateFontSizeState)
    editor.on('transaction', updateFontSizeState)
    return () => {
      editor.off('selectionUpdate', updateFontSizeState)
      editor.off('transaction', updateFontSizeState)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-lg shadow-sm bg-white">
      {!readOnly && (
        <div className="border-b border-gray-300 bg-gradient-to-b from-blue-50 to-white">
          {/* Font and Style Bar - Word 365 Style */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
            {/* Font Family Dropdown */}
            <div className="relative">
              <select
                value={selectedFont}
                onChange={(e) => applyFont(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ minWidth: '150px' }}
              >
                {fonts.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size Dropdown */}
            <div className="relative">
              <select
                value={selectedFontSize}
                onChange={(e) => applyFontSize(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="default">Font Size</option>
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Text Formatting */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2.5 py-1.5 rounded text-sm font-bold transition ${
                  editor.isActive('bold') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-2.5 py-1.5 rounded text-sm italic transition ${
                  editor.isActive('italic') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                title="Italic (Ctrl+I)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`px-2.5 py-1.5 rounded text-sm underline transition ${
                  editor.isActive('underline') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                title="Underline (Ctrl+U)"
              >
                U
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-2.5 py-1.5 rounded text-sm line-through transition ${
                  editor.isActive('strike') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                title="Strikethrough"
              >
                S
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Text Color */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowColorPicker(!showColorPicker)
                  setShowHighlightPicker(false)
                }}
                className="px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 border border-transparent transition flex items-center gap-1"
                title="Text Color"
              >
                <span>A</span>
                <div className="w-4 h-1 bg-red-500 rounded"></div>
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10">
                  <div className="grid grid-cols-7 gap-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          editor.chain().focus().setColor(color).run()
                          setShowColorPicker(false)
                        }}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Highlight Color */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowHighlightPicker(!showHighlightPicker)
                  setShowColorPicker(false)
                }}
                className={`px-2.5 py-1.5 rounded text-sm transition flex items-center gap-1 ${
                  editor.isActive('highlight') 
                    ? 'bg-yellow-100 text-gray-900 border border-yellow-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                title="Highlight"
              >
                <span className="bg-yellow-300 px-1">ab</span>
              </button>
              {showHighlightPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10">
                  <div className="grid grid-cols-6 gap-1">
                    {highlightColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          editor.chain().focus().toggleHighlight({ color }).run()
                          setShowHighlightPicker(false)
                        }}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run()
                      setShowHighlightPicker(false)
                    }}
                    className="mt-2 w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Remove Highlight
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Paragraph Styles - Word 365 Style */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                  editor.isActive('heading', { level: 1 }) 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                style={{ fontSize: '16px' }}
              >
                Heading 1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                  editor.isActive('heading', { level: 2 }) 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                style={{ fontSize: '14px' }}
              >
                Heading 2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-1.5 rounded text-sm transition ${
                  editor.isActive('heading', { level: 3 }) 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Heading 3
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-3 py-1.5 rounded text-sm transition ${
                  editor.isActive('paragraph') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Normal
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Lists */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-3 py-1.5 rounded text-sm transition flex items-center gap-1 ${
                  editor.isActive('bulletList') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                title="Bullet List"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="3" cy="4" r="1.5"/>
                  <rect x="6" y="3" width="8" height="2" rx="1"/>
                  <circle cx="3" cy="8" r="1.5"/>
                  <rect x="6" y="7" width="8" height="2" rx="1"/>
                  <circle cx="3" cy="12" r="1.5"/>
                  <rect x="6" y="11" width="8" height="2" rx="1"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-3 py-1.5 rounded text-sm transition flex items-center gap-1 ${
                  editor.isActive('orderedList') 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                title="Numbered List"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <text x="1" y="5" fontSize="6" fontWeight="bold">1.</text>
                  <rect x="6" y="3" width="8" height="2" rx="1"/>
                  <text x="1" y="9" fontSize="6" fontWeight="bold">2.</text>
                  <rect x="6" y="7" width="8" height="2" rx="1"/>
                  <text x="1" y="13" fontSize="6" fontWeight="bold">3.</text>
                  <rect x="6" y="11" width="8" height="2" rx="1"/>
                </svg>
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`px-2.5 py-1.5 rounded text-sm transition ${
                  editor.isActive({ textAlign: 'left' }) 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                title="Align Left"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="3" width="10" height="1.5" rx="0.5"/>
                  <rect x="2" y="6" width="12" height="1.5" rx="0.5"/>
                  <rect x="2" y="9" width="8" height="1.5" rx="0.5"/>
                  <rect x="2" y="12" width="11" height="1.5" rx="0.5"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`px-2.5 py-1.5 rounded text-sm transition ${
                  editor.isActive({ textAlign: 'center' }) 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                title="Align Center"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="3" width="10" height="1.5" rx="0.5"/>
                  <rect x="2" y="6" width="12" height="1.5" rx="0.5"/>
                  <rect x="4" y="9" width="8" height="1.5" rx="0.5"/>
                  <rect x="2.5" y="12" width="11" height="1.5" rx="0.5"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`px-2.5 py-1.5 rounded text-sm transition ${
                  editor.isActive({ textAlign: 'right' }) 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                title="Align Right"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="4" y="3" width="10" height="1.5" rx="0.5"/>
                  <rect x="2" y="6" width="12" height="1.5" rx="0.5"/>
                  <rect x="6" y="9" width="8" height="1.5" rx="0.5"/>
                  <rect x="3" y="12" width="11" height="1.5" rx="0.5"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`px-2.5 py-1.5 rounded text-sm transition ${
                  editor.isActive({ textAlign: 'justify' }) 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                title="Justify"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="3" width="12" height="1.5" rx="0.5"/>
                  <rect x="2" y="6" width="12" height="1.5" rx="0.5"/>
                  <rect x="2" y="9" width="12" height="1.5" rx="0.5"/>
                  <rect x="2" y="12" width="12" height="1.5" rx="0.5"/>
                </svg>
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Table */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className="px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 border border-transparent transition"
                title="Insert Table"
              >
                ⊞ Table
              </button>
              {editor.isActive('table') && (
                <>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="px-2 py-1.5 rounded text-xs bg-white text-gray-700 hover:bg-gray-100"
                    title="Add Column"
                  >
                    +Col
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="px-2 py-1.5 rounded text-xs bg-white text-gray-700 hover:bg-gray-100"
                    title="Add Row"
                  >
                    +Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().mergeCells().run()}
                    className="px-2 py-1.5 rounded text-xs bg-white text-gray-700 hover:bg-gray-100"
                    title="Merge Selected Cells"
                  >
                    Merge
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().splitCell().run()}
                    className="px-2 py-1.5 rounded text-xs bg-white text-gray-700 hover:bg-gray-100"
                    title="Split Cell"
                  >
                    Split
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="px-2 py-1.5 rounded text-xs bg-red-50 text-red-700 hover:bg-red-100"
                    title="Delete Table"
                  >
                    Del
                  </button>
                </>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Undo (Ctrl+Z)"
              >
                ↶
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="px-2.5 py-1.5 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Redo (Ctrl+Y)"
              >
                ↷
              </button>
            </div>
          </div>
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="max-w-none p-6 min-h-[400px] focus:outline-none bg-white word365-editor-content"
        style={{
          fontFamily: selectedFont
        }}
      />
      <style jsx global>{`
        .word365-editor-content .ProseMirror {
          outline: none;
          min-height: 400px;
        }
        
        .word365-editor-content .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
          line-height: 1.2;
        }
        
        .word365-editor-content .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
          line-height: 1.3;
        }
        
        .word365-editor-content .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 1em;
          line-height: 1.4;
        }
        
        .word365-editor-content .ProseMirror p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          line-height: 1.6;
        }
        
        .word365-editor-content .ProseMirror ul,
        .word365-editor-content .ProseMirror ol {
          padding-left: 2em;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          list-style-position: outside;
        }
        
        .word365-editor-content .ProseMirror ul {
          list-style-type: disc;
        }
        
        .word365-editor-content .ProseMirror ol {
          list-style-type: decimal;
        }
        
        .word365-editor-content .ProseMirror li {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
          display: list-item;
        }
        
        .word365-editor-content .ProseMirror li p {
          margin: 0;
        }
        
        .word365-editor-content .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
          table-layout: fixed;
        }
        
        .word365-editor-content .ProseMirror table td,
        .word365-editor-content .ProseMirror table th {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          vertical-align: top;
          min-width: 100px;
        }
        
        .word365-editor-content .ProseMirror table th {
          background-color: #f3f4f6;
          font-weight: bold;
          text-align: left;
        }
        
        .word365-editor-content .ProseMirror table .selectedCell {
          background-color: #dbeafe;
        }
        
        .word365-editor-content .ProseMirror .tableWrapper {
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .word365-editor-content .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1em;
          margin-left: 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .word365-editor-content .ProseMirror code {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        .word365-editor-content .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        
        .word365-editor-content .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        
        .word365-editor-content .ProseMirror hr {
          border: none;
          border-top: 2px solid #d1d5db;
          margin: 2em 0;
        }
        
        .word365-editor-content .ProseMirror .ProseMirror-focused {
          outline: none;
        }
        
        /* Cursor visibility */
        .word365-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
