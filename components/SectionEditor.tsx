'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Trash2, 
  Plus, 
  FileText, 
  LayoutGrid, 
  Layers, 
  Sparkles, 
  Calendar, 
  Tag
} from 'lucide-react'

const Word365Editor = dynamic(() => import('@/components/Word365Editor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
    </div>
  )
})

export interface Section {
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

const SECTION_BADGES = [
  { icon: FileText, bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  { icon: LayoutGrid, bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  { icon: Layers, bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  { icon: Sparkles, bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
  { icon: Calendar, bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' },
  { icon: Tag, bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' }
]

export default function SectionEditor({ sections, onChange, readOnly = false }: SectionEditorProps) {
  // Section 1 expanded by default (or the first section's id)
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.length > 0 ? [sections[0].id] : []
  )

  const addSection = () => {
    const newId = `section-${Date.now()}`
    const newSection: Section = {
      id: newId,
      title: `New Section ${sections.length + 1}`,
      content: { html: '<p>Start typing your section content...</p>', json: {} },
      order: sections.length,
      type: 'text'
    }
    onChange([...sections, newSection])
    setExpandedSections(prev => [...prev, newId])
  }

  const duplicateSection = (section: Section, index: number) => {
    const dupId = `section-${Date.now()}`
    const dupSection: Section = {
      ...section,
      id: dupId,
      title: `${section.title} (Copy)`,
      order: index + 1
    }
    const newSections = [...sections]
    newSections.splice(index + 1, 0, dupSection)
    // Re-assign order indices
    newSections.forEach((s, idx) => (s.order = idx))
    onChange(newSections)
    setExpandedSections(prev => [...prev, dupId])
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
    setExpandedSections(prev => prev.filter(sId => sId !== id))
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
        const BadgeStyle = SECTION_BADGES[index % SECTION_BADGES.length]
        const BadgeIcon = BadgeStyle.icon

        return (
          <div
            key={section.id}
            className={`border rounded-2xl overflow-hidden transition-all shadow-2xs ${
              isExpanded 
                ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200' 
                : 'border-slate-200/90 bg-slate-50/50 hover:border-slate-300'
            }`}
          >
            {/* Section Header */}
            <div className="px-4 py-3.5 flex items-center justify-between gap-3 bg-white/80">
              
              {/* Left Info: Drag handle, Number, Icon Badge, Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5"
                  title="Drag to reorder section"
                >
                  <GripVertical className="w-4 h-4" />
                </button>

                {/* Number Circle Badge */}
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                  {index + 1}
                </div>

                {/* Color Icon Badge */}
                <div className={`p-1.5 rounded-xl border ${BadgeStyle.bg} ${BadgeStyle.text} ${BadgeStyle.border} shrink-0`}>
                  <BadgeIcon className="w-4 h-4" />
                </div>

                {/* Title */}
                {isExpanded && !readOnly ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-amber-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 min-w-[180px]"
                    placeholder="Section Title"
                  />
                ) : (
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {section.title}
                  </h3>
                )}
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                
                {/* Collapse / Expand Toggle */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center gap-1 border border-slate-200 cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      <span>Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      <span>Expand</span>
                    </>
                  )}
                </button>

                {!readOnly && (
                  <>
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => duplicateSection(section, index)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition cursor-pointer"
                      title="Duplicate Section"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Trash Button */}
                    <button
                      type="button"
                      onClick={() => deleteSection(section.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* Expanded Section Body & TipTap Editor */}
            {isExpanded && (
              <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-4">
                {!readOnly && (
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700 shrink-0">
                      Section Type
                    </label>
                    <select
                      value={section.type === 'text' ? 'Rich Content' : section.type}
                      onChange={(e) => {
                        const val = e.target.value === 'Rich Content' ? 'text' : e.target.value
                        updateSection(section.id, { type: val as any })
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
                    >
                      <option value="Rich Content">Rich Content</option>
                      <option value="pricing">Pricing Table</option>
                      <option value="timeline">Timeline</option>
                      <option value="custom">Custom Block</option>
                    </select>
                  </div>
                )}

                {/* Rich Text TipTap Editor */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <Word365Editor
                    content={section.content}
                    onChange={(content: any) => updateSection(section.id, { content })}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Dashed Add New Section Card */}
      {!readOnly && (
        <button
          type="button"
          onClick={addSection}
          className="w-full border-2 border-dashed border-slate-200/90 hover:border-amber-300 rounded-2xl p-6 bg-slate-50/50 hover:bg-amber-50/20 transition-all text-center cursor-pointer group flex flex-col items-center justify-center space-y-1.5"
        >
          <div className="w-9 h-9 rounded-full bg-blue-50 group-hover:bg-amber-100 text-blue-600 group-hover:text-amber-700 flex items-center justify-center transition-colors border border-blue-200 group-hover:border-amber-300">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-black text-slate-900 group-hover:text-amber-900">
            Add New Section
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            Create a new section to include in this template
          </span>
        </button>
      )}
    </div>
  )
}
