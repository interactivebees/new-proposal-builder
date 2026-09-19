'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { 
  ChevronLeft, 
  FileText, 
  User, 
  Building2, 
  SendHorizontal, 
  Sparkles,
  Layers,
  Check
} from 'lucide-react'
import { extractVariables, replaceVariablesInSections } from '@/lib/template-variables'

const VariableInputForm = dynamic(() => import('@/components/VariableInputForm'), {
  ssr: false
})

function NewProposalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateIdParam = searchParams.get('templateId')
  
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientLogoUrl, setClientLogoUrl] = useState('')
  const [sections, setSections] = useState<Array<{
    id: string
    title: string
    content: any
    order: number
    type: 'text' | 'pricing' | 'timeline' | 'custom'
  }>>([
    {
      id: 'section-1',
      title: 'Executive Summary',
      content: { html: '<p>Interactive Bees Pvt. Ltd. is pleased to present this proposal...</p>', json: {} },
      order: 0,
      type: 'text'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; category?: string }>>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateIdParam || '')
  
  // Variable detection state
  const [showVariableForm, setShowVariableForm] = useState(false)
  const [variableContent, setVariableContent] = useState('')
  const [pendingTemplateSections, setPendingTemplateSections] = useState<any[] | null>(null)

  // Fetch available templates
  useEffect(() => {
    fetchTemplates()
  }, [])

  // Load template if selectedTemplateId changes
  useEffect(() => {
    if (selectedTemplateId) {
      loadTemplate(selectedTemplateId)
    }
  }, [selectedTemplateId])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    }
  }

  const loadTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`)
      if (res.ok) {
        const template = await res.json()
        if (template.name && !title) {
          setTitle(`${template.name} - Proposal`)
        }
        if (template.sections?.sections) {
          const templateSections = template.sections.sections
          setPendingTemplateSections(templateSections)
          
          let allContent = ''
          templateSections.forEach((section: any) => {
            allContent += (section.title || '') + ' '
            allContent += (section.content?.html || '') + ' '
          })
          
          const variables = extractVariables(allContent)
          
          if (variables.length > 0) {
            setVariableContent(allContent)
            setShowVariableForm(true)
          } else {
            const sectionsWithIds = templateSections.map((section: any, index: number) => ({
              ...section,
              id: section.id || `section-${index + 1}`,
              title: section.title || '',
              type: section.type || 'text'
            }))
            setSections(sectionsWithIds)
          }
        }
      }
    } catch (err) {
      console.error('Error loading template:', err)
    }
  }

  const handleVariableSubmit = (values: Record<string, string>) => {
    if (pendingTemplateSections) {
      const replacedSections = replaceVariablesInSections(pendingTemplateSections, values)
      const sectionsWithIds = replacedSections.map((section: any, index: number) => ({
        ...section,
        id: section.id || `section-${index + 1}`,
        title: section.title || '',
        type: section.type || 'text'
      }))
      setSections(sectionsWithIds)
    }
    setShowVariableForm(false)
    setPendingTemplateSections(null)
  }

  const handleVariableSkip = () => {
    if (pendingTemplateSections) {
      const sectionsWithIds = pendingTemplateSections.map((section: any, index: number) => ({
        ...section,
        id: section.id || `section-${index + 1}`,
        title: section.title || '',
        type: section.type || 'text'
      }))
      setSections(sectionsWithIds)
    }
    setShowVariableForm(false)
    setPendingTemplateSections(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Proposal title is required')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          clientName,
          clientCompany,
          clientEmail,
          clientAddress,
          clientLogoUrl,
          content: { sections },
          templateId: selectedTemplateId || undefined
        })
      })

      if (res.ok) {
        const proposal = await res.json()
        router.push(`/dashboard/proposals/${proposal.id}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create proposal')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* Top Warm Golden Hero Header Banner matching media_1789797920150.png */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5C6] to-[#FFD84D] rounded-3xl p-6 sm:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Banner Left Information */}
        <div className="space-y-2 z-10 max-w-2xl">
          <Link 
            href="/dashboard/proposals" 
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-amber-800" />
            <span>Back to Proposals</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-0.5">
            Create New Proposal
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
            Start a new business proposal, select a template and provide key details.
          </p>

          {/* Handwritten 'we believe. we can.' graphic accent */}
          <div className="pt-1">
            <div className="relative inline-flex items-center px-3 py-1 bg-amber-100/90 border border-amber-300/90 rounded-md transform -rotate-1 shadow-2xs">
              <span className="font-serif italic text-xs font-black text-amber-950 tracking-tight">
                we believe. we can.
              </span>
            </div>
          </div>
        </div>

        {/* Right Hero Graphic Illustration Sticker */}
        <div className="hidden lg:flex items-center gap-2 bg-white/70 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-amber-300/70 shadow-2xs z-10 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#FFC800] text-slate-950 font-black text-sm flex items-center justify-center border border-amber-400 shadow-2xs shrink-0">
            <FileText className="w-4 h-4 text-slate-950" />
          </div>
          <div className="text-left">
            <p className="font-serif italic text-xs font-black text-amber-950 tracking-tight leading-tight">
              "Turn Ideas Into Opportunities"
            </p>
          </div>
        </div>

      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xs">
            {error}
          </div>
        )}

        {/* Step 1 Card: Select a Template */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          
          {/* Card Header with Number Circle 1 */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-950 font-black text-xs flex items-center justify-center shrink-0 border border-amber-200">
              1
            </div>

            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <FileText className="w-4 h-4" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Select a Template
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Choose a pre-built template to get started quickly.
              </p>
            </div>
          </div>

          {/* Inner Warm Yellow Box */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
            <label htmlFor="template" className="block text-xs font-extrabold text-amber-950">
              Start with a Pre-Built Template (Optional)
            </label>
            
            <div className="relative">
              <select
                id="template"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-xs font-semibold text-slate-800 border border-amber-200 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer appearance-none"
              >
                <option value="">-- Select from available templates --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.category ? `(${template.category})` : ''}
                  </option>
                ))}
              </select>

              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronLeft className="w-4 h-4 -rotate-90" />
              </div>
            </div>

            {selectedTemplateId && (
              <p className="text-xs text-amber-900 font-bold flex items-center gap-1.5 pt-1">
                <Check className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />
                <span>Template loaded. Sections and variables ready for customization.</span>
              </p>
            )}
          </div>

        </div>

        {/* Step 2 Card: Proposal Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          
          {/* Card Header with Number Circle 2 */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200">
              2
            </div>

            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <FileText className="w-4 h-4" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Proposal Details
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Provide the basic information for your new proposal.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Proposal Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-slate-700 mb-1.5">
                Proposal Title *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Migration Proposal"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* 2-Column Row: Contact Person & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Client Contact Person */}
              <div>
                <label htmlFor="clientName" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Client Contact Person
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Client Organization / Company */}
              <div>
                <label htmlFor="clientCompany" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Client Organization / Company
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="clientCompany"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="e.g. Maruti Suzuki India Ltd."
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard/proposals"
            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all border border-amber-400 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <SendHorizontal className="w-4 h-4 text-slate-950" />
            <span>{loading ? 'Creating...' : 'Create Proposal'}</span>
          </button>
        </div>

      </form>

      {/* Variable Input Form Modal */}
      {showVariableForm && (
        <VariableInputForm
          content={variableContent}
          onSubmit={handleVariableSubmit}
          onSkip={handleVariableSkip}
        />
      )}

    </div>
  )
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    }>
      <NewProposalForm />
    </Suspense>
  )
}