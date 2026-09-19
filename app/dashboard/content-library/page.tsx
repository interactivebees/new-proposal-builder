'use client'

import { useEffect, useState } from 'react'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Tag, 
  Copy, 
  Check, 
  FileText, 
  MoreVertical, 
  Layers, 
  Users, 
  Clock, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  X,
  Sparkles,
  Quote,
  Image as ImageIcon,
  Edit3,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ContentItem {
  id: string
  title: string
  category: string
  content: string
  tags?: string | null
  createdAt: string
  updatedText?: string
  creatorName?: string
}

const CATEGORIES_WITH_COUNTS = [
  { name: 'ALL', label: 'All', count: 120 },
  { name: 'Company Intro', label: 'Company Intro', count: 12 },
  { name: 'Services', label: 'Services', count: 18 },
  { name: 'Technologies', label: 'Technologies', count: 16 },
  { name: 'Testimonials', label: 'Testimonials', count: 10 },
  { name: 'Awards', label: 'Awards', count: 8 },
  { name: 'FAQs', label: 'FAQs', count: 20 },
  { name: 'Standard Clauses', label: 'Standard Clauses', count: 14 }
]

// Detailed sample list matching the reference screenshot exactly
const sampleContentList: ContentItem[] = [
  {
    id: '1',
    title: 'Frequently Asked Questions (FAQ) – Web Portal SLA',
    category: 'FAQs',
    content: 'Q: How are bug fixes handled post launch?\nA: All critical bugs are addressed within 4 hours during the 90-day post launch warranty period ...',
    tags: 'faq, warranty, bugs, support',
    createdAt: 'Sep 17, 2026',
    updatedText: 'Updated 2 days ago',
    creatorName: 'By Admin'
  },
  {
    id: '2',
    title: 'Company Overview & Value Proposition',
    category: 'Company Intro',
    content: 'Interactive Bees Pvt. Ltd. is a premier digital engineering & strategic marketing agency with 15+ years of experience crafting enterprise digital solutions.',
    tags: 'company, intro, overview, brand',
    createdAt: 'Sep 17, 2026',
    updatedText: 'Updated 3 days ago',
    creatorName: 'By Ananya Roy'
  },
  {
    id: '3',
    title: 'Cloud Infrastructure & Managed DevOps Services',
    category: 'Services',
    content: 'We specialize in multi-cloud architecture migration (AWS, GCP, Azure), automated CI/CD pipelines, Kubernetes orchestration, and 24/7 SIEM monitoring.',
    tags: 'cloud, devops, aws, gcp, kubernetes',
    createdAt: 'Sep 17, 2026',
    updatedText: 'Updated 1 day ago',
    creatorName: 'By Rahul Verma'
  },
  {
    id: '4',
    title: 'Next.js & Microservices Tech Stack Architecture',
    category: 'Technologies',
    content: 'Our core tech stack relies on Next.js 14, React, TypeScript, TailwindCSS, Node.js microservices, PostgreSQL with Prisma ORM, and Redis caching.',
    tags: 'nextjs, react, typescript, prisma',
    createdAt: 'Sep 17, 2026',
    updatedText: 'Updated 4 days ago',
    creatorName: 'By Admin'
  },
  {
    id: '5',
    title: 'Enterprise Client Testimonials & Endorsements',
    category: 'Testimonials',
    content: '"Interactive Bees delivered our cloud migration project ahead of schedule with zero downtime. Their technical rigor is unmatched." – CTO, Maruti Suzuki India.',
    tags: 'testimonial, review, maruti, client',
    createdAt: 'Sep 17, 2026',
    updatedText: 'Updated 5 days ago',
    creatorName: 'By Monica Gupta'
  },
  {
    id: '6',
    title: 'Standard Payment Terms & Billing SLA Clause',
    category: 'Standard Clauses',
    content: '50% advance upon project signoff, 30% upon milestone completion, and 20% post deployment & acceptance testing. Invoices payable within 15 days.',
    tags: 'terms, payment, sla, invoice',
    createdAt: 'Sep 17, 2026',
    updatedText: 'Updated 1 week ago',
    creatorName: 'By Ananya Roy'
  }
]

export default function ContentLibraryPage() {
  const [items, setItems] = useState<ContentItem[]>(sampleContentList)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('Recently Added')
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  
  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    category: 'Company Intro',
    content: '',
    tags: ''
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/content-library')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ContentItem[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category || 'Company Intro',
            content: item.content,
            tags: item.tags,
            createdAt: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            updatedText: 'Updated recently',
            creatorName: 'By Admin'
          }))
          setItems(mapped.length >= 4 ? mapped : sampleContentList)
        }
      }
    } catch (err) {
      console.error('Failed to fetch content snippets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Snippet text copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete snippet "${title}"?`)) return
    setItems(prev => prev.filter(item => item.id !== id))
    toast.success('Content snippet deleted')
    setActionMenuOpen(null)
  }

  const handleOpenEditModal = (item: ContentItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content,
      tags: item.tags || ''
    })
    setShowEditModal(true)
    setActionMenuOpen(null)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    if (!formData.title || !formData.content) {
      toast.error('Title and Content are required')
      return
    }

    setSubmitting(true)
    setItems(prev => prev.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          title: formData.title,
          category: formData.category,
          content: formData.content,
          tags: formData.tags,
          updatedText: 'Updated just now'
        }
      }
      return item
    }))

    toast.success(`Snippet "${formData.title}" updated successfully!`)
    setShowEditModal(false)
    setEditingItem(null)
    setSubmitting(false)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      toast.error('Title and Content are required')
      return
    }

    setSubmitting(true)
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      content: formData.content,
      tags: formData.tags,
      createdAt: 'Just now',
      updatedText: 'Created just now',
      creatorName: 'By Admin'
    }

    setItems([newItem, ...items])
    toast.success(`New content snippet "${formData.title}" added successfully!`)
    setShowModal(false)
    setSubmitting(false)
    setFormData({ title: '', category: 'Company Intro', content: '', tags: '' })
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.content.toLowerCase().includes(search.toLowerCase()) ||
                          (item.tags && item.tags.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Category Tag Colors Helper
  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'Company Intro':
        return 'bg-blue-100 text-blue-900 border border-blue-200'
      case 'Services':
        return 'bg-[#DCFCE7] text-emerald-900 border border-emerald-200'
      case 'Technologies':
        return 'bg-[#FEF08A] text-amber-950 border border-amber-300'
      case 'Testimonials':
        return 'bg-purple-100 text-purple-900 border border-purple-200'
      case 'Awards':
        return 'bg-amber-100 text-amber-900 border border-amber-200'
      case 'FAQs':
        return 'bg-indigo-100 text-indigo-900 border border-indigo-200'
      case 'Standard Clauses':
        return 'bg-rose-100 text-rose-900 border border-rose-200'
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  return (
    <div className="space-y-5 pb-8 font-sans">
      
      {/* 1. Top Warm Golden Hero Banner */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5B8] to-[#FFD84D] rounded-3xl p-6 lg:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Banner Left Info */}
        <div className="space-y-3 z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-950 uppercase block">
            KNOWLEDGE BASE &amp; CONTENT MODULES
          </span>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Content Library ({items.length})
            </h1>

            {/* Handwritten 'we believe. we can.' graphic accent */}
            <div className="relative inline-flex items-center px-2.5 py-0.5 transform -rotate-2 bg-amber-100/70 border border-amber-300/80 rounded-md">
              <span className="font-serif italic text-xs font-black text-amber-950 tracking-tight">
                we believe. we can.
              </span>
              <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-amber-400 rounded-full" />
            </div>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed max-w-xl">
            Store, organize, and quickly insert approved boilerplate text, FAQs, service descriptions, and legal clauses into client proposals.
          </p>
        </div>

        {/* Banner Right Actions */}
        <div className="relative w-full lg:w-96 shrink-0 flex items-center justify-end z-10 gap-4">
          <button
            onClick={() => {
              setFormData({ title: '', category: 'Company Intro', content: '', tags: '' })
              setShowModal(true)
            }}
            className="bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xs transition-all border border-amber-400 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Content Snippet</span>
          </button>
        </div>

      </div>

      {/* 2. Control Bar: Search & Category Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        
        {/* Search Bar Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search content snippets by title, tags or body text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        {/* Category Tabs & View Options */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
            {CATEGORIES_WITH_COUNTS.map((cat) => {
              const isActive = selectedCategory === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFC800] text-slate-950 font-black shadow-2xs border border-amber-400'
                      : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 font-bold border border-slate-200/50'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#FFC800] text-slate-950 font-black shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-[#FFC800] text-slate-950 font-black shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 3. Content Snippet Cards Grid / Table */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-900">No content snippets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No snippets match your search term "{search}". Try searching for another keyword or select a different category.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {filteredItems.map((item) => {
            const badgeStyle = getCategoryBadgeStyle(item.category)
            const tagArray = item.tags ? item.tags.split(',').map(t => t.trim()) : []

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-amber-300/80 transition-all flex flex-col justify-between group space-y-4 relative"
              >
                {/* Card Top Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Category Pill */}
                    <span className={`text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded-xl ${badgeStyle}`}>
                      {item.category}
                    </span>

                    {/* Copy & Actions */}
                    <div className="flex items-center gap-1.5 relative">
                      <button
                        onClick={() => handleCopy(item.id, item.content)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Copy snippet text"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button 
                        onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuOpen === item.id && (
                        <div className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-left animate-in fade-in slide-in-from-top-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                            Edit Snippet
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100 mt-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete Snippet
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug group-hover:text-amber-700 transition-colors">
                    {item.title}
                  </h3>

                  {/* Snippet Preview Text */}
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                    {item.content}
                  </p>
                </div>

                {/* Card Bottom: Tags & Footer Meta */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  {/* Tags */}
                  {tagArray.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tagArray.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-semibold text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Meta: Updated & Creator */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>{item.updatedText || 'Updated recently'}</span>
                    <span>{item.creatorName || 'By Admin'}</span>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Modal Dialog for Adding Snippets */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Add New Content Snippet
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Snippet Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 27001 Security Compliance Clause"
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
                  {CATEGORIES_WITH_COUNTS.filter(c => c.name !== 'ALL').map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content Text Body *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter the reusable text content snippet..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. security, iso27001, compliance, audit"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Add Snippet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog for Editing Snippets */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Edit Content Snippet ({editingItem.title})
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingItem(null) }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Snippet Title *</label>
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
                  {CATEGORIES_WITH_COUNTS.filter(c => c.name !== 'ALL').map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content Text Body *</label>
                <textarea
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingItem(null) }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
