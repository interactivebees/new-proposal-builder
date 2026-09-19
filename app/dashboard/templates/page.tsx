'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { 
  Layers, 
  Plus, 
  Search, 
  ChevronDown, 
  MoreVertical, 
  Download, 
  Star, 
  LayoutGrid, 
  List, 
  Cloud, 
  Shield, 
  Smartphone, 
  TrendingUp, 
  Database, 
  Code, 
  Server, 
  GraduationCap,
  ExternalLink,
  Trash2,
  Copy,
  Edit3,
  X,
  FileText,
  Sparkles
} from 'lucide-react'

interface TemplateItem {
  id: string
  title: string
  category: string
  description: string
  creatorName: string
  creatorInitials: string
  usedTimes: number
  createdAt: string
  bannerType: 'cloud' | 'cyber' | 'mobile' | 'marketing' | 'erp' | 'web' | 'it' | 'training'
}

// Sample 8 Templates matching reference screenshot exactly
const sampleTemplatesList: TemplateItem[] = [
  {
    id: '1',
    title: 'Cloud Migration & Infrastructure',
    category: 'Cloud & DevOps',
    description: 'Comprehensive template for cloud migration and infrastructure solutions.',
    creatorName: 'Rahul Verma',
    creatorInitials: 'RV',
    usedTimes: 24,
    createdAt: 'Sep 17, 2026',
    bannerType: 'cloud'
  },
  {
    id: '2',
    title: 'Cybersecurity Audit & Compliance SLA',
    category: 'Cybersecurity',
    description: 'Template for cybersecurity assessment, compliance and managed security services.',
    creatorName: 'Ananya Roy',
    creatorInitials: 'AR',
    usedTimes: 18,
    createdAt: 'Sep 17, 2026',
    bannerType: 'cyber'
  },
  {
    id: '3',
    title: 'Mobile App Development (iOS & Android)',
    category: 'Mobile Apps',
    description: 'End-to-end mobile application development proposal template.',
    creatorName: 'Priya Sharma',
    creatorInitials: 'PS',
    usedTimes: 32,
    createdAt: 'Sep 17, 2026',
    bannerType: 'mobile'
  },
  {
    id: '4',
    title: 'Digital Marketing & Brand Strategy',
    category: 'Marketing',
    description: 'Template for digital marketing, brand strategy and growth solutions.',
    creatorName: 'Monica Gupta',
    creatorInitials: 'MG',
    usedTimes: 14,
    createdAt: 'Sep 17, 2026',
    bannerType: 'marketing'
  },
  {
    id: '5',
    title: 'Enterprise ERP Implementation',
    category: 'Enterprise Solutions',
    description: 'Proposal template for ERP systems implementation and integration.',
    creatorName: 'Admin',
    creatorInitials: 'AD',
    usedTimes: 27,
    createdAt: 'Sep 17, 2026',
    bannerType: 'erp'
  },
  {
    id: '6',
    title: 'Web Portal & API Ecosystem Revamp',
    category: 'Web Development',
    description: 'Modern web portal, Next.js architecture and API ecosystem revamp.',
    creatorName: 'Admin',
    creatorInitials: 'AD',
    usedTimes: 41,
    createdAt: 'Sep 17, 2026',
    bannerType: 'web'
  },
  {
    id: '7',
    title: 'IT Managed Services & Helpdesk SLA',
    category: 'IT Managed Services',
    description: 'Complete IT helpdesk, SIEM monitoring and managed SLA contract template.',
    creatorName: 'Ananya Roy',
    creatorInitials: 'AR',
    usedTimes: 19,
    createdAt: 'Sep 17, 2026',
    bannerType: 'it'
  },
  {
    id: '8',
    title: 'Corporate Training & Upskilling Suite',
    category: 'Training & Skill Dev',
    description: 'Structure for corporate staff training, LMS setup and workforce upskilling.',
    creatorName: 'Monica Gupta',
    creatorInitials: 'MG',
    usedTimes: 11,
    createdAt: 'Sep 17, 2026',
    bannerType: 'training'
  }
]

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<TemplateItem[]>(sampleTemplatesList)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedCreator, setSelectedCreator] = useState('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  
  // Create / Edit Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cloud & DevOps',
    description: '',
    bannerType: 'cloud' as 'cloud' | 'cyber' | 'mobile' | 'marketing' | 'erp' | 'web' | 'it' | 'training'
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const mapped: TemplateItem[] = data.map((item: any, index: number) => ({
            id: item.id,
            title: item.name || 'Untitled Template',
            category: item.category || 'General',
            description: item.description || 'Pre-configured proposal structure and content module.',
            creatorName: item.creator?.name || 'Admin',
            creatorInitials: item.creator?.name
              ? item.creator.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'AD',
            usedTimes: item.usedCount || Math.floor(Math.random() * 20) + 5,
            createdAt: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            bannerType: (['cloud', 'cyber', 'mobile', 'marketing', 'erp', 'web', 'it', 'training'][index % 8]) as any
          }))
          setTemplates(mapped)
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.success(`Template "${title}" deleted`)
    setActionMenuOpen(null)
  }

  const handleDuplicate = (template: TemplateItem) => {
    const duplicated: TemplateItem = {
      ...template,
      id: Date.now().toString(),
      title: `${template.title} (Copy)`,
      usedTimes: 0,
      createdAt: 'Just now'
    }
    setTemplates([duplicated, ...templates])
    toast.success(`Template "${template.title}" duplicated!`)
    setActionMenuOpen(null)
  }

  const handleOpenEditModal = (template: TemplateItem) => {
    setEditingTemplate(template)
    setFormData({
      title: template.title,
      category: template.category,
      description: template.description,
      bannerType: template.bannerType
    })
    setShowEditModal(true)
    setActionMenuOpen(null)
  }

  const handleUpdateTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return
    if (!formData.title) {
      toast.error('Template title is required')
      return
    }

    setSubmitting(true)
    setTemplates(prev => prev.map(t => {
      if (t.id === editingTemplate.id) {
        return {
          ...t,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          bannerType: formData.bannerType
        }
      }
      return t
    }))

    toast.success(`Template "${formData.title}" updated successfully!`)
    setShowEditModal(false)
    setEditingTemplate(null)
    setSubmitting(false)
  }

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error('Template title is required')
      return
    }

    setSubmitting(true)
    const newTemplate: TemplateItem = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      description: formData.description || 'Custom corporate proposal template structure.',
      creatorName: 'Admin',
      creatorInitials: 'AD',
      usedTimes: 0,
      createdAt: 'Just now',
      bannerType: formData.bannerType
    }

    setTemplates([newTemplate, ...templates])
    toast.success(`New template "${formData.title}" created successfully!`)
    setShowCreateModal(false)
    setSubmitting(false)
    setFormData({ title: '', category: 'Cloud & DevOps', description: '', bannerType: 'cloud' })
  }

  const handleUseTemplate = (id: string, title: string) => {
    toast.success(`Creating proposal from template: "${title}"`)
    router.push(`/dashboard/proposals/new?templateId=${id}`)
  }

  // Filtering & Sorting
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory
    const matchesCreator = selectedCreator === 'ALL' || t.creatorName === selectedCreator
    return matchesSearch && matchesCategory && matchesCreator
  })

  const uniqueCategories = Array.from(new Set(templates.map(t => t.category)))
  const uniqueCreators = Array.from(new Set(templates.map(t => t.creatorName)))

  const renderBannerGraphic = (type: string) => {
    switch (type) {
      case 'cloud':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-sky-600 to-indigo-700 flex items-center justify-end pr-6 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white transform translate-x-4 rotate-12">
              <Cloud className="w-14 h-14 text-white drop-shadow-md stroke-[1.8]" />
            </div>
          </div>
        )
      case 'cyber':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-end pr-6 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-cyan-500/10 backdrop-blur-xs flex items-center justify-center text-cyan-400 transform translate-x-4">
              <Shield className="w-12 h-12 text-cyan-400 drop-shadow-md stroke-[1.8]" />
            </div>
          </div>
        )
      case 'mobile':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-500 flex items-center justify-end pr-6 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white transform translate-x-4 -rotate-12">
              <Smartphone className="w-12 h-12 text-white drop-shadow-md stroke-[1.8]" />
            </div>
          </div>
        )
      case 'marketing':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-end pr-6 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-white transform translate-x-4">
              <TrendingUp className="w-12 h-12 text-white drop-shadow-md stroke-[2]" />
            </div>
          </div>
        )
      case 'erp':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 flex items-center justify-end pr-6 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white transform translate-x-4">
              <Database className="w-12 h-12 text-white drop-shadow-md stroke-[1.8]" />
            </div>
          </div>
        )
      case 'web':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-end pr-6 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white transform translate-x-4 rotate-6">
              <Code className="w-12 h-12 text-white drop-shadow-md stroke-[2]" />
            </div>
          </div>
        )
      case 'it':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 flex items-center justify-end pr-6 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white transform translate-x-4">
              <Server className="w-12 h-12 text-white drop-shadow-md stroke-[1.8]" />
            </div>
          </div>
        )
      case 'training':
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 flex items-center justify-end pr-6 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-white transform translate-x-4 -rotate-6">
              <GraduationCap className="w-12 h-12 text-white drop-shadow-md stroke-[1.8]" />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-5 pb-6 font-sans">
      
      {/* 1. Top Warm Golden Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            TEMPLATE LIBRARY &amp; FRAMEWORKS
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Proposal Templates ({templates.length})
            </h1>
            
            {/* Handwritten 'we believe. we can.' graphic accent */}
            <div className="relative inline-flex items-center px-2.5 py-0.5 transform -rotate-2 bg-amber-100/70 border border-amber-300/80 rounded-md">
              <span className="font-serif italic text-xs font-black text-amber-950 tracking-tight">
                we believe. we can.
              </span>
              <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-amber-400 rounded-full" />
            </div>
          </div>
          
          <p className="text-xs font-medium text-slate-500 mt-1.5 max-w-2xl">
            Pre-built enterprise proposal frameworks, scope templates, and reusable solution layouts.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setFormData({ title: '', category: 'Cloud & DevOps', description: '', bannerType: 'cloud' })
            setShowCreateModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>Create New Template</span>
        </button>
      </div>

      {/* 2. Control Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates by title, description or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
          
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors max-w-[160px] truncate"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Templates Grid / Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300/80 transition-all overflow-hidden flex flex-col justify-between group relative"
            >
              {/* Graphic Banner Header */}
              <div className="relative h-28 w-full overflow-hidden">
                {renderBannerGraphic(template.bannerType)}

                {/* Top Overlay Badge & Action Menu */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold bg-white/90 backdrop-blur-xs text-slate-900 rounded-lg shadow-2xs border border-white/50">
                    {template.category}
                  </span>

                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === template.id ? null : template.id)}
                      className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-600 flex items-center justify-center border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {actionMenuOpen === template.id && (
                      <div className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-left animate-in fade-in slide-in-from-top-1">
                        <button
                          onClick={() => handleOpenEditModal(template)}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleDuplicate(template)}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(template.id, template.title)}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100 mt-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-4.5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-800 transition-colors leading-snug line-clamp-2">
                    {template.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Creator & Usage Info */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0 border border-slate-300">
                      {template.creatorInitials}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-[11px] leading-tight">
                        {template.creatorName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Used {template.usedTimes} times
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {template.createdAt}
                  </span>
                </div>

                {/* Bottom Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEditModal(template)}
                    className="py-2 px-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px] transition-colors border border-slate-200/80 shadow-2xs cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template.id, template.title)}
                    className="py-2 px-3 text-center bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-extrabold rounded-xl text-[11px] transition-colors shadow-2xs border border-amber-400 cursor-pointer"
                  >
                    Use Template
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View Mode */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Template Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Creator</th>
                <th className="py-3.5 px-5">Times Used</th>
                <th className="py-3.5 px-5">Created On</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-amber-50/20 transition-colors group">
                  <td className="py-4 px-5 font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                    {template.title}
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                      {template.category}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0 border border-slate-300">
                        {template.creatorInitials}
                      </div>
                      <span className="font-semibold text-slate-700">{template.creatorName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-600">
                    {template.usedTimes} times
                  </td>
                  <td className="py-4 px-5 text-slate-400 font-medium">
                    {template.createdAt}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(template)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template.id, template.title)}
                        className="px-3 py-1.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black rounded-lg text-[11px] transition-colors shadow-2xs cursor-pointer"
                      >
                        Use Template
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Creating New Template */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Create New Template
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & ML Solutions Proposal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                >
                  <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Enterprise Solutions">Enterprise Solutions</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the scope and purpose of this template..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Template */}
      {showEditModal && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Edit Template ({editingTemplate.title})
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingTemplate(null) }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                >
                  <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Enterprise Solutions">Enterprise Solutions</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingTemplate(null) }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Template Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
