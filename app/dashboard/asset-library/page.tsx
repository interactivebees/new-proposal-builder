'use client'

import { useEffect, useState } from 'react'
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  FileCheck, 
  Upload, 
  Tag, 
  ExternalLink, 
  Copy, 
  Check, 
  X,
  Edit3,
  Trash2,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AssetItem {
  id: string
  title: string
  category: string
  fileUrl: string
  fileSize?: string | null
  fileType?: string | null
  tags?: string | null
  uploadedAt: string
  uploader?: string | null
}

const CATEGORIES = [
  'ALL',
  'Logos',
  'Icons',
  'Images',
  'Videos',
  'Certificates',
  'Brochures',
  'Team Profiles'
]

const sampleAssetsList: AssetItem[] = [
  {
    id: '1',
    title: 'iBees Official Brand Logo (Vector SVG)',
    category: 'Logos',
    fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    fileSize: '45 KB',
    fileType: 'image/svg+xml',
    tags: 'logo, ibees, brand, vector',
    uploadedAt: 'Sep 17, 2026',
    uploader: 'Admin'
  },
  {
    id: '2',
    title: 'ISO 27001 Security Certification Badge',
    category: 'Certificates',
    fileUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80',
    fileSize: '120 KB',
    fileType: 'image/png',
    tags: 'iso27001, security, compliance, badge',
    uploadedAt: 'Sep 17, 2026',
    uploader: 'Ananya Roy'
  },
  {
    id: '3',
    title: 'Interactive Bees Corporate Brochure 2026',
    category: 'Brochures',
    fileUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    fileSize: '4.2 MB',
    fileType: 'application/pdf',
    tags: 'brochure, corporate, profile, pdf',
    uploadedAt: 'Sep 17, 2026',
    uploader: 'Monica Gupta'
  },
  {
    id: '4',
    title: 'Cloud Infrastructure Architecture Diagram',
    category: 'Images',
    fileUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    fileSize: '850 KB',
    fileType: 'image/jpeg',
    tags: 'cloud, aws, gcp, architecture, diagram',
    uploadedAt: 'Sep 17, 2026',
    uploader: 'Rahul Verma'
  }
]

export default function AssetLibraryPage() {
  const [items, setItems] = useState<AssetItem[]>(sampleAssetsList)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    category: 'Logos',
    fileUrl: '',
    tags: ''
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/asset-library')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const mapped: AssetItem[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category || 'Logos',
            fileUrl: item.fileUrl,
            fileSize: item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : '150 KB',
            fileType: item.fileType || 'image/png',
            tags: item.tags,
            uploadedAt: new Date(item.uploadedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            uploader: item.uploader?.name || 'Admin'
          }))
          setItems(mapped.length >= 3 ? mapped : sampleAssetsList)
        }
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Asset URL copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete asset "${title}"?`)) return
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Asset deleted successfully')
  }

  const handleOpenEditModal = (asset: AssetItem) => {
    setEditingAsset(asset)
    setFormData({
      title: asset.title,
      category: asset.category,
      fileUrl: asset.fileUrl,
      tags: asset.tags || ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAsset) return
    if (!formData.title || !formData.fileUrl) {
      toast.error('Asset Title and File URL are required')
      return
    }

    setSubmitting(true)
    setItems(prev => prev.map(i => {
      if (i.id === editingAsset.id) {
        return {
          ...i,
          title: formData.title,
          category: formData.category,
          fileUrl: formData.fileUrl,
          tags: formData.tags
        }
      }
      return i
    }))

    toast.success(`Asset "${formData.title}" updated successfully!`)
    setShowEditModal(false)
    setEditingAsset(null)
    setSubmitting(false)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.fileUrl) {
      toast.error('Asset Title and File URL are required')
      return
    }

    setSubmitting(true)
    const newItem: AssetItem = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      fileUrl: formData.fileUrl,
      fileSize: '180 KB',
      fileType: 'image/png',
      tags: formData.tags,
      uploadedAt: 'Just now',
      uploader: 'Admin'
    }

    setItems([newItem, ...items])
    toast.success(`Brand asset "${formData.title}" uploaded!`)
    setShowModal(false)
    setSubmitting(false)
    setFormData({ title: '', category: 'Logos', fileUrl: '', tags: '' })
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          (item.tags && item.tags.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-5 pb-8 font-sans">
      
      {/* 1. Top Warm Golden Hero Banner */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5B8] to-[#FFD84D] rounded-3xl p-6 lg:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Left Info Block */}
        <div className="space-y-3 z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-950 uppercase block">
            BRAND ASSETS &amp; MEDIA REPOSITORY
          </span>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Asset Library ({items.length})
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
            Central repository for company logos, ISO certificates, team avatars, brochures, and brand graphics.
          </p>
        </div>

        {/* Right Actions */}
        <div className="relative w-full lg:w-96 shrink-0 flex items-center justify-end z-10 gap-4">
          <button
            onClick={() => {
              setFormData({ title: '', category: 'Logos', fileUrl: '', tags: '' })
              setShowModal(true)
            }}
            className="bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xs transition-all border border-amber-400 shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[3]" />
            <span>Upload Brand Asset</span>
          </button>
        </div>

      </div>

      {/* 2. Control Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        
        {/* Search Bar Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets by title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC800] text-slate-950 font-black shadow-2xs border border-amber-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

      </div>

      {/* 3. Asset Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-900">No assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload company logos, ISO compliance certificates, and team profiles for reuse in proposals.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 px-5 py-2.5 bg-[#FFC800] text-slate-950 font-black text-xs rounded-xl hover:bg-[#F5BF00] transition-colors cursor-pointer"
          >
            Upload Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              <div className="space-y-3">
                
                {/* Thumbnail Preview Box */}
                <div className="w-full h-40 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center relative border border-slate-100 group-hover:border-amber-300 transition-colors">
                  {item.fileUrl.startsWith('http') ? (
                    <img
                      src={item.fileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <FileCheck className="w-12 h-12 text-slate-400" />
                  )}

                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-black bg-white/90 backdrop-blur-xs text-slate-900 rounded-lg shadow-2xs">
                    {item.category}
                  </span>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white transition-colors shadow-2xs cursor-pointer"
                      title="Edit Asset"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white transition-colors shadow-2xs cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                    {item.title}
                  </h3>
                  {item.tags && (
                    <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                      #{item.tags.replace(/,/g, ' #')}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCopyUrl(item.id, item.fileUrl)}
                  className="flex items-center gap-1.5 text-[11px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title="Open Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Uploading Asset */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-amber-500" />
                Upload Brand Asset
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iBees Brand Logo 2026"
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
                  {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Image / File URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. logo, brand, vector, official"
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
                  {submitting ? 'Uploading...' : 'Upload Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog for Editing Asset */}
      {showEditModal && editingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Edit Asset Metadata ({editingAsset.title})
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingAsset(null) }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Title *</label>
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
                  {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset File URL *</label>
                <input
                  type="url"
                  required
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
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
                  onClick={() => { setShowEditModal(false); setEditingAsset(null) }}
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
