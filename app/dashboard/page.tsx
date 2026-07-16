import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/proposals" className="block p-6 bg-[var(--bg-card)] rounded-lg shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-2">Proposals</h2>
              <p className="text-[var(--text-muted)]">View and manage your proposals</p>
            </Link>

            <Link href="/dashboard/templates" className="block p-6 bg-[var(--bg-card)] rounded-lg shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-2">Templates</h2>
              <p className="text-[var(--text-muted)]">Browse and create templates</p>
            </Link>

            <Link href="/dashboard/settings" className="block p-6 bg-[var(--bg-card)] rounded-lg shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-2">Settings</h2>
              <p className="text-[var(--text-muted)]">Manage your company settings</p>
            </Link>

            {session.user?.role === 'OWNER' && (
              <Link href="/dashboard/users" className="block p-6 bg-[var(--bg-card)] rounded-lg shadow hover:shadow-md transition border-2 border-purple-200">
                <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-2">User Management</h2>
                <p className="text-[var(--text-muted)]">Create and manage user accounts</p>
              </Link>
            )}
          </div>

          <div className="mt-8 bg-[var(--bg-card)] rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {(session.user?.role === 'SALES_TEAM' || session.user?.role === 'OWNER') && (
                <Link 
                  href="/dashboard/proposals/new"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Create New Proposal
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
