import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, 
  Layers, 
  Users, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  Settings,
  Sparkles,
  ChevronDown,
  MoreVertical,
  Building2,
  Edit3,
  Wand2,
  FileCheck,
  Globe
} from 'lucide-react'

// Helper for dynamic greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'GOOD MORNING,'
  if (hour < 18) return 'GOOD AFTERNOON,'
  return 'GOOD EVENING,'
}

// Helper for status badge styling matching reference design exactly
function getStatusBadgeInfo(status: string) {
  const norm = (status || '').toUpperCase().replace(/[\s_]+/g, '_')
  if (norm.includes('PENDING') || norm === 'PENDING_APPROVAL') {
    return {
      text: 'Pending Approval',
      badgeClass: 'bg-[#FEF08A] text-amber-950 border border-amber-300/80 shadow-2xs'
    }
  }
  if (norm.includes('APPROVED')) {
    return {
      text: 'Approved',
      badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-200/80 shadow-2xs'
    }
  }
  if (norm.includes('SENT')) {
    return {
      text: 'Sent',
      badgeClass: 'bg-purple-100 text-purple-950 border border-purple-200/80 shadow-2xs'
    }
  }
  if (norm.includes('REVIEW') || norm === 'IN_REVIEW') {
    return {
      text: 'In Review',
      badgeClass: 'bg-amber-100 text-amber-950 border border-amber-200/80 shadow-2xs'
    }
  }
  return {
    text: 'Draft',
    badgeClass: 'bg-blue-100 text-blue-950 border border-blue-200/80 shadow-2xs'
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  // Fetch live counts and proposals from database
  const [proposalsCount, templatesCount, usersCount, rolesCount, dbProposals] = await Promise.all([
    prisma.proposal.count().catch(() => 25),
    prisma.template.count().catch(() => 19),
    prisma.user.count().catch(() => 8),
    prisma.role.count().catch(() => 11),
    prisma.proposal.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: { creator: true }
    }).catch(() => [])
  ])

  // Realistic sample proposals matching the reference UI exactly
  const rawSampleProposals = [
    { 
      id: '1', 
      num: 1,
      title: 'Maruti Suzuki Cloud Architecture Migration', 
      clientName: 'Maruti Suzuki India Limited', 
      status: 'PENDING_APPROVAL', 
      updatedAt: 'Sep 17, 2026',
      owner: 'RS'
    },
    { 
      id: '2', 
      num: 2,
      title: 'Apollo Telehealth App & Integration', 
      clientName: 'Apollo Hospitals Enterprise', 
      status: 'APPROVED', 
      updatedAt: 'Sep 17, 2026',
      owner: 'AP'
    },
    { 
      id: '3', 
      num: 3,
      title: 'Tata Motors Supply Chain Analytics Dashboard', 
      clientName: 'Tata Motors Limited', 
      status: 'SENT', 
      updatedAt: 'Sep 17, 2026',
      owner: 'PK'
    },
    { 
      id: '4', 
      num: 4,
      title: 'Indorama Industry 4.0 Portal Revamp', 
      clientName: 'Indorama Synthetics Ltd.', 
      status: 'IN_REVIEW', 
      updatedAt: 'Sep 17, 2026',
      owner: 'SK'
    },
    { 
      id: '5', 
      num: 5,
      title: 'NASSCOM Annual Event Web Ecosystem', 
      clientName: 'NASSCOM India', 
      status: 'DRAFT', 
      updatedAt: 'Sep 17, 2026',
      owner: 'NJ'
    },
  ]

  const displayProposals = dbProposals.length > 0 ? dbProposals.map((p, idx) => {
    const badge = getStatusBadgeInfo(p.status)
    return {
      id: p.id,
      num: idx + 1,
      title: p.title,
      clientName: p.clientName || 'Client Entity',
      status: p.status,
      statusText: badge.text,
      statusClass: badge.badgeClass,
      updatedAt: new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      owner: p.creator?.name ? p.creator.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'AB'
    }
  }) : rawSampleProposals.map((p) => {
    const badge = getStatusBadgeInfo(p.status)
    return {
      ...p,
      statusText: badge.text,
      statusClass: badge.badgeClass
    }
  })

  const userName = session.user.name || 'Admin'
  const greeting = getGreeting()

  return (
    <div className="space-y-5 pb-6 font-sans">
      
      {/* 1. Top Welcome Banner Box */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFFBEB] to-[#FEF08A]/50 rounded-2xl p-6 lg:p-7 border border-amber-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Banner Left Greeting & Tagline */}
        <div className="space-y-2 z-10 max-w-lg">
          <span className="text-[11px] font-extrabold tracking-widest text-amber-900/80 uppercase block">
            {greeting}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {userName}! <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed pt-1">
            Turn ideas into winning proposals. Create, collaborate and close more opportunities with iBees Proposal Builder.
          </p>
        </div>

        {/* Banner Center Cursive Script & Airplane Trail */}
        <div className="hidden xl:flex flex-col items-center justify-center z-10 relative">
          <div className="relative">
            <span className="font-serif italic font-bold text-2xl text-slate-800 tracking-wide inline-block -rotate-6 select-none">
              Ideas into Opportunities
            </span>
            <svg className="w-44 h-3 text-amber-400 mt-1 mx-auto" viewBox="0 0 180 12" fill="none">
              <path d="M3 9C45 3 135 2 177 9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
            
            {/* Paper Airplane Flying Out */}
            <div className="absolute -top-7 -right-8">
              <svg className="w-28 h-16 overflow-visible" viewBox="0 0 100 50" fill="none">
                <path d="M 0 45 C 30 20, 60 10, 90 5" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
                <g transform="translate(85, 0) rotate(-15) scale(0.75)">
                  <path d="M0 25 L40 0 L20 35 L12 23 Z" fill="#FFC800" stroke="#CA8A04" strokeWidth="1.2" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Banner Right: Corporate Building Graphic with Yellow iBees Signboard */}
        <div className="relative w-full lg:w-80 h-36 rounded-2xl overflow-hidden shrink-0 border border-amber-300/80 shadow-md group bg-[#0F172A]">
          {/* Glass Facade Grid Graphic */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
            <svg className="w-full h-full opacity-70" viewBox="0 0 320 150" fill="none">
              <defs>
                <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#0284C7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Glass Building Panels */}
              <polygon points="0,0 240,0 180,150 0,150" fill="url(#glassGrad)" />
              <polygon points="240,0 320,0 320,150 180,150" fill="#1E293B" fillOpacity="0.9" />
              
              {/* Architectural Glass Grid Lines */}
              <line x1="40" y1="0" x2="30" y2="150" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="80" y1="0" x2="60" y2="150" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="120" y1="0" x2="90" y2="150" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="160" y1="0" x2="120" y2="150" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="200" y1="0" x2="150" y2="150" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.3" />
              
              <line x1="0" y1="30" x2="320" y2="30" stroke="#38BDF8" strokeWidth="0.75" strokeOpacity="0.25" />
              <line x1="0" y1="65" x2="320" y2="65" stroke="#38BDF8" strokeWidth="0.75" strokeOpacity="0.25" />
              <line x1="0" y1="100" x2="320" y2="100" stroke="#38BDF8" strokeWidth="0.75" strokeOpacity="0.25" />
              <line x1="0" y1="130" x2="320" y2="130" stroke="#38BDF8" strokeWidth="0.75" strokeOpacity="0.25" />
              
              {/* Sun Light Reflection Beam */}
              <polygon points="60,0 160,0 70,150 0,150" fill="url(#shineGrad)" />
            </svg>
          </div>
          
          {/* Mounted Bright Yellow iBees Signboard Badge */}
          <div className="absolute top-4 right-4 bg-[#FFC800] text-slate-950 px-3.5 py-2 rounded-xl shadow-2xl border-2 border-amber-300 flex flex-col items-center justify-center transform rotate-1 group-hover:rotate-0 transition-transform z-10">
            <span className="font-serif italic font-black text-lg leading-none tracking-tight text-slate-950">
              iBees
            </span>
            <span className="text-[7.5px] font-serif italic text-slate-900 leading-none mt-0.5 font-bold">
              we believe. we can.
            </span>
          </div>

          <div className="absolute bottom-2.5 left-3.5 text-[10px] font-extrabold text-amber-300/90 tracking-widest uppercase z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise HQ</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        
        {/* Card 1: Proposals */}
        <Link href="/dashboard/proposals" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#FEF08A] flex items-center justify-center text-slate-950 mb-3 border border-amber-300 shadow-2xs">
              <FileText className="w-5 h-5 text-slate-950" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {proposalsCount}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Total Proposals
            </div>
            <div className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1 pt-1">
              <span>↑ +20%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
          {/* Mini Yellow Bar Chart */}
          <div className="flex items-end gap-1.5 h-12 self-end mb-1">
            <div className="w-2 h-4 bg-amber-200 rounded-t-sm" />
            <div className="w-2 h-7 bg-amber-300 rounded-t-sm" />
            <div className="w-2 h-5 bg-amber-200 rounded-t-sm" />
            <div className="w-2 h-11 bg-[#FFC800] rounded-t-sm" />
          </div>
        </Link>

        {/* Card 2: Templates */}
        <Link href="/dashboard/templates" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-900 mb-3 border border-purple-200 shadow-2xs">
              <Layers className="w-5 h-5 text-purple-900" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {templatesCount}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Templates
            </div>
            <div className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1 pt-1">
              <span>↑ +14%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
          {/* Mini Purple Bar Chart */}
          <div className="flex items-end gap-1.5 h-12 self-end mb-1">
            <div className="w-2 h-5 bg-purple-200 rounded-t-sm" />
            <div className="w-2 h-8 bg-purple-300 rounded-t-sm" />
            <div className="w-2 h-6 bg-purple-200 rounded-t-sm" />
            <div className="w-2 h-11 bg-purple-500 rounded-t-sm" />
          </div>
        </Link>

        {/* Card 3: Users */}
        <Link href="/dashboard/users" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-900 mb-3 border border-emerald-200 shadow-2xs">
              <Users className="w-5 h-5 text-emerald-900" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {usersCount}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Users
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 flex items-center gap-1 pt-1">
              <span>↑ +0%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
          {/* Mini Green Bar Chart */}
          <div className="flex items-end gap-1.5 h-12 self-end mb-1">
            <div className="w-2 h-6 bg-emerald-200 rounded-t-sm" />
            <div className="w-2 h-9 bg-emerald-300 rounded-t-sm" />
            <div className="w-2 h-7 bg-emerald-200 rounded-t-sm" />
            <div className="w-2 h-10 bg-emerald-500 rounded-t-sm" />
          </div>
        </Link>

        {/* Card 4: Roles */}
        <Link href="/dashboard/roles" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-900 mb-3 border border-orange-200 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-orange-900" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {rolesCount}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Roles
            </div>
            <div className="text-[11px] font-extrabold text-slate-500 flex items-center gap-1 pt-1">
              <span>↑ +0%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
          {/* Mini Orange Bar Chart */}
          <div className="flex items-end gap-1.5 h-12 self-end mb-1">
            <div className="w-2 h-4 bg-orange-200 rounded-t-sm" />
            <div className="w-2 h-7 bg-orange-300 rounded-t-sm" />
            <div className="w-2 h-6 bg-orange-200 rounded-t-sm" />
            <div className="w-2 h-9 bg-orange-500 rounded-t-sm" />
          </div>
        </Link>
      </div>

      {/* 3. Middle Section: Quick Access Grid & AI Assistant Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (8/12): Quick Access Block */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Quick Access
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Everything you need, in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline-block">Shortcuts</span>
              <Link 
                href="/dashboard/proposals/new"
                className="bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create New Proposal</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Shortcut 1: Create Proposal */}
            <Link href="/dashboard/proposals/new" className="bg-[#FFFDF0] hover:bg-[#FFFBEB] p-4.5 rounded-2xl border border-amber-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group h-44">
              <div className="w-10 h-10 rounded-xl bg-[#FEF08A] flex items-center justify-center text-slate-900 font-bold border border-amber-300">
                <FileText className="w-5 h-5 text-slate-900" />
              </div>
              <div className="mt-2">
                <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                  Create Proposal
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">
                  Start a new proposal with templates
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white border border-amber-200 flex items-center justify-center text-slate-600 group-hover:bg-[#FFC800] group-hover:text-slate-950 transition-colors ml-auto mt-2">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </Link>

            {/* Shortcut 2: Browse Templates */}
            <Link href="/dashboard/templates" className="bg-purple-50/40 hover:bg-purple-50/80 p-4.5 rounded-2xl border border-purple-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group h-44">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-900 font-bold border border-purple-200">
                <Layers className="w-5 h-5 text-purple-900" />
              </div>
              <div className="mt-2">
                <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-purple-800 transition-colors">
                  Browse Templates
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">
                  Use pre-built templates
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white border border-purple-200 flex items-center justify-center text-slate-600 group-hover:bg-purple-600 group-hover:text-white transition-colors ml-auto mt-2">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </Link>

            {/* Shortcut 3: Manage Clients */}
            <Link href="/dashboard/clients" className="bg-emerald-50/40 hover:bg-emerald-50/80 p-4.5 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group h-44">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold border border-emerald-200">
                <Building2 className="w-5 h-5 text-emerald-900" />
              </div>
              <div className="mt-2">
                <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  Manage Clients
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">
                  View and manage client information
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors ml-auto mt-2">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </Link>

            {/* Shortcut 4: Settings */}
            <Link href="/dashboard/settings" className="bg-orange-50/40 hover:bg-orange-50/80 p-4.5 rounded-2xl border border-orange-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group h-44">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-900 font-bold border border-orange-200">
                <Settings className="w-5 h-5 text-orange-900" />
              </div>
              <div className="mt-2">
                <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-orange-800 transition-colors">
                  Settings
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">
                  Configure your company settings
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white border border-orange-200 flex items-center justify-center text-slate-600 group-hover:bg-orange-600 group-hover:text-white transition-colors ml-auto mt-2">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column (4/12): AI Assistant Feature Card Widget */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#FFFDF0] via-[#FFFBEB] to-amber-100/60 rounded-3xl p-5 border border-amber-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Star Art */}
          <div className="absolute top-2 right-2 opacity-30 text-amber-500 pointer-events-none">
            <Sparkles className="w-16 h-16" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFC800] flex items-center justify-center text-slate-950 font-black shadow-2xs border border-amber-400">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>AI Assistant</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-200 text-amber-900 rounded-md">
                    Beta
                  </span>
                </h3>
                <p className="text-[11px] font-bold text-slate-500">
                  Write Better. Win Faster.
                </p>
              </div>
            </div>

            {/* AI Capability List */}
            <div className="space-y-1.5 pt-1 text-xs font-extrabold text-slate-700">
              <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
                <div className="p-1 bg-amber-200/70 rounded-md text-amber-900"><Edit3 className="w-3.5 h-3.5" /></div>
                <span>Generate proposal content</span>
              </div>
              <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
                <div className="p-1 bg-amber-200/70 rounded-md text-amber-900"><Wand2 className="w-3.5 h-3.5" /></div>
                <span>Improve existing content</span>
              </div>
              <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
                <div className="p-1 bg-amber-200/70 rounded-md text-amber-900"><FileCheck className="w-3.5 h-3.5" /></div>
                <span>Suggest case studies</span>
              </div>
              <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
                <div className="p-1 bg-amber-200/70 rounded-md text-amber-900"><Layers className="w-3.5 h-3.5" /></div>
                <span>Summarize requirements</span>
              </div>
              <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
                <div className="p-1 bg-amber-200/70 rounded-md text-amber-900"><Globe className="w-3.5 h-3.5" /></div>
                <span>Translate content</span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <Link
              href="/dashboard/ai-assistant"
              className="w-full py-3 px-4 rounded-2xl bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <span>Try AI Assistant</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Recent Proposals Table & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        
        {/* Recent Proposals Table (8/12) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Recent Proposals
                </h2>
                <span className="w-5 h-5 rounded-full bg-[#FFC800] text-slate-950 text-[10px] font-black flex items-center justify-center">
                  5
                </span>
              </div>
              <Link
                href="/dashboard/proposals"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-10">#</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Modified</th>
                    <th className="py-3 px-4 text-center">Owner</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayProposals.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors group">
                      <td className="py-3.5 px-4 font-bold text-slate-400 text-center">
                        {item.num}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors max-w-xs truncate">
                        <Link href={`/dashboard/proposals/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-500 max-w-[160px] truncate">
                        {item.clientName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-extrabold rounded-md whitespace-nowrap ${item.statusClass}`}>
                          {item.statusText}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-500">
                        {item.updatedAt}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center mx-auto border border-slate-300">
                          {item.owner}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed & Bottom Quote Card (4/12) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          
          {/* Recent Activity Stream */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Recent Activity
                </h2>
                <Link
                  href="/dashboard/proposals"
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Activity Timeline Stream */}
              <div className="mt-4 space-y-4 flex flex-col items-center justify-center py-8 text-center">
                <p className="text-xs font-bold text-slate-400">Activity feed coming soon</p>
              </div>
            </div>
          </div>

          {/* Bottom Quote Card */}
          <div className="bg-[#FFFDF0] border border-amber-200/80 rounded-3xl p-4 text-center shadow-2xs">
            <p className="text-xs italic font-serif font-bold text-amber-950">
              &quot;Simplify Proposals. Accelerate Growth.&quot;
            </p>
            <p className="text-[10px] font-extrabold text-amber-700/80 uppercase tracking-widest mt-1">
              — iBees
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}
