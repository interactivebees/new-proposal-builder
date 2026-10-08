'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, FileText, Search, MoreHorizontal, Trash2, Copy, 
  Clock, FileEdit, Archive, Filter, LayoutGrid, List,
  SortAsc, SortDesc
} from 'lucide-react'

interface Document {
  id: string
  title: string
  status: string
  wordCount: number
  createdAt: string
  updatedAt: string
}

export default function DocEditorListPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'createdAt'>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [contextMenu, setContextMenu] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const createNewDocument = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document' })
      })
      if (res.ok) {
        const doc = await res.json()
        router.push(`/dashboard/doc-editor/${doc.id}`)
      }
    } catch (err) {
      console.error('Error creating document:', err)
    } finally {
      setCreating(false)
    }
  }

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      console.error('Error deleting document:', err)
    }
    setContextMenu(null)
  }

  const duplicateDocument = async (id: string) => {
    const doc = documents.find(d => d.id === id)
    if (!doc) return
    try {
      // First fetch the full document content
      const fullRes = await fetch(`/api/documents/${id}`)
      if (fullRes.ok) {
        const fullDoc = await fullRes.json()
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${fullDoc.title} (Copy)`,
            content: fullDoc.content,
            contentJson: fullDoc.contentJson,
          })
        })
        if (res.ok) {
          fetchDocuments()
        }
      }
    } catch (err) {
      console.error('Error duplicating document:', err)
    }
    setContextMenu(null)
  }

  const filteredDocuments = documents
    .filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortBy === 'updatedAt') cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortDir === 'desc' ? -cmp : cmp
    })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PUBLISHED: 'bg-emerald-100 text-emerald-700',
    ARCHIVED: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Document Editor</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Create and edit rich documents with a full-featured editor
          </p>
        </div>
        <button
          onClick={createNewDocument}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Creating...' : 'New Document'}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:border-slate-400 outline-none"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:border-slate-400 outline-none"
          >
            <option value="updatedAt">Last Modified</option>
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
          </select>

          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            {sortDir === 'desc' ? <SortDesc className="w-4 h-4 text-slate-500" /> : <SortAsc className="w-4 h-4 text-slate-500" />}
          </button>

          <div className="flex border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border-l border-slate-200 ${viewMode === 'list' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
            >
              <List className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-3 border-slate-200 border-t-slate-800 rounded-full" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {searchQuery || statusFilter !== 'all' ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first document to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={createNewDocument}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Document
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* New Document Card */}
          <button
            onClick={createNewDocument}
            disabled={creating}
            className="group flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors mb-3">
              <Plus className="w-6 h-6 text-slate-500" />
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">
              Blank document
            </span>
          </button>

          {filteredDocuments.map(doc => (
            <div key={doc.id} className="relative group">
              <Link
                href={`/dashboard/doc-editor/${doc.id}`}
                className="flex flex-col p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-md transition-all min-h-[200px]"
              >
                {/* Document Preview Area */}
                <div className="flex-1 mb-4">
                  <div className="w-full h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center mb-3">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                </div>

                {/* Document Info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate mb-1">{doc.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[doc.status] || statusColors.DRAFT}`}>
                      {doc.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {doc.wordCount} words
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Edited {formatDate(doc.updatedAt)}</span>
                  </div>
                </div>
              </Link>

              {/* Context menu button */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu(contextMenu === doc.id ? null : doc.id) }}
                  className="p-1.5 rounded-lg bg-white/80 border border-slate-200 opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </button>

                {contextMenu === doc.id && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateDocument(doc.id) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase px-4 py-3">Title</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase px-4 py-3">Status</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase px-4 py-3">Words</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase px-4 py-3">Last Modified</th>
                <th className="text-right text-[11px] font-bold text-slate-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/doc-editor/${doc.id}`} className="flex items-center gap-3">
                      <FileEdit className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-900 hover:text-blue-600">{doc.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${statusColors[doc.status] || statusColors.DRAFT}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-medium">{doc.wordCount}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-medium">{formatDate(doc.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => duplicateDocument(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
      )}
    </div>
  )
}
