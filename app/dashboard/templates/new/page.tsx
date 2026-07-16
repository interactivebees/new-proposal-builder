'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

export default function NewTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [sections, setSections] = useState<Array<{
    id: string
    title: string
    content: any
    order: number
    type: 'text' | 'pricing' | 'timeline' | 'custom'
  }>>([
    {
      id: 'section-1',
      title: 'Introduction',
      content: { html: '', json: {} },
      order: 0,
      type: 'text'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          content: { sections }
        })
      })

      if (res.ok) {
        const template = await res.json()
        router.push(`/dashboard/templates/${template.id}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-6">Create New Template</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-[var(--bg-card)] shadow rounded-lg p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--text-body)]">
                  Template Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Standard Proposal Template"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[var(--text-body)]">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sales, Marketing, Consulting"
                />
              </div>
            </div>

            <div className="bg-[var(--bg-card)] shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Template Sections</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Define the structure and default content for proposals using this template.
              </p>
              <SectionEditor sections={sections} onChange={setSections} />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-[var(--border-default)] rounded-md shadow-sm text-sm font-medium text-[var(--text-body)] bg-[var(--bg-card)] hover:bg-[var(--bg-page)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
