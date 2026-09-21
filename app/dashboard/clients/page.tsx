'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { 
  Building2, 
  Plus, 
  Search, 
  ChevronDown, 
  MoreVertical, 
  Users, 
  UserCheck, 
  Handshake, 
  Clock, 
  LayoutGrid, 
  List, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  ArrowRight, 
  X, 
  Trash2, 
  Briefcase, 
  Edit3,
  Upload,
  User,
  Image as ImageIcon
} from 'lucide-react'

interface ClientItem {
  id: string
  num: number
  companyName: string
  slogan: string
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE'
  industry: string
  location: string
  email: string
  phone: string
  contactPerson: string
  contactDesignation: string
  logoUrl?: string
  proposalsCount: number
  pipelineValue: string
  avatarLetter: string
  avatarBg: string
}

// Detailed sample clients list with Logos & Person Designations
const sampleClientsList: ClientItem[] = [
  {
    id: '1',
    num: 1,
    companyName: 'Maruti Suzuki India Limited',
    slogan: 'Mobility for a Better Tomorrow',
    status: 'ACTIVE',
    industry: 'Automotive',
    location: 'New Delhi, India',
    email: 'contact@maruti.co.in',
    phone: '+91 120 452 9000',
    contactPerson: 'Anil Malhotra',
    contactDesignation: 'Chief Technology Officer',
    logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=120&auto=format&fit=crop&q=80',
    proposalsCount: 12,
    pipelineValue: '₹ 1.2 Cr',
    avatarLetter: 'M',
    avatarBg: 'bg-rose-600'
  },
  {
    id: '2',
    num: 2,
    companyName: 'Apollo Hospitals Enterprise',
    slogan: 'Touching Lives',
    status: 'ACTIVE',
    industry: 'Healthcare',
    location: 'Chennai, India',
    email: 'info@apollohospitals.com',
    phone: '+91 44 2829 0200',
    contactPerson: 'Dr. Vikram Reddy',
    contactDesignation: 'Head of Digital Health',
    logoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&auto=format&fit=crop&q=80',
    proposalsCount: 8,
    pipelineValue: '₹ 75 L',
    avatarLetter: 'A',
    avatarBg: 'bg-blue-600'
  },
  {
    id: '3',
    num: 3,
    companyName: 'Tata Motors Limited',
    slogan: 'Connecting Aspirations',
    status: 'ACTIVE',
    industry: 'Manufacturing',
    location: 'Mumbai, India',
    email: 'contact@tatamotors.com',
    phone: '+91 22 6665 8282',
    contactPerson: 'Rajesh Verma',
    contactDesignation: 'VP Digital Transformation',
    logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=120&auto=format&fit=crop&q=80',
    proposalsCount: 10,
    pipelineValue: '₹ 98 L',
    avatarLetter: 'T',
    avatarBg: 'bg-indigo-600'
  },
  {
    id: '4',
    num: 4,
    companyName: 'Canon India Pvt. Ltd.',
    slogan: 'Delighting You Always',
    status: 'ACTIVE',
    industry: 'Technology',
    location: 'Gurugram, India',
    email: 'info@canon.co.in',
    phone: '+91 124 416 0000',
    contactPerson: 'Meenakshi Iyer',
    contactDesignation: 'Head of Information Security',
    logoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&auto=format&fit=crop&q=80',
    proposalsCount: 6,
    pipelineValue: '₹ 60 L',
    avatarLetter: 'C',
    avatarBg: 'bg-red-600'
  },
  {
    id: '5',
    num: 5,
    companyName: 'Century Plyboard India Ltd.',
    slogan: 'Strong Inside',
    status: 'INACTIVE',
    industry: 'Manufacturing',
    location: 'Kolkata, India',
    email: 'digital@centuryply.com',
    phone: '+91 33 3940 3950',
    contactPerson: 'Ms. Shabana Rahman',
    contactDesignation: 'Category Manager (New Age Products)',
    logoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&auto=format&fit=crop&q=80',
    proposalsCount: 4,
    pipelineValue: '₹ 28 L',
    avatarLetter: 'C',
    avatarBg: 'bg-slate-800'
  },
  {
    id: '6',
    num: 6,
    companyName: 'ASDC (Automotive Skills)',
    slogan: 'Skilling India for Tomorrow',
    status: 'LEAD',
    industry: 'Education',
    location: 'New Delhi, India',
    email: 'contact@asdc.org.in',
    phone: '+91 11 4186 8900',
    contactPerson: 'Sunil Kumar',
    contactDesignation: 'Director Events & Media',
    logoUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=120&auto=format&fit=crop&q=80',
    proposalsCount: 3,
    pipelineValue: '₹ 35 L',
    avatarLetter: 'A',
    avatarBg: 'bg-purple-600'
  }
]

function getStatusBadge(status: string) {
  switch (status) {
    // case 'LEAD':
    //   return { text: 'LEAD', class: 'bg-[#FEF08A] text-amber-950 border border-amber-300/80 shadow-2xs' }
    case 'ACTIVE':
      return { text: 'ACTIVE', class: 'bg-[#DCFCE7] text-emerald-900 border border-emerald-200/80 shadow-2xs' }
    case 'INACTIVE':
    default:
      return { text: 'INACTIVE', class: 'bg-[#FEE2E2] text-rose-950 border border-rose-200/80 shadow-2xs' }
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  
  // Create Modal State
  const [showModal, setShowModal] = useState(false)
  const [addLogoError, setAddLogoError] = useState(false)

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null)
  const [editLogoError, setEditLogoError] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState({
    companyName: '',
    slogan: '',
    industry: 'Technology',
    location: 'New Delhi, India',
    email: '',
    phone: '',
    contactPerson: '',
    contactDesignation: '',
    logoUrl: '',
    pipelineValue: '₹ 0',
    status: 'ACTIVE' as 'LEAD' | 'ACTIVE' | 'INACTIVE'
  })

  const [editFormData, setEditFormData] = useState({
    companyName: '',
    slogan: '',
    industry: 'Technology',
    location: 'New Delhi, India',
    email: '',
    phone: '',
    contactPerson: '',
    contactDesignation: '',
    logoUrl: '',
    pipelineValue: '₹ 0',
    status: 'ACTIVE' as 'LEAD' | 'ACTIVE' | 'INACTIVE'
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          const mapped: ClientItem[] = data.map((item: any, index: number) => {
            const firstContact = item.contacts && item.contacts.length > 0 ? item.contacts[0] : null
            const proposals = item.proposals || []
            const proposalsCount = proposals.length
            const totalVal = proposals.reduce((acc: number, p: any) => acc + (Number(p.opportunityValue) || 0), 0)

            let pipelineValue = '₹ 0'
            if (totalVal >= 10000000) {
              pipelineValue = `₹ ${(totalVal / 10000000).toFixed(1)} Cr`
            } else if (totalVal >= 100000) {
              pipelineValue = `₹ ${(totalVal / 100000).toFixed(0)} L`
            } else if (totalVal > 0) {
              pipelineValue = `₹ ${totalVal.toLocaleString('en-IN')}`
            }

            return {
              id: item.id,
              num: index + 1,
              companyName: item.companyName || item.name || 'Enterprise Account',
              slogan: item.slogan || 'Transforming Enterprise Growth',
              status: (item.status || 'ACTIVE') as any,
              industry: item.industry || 'Technology',
              location: item.city ? (item.country ? `${item.city}, ${item.country}` : `${item.city}, India`) : (item.country || 'New Delhi, India'),
              email: item.email || '',
              phone: item.phone || '',
              contactPerson: firstContact?.name || item.name || '',
              contactDesignation: firstContact?.designation || 'Lead Procurement Manager',
              logoUrl: item.logoUrl || '',
              proposalsCount,
              pipelineValue,
              avatarLetter: (item.companyName || item.name || 'C')[0].toUpperCase(),
              avatarBg: ['bg-rose-600', 'bg-blue-600', 'bg-indigo-600', 'bg-red-600', 'bg-slate-800', 'bg-purple-600'][index % 6]
            }
          })
          setClients(mapped)
        }
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'create' | 'edit') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (res.ok) {
        const data = await res.json()
        if (mode === 'create') {
          setFormData(prev => ({ ...prev, logoUrl: data.url }))
          setAddLogoError(false)
        } else {
          setEditFormData(prev => ({ ...prev, logoUrl: data.url }))
          setEditLogoError(false)
        }
        toast.success('Company logo uploaded successfully!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to upload logo')
      }
    } catch (error) {
      toast.error('Error uploading logo image')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.companyName) {
      toast.error('Company Name is required')
      return
    }

    setSubmitting(true)
    try {
      const parts = formData.location ? formData.location.split(',').map(s => s.trim()) : ['New Delhi', 'India']
      const city = parts[0] || 'New Delhi'
      const country = parts[1] || 'India'
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.contactPerson || formData.companyName,
          contactDesignation: formData.contactDesignation,
          companyName: formData.companyName,
          slogan: formData.slogan || '',
          logoUrl: formData.logoUrl || '',
          industry: formData.industry,
          email: formData.email,
          phone: formData.phone,
          city,
          country,
          status: formData.status
        })
      })

      if (res.ok) {
        toast.success(`Client account "${formData.companyName}" added successfully!`)
        setShowModal(false)
        setAddLogoError(false)
        setFormData({
          companyName: '',
          slogan: '',
          industry: 'Technology',
          location: 'New Delhi, India',
          email: '',
          phone: '',
          contactPerson: '',
          contactDesignation: '',
          logoUrl: '',
          pipelineValue: '₹ 0',
          status: 'ACTIVE'
        })
        fetchClients()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || err.details || 'Failed to create client')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create client')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEditModal = (client: ClientItem) => {
    setEditingClient(client)
    setEditLogoError(false)
    setEditFormData({
      companyName: client.companyName,
      slogan: client.slogan || '',
      industry: client.industry,
      location: client.location,
      email: client.email,
      phone: client.phone,
      contactPerson: client.contactPerson,
      contactDesignation: client.contactDesignation,
      logoUrl: client.logoUrl || '',
      pipelineValue: client.pipelineValue,
      status: client.status
    })
    setShowEditModal(true)
    setActionMenuOpen(null)
  }

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return
    if (!editFormData.companyName) {
      toast.error('Company Name is required')
      return
    }

    setSubmitting(true)
    try {
      const parts = editFormData.location ? editFormData.location.split(',').map(s => s.trim()) : ['New Delhi', 'India']
      const city = parts[0] || 'New Delhi'
      const country = parts[1] || 'India'
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.contactPerson || editFormData.companyName,
          contactDesignation: editFormData.contactDesignation,
          companyName: editFormData.companyName,
          slogan: editFormData.slogan || '',
          logoUrl: editFormData.logoUrl || '',
          industry: editFormData.industry,
          email: editFormData.email,
          phone: editFormData.phone,
          city,
          country,
          status: editFormData.status
        })
      })

      if (res.ok) {
        toast.success(`Client account "${editFormData.companyName}" updated successfully!`)
        setShowEditModal(false)
        setEditingClient(null)
        setEditLogoError(false)
        fetchClients()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || err.details || 'Failed to update client')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update client')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Client account "${name}" deleted`)
        setActionMenuOpen(null)
        fetchClients()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete client')
      }
    } catch (error) {
      toast.error('Failed to delete client')
    }
  }

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.contactDesignation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesIndustry = selectedIndustry === 'ALL' || c.industry === selectedIndustry
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus
    return matchesSearch && matchesIndustry && matchesStatus
  })

  const uniqueIndustries = Array.from(new Set(clients.map(c => c.industry)))

  return (
    <div className="space-y-5 pb-8 font-sans">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            CLIENT RELATIONSHIP MANAGEMENT
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Client Accounts (CRM)
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
            Manage your enterprise client accounts, key contact designations, logos, and deal opportunities.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Top Metric KPI Stat Cards Row (4 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Total Clients</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{clients.length}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 shadow-2xs">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Active Accounts</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {clients.filter(c => c.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
            <UserCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Lead Opportunities</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {clients.filter(c => c.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FEF08A] text-amber-950 flex items-center justify-center border border-amber-200 shadow-2xs">
            <Handshake className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Inactive Accounts</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {clients.filter(c => c.status === 'INACTIVE').length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-2xs">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company, person name, designation, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
          <div className="relative">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors max-w-[150px] truncate"
            >
              <option value="ALL">All Industries</option>
              {uniqueIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Statuses</option>
              {/* <option value="LEAD">LEAD</option> */}
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

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

      {/* Client Cards Grid / Table Section */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const badge = getStatusBadge(client.status)
            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-amber-300/80 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs relative">
                        {client.logoUrl ? (
                          <img 
                            src={client.logoUrl} 
                            alt={client.companyName}
                            className="w-full h-full object-contain p-1 relative z-10 bg-white"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 w-full h-full ${client.avatarBg} text-white font-black text-lg flex items-center justify-center`}>
                          {client.avatarLetter}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-amber-800 transition-colors">
                          {client.companyName}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 line-clamp-1">
                          {client.slogan}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md whitespace-nowrap ${badge.class}`}>
                        {badge.text}
                      </span>

                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === client.id ? null : client.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuOpen === client.id && (
                        <div className="absolute right-3 top-12 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-left animate-in fade-in slide-in-from-top-1">
                          <button
                            onClick={() => handleOpenEditModal(client)}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                            Edit Account
                          </button>
                          <button
                            onClick={() => handleDelete(client.id, client.companyName)}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100 mt-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete Account
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Contact Person & Designation */}
                  <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3 mb-3 flex items-center gap-2.5">
                    <div className="p-2 bg-amber-100 text-amber-950 rounded-xl shrink-0 border border-amber-200 shadow-2xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black text-slate-900 truncate block">
                        {client.contactPerson}
                      </span>
                      <span className="inline-block text-[10px] font-extrabold text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300/80 truncate max-w-full mt-0.5">
                        {client.contactDesignation}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.industry}</span>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0 justify-end sm:justify-start">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0 justify-end sm:justify-start">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                  </div>

                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-600">
                    <FileText className="w-4 h-4 text-amber-600 stroke-[2.2]" />
                    <span>{client.proposalsCount} Proposals</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block leading-none">
                        Pipeline Value
                      </span>
                      <span className="font-black text-slate-900 text-xs leading-tight">
                        {client.pipelineValue}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEditModal(client)}
                      className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-[#FFC800] group-hover:text-slate-950 group-hover:border-amber-400 transition-colors shrink-0 cursor-pointer"
                      title="Edit Account Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Company &amp; Logo</th>
                <th className="py-3.5 px-5">Contact &amp; Designation</th>
                <th className="py-3.5 px-5">Industry</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Proposals</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClients.map((client) => {
                const badge = getStatusBadge(client.status)
                return (
                  <tr key={client.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="py-3.5 px-5 font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs relative">
                          {client.logoUrl ? (
                            <img 
                              src={client.logoUrl} 
                              alt={client.companyName}
                              className="w-full h-full object-contain p-0.5 relative z-10 bg-white"
                              onError={(e) => {
                                ;(e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : null}
                          <div className={`absolute inset-0 w-full h-full ${client.avatarBg} text-white font-black text-xs flex items-center justify-center`}>
                            {client.avatarLetter}
                          </div>
                        </div>

                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{client.companyName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{client.slogan}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <p className="font-extrabold text-slate-900 text-xs">{client.contactPerson}</p>
                      <span className="inline-block text-[10px] font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 mt-0.5">
                        {client.contactDesignation}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-semibold text-slate-600">{client.industry}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-500">{client.location}</td>
                    
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md whitespace-nowrap ${badge.class}`}>
                        {badge.text}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-slate-700">{client.proposalsCount} Proposals</td>
                    
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="px-3 py-1 bg-slate-100 hover:bg-[#FFC800] text-slate-800 hover:text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.companyName)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Adding New Client */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                Add New Client Account
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs font-bold text-slate-700">
              
              {/* Browse & Upload Company Logo Box */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800">
                  Company Logo (Browse File or Image URL)
                </label>
                
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-2xs relative">
                    {formData.logoUrl && !addLogoError ? (
                      <img 
                        key={formData.logoUrl}
                        src={formData.logoUrl} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain p-1"
                        onError={() => setAddLogoError(true)}
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <label className="cursor-pointer px-3.5 py-2 bg-white hover:bg-amber-50 text-slate-900 border border-slate-200 hover:border-amber-300 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-2 shrink-0">
                    <Upload className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Browse & Upload Logo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleLogoUpload(e, 'create')}
                      disabled={uploadingLogo}
                      className="hidden" 
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Or paste Logo Image URL..."
                    value={formData.logoUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, logoUrl: e.target.value })
                      setAddLogoError(false)
                    }}
                    className="flex-1 min-w-[180px] px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />

                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, logoUrl: '' })
                        setAddLogoError(false)
                      }}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maruti Suzuki India Ltd."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Tagline / Slogan</label>
                  <input
                    type="text"
                    placeholder="e.g. Mobility for a Better Tomorrow"
                    value={formData.slogan}
                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Verma"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Contact Person Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VP Digital Transformation"
                    value={formData.contactDesignation}
                    onChange={(e) => setFormData({ ...formData, contactDesignation: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                  >
                    <option value="Automotive">Automotive</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Technology">Technology</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                  >
                    
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 11 4100 2000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, India"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-extrabold rounded-xl shadow-2xs transition-all border border-amber-400 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Client */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                Edit Client Account ({editingClient.companyName})
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingClient(null) }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-4 text-xs font-bold text-slate-700">
              
              {/* Browse & Upload Company Logo Box */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800">
                  Company Logo (Browse File or Image URL)
                </label>
                
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-2xs relative">
                    {editFormData.logoUrl && !editLogoError ? (
                      <img 
                        key={editFormData.logoUrl}
                        src={editFormData.logoUrl} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain p-1"
                        onError={() => setEditLogoError(true)}
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <label className="cursor-pointer px-3.5 py-2 bg-white hover:bg-amber-50 text-slate-900 border border-slate-200 hover:border-amber-300 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-2 shrink-0">
                    <Upload className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Browse & Upload Logo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleLogoUpload(e, 'edit')}
                      disabled={uploadingLogo}
                      className="hidden" 
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Or paste Logo Image URL..."
                    value={editFormData.logoUrl}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, logoUrl: e.target.value })
                      setEditLogoError(false)
                    }}
                    className="flex-1 min-w-[180px] px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />

                  {editFormData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormData({ ...editFormData, logoUrl: '' })
                        setEditLogoError(false)
                      }}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Tagline / Slogan</label>
                  <input
                    type="text"
                    value={editFormData.slogan}
                    onChange={(e) => setEditFormData({ ...editFormData, slogan: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Contact Person Designation *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactDesignation}
                    onChange={(e) => setEditFormData({ ...editFormData, contactDesignation: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Industry</label>
                  <select
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                  >
                    <option value="Automotive">Automotive</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Technology">Technology</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                  >
                    <option value="LEAD">LEAD</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, India"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingClient(null) }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-extrabold rounded-xl shadow-2xs transition-all border border-amber-400 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Account Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
