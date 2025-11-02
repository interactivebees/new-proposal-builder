'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const ProposalEditor = dynamic(() => import('@/components/ProposalEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

interface Section {
  id: string
  title: string
  content: any
  order: number
  type: 'text' | 'pricing' | 'timeline' | 'custom'
}

interface SectionEditorProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
  readOnly?: boolean
}

export default function SectionEditor({ sections, onChange, readOnly = false }: SectionEditorProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.map(s => s.id)
  )

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: { html: '', json: {} },
      order: sections.length,
      type: 'text'
    }
    onChange([...sections, newSection])
    setExpandedSections([...expandedSections, newSection.id])
  }

  const updateSection = (id: string, updates: Partial<Section>) => {
    onChange(
      sections.map(section =>
        section.id === id ? { ...section, ...updates } : section
      )
    )
  }

  const deleteSection = (id: string) => {
    onChange(sections.filter(section => section.id !== id))
    setExpandedSections(expandedSections.filter(sId => sId !== id))
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return
    }

    const newSections = [...sections]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index]
    ]

    // Update order
    newSections.forEach((section, idx) => {
      section.order = idx
    })

    onChange(newSections)
  }

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const isExpanded = expandedSections.includes(section.id)

        return (
          <div key={section.id} className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Section Header */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {isExpanded ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                {!readOnly && isExpanded ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                    placeholder="Section Title"
                  />
                ) : (
                  <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
                )}

                <span className="text-xs text-gray-500">
                  {section.type === 'text' ? '📝 Text' : 
                   section.type === 'pricing' ? '💰 Pricing' :
                   section.type === 'timeline' ? '📅 Timeline' : '📄 Custom'}
                </span>
              </div>

              {!readOnly && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    title="Move Up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    title="Move Down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(section.id)}
                    className="p-1 text-red-600 hover:text-red-900"
                    title="Delete Section"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Section Content */}
            {isExpanded && (
              <div className="p-4 bg-white">
                {!readOnly && (
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Section Type</label>
                    <select
                      value={section.type}
                      onChange={(e) => updateSection(section.id, { type: e.target.value as any })}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="text">Text Content</option>
                      <option value="pricing">Pricing Table</option>
                      <option value="timeline">Timeline</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                )}

                <ProposalEditor
                  content={section.content}
                  onChange={(content) => updateSection(section.id, { content })}
                  readOnly={readOnly}
                />
              </div>
            )}
          </div>
        )
      })}

      {!readOnly && (
        <button
          type="button"
          onClick={addSection}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
        >
          + Add New Section
        </button>
      )}
    </div>
  )
}
