'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const SectionEditor = dynamic(() => import('@/components/SectionEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

interface Proposal {
  id: string
  title: string
  content: any
  clientName?: string
  clientCompany?: string
  clientEmail?: string
  clientAddress?: string
  clientLogoUrl?: string
  status: string
  createdAt: string
  creator: {
    name: string
    email: string
  }
  pricingItems: Array<{
    id: string
    serviceDescription: string
    cost: number
    frequency?: string
  }>
  comments: Array<{
    id: string
    content: string
    user: {
      name: string
    }
    createdAt: string
  }>
}

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<any>({})
  const [editedTitle, setEditedTitle] = useState('')
  const [editedClientLogoUrl, setEditedClientLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  useEffect(() => {
    fetchProposal()
  }, [params.id])

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setProposal(data)
        setEditedContent(data.content)
        setEditedTitle(data.title)
        setEditedClientLogoUrl(data.clientLogoUrl || '')
      } else {
        console.error('Failed to fetch proposal')
      }
    } catch (error) {
      console.error('Error fetching proposal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setEditedClientLogoUrl(data.url)
      } else {
        console.error('Failed to upload logo')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/proposals/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          clientLogoUrl: editedClientLogoUrl
        })
      })

      if (res.ok) {
        await fetchProposal()
        setEditing(false)
      } else {
        console.error('Failed to update proposal')
      }
    } catch (error) {
      console.error('Error updating proposal:', error)
    }
  }

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: params.id })
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${proposal?.title || 'proposal'}.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting proposal:', error)
    }
  }

  const handleDuplicate = async (newClientData: any) => {
    setDuplicating(true)
    try {
      const res = await fetch(`/api/proposals/${params.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData)
      })

      if (res.ok) {
        const newProposal = await res.json()
        router.push(`/dashboard/proposals/${newProposal.id}`)
      } else {
        console.error('Failed to duplicate proposal')
      }
    } catch (error) {
      console.error('Error duplicating proposal:', error)
    } finally {
      setDuplicating(false)
      setShowDuplicateModal(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      IN_REVIEW: 'bg-yellow-100 text-yellow-800',
      PENDING_APPROVAL: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SENT: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading proposal...</div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal not found</h2>
          <button
            onClick={() => router.push('/dashboard/proposals')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Proposals
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {editing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
                )}
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created by {proposal.creator.name}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setEditedTitle(proposal.title)
                        setEditedContent(proposal.content)
                        setEditedClientLogoUrl(proposal.clientLogoUrl || '')
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDuplicateModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={handleExport}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Export DOCX
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/proposals')}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Back
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div className="mt-4 pt-4 border-t">
              {/* Client Logo */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Client Logo</p>
                {editing ? (
                  <div className="space-y-2">
                    {editedClientLogoUrl && (
                      <img 
                        src={editedClientLogoUrl} 
                        alt="Client logo" 
                        className="h-20 w-auto border rounded shadow-sm mb-2"
                      />
                    )}
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                    </div>
                    {editedClientLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditedClientLogoUrl('')}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                ) : (
                  proposal.clientLogoUrl ? (
                    <img 
                      src={proposal.clientLogoUrl} 
                      alt="Client logo" 
                      className="h-20 w-auto border rounded shadow-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">No logo uploaded</p>
                  )
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Client Name</p>
                  <p className="text-sm font-medium text-gray-900">{proposal.clientName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-sm font-medium text-gray-900">{proposal.clientCompany || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{proposal.clientEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{proposal.clientAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(proposal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposal Sections</h2>
            <SectionEditor
              sections={editing ? editedContent?.sections || [] : proposal.content?.sections || []}
              onChange={(sections) => setEditedContent({ ...editedContent, sections })}
              readOnly={!editing}
            />
          </div>

          {/* Pricing Items */}
          {proposal.pricingItems && proposal.pricingItems.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {proposal.pricingItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.serviceDescription}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">${item.cost.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{item.frequency || 'one-time'}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">Total</td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                      ${proposal.pricingItems.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Comments */}
          {proposal.comments && proposal.comments.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
              <div className="space-y-4">
                {proposal.comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{comment.user.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Modal */}
          {showDuplicateModal && (
            <DuplicateModal
              onClose={() => setShowDuplicateModal(false)}
              onDuplicate={handleDuplicate}
              duplicating={duplicating}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Duplicate Modal Component
function DuplicateModal({ onClose, onDuplicate, duplicating }: any) {
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onDuplicate({ clientName, clientCompany, clientEmail, clientAddress, title })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Duplicate Proposal for New Client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Proposal Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to auto-generate"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Company</label>
            <input
              type="text"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Address</label>
            <textarea
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={duplicating}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={duplicating}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {duplicating ? 'Duplicating...' : 'Duplicate Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
