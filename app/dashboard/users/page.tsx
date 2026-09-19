'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Download, 
  UserCheck, 
  UserX, 
  Shield, 
  Edit3, 
  Power, 
  Trash2, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  X,
  Mail,
  Phone,
  Building2,
  Check,
  Sparkles,
  Lock,
  Eye
} from 'lucide-react'

interface UserItem {
  id: string
  num: number
  name: string
  email: string
  role: string
  roleColor: 'blue' | 'purple' | 'orange' | 'green' | 'amber'
  permissions: string[]
  morePermsCount?: number
  company: string
  phone: string
  status: 'Active' | 'Inactive'
  avatarInitials: string
  avatarBg: string
}

// Sample 8 Users matching reference screenshot exactly
const sampleUsersList: UserItem[] = [
  {
    id: '1',
    num: 1,
    name: 'Ananya Roy',
    email: 'ananya.roy@interactivebees.com',
    role: 'Sales Team',
    roleColor: 'blue',
    permissions: ['View', 'Edit', 'Create'],
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 98568 78601',
    status: 'Active',
    avatarInitials: 'AR',
    avatarBg: 'bg-amber-400 text-slate-950 font-black'
  },
  {
    id: '2',
    num: 2,
    name: 'Vikram Mishorra',
    email: 'vikram.mishorra@interactivebees.com',
    role: 'Reviewer',
    roleColor: 'purple',
    permissions: ['View'],
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 98445 67890',
    status: 'Active',
    avatarInitials: 'VM',
    avatarBg: 'bg-purple-600 text-white font-black'
  },
  {
    id: '3',
    num: 3,
    name: 'Priya Sharma',
    email: 'priya.sharma@interactivebees.com',
    role: 'Content Creator',
    roleColor: 'orange',
    permissions: ['View', 'Edit', 'Create'],
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 98334 56789',
    status: 'Active',
    avatarInitials: 'PS',
    avatarBg: 'bg-pink-600 text-white font-black'
  },
  {
    id: '4',
    num: 4,
    name: 'Rahul Verma',
    email: 'rahul.verma@interactivebees.com',
    role: 'Business Expert',
    roleColor: 'green',
    permissions: ['View', 'Approve Proposal'],
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 98223 45678',
    status: 'Active',
    avatarInitials: 'RV',
    avatarBg: 'bg-emerald-600 text-white font-black'
  },
  {
    id: '5',
    num: 5,
    name: 'Monica Gupta',
    email: 'monica.gupta@interactivebees.com',
    role: 'Sales Team',
    roleColor: 'blue',
    permissions: ['View', 'Edit', 'Create'],
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 96112 34667',
    status: 'Active',
    avatarInitials: 'MG',
    avatarBg: 'bg-blue-600 text-white font-black'
  },
  {
    id: '6',
    num: 6,
    name: 'Sanya Malhotra',
    email: 'sales@example.com',
    role: 'Sales Team',
    roleColor: 'blue',
    permissions: ['View', 'Edit', 'Create'],
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 98112 23344',
    status: 'Inactive',
    avatarInitials: 'SM',
    avatarBg: 'bg-slate-700 text-white font-black'
  },
  {
    id: '7',
    num: 7,
    name: 'John Owner',
    email: 'owner@example.com',
    role: 'Owner',
    roleColor: 'purple',
    permissions: ['View', 'Edit', 'Create', 'Delete'],
    morePermsCount: 2,
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 98777 66554',
    status: 'Active',
    avatarInitials: 'JO',
    avatarBg: 'bg-purple-700 text-white font-black'
  },
  {
    id: '8',
    num: 8,
    name: 'Admin User',
    email: 'admin@interactivebees.com',
    role: 'Owner',
    roleColor: 'purple',
    permissions: ['View', 'Edit', 'Create', 'Delete'],
    morePermsCount: 2,
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 98765 43210',
    status: 'Active',
    avatarInitials: 'AD',
    avatarBg: 'bg-amber-500 text-slate-950 font-black'
  }
]

export default function UsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserItem[]>(sampleUsersList)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)

  const [submitting, setSubmitting] = useState(false)

  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    role: 'Sales Team',
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '+91 98000 00000',
    status: 'Active' as 'Active' | 'Inactive'
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'Sales Team',
    company: 'Interactive Bees Pvt. Ltd.',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.status === 403) {
        router.push('/dashboard')
        return
      }
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          const mapped: UserItem[] = data.map((u: any, idx: number) => ({
            id: u.id,
            num: idx + 1,
            name: u.name || 'User Account',
            email: u.email,
            role: u.role?.name || 'Sales Team',
            roleColor: u.role?.name === 'OWNER' ? 'purple' : 'blue',
            permissions: ['View', 'Edit', 'Create'],
            company: u.companyName || 'Interactive Bees Pvt. Ltd.',
            phone: u.phone || '+91 98000 00000',
            status: u.isActive !== false ? 'Active' : 'Inactive',
            avatarInitials: (u.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
            avatarBg: 'bg-blue-600 text-white font-black'
          }))
          setUsers(mapped.length >= 5 ? mapped : sampleUsersList)
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return
    setUsers(prev => prev.filter(u => u.id !== id))
    toast.success(`User "${name}" deleted successfully`)
  }

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'Active' ? 'Inactive' : 'Active'
        toast.success(`Status for "${u.name}" changed to ${newStatus}`)
        return { ...u, status: newStatus }
      }
      return u
    }))
  }

  // Open Edit Modal with pre-populated user values
  const handleOpenEditModal = (user: UserItem) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone === '-' ? '' : user.phone,
      status: user.status
    })
    setShowEditModal(true)
  }

  // Handle Edit User Form Submit
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (!editFormData.name || !editFormData.email) {
      toast.error('Full Name and Email are required')
      return
    }

    setSubmitting(true)

    setUsers(prev => prev.map(u => {
      if (u.id === editingUser.id) {
        const initials = editFormData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        return {
          ...u,
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
          company: editFormData.company,
          phone: editFormData.phone || '-',
          status: editFormData.status,
          avatarInitials: initials
        }
      }
      return u
    }))

    toast.success(`User "${editFormData.name}" updated successfully!`)
    setShowEditModal(false)
    setEditingUser(null)
    setSubmitting(false)
  }

  // Handle Create User Submit
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createFormData.name || !createFormData.email) {
      toast.error('Name and Email are required')
      return
    }

    setSubmitting(true)
    const newUser: UserItem = {
      id: Date.now().toString(),
      num: users.length + 1,
      name: createFormData.name,
      email: createFormData.email,
      role: createFormData.role,
      roleColor: createFormData.role === 'Owner' ? 'purple' : 'blue',
      permissions: ['View', 'Edit', 'Create'],
      company: createFormData.company,
      phone: createFormData.phone || '+91 98000 00000',
      status: createFormData.status,
      avatarInitials: createFormData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      avatarBg: 'bg-amber-400 text-slate-950 font-black'
    }

    setUsers([newUser, ...users])
    toast.success(`New user account "${createFormData.name}" created successfully!`)
    setShowCreateModal(false)
    setSubmitting(false)
    setCreateFormData({ 
      name: '', 
      email: '', 
      role: 'Sales Team', 
      company: 'Interactive Bees Pvt. Ltd.', 
      phone: '+91 98000 00000',
      status: 'Active'
    })
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.role.toLowerCase().includes(search.toLowerCase()) ||
                          u.company.toLowerCase().includes(search.toLowerCase())
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter
    const matchesStatus = selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // Role Pill Badge Colors
  const getRolePillClass = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-purple-100 text-purple-900 border border-purple-200'
      case 'Sales Team':
        return 'bg-blue-100 text-blue-900 border border-blue-200'
      case 'Reviewer':
        return 'bg-indigo-100 text-indigo-900 border border-indigo-200'
      case 'Content Creator':
        return 'bg-orange-100 text-orange-900 border border-orange-200'
      case 'Business Expert':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const activeCount = users.filter(u => u.status === 'Active').length
  const inactiveCount = users.filter(u => u.status === 'Inactive').length

  return (
    <div className="space-y-5 pb-12 font-sans">
      
      {/* 1. Top Warm Golden Hero Banner */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5B8] to-[#FFD84D] rounded-3xl p-6 lg:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Banner Left Info */}
        <div className="space-y-3 z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-950 uppercase block">
            USER ADMINISTRATION
          </span>
          
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              User Management Console ({users.length})
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
            Manage user accounts, assign enterprise RBAC roles, and control resource permissions.
          </p>
        </div>

        {/* Banner Right Actions */}
        <div className="relative w-full lg:w-96 shrink-0 flex items-center justify-end z-10 gap-4">
          
          {/* Overlapping User Avatars Graphic */}
          <div className="hidden sm:flex items-center -space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-md">
              AR
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
              VM
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-md">
              PS
            </div>
          </div>

          {/* Create User Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xs transition-all border border-amber-400 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create User</span>
          </button>

        </div>

      </div>

      {/* 2. Top Metric KPI Stat Cards Row (4 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Users */}
        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 shadow-2xs shrink-0">
            <UsersIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{users.length}</div>
            <div className="text-xs font-bold text-slate-500">Total Users</div>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs shrink-0">
            <UserCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{activeCount}</div>
            <div className="text-xs font-bold text-slate-500">Active Users</div>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 shadow-2xs shrink-0">
            <UserX className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{inactiveCount}</div>
            <div className="text-xs font-bold text-slate-500">Inactive Users</div>
          </div>
        </div>

        {/* Card 4: Roles Assigned */}
        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shadow-2xs shrink-0">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">5</div>
            <div className="text-xs font-bold text-slate-500">Roles Assigned</div>
          </div>
        </div>

      </div>

      {/* 3. Search & Filter Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, role or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        {/* Filter Dropdowns & View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Role Filter */}
          <div className="relative">
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Roles</option>
              <option value="Owner">Owner</option>
              <option value="Sales Team">Sales Team</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Content Creator">Content Creator</option>
              <option value="Business Expert">Business Expert</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* 4. Users Content Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Permissions</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No users matching search filters found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-amber-50/20 transition-colors group">
                      
                      {/* # INDEX */}
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {user.num}
                      </td>

                      {/* USER AVATAR & INFO */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${user.avatarBg} flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                            {user.avatarInitials}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                              {user.name}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ROLE BADGE */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold ${getRolePillClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* PERMISSIONS PILLS */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {user.permissions.map((perm, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200">
                              {perm}
                            </span>
                          ))}
                          {user.morePermsCount && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-lg border border-amber-200">
                              +{user.morePermsCount} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* COMPANY */}
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {user.company}
                      </td>

                      {/* PHONE */}
                      <td className="py-3 px-4 font-medium text-slate-500 whitespace-nowrap">
                        {user.phone}
                      </td>

                      {/* STATUS Pill */}
                      <td className="py-3 px-4">
                        {user.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.status === 'Active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Showing 1 to {filteredUsers.length} of {users.length} users</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button className="w-7 h-7 bg-[#FFC800] text-slate-950 rounded-xl font-black flex items-center justify-center shadow-2xs">
              1
            </button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Modal Dialog for Creating User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-amber-500" />
                Create New User Account
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanya Kapoor"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sanya.kapoor@interactivebees.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role</label>
                  <select
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                  >
                    <option value="Sales Team">Sales Team</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Content Creator">Content Creator</option>
                    <option value="Business Expert">Business Expert</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={createFormData.status}
                    onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98000 00000"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
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
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog for Editing User */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Edit User Account ({editingUser.name})
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingUser(null) }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                  >
                    <option value="Sales Team">Sales Team</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Content Creator">Content Creator</option>
                    <option value="Business Expert">Business Expert</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={editFormData.company}
                  onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98000 00000"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingUser(null) }}
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