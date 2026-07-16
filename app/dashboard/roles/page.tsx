'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Permission {
  id: string
  name: string
  description?: string
  category: string
}

interface Role {
  id: string
  name: string
  description?: string
  isDefault: boolean
  permissions: Permission[]
  _count?: { users: number }
}

export default function RolesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/permissions')
      ])
      
      if (rolesRes.status === 403) {
        router.push('/dashboard')
        return
      }
      
      const rolesData = await rolesRes.json()
      const permsData = await permsRes.json()
      
      setRoles(rolesData)
      setPermissions(permsData)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete role')
      }
      setRoles(roles.filter(r => r.id !== roleId))
      setDeleteConfirm(null)
      toast.success('Role deleted successfully')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800'
      case 'SALES_TEAM':
        return 'bg-blue-100 text-blue-800'
      case 'BUSINESS_EXPERT':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-[var(--badge-bg)] text-gray-800'
    }
  }

  const formatRole = (roleName: string) => {
    return roleName.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--text-heading)]">Roles ({roles.length})</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Manage roles and their default permissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="bg-[var(--bg-card)] shadow rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(role.name)}`}>
                      {formatRole(role.name)}
                    </span>
                    {role.isDefault && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-[var(--badge-bg)] text-[var(--text-muted)] rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedRole(role)
                        setShowEditModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(role.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                      disabled={role._count?.users ? role._count.users > 0 : false}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {role.description && (
                  <p className="text-sm text-[var(--text-muted)] mb-3">{role.description}</p>
                )}
                
                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">
                    Default Permissions ({role.permissions.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm.id}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                        title={perm.description}
                      >
                        {perm.name}
                      </span>
                    ))}
                    {role.permissions.length === 0 && (
                      <span className="text-xs text-gray-400">No permissions assigned</span>
                    )}
                  </div>
                </div>
                
                <div className="border-t mt-3 pt-3 text-xs text-[var(--text-muted)]">
                  {role._count?.users || 0} user(s) with this role
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showCreateModal && (
        <RoleModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchData()
          }}
          allPermissions={permissions}
        />
      )}

      {showEditModal && selectedRole && (
        <RoleModal
          mode="edit"
          role={selectedRole}
          onClose={() => {
            setShowEditModal(false)
            setSelectedRole(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedRole(null)
            fetchData()
          }}
          allPermissions={permissions}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Confirm Delete</h3>
            <p className="text-[var(--text-muted)] mb-6">
              Are you sure you want to delete this role? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-[var(--border-default)] rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-page)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleModal({
  mode,
  role,
  onClose,
  onSuccess,
  allPermissions
}: {
  mode: 'create' | 'edit'
  role?: Role
  onClose: () => void
  onSuccess: () => void
  allPermissions: Permission[]
}) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    isDefault: role?.isDefault || false,
    permissionIds: role?.permissions.map(p => p.id) || [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = mode === 'create' ? '/api/roles' : `/api/roles/${role?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${mode} role`)
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter(id => id !== permId)
        : [...prev.permissionIds, permId]
    }))
  }

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-[var(--text-heading)] mb-4">
          {mode === 'create' ? 'Create New Role' : 'Edit Role'}
        </h3>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Role Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              placeholder="e.g., MANAGER"
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this role"
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-[var(--border-default)]"
              />
              <span className="font-medium text-[var(--text-body)]">Set as default role</span>
            </label>
            <p className="text-xs text-[var(--text-muted)] ml-6 mt-1">
              New users will be assigned this role by default
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Default Permissions
            </label>
            <div className="max-h-48 overflow-y-auto border border-[var(--border-default)] rounded-lg p-2 space-y-2">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category}>
                  <div className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {perms.map(perm => (
                      <label key={perm.id} className="flex items-center space-x-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="rounded border-[var(--border-default)]"
                        />
                        <span>{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--border-default)] rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-page)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}