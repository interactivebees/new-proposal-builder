'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { FileText } from 'lucide-react'
import { extractVariables, replaceVariablesInSections } from '@/lib/template-variables'

const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

const VariableInputForm = dynamic(() => import('@/components/VariableInputForm'), {
  ssr: false
})

function NewProposalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')
  
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
      content: { html: '', json: {} },
      order: 0,
      type: 'text'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; category?: string }>>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateId || '')
  
  // Variable detection state
  const [showVariableForm, setShowVariableForm] = useState(false)
  const [variableContent, setVariableContent] = useState('')
  const [pendingTemplateSections, setPendingTemplateSections] = useState<any[] | null>(null)

  // Fetch available templates
  useEffect(() => {
    fetchTemplates()
  }, [])

  // Load template if templateId is provided or selected
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
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const loadTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`)
      if (res.ok) {
        const template = await res.json()
        if (template.sections?.sections) {
          const templateSections = template.sections.sections
          
          // Store pending sections for variable replacement
          setPendingTemplateSections(templateSections)
          
          // Extract all text content to check for variables
          let allContent = ''
          templateSections.forEach((section: any) => {
            allContent += (section.title || '') + ' '
            allContent += (section.content?.html || '') + ' '
          })
          
          // Check if there are any variables
          const variables = extractVariables(allContent)
          
          if (variables.length > 0) {
            // Show variable form with the raw content
            setVariableContent(allContent)
            setShowVariableForm(true)
          } else {
            // No variables, set sections directly with IDs
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
    } catch (error) {
      console.error('Error loading template:', error)
    }
  }

  const handleVariableSubmit = (values: Record<string, string>) => {
    if (pendingTemplateSections) {
      const replacedSections = replaceVariablesInSections(pendingTemplateSections, values)
      // Add IDs to sections
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
    // Use template as-is without replacing variables
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setClientLogoUrl(data.url)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to upload logo')
      }
    } catch (err) {
      setError('An error occurred while uploading')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-amber-600" />
          Create New Proposal
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Draft a new business proposal, select pre-built templates, and define client deliverables.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        {/* Template Selector */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-2xs">
          <label htmlFor="template" className="block text-xs font-extrabold text-amber-950 mb-2">
            Start with a Pre-Built Template (Optional)
          </label>
          <select
            id="template"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="block w-full px-3.5 py-2.5 bg-white text-xs font-semibold border border-amber-200 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">-- Start from scratch --</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} {template.category ? `(${template.category})` : ''}
              </option>
            ))}
          </select>
          {selectedTemplateId && (
            <p className="mt-2 text-xs text-amber-800 font-bold flex items-center gap-1.5">
              ✓ Template loaded. You can still customize all sections below.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs font-extrabold text-slate-800 mb-1">
              Proposal Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enterprise Cloud Migration Proposal"
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientName" className="block text-xs font-extrabold text-slate-800 mb-1">
                Client Contact Person
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label htmlFor="clientCompany" className="block text-xs font-extrabold text-slate-800 mb-1">
                Client Organization / Company
              </label>
              <input
                type="text"
                id="clientCompany"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="e.g. Maruti Suzuki India Ltd."
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#FEF08A] hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-2xs transition-all border border-amber-300/80 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Proposal'}
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
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">Loading...</div>}>
      <NewProposalForm />
    </Suspense>
  )
}