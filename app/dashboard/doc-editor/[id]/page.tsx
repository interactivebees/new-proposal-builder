'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, Save, Cloud, CloudOff, Check, Loader2,
  Download, MoreHorizontal, Trash2, Archive, Send,
  Clock, FileText, ChevronDown
} from 'lucide-react'

const StandaloneDocxEditor = dynamic(() => import('@/components/StandaloneDocxEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-20">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
        <span className="text-sm text-slate-500 font-medium">Loading editor...</span>
      </div>
    </div>
  )
})

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

export default function DocumentEditorPage() {
  const router = useRouter()
  const params = useParams()
  const docId = params.id as string

  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<any>({ html: '', json: {} })
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoad = useRef(true)

  // Fetch document on mount
  useEffect(() => {
    fetchDocument()
  }, [docId])

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${docId}`)
      if (!res.ok) {
        router.push('/dashboard/doc-editor')
        return
      }
      const doc = await res.json()
      setDocument(doc)
      setTitle(doc.title)
      setContent({ html: doc.content || '', json: doc.contentJson || {} })
      setWordCount(doc.wordCount || 0)
      setLastSaved(new Date(doc.updatedAt))
      isInitialLoad.current = false
    } catch (err) {
      console.error('Error fetching document:', err)
      router.push('/dashboard/doc-editor')
    } finally {
      setLoading(false)
    }
  }

  // Auto-save function
  const saveDocument = useCallback(async (newTitle?: string, newContent?: any) => {
    const titleToSave = newTitle ?? title
    const contentToSave = newContent ?? content

    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToSave,
          content: contentToSave.html,
          contentJson: contentToSave.json,
        })
      })
      if (res.ok) {
        setSaveStatus('saved')
        setLastSaved(new Date())
      } else {
        setSaveStatus('error')
      }
    } catch (err) {
      console.error('Error saving document:', err)
      setSaveStatus('error')
    }
  }, [docId, title, content])

  // Debounced auto-save on content change
  const handleContentChange = useCallback((newContent: any) => {
    setContent(newContent)
    
    // Update word/char counts
    const plainText = (newContent.html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    setWordCount(plainText ? plainText.split(' ').length : 0)
    setCharCount(plainText.length)

    if (isInitialLoad.current) return

    setSaveStatus('unsaved')

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Auto-save after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(undefined, newContent)
    }, 2000)
  }, [saveDocument])

  // Save title changes
  const handleTitleBlur = () => {
    setIsTitleEditing(false)
    if (title !== document?.title) {
      saveDocument(title)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      titleInputRef.current?.blur()
    }
  }

  // Keyboard shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveDocument()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveDocument])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleStatusChange = async (status: string) => {
    try {
      await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      setDocument((prev: any) => ({ ...prev, status }))
    } catch (err) {
      console.error('Error updating status:', err)
    }
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      router.push('/dashboard/doc-editor')
    } catch (err) {
      console.error('Error deleting document:', err)
    }
  }

  const formatLastSaved = () => {
    if (!lastSaved) return ''
    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(diff / 3600000)
    if (hours < 24) return `${hours}h ago`
    return lastSaved.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: 'bg-slate-100', text: 'text-slate-700' },
    PUBLISHED: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    ARCHIVED: { bg: 'bg-amber-100', text: 'text-amber-700' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800" />
          <span className="text-sm text-slate-500 font-medium">Loading document...</span>
        </div>
      </div>
    )
  }

  const currentStatus = document?.status || 'DRAFT'
  const statusStyle = statusColors[currentStatus] || statusColors.DRAFT

  return (
    <div className="space-y-0 -m-4 sm:-m-5 lg:-m-5 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 h-[52px] relative z-[60]">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/dashboard/doc-editor"
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </Link>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            {isTitleEditing ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="text-sm font-bold text-slate-900 border-b-2 border-blue-500 outline-none bg-transparent py-0.5 w-full max-w-md"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setIsTitleEditing(true)
                  setTimeout(() => titleInputRef.current?.focus(), 50)
                }}
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-md text-left"
              >
                {title || 'Untitled Document'}
              </button>
            )}
          </div>
        </div>

        {/* Center: Save Status */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-blue-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Cloud className="w-3.5 h-3.5" />
              Saved {formatLastSaved()}
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="flex items-center gap-1.5 text-amber-600">
              <CloudOff className="w-3.5 h-3.5" />
              Unsaved changes
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-red-600">
              <CloudOff className="w-3.5 h-3.5" />
              Save failed
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span className={`hidden sm:inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            {currentStatus}
          </span>

          {/* Manual Save */}
          <button
            onClick={() => saveDocument()}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase">Status</div>
                <button
                  onClick={() => handleStatusChange('DRAFT')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 ${currentStatus === 'DRAFT' ? 'text-blue-600' : 'text-slate-700'}`}
                >
                  <FileText className="w-3.5 h-3.5" /> Draft
                  {currentStatus === 'DRAFT' && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
                <button
                  onClick={() => handleStatusChange('PUBLISHED')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 ${currentStatus === 'PUBLISHED' ? 'text-emerald-600' : 'text-slate-700'}`}
                >
                  <Send className="w-3.5 h-3.5" /> Published
                  {currentStatus === 'PUBLISHED' && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
                <button
                  onClick={() => handleStatusChange('ARCHIVED')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 ${currentStatus === 'ARCHIVED' ? 'text-amber-600' : 'text-slate-700'}`}
                >
                  <Archive className="w-3.5 h-3.5" /> Archived
                  {currentStatus === 'ARCHIVED' && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-[#f8f9fa] flex-1 overflow-y-auto">
        <StandaloneDocxEditor
          content={content}
          onChange={handleContentChange}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0 h-[36px]">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last saved: {formatLastSaved()}
            </span>
          )}
          <span className="text-slate-400">Ctrl+S to save</span>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-[55]" onClick={() => setShowMenu(false)} />
      )}
    </div>
  )
}
