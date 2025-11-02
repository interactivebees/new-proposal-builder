'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
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
          setSections(template.sections.sections)
        }
      }
    } catch (error) {
      console.error('Error loading template:', error)
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Proposal</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Template Selector */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                Start with a Template (Optional)
              </label>
              <select
                id="template"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Start from scratch --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.category ? `(${template.category})` : ''}
                  </option>
                ))}
              </select>
              {selectedTemplateId && (
                <p className="mt-2 text-sm text-blue-600">
                  ✓ Template loaded. You can still customize all sections below.
                </p>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="clientCompany" className="block text-sm font-medium text-gray-700">
                    Client Company
                  </label>
                  <input
                    type="text"
                    id="clientCompany"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
                  Client Email
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700">
                  Client Address
                </label>
                <textarea
                  id="clientAddress"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="clientLogo" className="block text-sm font-medium text-gray-700">
                  Client Logo
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    id="clientLogo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
                {clientLogoUrl && (
                  <div className="mt-2">
                    <img src={clientLogoUrl} alt="Client logo" className="h-16 w-auto border rounded" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposal Sections</h2>
            <p className="text-sm text-gray-600 mb-4">
              Organize your proposal into multiple sections. You can add, reorder, and customize each section.
            </p>
            <SectionEditor sections={sections} onChange={setSections} />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <NewProposalForm />
    </Suspense>
  )
}
