'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import IbeesLogo from '@/components/IbeesLogo'
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  Users, 
  ShieldCheck, 
  Settings, 
  Headset, 
  Search, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown,
  Building2,
  BookOpen,
  FolderGit2,
  Calculator,
  CheckSquare,
  BarChart3,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react'

interface DashboardNavigationProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
  children: React.ReactNode
}

export default function DashboardNavigation({ user, children }: DashboardNavigationProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Proposals', href: '/dashboard/proposals', icon: FileText },
    { name: 'Templates', href: '/dashboard/templates', icon: Layers },
    { name: 'Clients (CRM)', href: '/dashboard/clients', icon: Building2 },
    { name: 'Content Library', href: '/dashboard/content-library', icon: BookOpen },
    { name: 'Asset Library', href: '/dashboard/asset-library', icon: FolderGit2 },
    { name: 'Pricing Module', href: '/dashboard/pricing', icon: Calculator },
    { name: 'Approvals Engine', href: '/dashboard/approvals', icon: CheckSquare },
    { name: 'Reports & Analytics', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Sparkles },
    { name: 'Users', href: '/dashboard/users', icon: Users, roleRequired: 'OWNER' },
    { name: 'Roles & Permissions', href: '/dashboard/roles', icon: ShieldCheck, roleRequired: 'OWNER' },
    { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: FileSpreadsheet, roleRequired: 'OWNER' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  // Keyboard shortcut listener for ⌘K / Ctrl+K / /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchModalOpen((prev) => !prev)
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setSearchModalOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const sampleNotifications = [
    { id: '1', title: 'New proposal "Centuryply Warranty Portal" submitted', time: '10m ago', unread: true },
    { id: '2', title: 'Approval granted for "Canon Security Upgrade"', time: '1h ago', unread: true },
    { id: '3', title: 'Client "Tata Motors Ltd." added to CRM', time: '3h ago', unread: false },
  ]

  const quickSearchLinks = [
    { title: 'ASDC Website Revamp Proposal', type: 'Proposal', href: '/dashboard/proposals/1' },
    { title: 'Centuryply Warranty Portal Scope', type: 'Proposal', href: '/dashboard/proposals/2' },
    { title: 'Canon India Pvt. Ltd.', type: 'Client CRM', href: '/dashboard/clients' },
    { title: 'Web Portal Development Template', type: 'Template', href: '/dashboard/templates' },
    { title: 'Enterprise ERP Implementation Template', type: 'Template', href: '/dashboard/templates' },
  ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatRole = (role?: string | null) => {
    if (!role) return 'Owner'
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between shadow-2xs shrink-0">
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo on Left */}
          <IbeesLogo />
        </div>

        {/* Center/Right Section: Search Bar & User Profile */}
        <div className="flex items-center gap-4 sm:gap-5">
          
          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden md:flex items-center justify-between w-72 lg:w-96 px-4 py-2 text-xs font-medium bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-all text-slate-400 text-left shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium truncate">Search proposals, templates, clients...</span>
            </div>
            <kbd className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs shrink-0">
              /
            </kbd>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                1
              </span>
            </button>

            {/* Notifications Dropdown Tray */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Notifications</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                    1 Unread
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {sampleNotifications.map((n) => (
                    <div key={n.id} className={`p-3 text-xs hover:bg-slate-50 transition-colors ${n.unread ? 'bg-amber-50/40' : ''}`}>
                      <p className="font-bold text-slate-800 leading-snug">{n.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors text-left"
            >
              {/* Avatar Circle in Golden Yellow */}
              <div className="w-9 h-9 rounded-full bg-[#CA8A04] text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>

              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold text-slate-900 leading-none">
                    {user?.name || 'Admin'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium leading-tight block mt-0.5 max-w-[140px] truncate">
                  {user?.email || 'admin@interactivebees.com'}
                </span>
              </div>

              {/* Role Badge */}
              <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold bg-amber-100/80 text-amber-900 rounded-full border border-amber-200/60 ml-0.5">
                <span>{formatRole(user?.role)}</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </span>
            </button>

            {/* User Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Admin'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@interactivebees.com'}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                    {formatRole(user?.role)}
                  </span>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100 mt-1"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Menu */}
        <aside
          className={`fixed lg:sticky top-16 inset-y-0 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200/80 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col justify-between p-3.5 shadow-2xs shrink-0 overflow-y-auto`}
        >
          <div className="space-y-4 pt-1">
            
            {/* Mobile Header Inside Sidebar */}
            <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-100">
              <span className="text-sm font-extrabold text-slate-900">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                if (item.roleRequired && user?.role !== item.roleRequired && user?.role !== 'ADMIN') {
                  // Keep links accessible for admin demo
                }
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
                      isActive
                        ? 'bg-[#FEF08A] text-slate-950 font-black shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Bottom Section */}
          <div className="pt-3 border-t border-slate-100 space-y-3 shrink-0">
            
            {/* Soft Yellow Bee Badge Card */}
            <div className="p-3 bg-gradient-to-br from-[#FFFDF0] via-[#FFFBEB] to-[#FEF08A]/60 rounded-2xl border border-amber-200/80 shadow-2xs relative overflow-hidden flex items-center gap-3">
              {/* Flying Bee Icon */}
              <div className="w-9 h-9 rounded-xl bg-[#FFC800] flex items-center justify-center text-slate-950 font-black text-base shadow-2xs shrink-0 border border-amber-400">
                🐝
              </div>
              <div className="font-serif italic font-bold text-xs text-amber-900 leading-tight">
                <p>we believe.</p>
                <p>we can.</p>
              </div>
            </div>

            {/* Help & Support Link */}
            <Link
              href="/help"
              className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Headset className="w-4 h-4 text-slate-400" />
              <span>Help &amp; Support</span>
            </Link>

            {/* Copyright Footer */}
            <div className="px-3 text-[10px] text-slate-400 font-medium space-y-0.5">
              <p className="font-semibold text-slate-500">Interactive Bees Pvt. Ltd.</p>
              <p>© 2026 iBees Proposal Builder v1.0.0</p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 min-w-0 bg-[#F8FAFC]">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>

      {/* Global Search Modal Overlay */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search proposals, templates, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 text-sm font-medium border border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {quickSearchLinks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No matching results found for "{searchQuery}".
                </div>
              ) : (
                quickSearchLinks.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setSearchModalOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/60 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {item.title}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        {item.type}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 group-hover:text-amber-600 transition-colors" />
                  </Link>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold px-2">
              <span>Press <kbd className="px-1 bg-slate-100 rounded">ESC</kbd> or click outside to close</span>
              <span>Global Search v1.0</span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
