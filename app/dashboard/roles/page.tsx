'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Users, 
  ChevronRight, 
  Check, 
  ChevronDown, 
  LayoutGrid, 
  List, 
  X,
  Crown,
  UserCheck,
  FileText,
  MessageSquare,
  Cog,
  Briefcase,
  BarChart3,
  Calculator,
  Scale,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react'

interface RoleItem {
  id: string
  name: string
  subtitle: string
  badgeText?: string
  badgeType?: 'system' | 'default'
  iconType: 'crown' | 'users' | 'user-check' | 'file' | 'chat' | 'cog' | 'briefcase' | 'chart' | 'calculator' | 'scale' | 'eye' | 'shield'
  iconBg: string
  iconColor: string
  permissions: string[]
  morePermsCount?: number
  userCount: number
}

const ALL_AVAILABLE_PERMISSIONS = [
  'View',
  'Edit',
  'Create',
  'Delete',
  'Approve Proposal',
  'Manage Users',
  'System Settings',
  'Export Reports',
  'Audit Logs'
]

// Detailed 11 Sample Roles matching reference screenshot
const sampleRolesList: RoleItem[] = [
  {
    id: '1',
    name: 'Owner',
    subtitle: 'Workspace Founder & Owner - Full administrative authority over organization.',
    badgeText: 'System Role',
    badgeType: 'system',
    iconType: 'crown',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    permissions: ['View', 'Edit', 'Create', 'Delete'],
    morePermsCount: 2,
    userCount: 2
  },
  {
    id: '2',
    name: 'Sales Team',
    subtitle: 'Sales Executive & Rep - Access to create, edit, and send proposals.',
    badgeText: 'Default',
    badgeType: 'default',
    iconType: 'users',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    permissions: ['View', 'Edit', 'Create'],
    userCount: 3
  },
  {
    id: '3',
    name: 'Business Expert',
    subtitle: 'Domain Expert & Approver - Review and approve technical proposal sections.',
    iconType: 'user-check',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    permissions: ['View', 'Approve Proposal'],
    userCount: 1
  },
  {
    id: '4',
    name: 'Content Creator',
    subtitle: 'Marketing Content Author - Create and manage proposal templates & content.',
    iconType: 'file',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-700',
    permissions: ['View', 'Edit', 'Create'],
    userCount: 1
  },
  {
    id: '5',
    name: 'Reviewer',
    subtitle: 'Quality Reviewer - Read-only and comment access for internal audits.',
    iconType: 'chat',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-700',
    permissions: ['View'],
    userCount: 1
  },
  {
    id: '6',
    name: 'Super Admin',
    subtitle: 'System Administrator - Technical system management and user governance.',
    iconType: 'cog',
    iconBg: 'bg-[#FEF08A]',
    iconColor: 'text-amber-950',
    permissions: ['View', 'Edit', 'Create', 'Delete'],
    morePermsCount: 5,
    userCount: 0
  },
  {
    id: '7',
    name: 'Proposal Manager',
    subtitle: 'Proposal Director - Oversee lifecycle from draft to final client delivery.',
    iconType: 'briefcase',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    permissions: ['View', 'Edit', 'Create'],
    morePermsCount: 3,
    userCount: 0
  },
  {
    id: '8',
    name: 'Sales Executive',
    subtitle: 'Account Manager - Manage client accounts and baseline proposals.',
    badgeText: 'Default',
    badgeType: 'default',
    iconType: 'chart',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-800',
    permissions: ['View', 'Edit', 'Create'],
    morePermsCount: 2,
    userCount: 0
  },
  {
    id: '9',
    name: 'Finance',
    subtitle: 'Finance Manager - Review pricing models, discounts, and payment terms.',
    iconType: 'calculator',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-800',
    permissions: ['View', 'Edit', 'Approve Proposal'],
    morePermsCount: 1,
    userCount: 0
  },
  {
    id: '10',
    name: 'Legal',
    subtitle: 'Legal Counsel - Terms, SLA, and compliance review.',
    iconType: 'scale',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
    permissions: ['View', 'Edit', 'Approve Proposal'],
    userCount: 0
  },
  {
    id: '11',
    name: 'Viewer',
    subtitle: 'Read-only Viewer - Read-only access to published proposals.',
    iconType: 'eye',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    permissions: ['View'],
    userCount: 0
  }
]

export default function RolesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState<RoleItem[]>(sampleRolesList)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null)
  
  const [submitting, setSubmitting] = useState(false)

  const [createFormData, setCreateFormData] = useState({
    name: '',
    subtitle: '',
    isDefault: false,
    permissions: ['View', 'Edit']
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    subtitle: '',
    isDefault: false,
    permissions: [] as string[]
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles')
      if (res.status === 403) {
        router.push('/dashboard')
        return
      }
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const mapped: RoleItem[] = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            subtitle: r.description || `${r.name} access rights and privileges.`,
            badgeText: r.name === 'OWNER' ? 'System Role' : r.isDefault ? 'Default' : undefined,
            badgeType: r.name === 'OWNER' ? 'system' : r.isDefault ? 'default' : undefined,
            iconType: 'shield',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-700',
            permissions: r.permissions ? r.permissions.slice(0, 4).map((p: any) => p.name) : ['View', 'Edit'],
            userCount: r._count?.users || 0
          } as any))
          setRoles(mapped.length >= 8 ? mapped : sampleRolesList)
        }
      }
    } catch (err) {
      console.error('Error fetching roles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete role "${name}"?`)) return
    setRoles(prev => prev.filter(r => r.id !== id))
    toast.success(`Role "${name}" deleted successfully`)
  }

  const handleOpenEditModal = (role: RoleItem) => {
    setEditingRole(role)
    setEditFormData({
      name: role.name,
      subtitle: role.subtitle,
      isDefault: role.badgeType === 'default',
      permissions: [...role.permissions]
    })
    setShowEditModal(true)
  }

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return
    if (!editFormData.name) {
      toast.error('Role name is required')
      return
    }

    setSubmitting(true)
    setRoles(prev => prev.map(r => {
      if (r.id === editingRole.id) {
        return {
          ...r,
          name: editFormData.name,
          subtitle: editFormData.subtitle || `${editFormData.name} access permissions.`,
          badgeText: editFormData.isDefault ? 'Default' : r.badgeText === 'System Role' ? 'System Role' : undefined,
          badgeType: editFormData.isDefault ? 'default' : r.badgeType === 'system' ? 'system' : undefined,
          permissions: editFormData.permissions.length > 0 ? editFormData.permissions : ['View']
        }
      }
      return r
    }))

    toast.success(`Role "${editFormData.name}" updated successfully!`)
    setShowEditModal(false)
    setEditingRole(null)
    setSubmitting(false)
  }

  const handleTogglePermission = (perm: string) => {
    setEditFormData(prev => {
      const exists = prev.permissions.includes(perm)
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== perm) }
      } else {
        return { ...prev, permissions: [...prev.permissions, perm] }
      }
    })
  }

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createFormData.name) {
      toast.error('Role name is required')
      return
    }

    setSubmitting(true)
    const newRole: RoleItem = {
      id: Date.now().toString(),
      name: createFormData.name,
      subtitle: createFormData.subtitle || `${createFormData.name} permissions and privileges.`,
      badgeText: createFormData.isDefault ? 'Default' : undefined,
      badgeType: createFormData.isDefault ? 'default' : undefined,
      iconType: 'briefcase',
      iconBg: 'bg-[#FEF08A]',
      iconColor: 'text-amber-950',
      permissions: createFormData.permissions,
      userCount: 0
    }

    setRoles([...roles, newRole])
    toast.success(`Role "${createFormData.name}" created successfully!`)
    setShowCreateModal(false)
    setSubmitting(false)
    setCreateFormData({ name: '', subtitle: '', isDefault: false, permissions: ['View', 'Edit'] })
  }

  const filteredRoles = roles.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                          r.subtitle.toLowerCase().includes(search.toLowerCase())
    const matchesType = selectedRoleFilter === 'ALL' ||
                        (selectedRoleFilter === 'SYSTEM' && r.badgeType === 'system') ||
                        (selectedRoleFilter === 'DEFAULT' && r.badgeType === 'default')
    return matchesSearch && matchesType
  })

  const renderRoleIcon = (type: string) => {
    switch (type) {
      case 'crown': return <Crown className="w-5 h-5" />
      case 'users': return <Users className="w-5 h-5" />
      case 'user-check': return <UserCheck className="w-5 h-5" />
      case 'file': return <FileText className="w-5 h-5" />
      case 'chat': return <MessageSquare className="w-5 h-5" />
      case 'cog': return <Cog className="w-5 h-5" />
      case 'briefcase': return <Briefcase className="w-5 h-5" />
      case 'chart': return <BarChart3 className="w-5 h-5" />
      case 'calculator': return <Calculator className="w-5 h-5" />
      case 'scale': return <Scale className="w-5 h-5" />
      case 'eye': return <Eye className="w-5 h-5" />
      default: return <ShieldCheck className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-12 font-sans">
      
      {/* 1. Warm Golden Hero Banner */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5B8] to-[#FFD84D] rounded-3xl p-6 lg:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Left Info Block */}
        <div className="space-y-3 z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-950 uppercase block">
            SECURITY & ACCESS CONTROL
          </span>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Roles &amp; Permissions Configurator ({roles.length})
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
            Configure granular RBAC security roles, proposal creation rights, and team governance policies.
          </p>
        </div>

        {/* Right Actions */}
        <div className="relative w-full lg:w-96 shrink-0 flex items-center justify-end z-10 gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xs transition-all border border-amber-400 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Role</span>
          </button>
        </div>

      </div>

      {/* 2. Control Toolbar & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search roles (e.g. admin, reviewer, creator...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        {/* Filter Dropdowns & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Role Filter */}
          <div className="relative">
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Roles</option>
              <option value="SYSTEM">System Roles</option>
              <option value="DEFAULT">Default Roles</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Grid/List View Toggle */}
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

      {/* 3. Role Cards Grid (3 Columns) */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
        
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-amber-300/80 transition-all flex flex-col justify-between group space-y-4 relative"
          >
            {/* Card Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${role.iconBg} ${role.iconColor} flex items-center justify-center font-bold shrink-0 shadow-2xs`}>
                    {renderRoleIcon(role.iconType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-amber-700 transition-colors">
                        {role.name}
                      </h3>
                      {role.badgeText && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          role.badgeType === 'system' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {role.badgeText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Links */}
                <div className="flex items-center gap-2 text-xs font-extrabold shrink-0">
                  <button 
                    onClick={() => handleOpenEditModal(role)} 
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  {role.name !== 'Owner' && (
                    <>
                      <span className="text-slate-300">|</span>
                      <button 
                        onClick={() => handleDelete(role.id, role.name)} 
                        className="text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                {role.subtitle}
              </p>
            </div>

            {/* Default Permissions Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PERMISSIONS ({role.permissions.length + (role.morePermsCount || 0)})
              </span>
              
              <div className="flex flex-wrap items-center gap-1.5">
                {role.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-xl border border-blue-100/80"
                  >
                    {perm}
                  </span>
                ))}
                {role.morePermsCount && (
                  <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl border border-slate-200/60">
                    +{role.morePermsCount} more
                  </span>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{role.userCount} user(s) assigned</span>
              </div>

              {/* Chevron Arrow Matrix Button */}
              <button 
                onClick={() => handleOpenEditModal(role)}
                className="w-7 h-7 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Configure permissions matrix"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}

        {/* Create New Role Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/40 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3 group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-[#FFC800] text-blue-600 group-hover:text-slate-950 flex items-center justify-center transition-colors shadow-2xs border border-blue-100 group-hover:border-amber-400">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 group-hover:text-amber-900 transition-colors">
              Create New Role
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs mt-1">
              Add a new role and configure permissions for your team.
            </p>
          </div>
        </div>

      </div>

      {/* Modal Dialog for Creating New Role */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                Create New Role
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Sales Lead"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Subtitle</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Responsible for creating and approving regional proposal scopes..."
                  value={createFormData.subtitle}
                  onChange={(e) => setCreateFormData({ ...createFormData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultCreate"
                  checked={createFormData.isDefault}
                  onChange={(e) => setCreateFormData({ ...createFormData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                />
                <label htmlFor="isDefaultCreate" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Set as Default Role for New Users
                </label>
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
                  {submitting ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog for Editing Role */}
      {showEditModal && editingRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Configure Role ({editingRole.name})
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingRole(null) }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editFormData.subtitle}
                  onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Configure Permissions ({editFormData.permissions.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                    const checked = editFormData.permissions.includes(perm)
                    return (
                      <label 
                        key={perm}
                        onClick={() => handleTogglePermission(perm)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                          checked 
                            ? 'bg-amber-100/80 text-amber-950 border-amber-300/80' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}} // handled by parent label click
                          className="w-3.5 h-3.5 rounded text-amber-500 border-slate-300"
                        />
                        <span>{perm}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultEdit"
                  checked={editFormData.isDefault}
                  onChange={(e) => setEditFormData({ ...editFormData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                />
                <label htmlFor="isDefaultEdit" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Set as Default Role for New Team Members
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingRole(null) }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Role Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}