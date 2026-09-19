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
  X
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
    opportunityValue?: number | null
    status: string
  }
  requester: {
    name: string
    email: string
  }
  reviewer?: {
    name: string
  } | null
}

const STEPS = ['Sales Review', 'Technical Review', 'Finance Review', 'Legal Review', 'Management Sign-off']

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
        setRequests(data)
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
      toast.error('Failed to load approval requests')
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
          comments: actionComments || (status === 'APPROVED' ? 'Digital Sign-off Approved' : 'Rejected')
        })
      })

      if (res.ok) {
        toast.success(`Proposal ${status.toLowerCase()} successfully!`)
        setSelectedRequest(null)
        setActionComments('')
        fetchApprovals()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to update approval')
      }
    } catch (error) {
      console.error('Error acting on approval:', error)
      toast.error('Failed to update approval')
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
    <div className="space-y-5 pb-6 font-sans">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            APPROVALS ENGINE
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Multi-Level Approval Workflow
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
            Review, comment, and provide digital sign-off across Sales, Technical, Finance, and Management pipelines.
          </p>
        </div>
      </div>

      {/* Visual Workflow Steps Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Enterprise Approval Pipeline Stages
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {STEPS.map((step, idx) => (
            <div
              key={step}
              className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1 relative"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </div>
              <span className="text-xs font-bold text-slate-800">{step}</span>
              <span className="text-[10px] text-slate-400 font-medium">Required Gate</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'PENDING' ? 'Pending Reviews' : st}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-400">
          Showing {filteredRequests.length} requests
        </span>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No pending approvals</h3>
          <p className="text-xs text-slate-400 mt-1">
            All submitted proposal reviews have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    Stage: {req.stepName}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      req.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div>
                  <Link
                    href={`/dashboard/proposals/${req.proposalId}`}
                    className="text-base font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {req.proposal?.title}
                  </Link>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Client: {req.proposal?.clientName || 'N/A'} • Submitted by {req.requester?.name} ({req.requester?.email})
                  </p>
                </div>

                {req.comments && (
                  <p className="text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{req.comments}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <Link
                  href={`/dashboard/proposals/${req.proposalId}`}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Inspect Proposal
                </Link>

                {req.status === 'PENDING' && (
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Review &amp; Sign-off
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Digital Sign-off &amp; Review
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-900">{selectedRequest.proposal?.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Stage: {selectedRequest.stepName}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reviewer Notes &amp; Comments
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter feedback or digital sign-off comments..."
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('REJECTED')}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Reject / Request Revision
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction('APPROVED')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve &amp; Sign-off
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
