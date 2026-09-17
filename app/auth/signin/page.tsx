'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, FileText, Users, BarChart3 } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const { status } = useSession()
  const [email, setEmail] = useState('admin@interactivebees.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password')
        } else if (result.error === 'ACCOUNT_DEACTIVATED') {
          setError('Your account has been deactivated. Please contact admin.')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/60 relative overflow-hidden flex flex-col justify-between font-sans">
      {/* Background Decorative Graphic Shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-200/30 via-indigo-100/20 to-transparent rounded-l-[120px] pointer-events-none -z-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30">
            P
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Proposal <span className="text-blue-600">Builder</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          <span>Create</span>
          <span>•</span>
          <span>Collaborate</span>
          <span>•</span>
          <span>Win</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="w-full max-w-7xl mx-auto px-6 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 my-auto">
        
        {/* Left Side: Value Proposition & Hero Section */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Build Proposals <br />
              <span className="text-blue-600">That Win</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
              Create professional, modern and impactful proposals in minutes. Collaborate with your team and close more opportunities.
            </p>
          </div>

          {/* 3 Feature Highlight Cards */}
          <div className="space-y-5 max-w-md pt-2">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 p-2 rounded-2xl transition-all hover:bg-white/60">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Faster</h3>
                <p className="text-sm text-slate-500 mt-0.5">Use ready templates and smart tools</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 p-2 rounded-2xl transition-all hover:bg-white/60">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Work Together</h3>
                <p className="text-sm text-slate-500 mt-0.5">Collaborate seamlessly with your team</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 p-2 rounded-2xl transition-all hover:bg-white/60">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Close More</h3>
                <p className="text-sm text-slate-500 mt-0.5">Turn ideas into successful business</p>
              </div>
            </div>
          </div>

          {/* Handwritten Accent Text */}
          <div className="pt-4 pl-2 relative">
            <span className="font-serif italic text-2xl text-blue-600 tracking-wide inline-block -rotate-3 select-none">
              Ideas into Opportunities
            </span>
            <svg className="w-48 h-3 text-blue-500/60 mt-1" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 9.5C40 3.5 120 2 197.5 9.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Right Side: Sign-In Floating Card with Background Mockup */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center">
          
          {/* Subtle Tilted Background App Mockup */}
          <div className="hidden sm:block absolute -left-12 -top-6 w-[420px] bg-white/90 rounded-3xl p-5 shadow-xl border border-blue-100 transform -rotate-6 scale-95 opacity-80 pointer-events-none backdrop-blur-sm z-0">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">P</div>
                <span className="text-xs font-bold text-slate-700">Proposal Overview</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-20 bg-slate-100/70 rounded-xl p-3 flex gap-3 items-center">
                <div className="w-12 h-12 bg-blue-200/60 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-300/60 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-200/80 rounded w-1/2" />
                </div>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 pt-1">Recent Proposals</div>
              <div className="space-y-1.5">
                <div className="h-7 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center px-3 gap-2">
                  <div className="w-3.5 h-3.5 text-blue-500"><FileText className="w-3.5 h-3.5" /></div>
                  <div className="h-2 bg-slate-300/80 rounded w-28" />
                </div>
                <div className="h-7 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center px-3 gap-2">
                  <div className="w-3.5 h-3.5 text-emerald-500"><FileText className="w-3.5 h-3.5" /></div>
                  <div className="h-2 bg-slate-300/80 rounded w-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Clean White Sign-In Card */}
          <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-600/10 border border-slate-100 relative z-10 backdrop-blur-xl">
            
            {/* Logo Badge & Card Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-600/30 mx-auto mb-3">
                P
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Proposal <span className="text-blue-600">Builder</span>
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Sign in to your account
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50/50 text-slate-900 transition-all font-medium placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50/50 text-slate-900 transition-all font-medium placeholder:text-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox: Keep me signed in */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="keepSignedIn"
                  name="keepSignedIn"
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <label htmlFor="keepSignedIn" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                  Keep me signed in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Microsoft SSO Button */}
            <button
              type="button"
              onClick={() => setError('Microsoft Sign In is coming soon.')}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 flex items-center justify-center gap-3 text-xs font-semibold text-slate-700 transition-all"
            >
              {/* Microsoft 4 Color Squares Logo */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              <span>Sign in with Microsoft</span>
            </button>

            {/* Card Footer Copyright */}
            <p className="text-[11px] text-center text-slate-400 font-medium mt-8">
              © 2026 Proposal Builder. All rights reserved.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer Accent */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-400 z-10">
        <div></div>
        <div className="hidden sm:block font-medium text-slate-400 text-right">
          <p>Simplify Proposals. Accelerate Growth.</p>
          <div className="w-8 h-0.5 bg-blue-500/40 ml-auto mt-1 rounded-full" />
        </div>
      </footer>
    </div>
  )
}