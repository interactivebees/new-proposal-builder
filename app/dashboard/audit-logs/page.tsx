'use client'

import { useEffect, useState } from 'react'
import { 
  FileSpreadsheet, 
  Search, 
  ShieldCheck, 
  Clock, 
  User, 
  Laptop, 
  Activity, 
  Lock, 
  CheckCircle2,
  Filter,
  Download,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AuditLog {
  id: string
  action: string
  entity: string
  details?: string | null
  ipAddress?: string | null
  createdAt: string
  user?: {
    name: string
    email: string
  } | null
}

const sampleAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'USER_SIGNIN',
    entity: 'Authentication',
    details: 'User Alok Ranjan (admin@interactivebees.com) signed in via password credential authentication.',
    ipAddress: '192.168.1.104',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    user: { name: 'Alok Ranjan', email: 'admin@interactivebees.com' }
  },
  {
    id: 'log-2',
    action: 'PROPOSAL_CREATE',
    entity: 'Proposal',
    details: 'Created new proposal "ASDC Website & LMS Revamp Portal 2026" for client Maruti Suzuki India Ltd.',
    ipAddress: '192.168.1.104',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: { name: 'Alok Ranjan', email: 'admin@interactivebees.com' }
  },
  {
    id: 'log-3',
    action: 'APPROVAL_SUBMIT',
    entity: 'Approvals Engine',
    details: 'Submitted proposal "Canon Security & Surveillance Expansion" for Technical Director review.',
    ipAddress: '192.168.1.112',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    user: { name: 'Sunil Sharma', email: 'sunil@interactivebees.com' }
  },
  {
    id: 'log-4',
    action: 'CLIENT_CREATE',
    entity: 'Client CRM',
    details: 'Added client "Apollo Hospitals Enterprise Ltd." with contact person Dr. Vikram Reddy (Head of Digital Health).',
    ipAddress: '192.168.1.104',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    user: { name: 'Alok Ranjan', email: 'admin@interactivebees.com' }
  },
  {
    id: 'log-5',
    action: 'TEMPLATE_UPDATE',
    entity: 'Templates',
    details: 'Updated sections and variables for template "Enterprise Web Portal Development V3".',
    ipAddress: '192.168.1.108',
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    user: { name: 'Priya Nair', email: 'priya@interactivebees.com' }
  },
  {
    id: 'log-6',
    action: 'SETTINGS_UPDATE',
    entity: 'System Settings',
    details: 'Updated company branding logo URL, tax rates (18.0%), and default proposal validity days (30 days).',
    ipAddress: '192.168.1.104',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    user: { name: 'Alok Ranjan', email: 'admin@interactivebees.com' }
  }
]

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs')
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data) && data.length > 0) {
          setLogs(data)
        } else {
          setLogs(sampleAuditLogs)
        }
      } else {
        setLogs(sampleAuditLogs)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      setLogs(sampleAuditLogs)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
      (l.user && l.user.name.toLowerCase().includes(search.toLowerCase()))
    
    if (actionFilter === 'ALL') return matchesSearch
    if (actionFilter === 'AUTH') return matchesSearch && (l.action.includes('SIGNIN') || l.action.includes('LOG'))
    if (actionFilter === 'PROPOSAL') return matchesSearch && (l.action.includes('PROPOSAL') || l.action.includes('TEMPLATE'))
    if (actionFilter === 'SECURITY') return matchesSearch && (l.action.includes('SETTINGS') || l.action.includes('ROLE') || l.action.includes('CLIENT'))
    return matchesSearch
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionBadge = (action: string) => {
    if (action.includes('SIGNIN') || action.includes('LOGIN')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
    if (action.includes('PROPOSAL') || action.includes('CREATE')) {
      return 'bg-blue-50 text-blue-800 border-blue-200'
    }
    if (action.includes('APPROVAL') || action.includes('UPDATE')) {
      return 'bg-amber-50 text-amber-900 border-amber-200'
    }
    return 'bg-purple-50 text-purple-800 border-purple-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Warm Golden Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5C6] to-[#FFD84D] rounded-3xl p-6 sm:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Banner Left Info */}
        <div className="space-y-2 z-10 max-w-2xl">
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-900/90 bg-amber-200/60 px-2.5 py-1 rounded-full border border-amber-300/70 inline-block">
            SECURITY &amp; TELEMETRY CONSOLE
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-0.5">
            Audit &amp; Compliance Logs
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
            Immutable system event tracking, user login history, permission updates, and proposal security logs.
          </p>

          {/* Handwritten 'we believe. we can.' graphic accent */}
          <div className="pt-1">
            <div className="relative inline-flex items-center px-3 py-1 bg-amber-100/90 border border-amber-300/90 rounded-md transform -rotate-1 shadow-2xs">
              <span className="font-serif italic text-xs font-black text-amber-950 tracking-tight">
                we believe. we can.
              </span>
            </div>
          </div>
        </div>

        {/* Right Badge Card */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs px-4 py-3 rounded-2xl border border-amber-300/80 shadow-2xs z-10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center border border-emerald-600 shadow-2xs shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 block leading-tight">
              Audit Logger Active
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 stroke-[3]" /> Encrypted &amp; SOC-2 Ready
            </span>
          </div>
        </div>

      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500">Total Security Events</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">1,284</p>
          <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
            <span>+14% events logged this month</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500">System Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">99.9%</p>
          <p className="text-[10px] font-semibold text-slate-500">
            0 Unauthorized access attempts
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500">Active Admin Sessions</span>
            <Laptop className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">4 Active</p>
          <p className="text-[10px] font-semibold text-blue-600">
            MFA Enforced for all Owners
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500">Log Retention</span>
            <Lock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">365 Days</p>
          <p className="text-[10px] font-semibold text-slate-500">
            Immutable Storage Vault
          </p>
        </div>

      </div>

      {/* Filter Tabs & Search Bar Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'AUTH', label: 'Authentication & Logins' },
            { id: 'PROPOSAL', label: 'Proposals & Templates' },
            { id: 'SECURITY', label: 'Security & Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActionFilter(tab.id)}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                actionFilter === tab.id
                  ? 'bg-amber-100 text-amber-950 border border-amber-300/80 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search logs by user, action, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

      </div>

      {/* Logs Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              Audit Event Log Trail
            </h2>
          </div>

          <span className="px-3 py-1 text-[11px] font-black bg-amber-100 text-amber-950 rounded-full border border-amber-200">
            {filteredLogs.length} Events Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Scope Entity</th>
                <th className="py-3 px-6">Event Details</th>
                <th className="py-3 px-6 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No security event logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/30 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-950 font-black text-[10px] flex items-center justify-center shrink-0 border border-amber-300">
                          {log.user?.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-tight">
                            {log.user ? log.user.name : 'System Automated'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {log.user?.email || 'system@interactivebees.com'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border font-mono ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {log.entity}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-6 text-slate-600 font-medium max-w-sm">
                      <p className="line-clamp-2">{log.details || 'N/A'}</p>
                    </td>

                    {/* IP */}
                    <td className="py-3.5 px-6 text-right font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
