'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  IndianRupee, 
  FileText, 
  Users, 
  PieChart, 
  Download, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Calendar,
  Sparkles,
  Target,
  Star,
  ArrowRight,
  Building2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ClientData {
  name: string
  count: number
  value: number
  winRate: number
}

interface OwnerData {
  name: string
  count: number
  closedDeals: number
  value: number
  winRate: number
}

interface IndustryData {
  name: string
  percentage: number
}

interface MonthlyTrend {
  month: string
  count: number
  winRate: number
}

interface InsightData {
  id: string
  title: string
  subtitle: string
  type: string
  icon: string
}

interface ReportData {
  totalCount: number
  winRate: number
  totalPipelineValue: number
  approvedValue: number
  pendingValue: number
  draftValue: number
  closedDeals: number
  avgApprovalDays: number
  statusCounts: Record<string, number>
  topClients: ClientData[]
  ownerPerformance: OwnerData[]
  industryBreakdown: IndustryData[]
  monthlyTrends: MonthlyTrend[]
  keyInsights: InsightData[]
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const formatLakhsOrCrores = (val: number) => {
    if (val >= 10000000) {
      const cr = (val / 10000000).toFixed(1)
      return `₹ ${cr} Cr`
    }
    if (val >= 100000) {
      const l = Math.round(val / 100000)
      return `₹ ${l} L`
    }
    return `₹ ${val.toLocaleString('en-IN')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent" />
          <div className="absolute font-bold text-xs text-slate-500">iBees</div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const lifecycleItems = [
    { label: 'Draft', count: data.statusCounts['DRAFT'] || 7, color: '#3B82F6' },
    { label: 'In Review', count: data.statusCounts['IN_REVIEW'] || 6, color: '#F59E0B' },
    { label: 'Pending Approval', count: data.statusCounts['PENDING_APPROVAL'] || 3, color: '#F97316' },
    { label: 'Approved', count: data.statusCounts['APPROVED'] || 6, color: '#10B981' },
    { label: 'Sent', count: data.statusCounts['SENT'] || 3, color: '#8B5CF6' },
    { label: 'Rejected', count: data.statusCounts['REJECTED'] || 0, color: '#EF4444' },
  ]

  const totalLifecycleCount = lifecycleItems.reduce((acc, curr) => acc + curr.count, 0) || 25

  // Donut chart SVG path calculations helper
  const renderDonutSlices = (items: { count?: number; percentage?: number; color: string }[]) => {
    let cumulativePercent = 0
    return items.map((item, idx) => {
      const val = item.percentage !== undefined ? item.percentage : ((item.count || 0) / totalLifecycleCount) * 100
      if (val === 0) return null
      
      const startAngle = (cumulativePercent / 100) * 360
      cumulativePercent += val
      const endAngle = (cumulativePercent / 100) * 360

      const x1 = 50 + 40 * Math.cos((Math.PI * (startAngle - 90)) / 180)
      const y1 = 50 + 40 * Math.sin((Math.PI * (startAngle - 90)) / 180)
      const x2 = 50 + 40 * Math.cos((Math.PI * (endAngle - 90)) / 180)
      const y2 = 50 + 40 * Math.sin((Math.PI * (endAngle - 90)) / 180)

      const largeArcFlag = val > 50 ? 1 : 0

      const pathData = [
        `M ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L 50 50`,
        `Z`
      ].join(' ')

      return (
        <path
          key={idx}
          d={pathData}
          fill={item.color}
          className="transition-all duration-300 hover:opacity-90"
        />
      )
    })
  }

  // Colors for Industry breakdown donut
  const industryColors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#F97316', '#64748B']
  const industryItems = data.industryBreakdown.map((ind, i) => ({
    ...ind,
    color: industryColors[i % industryColors.length]
  }))

  return (
    <div className="space-y-5 pb-6 font-sans">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            REPORTS &amp; ANALYTICS
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Reports &amp; Analytics Suite
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
            Turn your proposal data into actionable insights. Track win rates, deal velocity, client pipeline value, and team productivity.
          </p>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Sep 01, 2026 – Sep 30, 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Total Proposals */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-700">
              <FileText className="w-4 h-4" />
            </div>
            {/* Sparkline visualization */}
            <div className="flex items-end gap-1 h-7">
              <div className="w-1.5 h-3 bg-amber-200 rounded-xs" />
              <div className="w-1.5 h-4 bg-amber-300 rounded-xs" />
              <div className="w-1.5 h-6 bg-amber-400 rounded-xs" />
              <div className="w-1.5 h-5 bg-amber-300 rounded-xs" />
              <div className="w-1.5 h-7 bg-amber-500 rounded-xs" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 block">Total Proposals</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {data.totalCount}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>20% <span className="font-normal text-slate-400">vs last month</span></span>
            </div>
          </div>
        </div>

        {/* KPI 2: Win Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 flex items-center justify-center text-emerald-700">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex items-end gap-1 h-7">
              <div className="w-1.5 h-3 bg-emerald-200 rounded-xs" />
              <div className="w-1.5 h-4 bg-emerald-300 rounded-xs" />
              <div className="w-1.5 h-5 bg-emerald-400 rounded-xs" />
              <div className="w-1.5 h-7 bg-emerald-500 rounded-xs" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 block">Win Rate</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {data.winRate}%
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>8% <span className="font-normal text-slate-400">vs last month</span></span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Pipeline Value */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-100/70 flex items-center justify-center text-blue-700">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div className="flex items-end gap-1 h-7">
              <div className="w-1.5 h-2 bg-blue-200 rounded-xs" />
              <div className="w-1.5 h-4 bg-blue-300 rounded-xs" />
              <div className="w-1.5 h-6 bg-blue-400 rounded-xs" />
              <div className="w-1.5 h-7 bg-blue-500 rounded-xs" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 block">Total Pipeline Value</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {formatLakhsOrCrores(data.totalPipelineValue)}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>32% <span className="font-normal text-slate-400">vs last month</span></span>
            </div>
          </div>
        </div>

        {/* KPI 4: Closed Deals */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-100/70 flex items-center justify-center text-purple-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex items-end gap-1 h-7">
              <div className="w-1.5 h-3 bg-purple-200 rounded-xs" />
              <div className="w-1.5 h-5 bg-purple-300 rounded-xs" />
              <div className="w-1.5 h-4 bg-purple-400 rounded-xs" />
              <div className="w-1.5 h-7 bg-purple-500 rounded-xs" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 block">Closed Deals</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {data.closedDeals}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>14% <span className="font-normal text-slate-400">vs last month</span></span>
            </div>
          </div>
        </div>

        {/* KPI 5: Avg Approval Turnaround */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex items-end gap-1 h-7">
              <div className="w-1.5 h-6 bg-amber-400 rounded-xs" />
              <div className="w-1.5 h-5 bg-amber-300 rounded-xs" />
              <div className="w-1.5 h-4 bg-amber-300 rounded-xs" />
              <div className="w-1.5 h-3 bg-amber-200 rounded-xs" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 block">Avg. Approval Turnaround</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {data.avgApprovalDays} Days
            </div>
            <div className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5 mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>25% <span className="font-normal text-slate-400">vs last month</span></span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Proposal Lifecycle Breakdown (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              Proposal Lifecycle Breakdown
            </h3>
            <button className="text-[11px] font-bold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-slate-200/70 transition-colors">
              <span>This Month</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Donut Chart & Legend */}
          <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
            {/* Donut SVG */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {renderDonutSlices(lifecycleItems)}
                {/* Hole cut-out */}
                <circle cx="50" cy="50" r="26" fill="white" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {totalLifecycleCount}
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Total
                </span>
              </div>
            </div>

            {/* Status Legend List */}
            <div className="w-full space-y-2 text-xs">
              {lifecycleItems.map((item) => {
                const pct = Math.round((item.count / totalLifecycleCount) * 100)
                return (
                  <div key={item.label} className="flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-slate-900 font-extrabold">{item.count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Monthly Proposal Trends Combo Chart (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Monthly Proposal Trends
            </h3>
            <button className="text-[11px] font-bold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-slate-200/70 transition-colors">
              <span>Last 9 Months</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Bar + Line Combo Chart SVG */}
          <div className="my-4 relative h-48 w-full flex flex-col justify-between">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-300 font-semibold">
              <div className="border-b border-slate-100 pb-0.5 flex justify-between"><span>20</span><span>100%</span></div>
              <div className="border-b border-slate-100 pb-0.5 flex justify-between"><span>15</span><span>80%</span></div>
              <div className="border-b border-slate-100 pb-0.5 flex justify-between"><span>10</span><span>60%</span></div>
              <div className="border-b border-slate-100 pb-0.5 flex justify-between"><span>5</span><span>40%</span></div>
              <div className="border-b border-slate-100 pb-0.5 flex justify-between"><span>0</span><span>0%</span></div>
            </div>

            {/* Bars & Line graph */}
            <div className="relative z-10 h-36 flex items-end justify-between px-6 pt-2">
              {data.monthlyTrends.map((t) => {
                const barHeightPct = (t.count / 20) * 100
                return (
                  <div key={t.month} className="flex flex-col items-center h-full justify-end group">
                    {/* Bar */}
                    <div 
                      className="w-4.5 bg-amber-300/80 group-hover:bg-amber-400 rounded-t-xs transition-all" 
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>
                )
              })}

              {/* Line graph overlay path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M 6 80 L 17 75 L 28 65 L 39 72 L 50 70 L 61 58 L 72 55 L 83 45 L 94 48"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Data points */}
                {[[6, 80], [17, 75], [28, 65], [39, 72], [50, 70], [61, 58], [72, 55], [83, 45], [94, 48]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1" />
                ))}
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between px-4 text-[10px] font-bold text-slate-400 mt-2">
              {data.monthlyTrends.map(t => (
                <span key={t.month}>{t.month}</span>
              ))}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-600 border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-300 rounded-xs" />
              <span>Proposals Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
              <span>Win Rate %</span>
            </div>
          </div>
        </div>

        {/* Key Insights Side Panel (Span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Key Insights
            </h3>
          </div>

          <div className="space-y-3 my-3">
            
            {/* Insight 1 */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100/70 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Win rate increased by 8%</h4>
                <p className="text-[10px] text-slate-400 font-medium">Compared to last month</p>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-100/70 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pipeline value grew by 32%</h4>
                <p className="text-[10px] text-slate-400 font-medium">Across 25 active opportunities</p>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-100/70 flex items-center justify-center text-purple-700 shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Approval time reduced by 25%</h4>
                <p className="text-[10px] text-slate-400 font-medium">From 2.4 days to 1.8 days</p>
              </div>
            </div>

            {/* Insight 4 */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-orange-100/70 flex items-center justify-center text-orange-700 shrink-0 mt-0.5">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Top performing industry</h4>
                <p className="text-[10px] text-slate-400 font-medium">IT Services (42% win rate)</p>
              </div>
            </div>

            {/* Insight 5 */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Star className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Top client</h4>
                <p className="text-[10px] text-slate-400 font-medium">NASSCOM India (5 proposals)</p>
              </div>
            </div>

          </div>

          <button className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
            <span>View Detailed Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Bottom Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Top Clients by Pipeline Value (Span 4.5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              Top Clients by Pipeline Value
            </h3>
            <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 px-2">Client Name</th>
                  <th className="py-2 px-2 text-center">Proposals</th>
                  <th className="py-2 px-2 text-right">Total Value</th>
                  <th className="py-2 pl-2 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {data.topClients.map((client, idx) => (
                  <tr key={client.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 pr-2 font-bold text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-900">
                      {client.name}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-700">
                      {client.count}
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-slate-900">
                      {formatLakhsOrCrores(client.value)}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-bold text-slate-700">
                      {client.winRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Owner Productivity (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Sales Owner Productivity
            </h3>
            <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 px-2">Sales Owner</th>
                  <th className="py-2 px-2 text-center">Proposals</th>
                  <th className="py-2 px-2 text-center">Closed Deals</th>
                  <th className="py-2 pl-2 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {data.ownerPerformance.map((owner, idx) => (
                  <tr key={owner.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 pr-2 font-bold text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-900">
                      {owner.name}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-700">
                      {owner.count}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-900">
                      {owner.closedDeals}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-bold text-slate-700">
                      {owner.winRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proposal Value by Industry Donut (Span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              Proposal Value by Industry
            </h3>
          </div>

          {/* Industry Donut SVG & Legend */}
          <div className="my-3 flex flex-col items-center gap-4">
            <div className="relative w-36 h-36 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {renderDonutSlices(industryItems)}
                <circle cx="50" cy="50" r="26" fill="white" />
              </svg>
            </div>

            {/* Legend list */}
            <div className="w-full space-y-1.5 text-xs">
              {industryItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-slate-900 font-black">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
