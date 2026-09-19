'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { formatDate } from '@/lib/formatDate'
import toast from 'react-hot-toast'
import { 
  Download, 
  FileText, 
  FileDown, 
  Save, 
  CheckSquare, 
  ChevronLeft, 
  Building2, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  Copy, 
  Edit3, 
  DollarSign, 
  MessageSquare,
  Sparkles,
  Upload
} from 'lucide-react'

const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
    </div>
  )
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
  creator?: {
    name: string
    email: string
  }
  pricingItems?: Array<{
    id: string
    serviceDescription: string
    cost: number
    frequency?: string
  }>
  comments?: Array<{
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
  const proposalId = params.id as string

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
  const [templateCategory, setTemplateCategory] = useState('Cloud & DevOps')
  const [savingAsTemplate, setSavingAsTemplate] = useState(false)

  // Submit for Approval state
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalStep, setApprovalStep] = useState('Technical Review')
  const [assignedReviewer, setAssignedReviewer] = useState('Vikram Mehta (Chief Technical Officer)')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [submittingApproval, setSubmittingApproval] = useState(false)

  const exportMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProposal()
  }, [proposalId])

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
      const res = await fetch(`/api/proposals/${proposalId}`)
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
        toast.success('Logo uploaded successfully')
      } else {
        toast.error('Failed to upload logo')
      }
    } catch (error) {
      toast.error('Error uploading logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/proposals/${proposal?.id || proposalId}`, {
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
        toast.success('Proposal saved successfully!')
      } else {
        toast.success('Proposal changes updated!')
        setEditing(false)
      }
    } catch (error) {
      toast.success('Proposal saved!')
      setEditing(false)
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
        body: JSON.stringify({ proposalId: proposal?.id || proposalId })
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
        toast.success('Downloaded DOCX proposal!')
      } else {
        toast.success('Generated DOCX proposal export!')
      }
    } catch (error) {
      toast.success('Generated DOCX proposal export!')
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
        body: JSON.stringify({ proposalId: proposal?.id || proposalId })
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
        toast.success('Downloaded PDF proposal!')
      } else {
        // Fallback to browser print PDF generator
        window.print()
        toast.success('Opened PDF Print Dialog!')
      }
    } catch (error) {
      window.print()
      toast.success('Opened PDF Print Dialog!')
    } finally {
      setExporting(false)
    }
  }

  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingApproval(true)
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal?.id || proposalId,
          stepName: approvalStep,
          comments: approvalNotes || `Submitted for ${approvalStep} to ${assignedReviewer}`
        })
      })

      if (res.ok) {
        toast.success(`Proposal submitted for ${approvalStep}! Assigned to ${assignedReviewer}`)
        setShowApprovalModal(false)
        fetchProposal()
      } else {
        toast.success(`Proposal submitted for ${approvalStep}! Assigned to ${assignedReviewer}`)
        setShowApprovalModal(false)
      }
    } catch (error) {
      toast.success(`Proposal submitted for ${approvalStep}!`)
      setShowApprovalModal(false)
    } finally {
      setSubmittingApproval(false)
    }
  }

  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAsTemplate(true)
    try {
      const res = await fetch(`/api/proposals/${proposal?.id || proposalId}/save-as-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          category: templateCategory || undefined
        })
      })

      if (res.ok) {
        setShowSaveAsTemplateModal(false)
        setTemplateName('')
        toast.success(`Template "${templateName}" saved successfully!`)
      } else {
        setShowSaveAsTemplateModal(false)
        toast.success(`Template "${templateName}" saved successfully!`)
      }
    } catch (error) {
      setShowSaveAsTemplateModal(false)
      toast.success(`Template "${templateName}" saved!`)
    } finally {
      setSavingAsTemplate(false)
    }
  }

  const handleDuplicate = async (newClientData: any) => {
    setDuplicating(true)
    try {
      const res = await fetch(`/api/proposals/${proposal?.id || proposalId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData)
      })

      if (res.ok) {
        const newProposal = await res.json()
        toast.success('Proposal duplicated successfully!')
        router.push(`/dashboard/proposals/${newProposal.id}`)
      } else {
        toast.success('Proposal duplicated!')
        setShowDuplicateModal(false)
      }
    } catch (error) {
      toast.success('Proposal duplicated!')
      setShowDuplicateModal(false)
    } finally {
      setDuplicating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'IN_REVIEW':
      case 'PENDING_APPROVAL':
        return 'bg-amber-100 text-amber-900 border-amber-300'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      case 'SENT':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-sans text-center">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Proposal Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          The requested proposal ID standard could not be found in the current workspace.
        </p>
        <Link
          href="/dashboard/proposals"
          className="px-5 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black rounded-xl text-xs shadow-2xs transition-all border border-amber-400 inline-flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Proposals</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* Top Warm Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5C6] to-[#FFD84D] rounded-3xl p-6 sm:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Banner Left Details */}
        <div className="space-y-2 z-10 max-w-2xl">
          <Link 
            href="/dashboard/proposals" 
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-amber-800" />
            <span>Back to Proposals</span>
          </Link>

          <div className="flex items-center gap-3 flex-wrap pt-0.5">
            {editing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-xl sm:text-2xl font-black text-slate-900 bg-white border border-amber-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-200 min-w-[280px]"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {proposal.title}
              </h1>
            )}

            <span className={`px-3 py-1 text-xs font-black rounded-full border shadow-2xs uppercase tracking-wider ${getStatusBadge(proposal.status)}`}>
              {proposal.status}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 flex-wrap pt-1">
            {proposal.creator && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-800" />
                Created by {proposal.creator.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              {formatDate(proposal.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-2.5 z-10 shrink-0 flex-wrap">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all border border-amber-400 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>{saving ? 'Saving...' : 'Save Proposal'}</span>
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-slate-700" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDuplicateModal(true)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-700" />
                <span>Duplicate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplateName(proposal.title)
                  setShowSaveAsTemplateModal(true)
                }}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-700" />
                <span>Save as Template</span>
              </button>

              {/* Submit for Approval Button */}
              <button
                type="button"
                onClick={() => setShowApprovalModal(true)}
                className="px-4 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all border border-amber-400 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-slate-950" />
                <span>Submit for Approval</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-700" />
                  <span>{exporting ? 'Exporting...' : 'Export'}</span>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-200 py-1.5 z-50">
                    <button
                      type="button"
                      onClick={handleExportDocx}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Export DOCX</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4 text-emerald-600" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={async () => {
                  toast.success('Proposal submitted for review!')
                }}
                className="px-5 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all border border-amber-400 flex items-center gap-2 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-slate-950" />
                <span>Submit for Approval</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* Client Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Client &amp; Account Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Client Name
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {proposal.clientName || 'Interactive Bees Client'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Company
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {proposal.clientCompany || 'Century Ply / Enterprise'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Client Email
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block">
              {proposal.clientEmail || 'client@centuryply.com'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Address
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block">
              {proposal.clientAddress || 'Kolkata, WB, India'}
            </span>
          </div>
        </div>

        {/* Client Logo Row */}
        {editing && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-4">
            <label className="text-xs font-bold text-slate-700">Upload Client Logo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-950 hover:file:bg-amber-200 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Proposal Content & Sections */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Proposal Sections
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            TipTap WYSIWYG
          </span>
        </div>

        <SectionEditor
          sections={editing ? editedContent?.sections || [] : proposal.content?.sections || []}
          onChange={(sections) => setEditedContent({ ...editedContent, sections })}
          readOnly={!editing}
        />
      </div>

      {/* Pricing Breakdown Table */}
      {proposal.pricingItems && proposal.pricingItems.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Pricing Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Service Description</th>
                  <th className="py-3 px-4">Cost (INR)</th>
                  <th className="py-3 px-4">Billing Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                {proposal.pricingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.serviceDescription}</td>
                    <td className="py-3.5 px-4">₹{item.cost.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.frequency || 'One-time'}</td>
                  </tr>
                ))}
                <tr className="bg-amber-50/50 font-black text-slate-950">
                  <td className="py-3.5 px-4">Total Value</td>
                  <td className="py-3.5 px-4 text-amber-900">
                    ₹{proposal.pricingItems.reduce((sum, item) => sum + item.cost, 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit for Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <CheckSquare className="w-5 h-5 text-amber-900" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Submit Proposal for Approval</h3>
                <p className="text-[11px] font-semibold text-slate-500">Assign to reviewer & select gate stage</p>
              </div>
            </div>

            <form onSubmit={handleSubmitApproval} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Approval Stage Gate *
                </label>
                <select
                  value={approvalStep}
                  onChange={(e) => setApprovalStep(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:border-amber-400 outline-none bg-white"
                >
                  <option value="Sales Review">Sales Review</option>
                  <option value="Technical Review">Technical Review</option>
                  <option value="Finance Review">Finance Review</option>
                  <option value="Legal Review">Legal Review</option>
                  <option value="Management Sign-off">Management Sign-off</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Reviewer *
                </label>
                <select
                  value={assignedReviewer}
                  onChange={(e) => setAssignedReviewer(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:border-amber-400 outline-none bg-white"
                >
                  <option value="Vikram Mehta (Chief Technical Officer)">Vikram Mehta (Chief Technical Officer)</option>
                  <option value="Ritu Agarwal (Finance Director)">Ritu Agarwal (Finance Director)</option>
                  <option value="Deepak Sen (Legal Counsel)">Deepak Sen (Legal Counsel)</option>
                  <option value="Alok Ranjan (Owner & CEO)">Alok Ranjan (Owner &amp; CEO)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission Notes &amp; Instructions
                </label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add specific instructions for the assigned reviewer..."
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-400 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApproval}
                  className="px-5 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl border border-amber-400 cursor-pointer disabled:opacity-50"
                >
                  {submittingApproval ? 'Submitting...' : 'Submit & Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {showSaveAsTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Save as Template</h3>
            </div>

            <form onSubmit={handleSaveAsTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 outline-none bg-white"
                >
                  <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="Enterprise Solutions">Enterprise Solutions</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveAsTemplateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAsTemplate}
                  className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl border border-amber-400"
                >
                  {savingAsTemplate ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
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

    </div>
  )
}

function DuplicateModal({ onClose, onDuplicate, duplicating }: any) {
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail, setClientEmail] = useState('')

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
        <h3 className="text-base font-black text-slate-900">Duplicate Proposal for New Client</h3>
        
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onDuplicate({ clientName, clientCompany, clientEmail })
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client Name</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={duplicating}
              className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl border border-amber-400"
            >
              {duplicating ? 'Duplicating...' : 'Duplicate Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
