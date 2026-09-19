'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, FileText, Users, BarChart3 } from 'lucide-react'
import IbeesLogo from '@/components/IbeesLogo'

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
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF0]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#FFC800] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-sm text-slate-600 font-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF0] via-[#FFFBEB] to-[#FEF08A]/30 relative overflow-hidden flex flex-col justify-between font-sans selection:bg-[#FFC800] selection:text-black">
      
      {/* Background Soft Yellow Radial Mesh Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#FEF08A]/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-40 right-10 w-[600px] h-[600px] bg-[#FFC800]/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Honeycomb Grid Pattern SVG on Right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 lg:w-[480px] h-full opacity-30 pointer-events-none z-0">
        <svg viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-amber-400">
          <pattern id="honeycomb-pattern" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1.25)">
            <path
              d="M28 0 L56 16.16 L56 48.49 L28 64.65 L0 48.49 L0 16.16 Z M28 97 L56 80.84 L56 48.51 L28 32.35 L0 48.51 L0 80.84 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M56 48.49 L84 64.65 L84 96.98 L56 113.14 L28 96.98 L28 64.65 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#honeycomb-pattern)" />
        </svg>
      </div>

      {/* Cursive Tagline on Bottom Right */}
      <div className="absolute right-12 bottom-20 hidden lg:block text-right pointer-events-none select-none z-10">
        <p className="font-serif italic font-bold text-3xl text-amber-600/90 leading-tight">
          we believe.
        </p>
        <p className="font-serif italic font-bold text-3xl text-amber-600/90 leading-tight">
          we can.
        </p>
        <svg className="w-28 h-3 text-amber-400 ml-auto mt-1" viewBox="0 0 100 12" fill="none">
          <path d="M2 8C25 3 75 2 98 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <IbeesLogo />
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
          <span>CREATE</span>
          <span>•</span>
          <span>COLLABORATE</span>
          <span>•</span>
          <span>WIN</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="w-full max-w-7xl mx-auto px-6 py-4 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 my-auto relative">
        
        {/* Flying Bee with Dotted Flight Trail (Between Left & Right) */}
        <div className="hidden lg:block absolute left-[44%] top-[-30px] z-20 pointer-events-none">
          <svg className="w-72 h-56 overflow-visible" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Dotted Flight Loop Trail */}
            <path
              d="M -100 170 C -40 150, -20 70, 50 50 C 100 30, 120 100, 85 115 C 50 130, 40 70, 100 50 C 140 35, 180 45, 225 60"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeDasharray="5 5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
            {/* Flying Bee Graphic */}
            <g transform="translate(210, 40) rotate(22)">
              {/* Wings */}
              <ellipse cx="-4" cy="-12" rx="8" ry="12" fill="#E0F2FE" fillOpacity="0.85" stroke="#0284C7" strokeWidth="1.2" transform="rotate(-25 -4 -12)" />
              <ellipse cx="6" cy="-13" rx="7" ry="11" fill="#E0F2FE" fillOpacity="0.85" stroke="#0284C7" strokeWidth="1.2" transform="rotate(20 6 -13)" />
              {/* Body */}
              <ellipse cx="0" cy="0" rx="15" ry="11" fill="#FFC800" stroke="#000" strokeWidth="2.2" />
              {/* Black Stripes */}
              <path d="M-4 -10.5 C -4 0, -4 0, -4 10.5" stroke="#000" strokeWidth="3.2" />
              <path d="M3 -10.8 C 3 0, 3 0, 3 10.8" stroke="#000" strokeWidth="3.2" />
              <path d="M9 -8.5 C 9 0, 9 0, 9 8.5" stroke="#000" strokeWidth="3.5" />
              {/* Stinger */}
              <path d="M -15 0 L -20 -2.5 L -20 2.5 Z" fill="#000" />
              {/* Head */}
              <circle cx="13" cy="0" r="5.5" fill="#000" />
              {/* Eye */}
              <circle cx="14" cy="-1.5" r="1.2" fill="#FFF" />
              {/* Antennae */}
              <path d="M15 -4 Q 18 -10 16 -12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M16 -2 Q 20 -6 20 -9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          </svg>
        </div>

        {/* Left Side: Value Proposition & Hero Section */}
        <div className="lg:col-span-6 space-y-7 pr-0 lg:pr-4">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Build Proposals <br />
              <span className="text-[#CA8A04]">That Win</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed pt-1">
              Create professional, modern and impactful proposals in minutes. Collaborate with your team and close more opportunities.
            </p>
          </div>

          {/* 3 Feature Bullet Items */}
          <div className="space-y-4 max-w-md pt-1">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 p-1.5 rounded-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center text-slate-900 shrink-0 shadow-xs border border-amber-200">
                <FileText className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Create Faster</h3>
                <p className="text-sm text-slate-600 mt-0.5 font-medium">Use ready templates and smart tools</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 p-1.5 rounded-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center text-slate-900 shrink-0 shadow-xs border border-amber-200">
                <Users className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Work Together</h3>
                <p className="text-sm text-slate-600 mt-0.5 font-medium">Collaborate seamlessly with your team</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 p-1.5 rounded-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center text-slate-900 shrink-0 shadow-xs border border-amber-200">
                <BarChart3 className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Close More</h3>
                <p className="text-sm text-slate-600 mt-0.5 font-medium">Turn ideas into successful business</p>
              </div>
            </div>
          </div>

          {/* Handwritten Accent Text */}
          <div className="pt-4 pl-2 relative">
            <span className="font-serif italic text-3xl font-bold text-slate-900 tracking-wide inline-block -rotate-2 select-none">
              Ideas into Opportunities
            </span>
            <svg className="w-56 h-4 text-amber-400 mt-1" viewBox="0 0 220 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10C50 3.5 140 2 217 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Right Side: Sign-In Floating Card with Background Mockup */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center">
          
          {/* Subtle Tilted Background App Mockup */}
          <div className="hidden sm:block absolute -left-12 lg:-left-16 -top-8 w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-amber-200/60 transform -rotate-6 scale-95 opacity-90 pointer-events-none z-0">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#FFC800] rounded-lg flex items-center justify-center text-black font-black text-sm shadow-xs">
                  P
                </div>
                <span className="text-xs font-extrabold text-slate-800">Proposal Overview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">🏠</div>
                <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">📁</div>
                <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">👥</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-24 bg-amber-50/60 rounded-2xl p-3 flex gap-3 items-center border border-amber-100/50">
                <div className="w-14 h-14 bg-[#FFC800]/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0 border border-amber-200/50">
                  <svg className="w-7 h-7 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded-full w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
              <div className="text-[11px] font-bold text-slate-400 pt-1">Recent Proposals</div>
              <div className="space-y-2">
                <div className="h-8 bg-amber-50/40 rounded-xl border border-amber-100/60 flex items-center px-3 gap-2.5">
                  <div className="w-4 h-4 rounded bg-amber-200/60 flex items-center justify-center text-[10px] text-amber-700 font-bold">📄</div>
                  <div className="h-2.5 bg-slate-200 rounded-full w-36" />
                </div>
                <div className="h-8 bg-amber-50/40 rounded-xl border border-amber-100/60 flex items-center px-3 gap-2.5">
                  <div className="w-4 h-4 rounded bg-amber-200/60 flex items-center justify-center text-[10px] text-amber-700 font-bold">📄</div>
                  <div className="h-2.5 bg-slate-200 rounded-full w-28" />
                </div>
              </div>
            </div>
          </div>

          {/* Clean White Sign-In Card */}
          <div className="w-full max-w-[430px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-amber-500/10 border border-amber-100/80 relative z-10 backdrop-blur-xl">
            
            {/* Logo Badge & Card Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#FFC800] rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-md shadow-amber-500/20 mx-auto mb-3 border border-amber-400">
                P
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Proposal <span className="text-[#CA8A04]">Builder</span>
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">
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
                <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-amber-300/70 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 bg-[#FEF9C3]/70 text-slate-900 transition-all font-medium placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-amber-300/70 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 bg-[#FEF9C3]/70 text-slate-900 transition-all font-medium placeholder:text-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
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
                  className="w-4 h-4 rounded border-amber-400 text-amber-500 focus:ring-amber-400 cursor-pointer accent-[#FFC800]"
                />
                <label htmlFor="keepSignedIn" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Keep me signed in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FFC800] hover:bg-[#F5BF00] active:bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Microsoft SSO Button */}
            <button
              type="button"
              onClick={() => setError('Microsoft Sign In is coming soon.')}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 flex items-center justify-center gap-3 text-xs font-bold text-slate-700 transition-all shadow-2xs"
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
              © 2026 Ibees Proposal Builder. All rights reserved.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer Accent */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-500 z-10">
        <div className="flex items-center gap-2 font-medium">
          <div className="w-6 h-0.5 bg-[#FFC800] rounded-full" />
          <span>Interactive Bees Pvt. Ltd.</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-medium text-slate-500">
          <span>Simplify Proposals. Accelerate Growth.</span>
          <div className="w-6 h-0.5 bg-[#FFC800] rounded-full" />
        </div>
      </footer>
    </div>
  )
}