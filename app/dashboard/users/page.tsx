'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Edit2, Power, PowerOff, Trash2 } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

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
  permissions: Permission[]
}

interface User {
  id: string
  email: string
  name: string
  roleId?: string
  role?: Role
  customPermissions: Permission[]
  isActive?: boolean
  companyName?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [statusConfirm, setStatusConfirm] = useState<{ id: string; name: string; activate: boolean } | null>(null)

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
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }
      setUsers(users.filter(u => u.id !== userId))
      setDeleteConfirm(null)
      toast.success('User deleted successfully')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    setStatusConfirm({ id: userId, name: userName, activate: !currentStatus })
  }

  const confirmStatusChange = async () => {
    if (!statusConfirm) return
    
    try {
      const response = await fetch(`/api/users/${statusConfirm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleStatus', isActive: statusConfirm.activate }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }
      setUsers(users.map(u => u.id === statusConfirm.id ? { ...u, isActive: statusConfirm.activate } : u))
      setStatusConfirm(null)
      toast.success(statusConfirm.activate ? 'User activated' : 'User deactivated')
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

  const getEffectivePermissions = (user: User) => {
    const rolePerms = user.role?.permissions || []
    const customPerms = user.customPermissions || []
    const allPerms = [...rolePerms, ...customPerms]
    const uniquePerms = allPerms.filter((p, index, self) => index === self.findIndex((x) => x.id === p.id))
    return uniquePerms
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
            <h2 className="text-2xl font-semibold text-[var(--text-heading)]">Users ({users.length})</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create User
            </button>
          </div>

          <div className="bg-[var(--bg-card)] shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-[var(--border-light)]">
              <thead className="bg-[var(--bg-page)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-light)]">
                {users.map((user) => {
                  const effectivePerms = getEffectivePermissions(user)
                  return (
                    <tr key={user.id} className="hover:bg-[var(--bg-page)]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--text-heading)]">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-muted)]">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role?.name || '')}`}>
                          {formatRole(user.role?.name || 'No Role')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {effectivePerms.slice(0, 4).map((perm) => (
                            <span
                              key={perm.id}
                              className="px-2 py-0.5 text-xs bg-[var(--badge-bg)] text-[var(--text-body)] rounded"
                              title={perm.description}
                            >
                              {perm.name}
                            </span>
                          ))}
                          {effectivePerms.length > 4 && (
                            <span className="px-2 py-0.5 text-xs bg-[var(--badge-bg)] text-[var(--text-muted)] rounded">
                              +{effectivePerms.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                        {user.companyName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* All action buttons in a single row */}
                        <div className="flex items-center gap-1">
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditModal(true)
                            }}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          {/* Deactivate/Activate Button */}
                          <button
                            onClick={() => handleToggleStatus(user.id, user.isActive !== false, user.name)}
                            className={`p-2 rounded-lg transition ${
                              user.isActive === false 
                                ? 'text-green-600 hover:text-green-900 hover:bg-green-50' 
                                : 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                            }`}
                            title={user.isActive === false ? 'Activate User' : 'Deactivate User'}
                          >
                            {user.isActive === false ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <PowerOff className="w-4 h-4" />
                            )}
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchUsers()
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedUser(null)
            fetchUsers()
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Confirm Delete</h3>
            <p className="text-[var(--text-muted)] mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
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

      {/* Status Change Confirmation Modal */}
      {statusConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              {statusConfirm.activate ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                {statusConfirm.activate ? 'Activate User' : 'Deactivate User'}
              </h3>
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              {statusConfirm.activate 
                ? 'Are you sure you want to activate this user? They will be able to sign in again.'
                : 'Are you sure you want to deactivate this user? They will not be able to sign in until activated again.'
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStatusConfirm(null)}
                className="px-4 py-2 border border-[var(--border-default)] rounded-lg text-[var(--text-body)] hover:bg-[var(--bg-page)]"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmStatusChange()}
                className={`px-4 py-2 text-white rounded-lg ${
                  statusConfirm.activate 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {statusConfirm.activate ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    roleId: '',
    customPermissionIds: [] as string[],
    companyName: '',
    phone: '',
  })
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles')
      const data = await res.json()
      setRoles(data)
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, roleId: data[0].id }))
      }
    } catch (err) {
      console.error('Failed to fetch roles')
    }
  }

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/permissions')
      const data = await res.json()
      setPermissions(data)
    } catch (err) {
      console.error('Failed to fetch permissions')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create user')
      }

      onSuccess()
      toast.success('User created successfully')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCustomPermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      customPermissionIds: prev.customPermissionIds.includes(permId)
        ? prev.customPermissionIds.filter(id => id !== permId)
        : [...prev.customPermissionIds, permId]
    }))
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Create New User</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <PasswordInput
            id="create-password"
            label="Password *"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="rounded-lg"
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Role *
            </label>
            <select
              required
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {formatRole(role.name)} {role.description && `- ${role.description}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Additional Permissions
            </label>
            <div className="max-h-40 overflow-y-auto border border-[var(--border-default)] rounded-lg p-2 space-y-2">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category}>
                  <div className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {perms.map(perm => (
                      <label key={perm.id} className="flex items-center space-x-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.customPermissionIds.includes(perm.id)}
                          onChange={() => toggleCustomPermission(perm.id)}
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

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditUserModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: user.email,
    password: '',
    name: user.name,
    roleId: user.role?.id || '',
    customPermissionIds: user.customPermissions?.map(p => p.id) || [],
    companyName: user.companyName || '',
    phone: user.phone || '',
  })
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles')
      const data = await res.json()
      setRoles(data)
    } catch (err) {
      console.error('Failed to fetch roles')
    }
  }

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/permissions')
      const data = await res.json()
      setPermissions(data)
    } catch (err) {
      console.error('Failed to fetch permissions')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const updateData: any = {
        email: formData.email,
        name: formData.name,
        roleId: formData.roleId,
        customPermissionIds: formData.customPermissionIds,
        companyName: formData.companyName,
        phone: formData.phone,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user')
      }

      onSuccess()
      toast.success('User updated successfully')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCustomPermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      customPermissionIds: prev.customPermissionIds.includes(permId)
        ? prev.customPermissionIds.filter(id => id !== permId)
        : [...prev.customPermissionIds, permId]
    }))
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Edit User</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <PasswordInput
            id="edit-password"
            label="New Password (leave blank to keep current)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="rounded-lg"
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Role *
            </label>
            <select
              required
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {formatRole(role.name)} {role.description && `- ${role.description}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Additional Permissions
            </label>
            <div className="max-h-40 overflow-y-auto border border-[var(--border-default)] rounded-lg p-2 space-y-2">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category}>
                  <div className="text-xs font-medium text-[var(--text-muted)] uppercase mb-1">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {perms.map(perm => (
                      <label key={perm.id} className="flex items-center space-x-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.customPermissionIds.includes(perm.id)}
                          onChange={() => toggleCustomPermission(perm.id)}
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

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function formatRole(roleName: string) {
  return roleName.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}