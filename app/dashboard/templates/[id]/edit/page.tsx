'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  ChevronLeft, 
  Eye, 
  Save, 
  FileText, 
  Package, 
  Plus
} from 'lucide-react'
import { Section } from '@/components/SectionEditor'

const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
    </div>
  )
})

const DEFAULT_WEB_PORTAL_SECTIONS: Section[] = [
  {
    id: 'sec-exec-summary',
    title: 'Executive Summary',
    type: 'text',
    order: 0,
    content: {
      html: `<h2>Executive Summary</h2><p>Interactive Bees Pvt. Ltd. is pleased to present this comprehensive Web Portal Development proposal. Our objective is to design, engineer, and deploy an enterprise digital experience built for performance, security, and exceptional user engagement.</p><ul><li><strong>High Availability:</strong> 99.9% uptime SLA backed by cloud microservices.</li><li><strong>Modern Architecture:</strong> Next.js 14 frontend, Node.js APIs, and PostgreSQL database.</li><li><strong>Security Governance:</strong> ISO 27001 compliant end-to-end encryption.</li></ul>`,
      json: {}
    }
  },
  {
    id: 'sec-project-overview',
    title: 'Project Overview',
    type: 'text',
    order: 1,
    content: {
      html: `<h2>Project Overview</h2><p>Detailed architecture and strategy for user portal design, front-end development, role-based access control, and seamless third-party API integration.</p>`,
      json: {}
    }
  },
  {
    id: 'sec-scope-work',
    title: 'Scope of Work',
    type: 'text',
    order: 2,
    content: {
      html: `<h2>Scope of Work & Deliverables</h2><ol><li><strong>UX Architecture & Wireframing:</strong> High-fidelity Figma prototypes and design system tokens.</li><li><strong>Frontend & API Engineering:</strong> Next.js 14, GraphQL, and Redis caching implementation.</li><li><strong>Cloud Infrastructure & DevOps:</strong> AWS/GCP automated CI/CD pipeline setup.</li><li><strong>QA & Security Audit:</strong> Automated VAPT security testing and load testing up to 10,000 concurrent users.</li></ol>`,
      json: {}
    }
  },
  {
    id: 'sec-customer-journey',
    title: 'Customer Journey',
    type: 'text',
    order: 3,
    content: {
      html: `<h2>Customer Journey & UX Mapping</h2><p>Interactive user onboarding workflows, customizable dashboards, and real-time activity tracking modules.</p>`,
      json: {}
    }
  },
  {
    id: 'sec-project-mgmt',
    title: 'Project Management',
    type: 'text',
    order: 4,
    content: {
      html: `<h2>Project Management & Governance</h2><p>Agile 2-week sprint cycles, bi-weekly stakeholder reviews, dedicated project manager, and real-time Jira dashboard tracking.</p>`,
      json: {}
    }
  },
  {
    id: 'sec-investment-pricing',
    title: 'Investment & Pricing',
    type: 'pricing',
    order: 5,
    content: {
      html: `<h2>Investment & Milestone Breakdown</h2><p>Milestone-based payment schedule: 30% project kickoff, 40% beta release, and 30% final deployment sign-off.</p>`,
      json: {}
    }
  }
]

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const [name, setName] = useState('Web Portal Development Template')
  const [category, setCategory] = useState('Cloud & DevOps')
  const [description, setDescription] = useState(
    'Comprehensive template for web portal design, development and cloud infrastructure services.'
  )
  const [sections, setSections] = useState<Section[]>(DEFAULT_WEB_PORTAL_SECTIONS)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${templateId}`)
      if (res.ok) {
        const template = await res.json()
        setName(template.name || 'Web Portal Development Template')
        setCategory(template.category || 'Cloud & DevOps')
        
        if (template.sections?.description) {
          setDescription(template.sections.description)
        } else if (template.description) {
          setDescription(template.description)
        }

        if (
          template.sections?.sections &&
          Array.isArray(template.sections.sections) &&
          template.sections.sections.length > 0
        ) {
          setSections(template.sections.sections)
        } else if (Array.isArray(template.sections) && template.sections.length > 0) {
          setSections(template.sections)
        }
      }
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!name.trim()) {
      toast.error('Template title is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          content: {
            description,
            sections
          }
        })
      })

      if (res.ok) {
        toast.success(`Template "${name}" saved successfully!`)
        router.push('/dashboard/templates')
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to save template' }))
        toast.error(err.error || 'Failed to save template')
      }
    } catch (error) {
      toast.error('Failed to save template. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    toast.success(`Opening preview for template: "${name}"`)
    window.open(`/api/templates/${templateId}/preview`, '_blank')
  }

  const handleAddSectionTop = () => {
    const newId = `section-${Date.now()}`
    const newSec: Section = {
      id: newId,
      title: `New Section ${sections.length + 1}`,
      content: { html: '<p>Start typing section content...</p>', json: {} },
      order: sections.length,
      type: 'text'
    }
    setSections([...sections, newSec])
    toast.success('Added new section to template!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* Top Warm Golden Hero Header Banner matching media_1789793807076.png */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5C6] to-[#FFD84D] rounded-3xl p-6 sm:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Banner Content Left */}
        <div className="space-y-2 z-10 max-w-2xl">
          <Link 
            href="/dashboard/templates" 
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-amber-800" />
            <span>Back to Templates</span>
          </Link>

          <div className="flex items-center gap-3 flex-wrap pt-0.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Edit Template: {name}
            </h1>

            {/* Handwritten 'we believe. we can.' graphic accent */}
            <div className="relative inline-flex items-center px-3 py-1 bg-amber-100/90 border border-amber-300/90 rounded-md transform -rotate-1 shadow-2xs">
              <span className="font-serif italic text-xs font-black text-amber-950 tracking-tight">
                we believe. we can.
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
            Configure modules, sections and content for this proposal template.
          </p>
        </div>

        {/* Right Hero Graphic & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10 shrink-0">
          
          {/* Cursive quote sticker illustration */}
          <div className="hidden xl:flex items-center gap-2 bg-white/70 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-amber-300/70 shadow-2xs text-right">
            <div className="w-7 h-7 rounded-lg bg-[#FFC800] text-slate-950 font-black text-sm flex items-center justify-center border border-amber-400 shrink-0 shadow-2xs">
              T
            </div>
            <div className="text-left">
              <p className="font-serif italic text-[11px] font-black text-amber-950 tracking-tight leading-none">
                "Great Proposals Build Greater Opportunities"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all border border-slate-200 flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-700" />
              <span>Preview Proposal</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all border border-amber-400 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{saving ? 'Saving...' : 'Save Template Changes'}</span>
            </button>
          </div>

        </div>

      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Template Metadata & Overview Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Template Metadata &amp; Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Template Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                placeholder="e.g. Web Portal Development Template"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white transition-all cursor-pointer"
              >
                <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Apps">Mobile Apps</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Enterprise Solutions">Enterprise Solutions</option>
                <option value="IT Managed Services">IT Managed Services</option>
                <option value="Marketing">Marketing</option>
                <option value="Training & Skill Dev">Training &amp; Skill Dev</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Template Description
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none"
              placeholder="Comprehensive template for web portal design, development and cloud infrastructure services."
            />
            <div className="text-[11px] font-semibold text-slate-400 text-right mt-1">
              {description.length}/500
            </div>
          </div>
        </div>

        {/* Template Sections Accordion List Container */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Template Sections ({sections.length})
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Add, edit, reorder and customize each section's content.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddSectionTop}
              className="px-4 py-2 bg-[#FFF6D6] hover:bg-[#FFEAA3] text-amber-950 font-extrabold text-xs rounded-xl border border-amber-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add New Section</span>
            </button>
          </div>

          {/* Section Editor List */}
          <SectionEditor sections={sections} onChange={setSections} />
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard/templates"
            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all border border-amber-400 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>{saving ? 'Saving...' : 'Save Template Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}
