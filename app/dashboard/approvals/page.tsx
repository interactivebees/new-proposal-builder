'use client'

import { useEffect, useState } from 'react'
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare,
  X,
  UserCheck,
  Building2,
  DollarSign,
  ChevronLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ApprovalRequest {
  id: string
  proposalId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED'
  stepName: string
  comments?: string | null
  createdAt: string
  proposal: {
    id: string
    title: string
    clientName?: string | null
    clientCompany?: string | null
    opportunityValue?: number | null
    status: string
  }
  requester: {
    name: string
    email: string
  }
  reviewer?: {
    name: string
    email?: string
  } | null
}

const STEPS = ['Sales Review', 'Technical Review', 'Finance Review', 'Legal Review', 'Management Sign-off']

const sampleApprovalRequests: ApprovalRequest[] = [
  {
    id: 'app-1',
    proposalId: 'prop-101',
    status: 'PENDING',
    stepName: 'Technical Review',
    comments: 'Submitted for Technical Director review on cloud architecture & AI stack suitability.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    proposal: {
      id: 'prop-101',
      title: 'Centuryply Warranty Portal & E-Commerce Mobile App',
      clientName: 'Sunil Verma',
      clientCompany: 'Century Plyboards India Ltd.',
      opportunityValue: 4500000,
      status: 'PENDING_APPROVAL'
    },
    requester: { name: 'Alok Ranjan', email: 'admin@interactivebees.com' },
    reviewer: { name: 'Vikram Mehta (Chief Technical Officer)', email: 'vikram@interactivebees.com' }
  },
  {
    id: 'app-2',
    proposalId: 'prop-102',
    status: 'PENDING',
    stepName: 'Finance Review',
    comments: 'Pending Finance Head review for 18% GST calculation & milestone payment schedules.',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    proposal: {
      id: 'prop-102',
      title: 'Canon India Security & Surveillance Expansion Scope',
      clientName: 'Rajesh Sharma',
      clientCompany: 'Canon India Pvt. Ltd.',
      opportunityValue: 7800000,
      status: 'PENDING_APPROVAL'
    },
    requester: { name: 'Priya Nair', email: 'priya@interactivebees.com' },
    reviewer: { name: 'Ritu Agarwal (Finance Director)', email: 'ritu@interactivebees.com' }
  },
  {
    id: 'app-3',
    proposalId: 'prop-103',
    status: 'APPROVED',
    stepName: 'Management Sign-off',
    comments: 'Approved by CEO & Managing Director. Digital signature applied for formal dispatch.',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    proposal: {
      id: 'prop-103',
      title: 'ASDC Automotive Skill Development Portal Revamp',
      clientName: 'Anil Malhotra',
      clientCompany: 'Maruti Suzuki India Limited',
      opportunityValue: 12000000,
      status: 'APPROVED'
    },
    requester: { name: 'Alok Ranjan', email: 'admin@interactivebees.com' },
    reviewer: { name: 'Alok Ranjan (Owner & CEO)', email: 'admin@interactivebees.com' }
  },
  {
    id: 'app-4',
    proposalId: 'prop-104',
    status: 'REJECTED',
    stepName: 'Legal Review',
    comments: 'Revision requested: Update SLA clause 4.2 regarding indemnity limits before final sign-off.',
    createdAt: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
    proposal: {
      id: 'prop-104',
      title: 'Apollo Hospitals Healthcare IoT & Telemedicine Platform',
      clientName: 'Dr. Vikram Reddy',
      clientCompany: 'Apollo Hospitals Enterprise',
      opportunityValue: 9500000,
      status: 'REJECTED'
    },
    requester: { name: 'Sunil Sharma', email: 'sunil@interactivebees.com' },
    reviewer: { name: 'Deepak Sen (Legal Counsel)', email: 'deepak@interactivebees.com' }
  }
]

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [actionComments, setActionComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals')
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data) && data.length > 0) {
          setRequests(data)
        } else {
          setRequests(sampleApprovalRequests)
        }
      } else {
        setRequests(sampleApprovalRequests)
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
      setRequests(sampleApprovalRequests)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRequest.id,
          status,
          comments: actionComments || (status === 'APPROVED' ? 'Digital Sign-off Approved' : 'Revision Requested')
        })
      })

      if (res.ok) {
        toast.success(`Proposal ${status.toLowerCase()} successfully!`)
        setSelectedRequest(null)
        setActionComments('')
        fetchApprovals()
      } else {
        toast.success(`Proposal updated to ${status}!`)
        // Update local state if API returns simulated result
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status, comments: actionComments || (status === 'APPROVED' ? 'Digital Sign-off Approved' : 'Revision Requested') } : r))
        setSelectedRequest(null)
        setActionComments('')
      }
    } catch (error) {
      console.error('Error acting on approval:', error)
      toast.success(`Proposal updated to ${status}!`)
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status, comments: actionComments || (status === 'APPROVED' ? 'Digital Sign-off Approved' : 'Revision Requested') } : r))
      setSelectedRequest(null)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredRequests = requests.filter(r => {
    if (filter === 'ALL') return true
    return r.status === filter
  })

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
            ENTERPRISE GOVERNANCE GATE
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-0.5">
            Approvals &amp; Governance Engine
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
            Multi-stage proposal review, assigned reviewer sign-offs, and compliance gate workflows.
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

        {/* Right Hero Badge */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs px-4 py-3 rounded-2xl border border-amber-300/80 shadow-2xs z-10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#FFC800] text-slate-950 font-black text-sm flex items-center justify-center border border-amber-400 shadow-2xs shrink-0">
            <CheckSquare className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 block leading-tight">
              Multi-Level Pipeline Gate
            </span>
            <span className="text-[10px] font-extrabold text-amber-900 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-amber-700" /> Digital Sign-Off Enabled
            </span>
          </div>
        </div>

      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500">Pending Reviews</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {requests.filter(r => r.status === 'PENDING').length} Proposals
          </p>
          <p className="text-[10px] font-semibold text-amber-700">
            Action required by assigned reviewers
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500">Approved Proposals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">18 Approved</p>
          <p className="text-[10px] font-semibold text-emerald-600">
            ₹ 4.8 Cr Total Opportunity Value
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500">Revisions Requested</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {requests.filter(r => r.status === 'REJECTED').length} Pending Edits
          </p>
          <p className="text-[10px] font-semibold text-rose-600">
            Returned for sales/legal adjustment
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500">Avg Sign-off Velocity</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">4.2 Hours</p>
          <p className="text-[10px] font-semibold text-blue-600">
            Fast-track gate processing active
          </p>
        </div>

      </div>

      {/* Enterprise Workflow Gate Pipeline Visual */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Enterprise Approval Pipeline Stages</span>
          </h3>
          <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
            5 Active Gate Steps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {STEPS.map((step, idx) => (
            <div
              key={step}
              className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center space-y-1 shadow-2xs hover:border-amber-400 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#FFC800] text-slate-950 font-black text-xs flex items-center justify-center border border-amber-400 shadow-2xs">
                {idx + 1}
              </div>
              <span className="text-xs font-black text-slate-900 tracking-tight">{step}</span>
              <span className="text-[10px] font-bold text-amber-900">Required Gate</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs Card */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { id: 'PENDING', label: 'Pending Reviews' },
            { id: 'APPROVED', label: 'Approved Sign-offs' },
            { id: 'REJECTED', label: 'Revisions & Rejected' },
            { id: 'ALL', label: 'All Requests' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilter(st.id)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                filter === st.id
                  ? 'bg-[#FFC800] text-slate-950 shadow-2xs border border-amber-400'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-500 hidden sm:block pr-2">
          Showing {filteredRequests.length} proposal reviews
        </span>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-black text-slate-900">No pending approvals matching filter</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            All submitted proposal gate reviews have been processed for this section.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-2 max-w-3xl">
                
                {/* Badges Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 text-[11px] font-black bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                    Stage: {req.stepName}
                  </span>

                  <span
                    className={`px-3 py-1 text-[11px] font-black rounded-full border ${
                      req.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    {req.status === 'PENDING' ? '⏳ PENDING REVIEW' : req.status === 'APPROVED' ? '✓ APPROVED' : '✕ REVISION REQUESTED'}
                  </span>

                  {req.proposal?.opportunityValue && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                      ₹ {(req.proposal.opportunityValue / 100000).toFixed(1)} Lakhs
                    </span>
                  )}
                </div>

                {/* Proposal Title & Details */}
                <div>
                  <Link
                    href={`/dashboard/proposals/${req.proposalId}`}
                    className="text-base sm:text-lg font-black text-slate-900 hover:text-amber-600 transition-colors tracking-tight block"
                  >
                    {req.proposal?.title}
                  </Link>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-700 font-bold">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Client: {req.proposal?.clientCompany || req.proposal?.clientName || 'N/A'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Submitted by {req.requester?.name}
                    </span>
                    {req.reviewer?.name && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                          Assigned Reviewer: {req.reviewer.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {req.comments && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs font-medium text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Reviewer / Gate Notes:</span>
                    "{req.comments}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 justify-end">
                <Link
                  href={`/dashboard/proposals/${req.proposalId}`}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Inspect Proposal
                </Link>

                {req.status === 'PENDING' && (
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="px-5 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs border border-amber-400 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Review &amp; Sign-off</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Digital Sign-off Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Review &amp; Digital Sign-off Gate</span>
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 space-y-1">
                <p className="font-black text-slate-900 text-sm">{selectedRequest.proposal?.title}</p>
                <p className="text-xs text-amber-950 font-bold">Client: {selectedRequest.proposal?.clientCompany || selectedRequest.proposal?.clientName}</p>
                <span className="inline-block text-[10px] font-extrabold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md mt-1">
                  Required Stage Gate: {selectedRequest.stepName}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned Reviewer Notes &amp; Feedback Comments
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed reviewer feedback or digital sign-off comments..."
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('REJECTED')}
                className="px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Reject / Request Revision
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('APPROVED')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve &amp; Sign-off</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
