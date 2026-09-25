'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Layers, Plus } from 'lucide-react'



const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

export default function NewTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [header, setHeader] = useState('')
  const [footer, setFooter] = useState('')
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Layers className="w-7 h-7 text-amber-600" />
          Create Proposal Template
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Build a reusable proposal structure with standard sections, pricing layouts, and content blocks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-extrabold text-slate-800 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="e.g., Enterprise Web Application Proposal Template"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-extrabold text-slate-800 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="e.g., IT Services, Cloud Architecture, Mobile App"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
          <h2 className="text-sm font-extrabold text-slate-900 mb-1">Template Sections</h2>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Define the default sections and content structure for proposals created with this template.
          </p>
          
          <SectionEditor sections={sections} onChange={setSections} />
          
        </div>

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
            {loading ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  )
}
