'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Calendar, 
  Download, 
  MoreVertical, 
  Link2, 
  Inbox, 
  Hourglass, 
  CheckCircle2, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ExternalLink,
  Filter,
  RotateCcw,
  X,
  Check,
  Cloud,
  Smartphone,
  BarChart3,
  Layers,
  Globe,
  ShieldCheck,
  LayoutGrid,
  FileText,
  Megaphone,
  Sparkles
} from 'lucide-react'

interface ProposalItem {
  id: string
  num: number
  title: string
  subtitle: string
  clientName: string
  clientIndustry: string
  status: string
  creatorName: string
  creatorInitials: string
  createdAt: string
  rawDate?: Date
  iconType: 'cloud' | 'app' | 'chart' | 'portal' | 'web' | 'security' | 'warranty' | 'layout' | 'doc' | 'marketing'
}

function getTitleIcon(type: string) {
  switch (type) {
    case 'cloud':
      return { Icon: Cloud, bgClass: 'bg-emerald-100/90 text-emerald-600' }
    case 'app':
      return { Icon: Smartphone, bgClass: 'bg-purple-100/90 text-purple-600' }
    case 'chart':
      return { Icon: BarChart3, bgClass: 'bg-rose-100/90 text-rose-600' }
    case 'portal':
      return { Icon: Layers, bgClass: 'bg-teal-100/90 text-teal-600' }
    case 'web':
      return { Icon: Globe, bgClass: 'bg-rose-100/90 text-rose-600' }
    case 'security':
      return { Icon: ShieldCheck, bgClass: 'bg-emerald-100/90 text-emerald-600' }
    case 'warranty':
      return { Icon: LayoutGrid, bgClass: 'bg-amber-100/90 text-amber-600' }
    case 'layout':
      return { Icon: LayoutGrid, bgClass: 'bg-teal-100/90 text-teal-600' }
    case 'doc':
      return { Icon: FileText, bgClass: 'bg-rose-100/90 text-rose-600' }
    case 'marketing':
      return { Icon: Megaphone, bgClass: 'bg-sky-100/90 text-sky-600' }
    default:
      return { Icon: FileText, bgClass: 'bg-amber-100/90 text-amber-600' }
  }
}

function getStatusBadge(status: string) {
  const norm = (status || '').toUpperCase().replace(/[\s_]+/g, '_')
  if (norm.includes('PENDING') || norm === 'PENDING_APPROVAL') {
    return {
      text: 'Pending Approval',
      badgeClass: 'bg-[#FEF9C3] text-[#854D0E] border border-amber-300/70'
    }
  }
  if (norm.includes('APPROVED')) {
    return {
      text: 'Approved',
      badgeClass: 'bg-[#DCFCE7] text-[#166534] border border-emerald-300/70'
    }
  }
  if (norm.includes('SENT')) {
    return {
      text: 'Sent',
      badgeClass: 'bg-[#F3E8FF] text-[#6B21A8] border border-purple-300/70'
    }
  }
  if (norm.includes('REVIEW') || norm === 'IN_REVIEW') {
    return {
      text: 'In Review',
      badgeClass: 'bg-[#FFEDD5] text-[#9A3412] border border-orange-300/70'
    }
  }
  if (norm.includes('REJECTED')) {
    return {
      text: 'Rejected',
      badgeClass: 'bg-[#FEE2E2] text-[#991B1B] border border-rose-300/70'
    }
  }
  return {
    text: 'Draft',
    badgeClass: 'bg-[#DBEAFE] text-[#1E40AF] border border-blue-300/70'
  }
}

// Exact 10 proposals matching the user's reference mockup image
const sampleProposalsList: ProposalItem[] = [
  {
    id: '1',
    num: 1,
    title: 'Maruti Suzuki Cloud Architecture Migration',
    subtitle: 'Cloud infrastructure migration proposal',
    clientName: 'Maruti Suzuki India Limited',
    clientIndustry: 'Automotive',
    status: 'PENDING_APPROVAL',
    creatorName: 'Ananya Roy',
    creatorInitials: 'AR',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'cloud'
  },
  {
    id: '2',
    num: 2,
    title: 'Apollo Telehealth App & Integration',
    subtitle: 'Healthcare app development',
    clientName: 'Apollo Hospitals Enterprise',
    clientIndustry: 'Healthcare',
    status: 'APPROVED',
    creatorName: 'Monica Gupta',
    creatorInitials: 'MG',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'app'
  },
  {
    id: '3',
    num: 3,
    title: 'Tata Motors Supply Chain Analytics Dashboard',
    subtitle: 'Data analytics dashboard',
    clientName: 'Tata Motors Limited',
    clientIndustry: 'Automotive',
    status: 'SENT',
    creatorName: 'Admin',
    creatorInitials: 'A',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'chart'
  },
  {
    id: '4',
    num: 4,
    title: 'Indorama Industry 4.0 Portal Revamp',
    subtitle: 'Digital platform revamp',
    clientName: 'Indorama Synthetics Ltd.',
    clientIndustry: 'Manufacturing',
    status: 'IN_REVIEW',
    creatorName: 'Monica Gupta',
    creatorInitials: 'MG',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'portal'
  },
  {
    id: '5',
    num: 5,
    title: 'NASSCOM Annual Event Web Ecosystem',
    subtitle: 'Event website & registrations',
    clientName: 'NASSCOM India',
    clientIndustry: 'Events',
    status: 'DRAFT',
    creatorName: 'Ananya Roy',
    creatorInitials: 'AR',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'web'
  },
  {
    id: '6',
    num: 6,
    title: 'Canon Security Infrastructure Upgrade',
    subtitle: 'Security & infrastructure',
    clientName: 'Canon India Pvt. Ltd.',
    clientIndustry: 'Technology',
    status: 'APPROVED',
    creatorName: 'Monica Gupta',
    creatorInitials: 'MG',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'security'
  },
  {
    id: '7',
    num: 7,
    title: 'Centuryply Warranty Portal Scope of Work',
    subtitle: 'Warranty portal proposal',
    clientName: 'Century Plyboard India Ltd.',
    clientIndustry: 'Manufacturing',
    status: 'IN_REVIEW',
    creatorName: 'Ananya Roy',
    creatorInitials: 'AR',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'warranty'
  },
  {
    id: '8',
    num: 8,
    title: 'ASDC Website Revamp Proposal',
    subtitle: 'Website redesign',
    clientName: 'Automotive Skills Development ...',
    clientIndustry: 'Education',
    status: 'DRAFT',
    creatorName: 'Monica Gupta',
    creatorInitials: 'MG',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'layout'
  },
  {
    id: '9',
    num: 9,
    title: 'Proposal for Century Ply – Warranty Portal Scope of Work',
    subtitle: 'Warranty portal development',
    clientName: 'Ms. Shabana Rahman',
    clientIndustry: 'Manufacturing',
    status: 'DRAFT',
    creatorName: 'Monica Gupta',
    creatorInitials: 'MG',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'doc'
  },
  {
    id: '10',
    num: 10,
    title: 'Digital Marketing Strategy 2026',
    subtitle: 'SEO, PPC and digital campaigns',
    clientName: 'Interactive Bees Pvt. Ltd.',
    clientIndustry: 'Internal',
    status: 'APPROVED',
    creatorName: 'Admin',
    creatorInitials: 'A',
    createdAt: 'Sep 17, 2026',
    rawDate: new Date('2026-09-17'),
    iconType: 'marketing'
  }
]

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalItem[]>(sampleProposalsList)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedClient, setSelectedClient] = useState('ALL')
  const [selectedCreator, setSelectedCreator] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateRangePreset, setDateRangePreset] = useState('ALL')
  const [showDateMenu, setShowDateMenu] = useState(false)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const dateMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) {
        setShowDateMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/proposals')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ProposalItem[] = data.map((item: any, index: number) => ({
            id: item.id,
            num: index + 1,
            title: item.title,
            subtitle: item.clientCompany ? `Proposal document for ${item.clientCompany}` : 'Client proposal document',
            clientName: item.clientName || '-',
            clientIndustry: item.clientCompany || '-',
            status: item.status || 'DRAFT',
            creatorName: item.creator?.name || 'Admin',
            creatorInitials: item.creator?.name 
              ? item.creator.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'A',
            createdAt: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            rawDate: new Date(item.createdAt),
            iconType: (['cloud', 'app', 'chart', 'portal', 'web', 'security', 'warranty', 'layout', 'doc', 'marketing'][index % 10]) as any
          }))
          setProposals(mapped)
        }
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProposals(prev => prev.filter(p => p.id !== id))
        toast.success('Proposal deleted successfully')
      } else {
        toast.error('Failed to delete proposal')
      }
    } catch (error) {
      toast.error('Failed to delete proposal')
    } finally {
      setActionMenuOpen(null)
    }
  }

  // Date preset handler
  const handleSelectPreset = (preset: string) => {
    setDateRangePreset(preset)
    const today = new Date()
    const formatDateYMD = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    if (preset === 'ALL') {
      setStartDate('')
      setEndDate('')
    } else if (preset === 'TODAY') {
      const todayStr = formatDateYMD(today)
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (preset === 'LAST_7_DAYS') {
      const past = new Date()
      past.setDate(today.getDate() - 7)
      setStartDate(formatDateYMD(past))
      setEndDate(formatDateYMD(today))
    } else if (preset === 'LAST_30_DAYS') {
      const past = new Date()
      past.setDate(today.getDate() - 30)
      setStartDate(formatDateYMD(past))
      setEndDate(formatDateYMD(today))
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      setStartDate(formatDateYMD(firstDay))
      setEndDate(formatDateYMD(today))
    } else if (preset === 'LAST_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0)
      setStartDate(formatDateYMD(firstDay))
      setEndDate(formatDateYMD(lastDay))
    }
    setShowDateMenu(false)
  }

  const getDateFilterLabel = () => {
    if (dateRangePreset === 'TODAY') return 'Today'
    if (dateRangePreset === 'LAST_7_DAYS') return 'Last 7 Days'
    if (dateRangePreset === 'LAST_30_DAYS') return 'Last 30 Days'
    if (dateRangePreset === 'THIS_MONTH') return 'This Month'
    if (dateRangePreset === 'LAST_MONTH') return 'Last Month'
    if (startDate && endDate) return `${startDate} → ${endDate}`
    if (startDate) return `From ${startDate}`
    if (endDate) return `Until ${endDate}`
    return 'Select Date Range'
  }

  // Active filter state and reset handler
  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedStatus !== 'ALL' || 
    selectedClient !== 'ALL' || 
    selectedCreator !== 'ALL' || 
    startDate !== '' || 
    endDate !== '' ||
    dateRangePreset !== 'ALL'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedStatus('ALL')
    setSelectedClient('ALL')
    setSelectedCreator('ALL')
    setStartDate('')
    setEndDate('')
    setDateRangePreset('ALL')
    setShowDateMenu(false)
  }

  // Filtered proposal list logic
  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus
    const matchesClient = selectedClient === 'ALL' || p.clientName === selectedClient
    const matchesCreator = selectedCreator === 'ALL' || p.creatorName === selectedCreator

    // Date range matching
    let matchesDate = true
    if (startDate || endDate) {
      const pTime = p.rawDate ? p.rawDate.getTime() : new Date(p.createdAt).getTime()
      if (!isNaN(pTime)) {
        if (startDate) {
          const sTime = new Date(`${startDate}T00:00:00`).getTime()
          if (pTime < sTime) matchesDate = false
        }
        if (endDate) {
          const eTime = new Date(`${endDate}T23:59:59`).getTime()
          if (pTime > eTime) matchesDate = false
        }
      }
    }

    return matchesSearch && matchesStatus && matchesClient && matchesCreator && matchesDate
  })

  // Extract unique clients and creators for filter dropdowns
  const uniqueClients = Array.from(new Set(proposals.map(p => p.clientName).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  const uniqueCreators = Array.from(new Set(proposals.map(p => p.creatorName).filter(Boolean))).sort((a, b) => a.localeCompare(b))


  const totalProposals = proposals.length
  const draftCount = proposals.filter(p => !p.status || p.status.toUpperCase().includes('DRAFT')).length
  const inReviewCount = proposals.filter(p => p.status && (p.status.toUpperCase().includes('REVIEW') || p.status.toUpperCase().includes('PENDING'))).length
  const approvedCount = proposals.filter(p => p.status && p.status.toUpperCase().includes('APPROVED')).length
  const rejectedCount = proposals.filter(p => p.status && p.status.toUpperCase().includes('REJECTED')).length

  const handleExportCSV = () => {
    const headers = ['Title', 'Client Name', 'Industry', 'Status', 'Creator', 'Created At']
    const csvContent = [
      headers.join(','),
      ...filteredProposals.map(p => 
        `"${p.title.replace(/"/g, '""')}","${p.clientName.replace(/"/g, '""')}","${p.clientIndustry.replace(/"/g, '""')}","${p.status}","${p.creatorName}","${p.createdAt}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'proposals_export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4 pb-6 font-sans">
      
      {/* 1. Warm Golden Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/15 p-6 rounded-3xl border border-amber-200/70 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Background Decorative Graphic Blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none" />

        {/* Left Text Block */}
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">
            PROPOSAL MANAGEMENT
          </span>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Proposals Directory
            </h1>

            {/* Handwritten 'we believe. we can.' graphic accent */}
            <div className="relative inline-flex items-center px-2.5 py-0.5 bg-[#FFFBEB] border border-amber-300/90 rounded-lg shadow-2xs">
              <span className="font-serif italic text-xs font-black text-[#78350F] tracking-tight">
                we believe. we can.
              </span>
            </div>
          </div>

          <p className="text-xs font-medium text-slate-600 pt-0.5 leading-relaxed">
            Manage, edit, review, and track status of all client proposals across your workspace.
          </p>
        </div>

        {/* Right Action Block with 'Ideas to Impact' Badge & Graphics */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          
          {/* Ideas to Impact Cursive Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-amber-100/60 border border-amber-200/80 rounded-full text-amber-900 font-serif italic text-xs font-bold transform -rotate-1 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ideas to Impact</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer">
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export List</span>
            </button>

            <Link
              href="/dashboard/proposals/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFC800] hover:bg-[#e6b400] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Create New Proposal</span>
            </Link>
          </div>

        </div>

      </div>

      {/* 2. Top Metric KPI Stat Cards Row (5 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Proposals */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Link2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{totalProposals}</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">Total Proposals</div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-400 pt-2 flex items-center gap-1">
            <span>Total across workspace</span>
          </div>
        </div>

        {/* Card 2: Draft */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Inbox className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{draftCount}</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">Draft</div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-400 pt-2 flex items-center gap-1">
            <span>Currently in draft state</span>
          </div>
        </div>

        {/* Card 3: In Review */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Hourglass className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{inReviewCount}</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">In Review</div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-400 pt-2 flex items-center gap-1">
            <span>Awaiting review</span>
          </div>
        </div>

        {/* Card 4: Approved */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{approvedCount}</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">Approved</div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-400 pt-2 flex items-center gap-1">
            <span>Successfully approved</span>
          </div>
        </div>

        {/* Card 5: Rejected */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <XCircle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{rejectedCount}</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">Rejected</div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-400 pt-2 flex items-center gap-1">
            <span>Needs revision</span>
          </div>
        </div>

      </div>

      {/* 3. Filter Toolbar & Search Control Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search proposals by title, client or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        {/* Middle & Right Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
          
          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="SENT">Sent</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Client Filter */}
          <div className="relative">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors max-w-[150px] truncate"
            >
              <option value="ALL">All Clients</option>
              {uniqueClients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Creator Filter */}
          <div className="relative">
            <select
              value={selectedCreator}
              onChange={(e) => setSelectedCreator(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Creators</option>
              {uniqueCreators.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Select Date Range Button & Popover */}
          <div className="relative" ref={dateMenuRef}>
            <button 
              type="button"
              onClick={() => setShowDateMenu(!showDateMenu)}
              className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                startDate || endDate || dateRangePreset !== 'ALL'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${startDate || endDate || dateRangePreset !== 'ALL' ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>{getDateFilterLabel()}</span>
              {(startDate || endDate || dateRangePreset !== 'ALL') && (
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setStartDate('')
                    setEndDate('')
                    setDateRangePreset('ALL')
                  }}
                  className="p-0.5 hover:bg-amber-200/80 rounded-full"
                  title="Clear date filter"
                >
                  <X className="w-3 h-3 text-amber-800" />
                </span>
              )}
            </button>

            {showDateMenu && (
              <div className="absolute right-0 sm:left-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-40 space-y-3 animate-in fade-in slide-in-from-top-1 text-left">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                  Quick Presets
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                  {[
                    { id: 'ALL', label: 'All Time' },
                    { id: 'TODAY', label: 'Today' },
                    { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
                    { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
                    { id: 'THIS_MONTH', label: 'This Month' },
                    { id: 'LAST_MONTH', label: 'Last Month' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        dateRangePreset === preset.id && !startDate && !endDate
                          ? 'bg-amber-100 text-amber-950 font-extrabold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100">
                  Custom Range
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        setDateRangePreset('CUSTOM')
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        setDateRangePreset('CUSTOM')
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('')
                      setEndDate('')
                      setDateRangePreset('ALL')
                      setShowDateMenu(false)
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Clear Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDateMenu(false)}
                    className="px-3 py-1 bg-[#FFC800] hover:bg-[#e6b400] text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Filters Option Button */}
          {hasActiveFilters && (
            <button 
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer animate-in fade-in"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Proposals Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 pl-6 pr-3 text-center w-12">#</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Created On</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No matching proposals found.
                  </td>
                </tr>
              ) : (
                filteredProposals.map((item) => {
                  const badge = getStatusBadge(item.status)
                  const iconInfo = getTitleIcon(item.iconType)
                  const IconComp = iconInfo.Icon

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-amber-50/20 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-3.5 pl-6 pr-3 font-bold text-slate-400 text-center">
                        {item.num}
                      </td>

                      {/* Title Column with Icon Badge & Subtitle */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg ${iconInfo.bgClass} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <Link 
                              href={`/dashboard/proposals/${item.id}`} 
                              className="font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors block leading-snug hover:underline"
                            >
                              {item.title}
                            </Link>
                            <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client Name & Industry */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="font-extrabold text-slate-800 block truncate">
                          {item.clientName}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                          {item.clientIndustry}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-extrabold rounded-lg whitespace-nowrap ${badge.badgeClass}`}>
                          {badge.text}
                        </span>
                      </td>

                      {/* Creator Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0 border border-slate-300">
                            {item.creatorInitials}
                          </div>
                          <span className="font-bold text-slate-700 text-xs">
                            {item.creatorName}
                          </span>
                        </div>
                      </td>

                      {/* Created On Date */}
                      <td className="py-3.5 px-4 font-medium text-slate-500 whitespace-nowrap">
                        {item.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 relative">
                          <Link
                            href={`/dashboard/proposals/${item.id}`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-[#FFC800] text-slate-800 hover:text-slate-950 font-bold rounded-xl text-[11px] transition-colors border border-slate-200/60 shadow-2xs"
                          >
                            View 
                          </Link>

                          {/* 3-Dots Options Button */}
                          <button 
                            onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Context Menu Dropdown */}
                          {actionMenuOpen === item.id && (
                            <div className="absolute right-0 top-9 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-left animate-in fade-in slide-in-from-top-1">
                              <Link
                                href={`/dashboard/proposals/${item.id}`}
                                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                View Details
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id, item.title)}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100 mt-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                Delete Proposal
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination & Footer Summary Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500 bg-slate-50/50">
          <div>
            Showing {filteredProposals.length > 0 ? 1 : 0} to {filteredProposals.length} of {proposals.length} proposals
          </div>

          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            
          </div>

          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 pr-7 text-xs font-bold text-slate-700 outline-none cursor-pointer">
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

    </div>
  )
}
