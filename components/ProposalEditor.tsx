'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { ResizableImage } from 'tiptap-extension-resizable-image'
import 'tiptap-extension-resizable-image/styles.css'
import { useEffect } from 'react'

interface ProposalEditorProps {
  content: any
  onChange: (content: any) => void
  readOnly?: boolean
}

export default function ProposalEditor({ content, onChange, readOnly = false }: ProposalEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false
      }),
      Placeholder.configure({
        placeholder: 'Start writing your proposal...'
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline'
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Highlight.configure({
        multicolor: true
      }),
      ResizableImage.configure({
        onUpload: async (file: File) => {
          const formData = new FormData()
          formData.append('file', file)
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          if (!response.ok) throw new Error('Failed to upload image')
          const data = await response.json()
          return { src: data.url }
        }
      })
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

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [readOnly, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="proposal-editor">
      <EditorContent editor={editor} />
    </div>
  )
}