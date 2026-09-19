'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { formatDate } from '@/lib/formatDate'
import toast from 'react-hot-toast'
import { Download, FileText, FileDown, Save, CheckSquare } from 'lucide-react'

const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

interface Proposal {
  id: string
  title: string
  content: any
  clientName?: string
  clientCompany?: string
  clientEmail?: string
  clientAddress?: string
  clientLogoUrl?: string
  status: string
  createdAt: string
  creator: {
    name: string
    email: string
  }
  pricingItems: Array<{
    id: string
    serviceDescription: string
    cost: number
    frequency?: string
  }>
  comments: Array<{
    id: string
    content: string
    user: {
      name: string
    }
    createdAt: string
  }>
}

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<any>({})
  const [editedTitle, setEditedTitle] = useState('')
  const [editedClientLogoUrl, setEditedClientLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showSaveAsTemplateModal, setShowSaveAsTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [savingAsTemplate, setSavingAsTemplate] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProposal()
  }, [params.id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setProposal(data)
        setEditedContent(data.content)
        setEditedTitle(data.title)
        setEditedClientLogoUrl(data.clientLogoUrl || '')
      } else {
        console.error('Failed to fetch proposal')
      }
    } catch (error) {
      console.error('Error fetching proposal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setEditedClientLogoUrl(data.url)
      } else {
        console.error('Failed to upload logo')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/proposals/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          clientLogoUrl: editedClientLogoUrl
        })
      })

      if (res.ok) {
        await fetchProposal()
        setEditing(false)
      } else {
        console.error('Failed to update proposal')
      }
    } catch (error) {
      console.error('Error updating proposal:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportDocx = async () => {
    setExporting(true)
    setShowExportMenu(false)
    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: params.id })
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${proposal?.title || 'proposal'}.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting proposal:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPdf = async () => {
    setExporting(true)
    setShowExportMenu(false)
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: params.id })
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${proposal?.title || 'proposal'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (format === 'docx') {
      await handleExportDocx()
    } else {
      await handleExportPdf()
    }
  }

  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAsTemplate(true)
    try {
      const res = await fetch(`/api/proposals/${params.id}/save-as-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          category: templateCategory || undefined
        })
      })

      if (res.ok) {
        const template = await res.json()
        setShowSaveAsTemplateModal(false)
        setTemplateName('')
        setTemplateCategory('')
        toast.success(`Template "${template.name}" created successfully`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save as template')
      }
    } catch (error) {
      console.error('Error saving as template:', error)
      toast.error('An error occurred')
    } finally {
      setSavingAsTemplate(false)
    }
  }

  const handleDuplicate = async (newClientData: any) => {
    setDuplicating(true)
    try {
      const res = await fetch(`/api/proposals/${params.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData)
      })

      if (res.ok) {
        const newProposal = await res.json()
        router.push(`/dashboard/proposals/${newProposal.id}`)
      } else {
        console.error('Failed to duplicate proposal')
      }
    } catch (error) {
      console.error('Error duplicating proposal:', error)
    } finally {
      setDuplicating(false)
      setShowDuplicateModal(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-[var(--badge-bg)] text-gray-800',
      IN_REVIEW: 'bg-yellow-100 text-yellow-800',
      PENDING_APPROVAL: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SENT: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-[var(--badge-bg)] text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900">Proposal not found</h2>
        <button
          onClick={() => router.push('/dashboard/proposals')}
          className="px-4 py-2 bg-[#FEF08A] hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-2xs transition-all border border-amber-300/80"
        >
          Back to Proposals
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {editing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold text-[var(--text-heading)] border-b-2 border-blue-500 focus:outline-none w-full"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-[var(--text-heading)]">{proposal.title}</h1>
                )}
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">
                    Created by {proposal.creator.name}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setEditedTitle(proposal.title)
                        setEditedContent(proposal.content)
                        setEditedClientLogoUrl(proposal.clientLogoUrl || '')
                      }}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-300 text-[var(--text-body)] rounded hover:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/approvals', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              proposalId: params.id,
                              stepName: 'Technical Review',
                              comments: 'Submitted for multi-level approval'
                            })
                          })
                          if (res.ok) {
                            toast.success('Submitted for approval!')
                            fetchProposal()
                          } else {
                            const err = await res.json()
                            toast.error(err.error || 'Failed to submit')
                          }
                        } catch (err) {
                          toast.error('Failed to submit for approval')
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 shadow-md shadow-teal-200 border border-white/20 hover:from-teal-500 hover:to-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400 transition-all flex items-center gap-1"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Submit for Approval
                    </button>
                    <button
                      onClick={() => setEditing(true)}
                      disabled={saving || exporting}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-200 border border-white/20 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Edit'}
                    </button>
                    <button
                      onClick={() => setShowDuplicateModal(true)}
                      disabled={duplicating}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 shadow-md shadow-purple-200 border border-white/20 hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {duplicating ? 'Duplicating...' : 'Duplicate'}
                    </button>
                    <button
                      onClick={() => {
                        setTemplateName(proposal?.title || 'New Template')
                        setShowSaveAsTemplateModal(true)
                      }}
                      disabled={savingAsTemplate}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-md shadow-orange-200 border border-white/20 hover:from-orange-400 hover:via-amber-400 hover:to-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      {savingAsTemplate ? 'Saving...' : 'Save as Template'}
                    </button>
                    <div className="relative" ref={exportMenuRef}>
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={exporting}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 shadow-md shadow-emerald-200 border border-white/20 hover:from-emerald-500 hover:via-green-500 hover:to-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Exporting...' : 'Export'}
                      </button>
                      {showExportMenu && (
                        <div className="absolute right-0 mt-1 w-40 bg-[var(--bg-card)] rounded-lg shadow-lg border border-[var(--border-light)] z-50">
                          <button
                            onClick={handleExportDocx}
                            disabled={exporting}
                            className="w-full px-4 py-2 text-left text-sm text-[var(--text-body)] hover:bg-[var(--badge-bg)] flex items-center gap-2 rounded-t-lg disabled:opacity-60"
                          >
                            <FileText className="w-4 h-4" />
                            Export DOCX
                          </button>
                          <button
                            onClick={handleExportPdf}
                            disabled={exporting}
                            className="w-full px-4 py-2 text-left text-sm text-[var(--text-body)] hover:bg-[var(--badge-bg)] flex items-center gap-2 rounded-b-lg disabled:opacity-60"
                          >
                            <FileDown className="w-4 h-4" />
                            Export PDF
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => router.push('/dashboard/proposals')}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-800 bg-gradient-to-r from-gray-100 via-gray-50 to-white border border-[var(--border-light)] shadow-md shadow-gray-100 hover:from-gray-50 hover:via-white hover:to-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300 transition-all"
                    >
                      Back
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div className="mt-4 pt-4 border-t">
              {/* Client Logo */}
              <div className="mb-4">
                <p className="text-sm text-[var(--text-muted)] mb-2">Client Logo</p>
                {editing ? (
                  <div className="space-y-2">
                    {editedClientLogoUrl && (
                      <img 
                        src={editedClientLogoUrl} 
                        alt="Client logo" 
                        className="h-20 w-auto border rounded shadow-sm mb-2"
                      />
                    )}
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="block text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploading && <span className="text-sm text-[var(--text-muted)]">Uploading...</span>}
                    </div>
                    {editedClientLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditedClientLogoUrl('')}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                ) : (
                  proposal.clientLogoUrl ? (
                    <img 
                      src={proposal.clientLogoUrl} 
                      alt="Client logo" 
                      className="h-20 w-auto border rounded shadow-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">No logo uploaded</p>
                  )
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Client Name</p>
                  <p className="text-sm font-medium text-[var(--text-heading)]">{proposal.clientName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Company</p>
                  <p className="text-sm font-medium text-[var(--text-heading)]">{proposal.clientCompany || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Email</p>
                  <p className="text-sm font-medium text-[var(--text-heading)]">{proposal.clientEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Address</p>
                  <p className="text-sm font-medium text-[var(--text-heading)]">{proposal.clientAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Created</p>
                  <p className="text-sm font-medium text-[var(--text-heading)]">{formatDate(proposal.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-[var(--bg-card)] shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Proposal Sections</h2>
            <SectionEditor
              sections={editing ? editedContent?.sections || [] : proposal.content?.sections || []}
              onChange={(sections) => setEditedContent({ ...editedContent, sections })}
              readOnly={!editing}
            />
          </div>

          {/* Pricing Items */}
          {proposal.pricingItems && proposal.pricingItems.length > 0 && (
            <div className="bg-[var(--bg-card)] shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Pricing</h2>
              <table className="min-w-full divide-y divide-[var(--border-light)]">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Service</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {proposal.pricingItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-[var(--text-heading)]">{item.serviceDescription}</td>
                      <td className="px-4 py-2 text-sm text-[var(--text-heading)]">${item.cost.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-[var(--text-muted)]">{item.frequency || 'one-time'}</td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--bg-page)]">
                    <td className="px-4 py-2 text-sm font-semibold text-[var(--text-heading)]">Total</td>
                    <td className="px-4 py-2 text-sm font-semibold text-[var(--text-heading)]">
                      ${proposal.pricingItems.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Comments */}
          {proposal.comments && proposal.comments.length > 0 && (
            <div className="bg-[var(--bg-card)] shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Comments</h2>
              <div className="space-y-4">
                {proposal.comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text-heading)]">{comment.user.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[var(--text-body)]">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Modal */}
          {showDuplicateModal && (
            <DuplicateModal
              onClose={() => setShowDuplicateModal(false)}
              onDuplicate={handleDuplicate}
              duplicating={duplicating}
            />
          )}

          {/* Save as Template Modal */}
          {showSaveAsTemplateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[var(--bg-card)] rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[var(--text-heading)] mb-2">Save as Template</h2>
                  <p className="text-sm text-[var(--text-muted)] mb-6">
                    Save this proposal as a reusable template. The template will include all sections and formatting, but client-specific data will be cleared.
                  </p>
                  <form onSubmit={handleSaveAsTemplate} className="space-y-4">
                    <div>
                      <label htmlFor="templateName" className="block text-sm font-medium text-[var(--text-body)]">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        id="templateName"
                        required
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Enter template name"
                        className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="templateCategory" className="block text-sm font-medium text-[var(--text-body)]">
                        Category (Optional)
                      </label>
                      <input
                        type="text"
                        id="templateCategory"
                        value={templateCategory}
                        onChange={(e) => setTemplateCategory(e.target.value)}
                        placeholder="e.g., Sales, Consulting"
                        className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSaveAsTemplateModal(false)
                          setTemplateName('')
                          setTemplateCategory('')
                        }}
                        className="px-4 py-2 border border-[var(--border-default)] rounded-md shadow-sm text-sm font-medium text-[var(--text-body)] bg-[var(--bg-card)] hover:bg-[var(--bg-page)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingAsTemplate}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingAsTemplate ? 'Saving...' : 'Save Template'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}

// Duplicate Modal Component
function DuplicateModal({ onClose, onDuplicate, duplicating }: any) {
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onDuplicate({ clientName, clientCompany, clientEmail, clientAddress, title })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-[var(--text-heading)] mb-4">Duplicate Proposal for New Client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-body)]">New Proposal Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to auto-generate"
              className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-body)]">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-body)]">Client Company</label>
            <input
              type="text"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-body)]">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-body)]">Client Address</label>
            <textarea
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={duplicating}
              className="px-4 py-2 bg-gray-300 text-[var(--text-body)] rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={duplicating}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {duplicating ? 'Duplicating...' : 'Duplicate Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
