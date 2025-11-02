'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

interface Template {
  id: string
  name: string
  sections: any
  createdAt: string
  creator: {
    name: string
    email: string
  }
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplate()
  }, [params.id])

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setTemplate(data)
      } else {
        console.error('Failed to fetch template')
      }
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = () => {
    // Navigate to new proposal page with template ID
    router.push(`/dashboard/proposals/new?templateId=${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading template...</div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Template not found</p>
          <Link href="/dashboard/templates" className="text-blue-600 hover:text-blue-800">
            Back to Templates
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/dashboard/templates"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Back
                </Link>
                <Link
                  href={`/dashboard/templates/${params.id}/edit`}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                >
                  Edit Template
                </Link>
                <button
                  onClick={handleUseTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Use This Template
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-sm font-medium text-gray-900">{template.creator.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h2>
            <SectionEditor
              sections={template.sections?.sections || []}
              onChange={() => {}}
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
