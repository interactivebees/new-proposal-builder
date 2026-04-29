'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const user = session?.user
  const loading = status === 'loading'

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const formatRole = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleLogout = async () => {
    // Use NextAuth's signOut - handles all cookie clearing internally
    await signOut({ 
      redirect: true,
      callbackUrl: '/auth/signin'
    })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand - Always visible */}
          <div className="flex items-center space-x-8">
            <Link href={session ? "/dashboard" : "/auth/signin"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Proposal Builder
              </span>
            </Link>

            {/* Navigation Links - Only when logged in */}
            {user && !loading && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname === '/dashboard'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/proposals"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/dashboard/proposals')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Proposals
                </Link>
                <Link
                  href="/dashboard/templates"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/dashboard/templates')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Templates
                </Link>
                {user.role === 'OWNER' && (
                  <Link
                    href="/dashboard/users"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive('/dashboard/users')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Users
                  </Link>
                )}
                {user.role === 'OWNER' && (
                  <Link
                    href="/dashboard/roles"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive('/dashboard/roles')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Roles
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/dashboard/settings')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </Link>
              </nav>
            )}
          </div>

          {/* User Info and Actions - Only when logged in */}
          {user && !loading && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                {user.role && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {formatRole(user.role)}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation - Only when logged in */}
        {user && !loading && mobileMenuOpen && (
          <nav className="md:hidden pb-3 flex flex-col space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                pathname === '/dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/proposals"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/dashboard/proposals')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Proposals
            </Link>
            <Link
              href="/dashboard/templates"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/dashboard/templates')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Templates
            </Link>
            {user.role === 'OWNER' && (
              <Link
                href="/dashboard/users"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/dashboard/users')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Users
              </Link>
            )}
            {user.role === 'OWNER' && (
              <Link
                href="/dashboard/roles"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/dashboard/roles')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Roles
              </Link>
            )}
            <Link
              href="/dashboard/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/dashboard/settings')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Settings
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}