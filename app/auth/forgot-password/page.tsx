'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ShieldCheck, Zap, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react'
import IbeesLogo from '@/components/IbeesLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send reset link')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <pattern id="honeycomb-pattern-fp" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1.25)">
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
          <rect width="100%" height="100%" fill="url(#honeycomb-pattern-fp)" />
        </svg>
      </div>

      {/* Right Side Hexagon Badge & Bee Illustration */}
      <div className="absolute right-10 top-1/3 hidden lg:flex flex-col items-center pointer-events-none select-none z-10 space-y-8">
        {/* Hexagon Outline Badge */}
        <div className="relative w-36 h-40 flex flex-col items-center justify-center text-center">
          <svg className="absolute inset-0 w-full h-full text-amber-400" viewBox="0 0 100 115" fill="none">
            <polygon points="50 3, 97 30, 97 85, 50 112, 3 85, 3 30" stroke="currentColor" strokeWidth="2.5" fill="#FFFBEB" fillOpacity="0.8" />
          </svg>
          <div className="relative z-10 font-serif italic font-bold text-lg text-amber-700 leading-tight pt-1">
            <p>we</p>
            <p>believe.</p>
            <p>we can.</p>
          </div>
        </div>

        {/* Flying Bee SVG */}
        <div className="relative w-20 h-20 -mr-8">
          <svg className="w-24 h-24 overflow-visible" viewBox="0 0 100 100" fill="none">
            {/* Dotted Trail */}
            <path d="M -30 90 Q -10 60 20 40 Q 50 20 80 10" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            {/* Bee */}
            <g transform="translate(60, 20) rotate(30)">
              <ellipse cx="-3" cy="-10" rx="7" ry="10" fill="#E0F2FE" fillOpacity="0.85" stroke="#0284C7" strokeWidth="1" transform="rotate(-25 -3 -10)" />
              <ellipse cx="5" cy="-11" rx="6" ry="9" fill="#E0F2FE" fillOpacity="0.85" stroke="#0284C7" strokeWidth="1" transform="rotate(20 5 -11)" />
              <ellipse cx="0" cy="0" rx="13" ry="9.5" fill="#FFC800" stroke="#000" strokeWidth="2" />
              <path d="M-3 -9 C -3 0, -3 0, -3 9" stroke="#000" strokeWidth="2.8" />
              <path d="M3 -9 C 3 0, 3 0, 3 9" stroke="#000" strokeWidth="2.8" />
              <path d="M8 -7 C 8 0, 8 0, 8 7" stroke="#000" strokeWidth="3" />
              <path d="M -13 0 L -17 -2 L -17 2 Z" fill="#000" />
              <circle cx="11" cy="0" r="4.5" fill="#000" />
              <circle cx="12" cy="-1" r="1" fill="#FFF" />
            </g>
          </svg>
        </div>
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
        
        {/* Left Side: Hero Section & Illustration */}
        <div className="lg:col-span-6 space-y-7 pr-0 lg:pr-4">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-amber-600 tracking-widest uppercase block">
              PROPOSAL BUILDER
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Reset Your <br />
              <span className="text-[#CA8A04]">Password</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed pt-1 font-medium">
              No worries! Enter your email address and we&apos;ll send you a secure link to reset your password.
            </p>
          </div>

          {/* 3 Feature Bullet Items */}
          <div className="space-y-4 max-w-md pt-1">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 p-1.5 rounded-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center text-slate-900 shrink-0 shadow-xs border border-amber-200">
                <Mail className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Quick &amp; Secure</h3>
                <p className="text-sm text-slate-600 mt-0.5 font-medium">Get a reset link in your inbox</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 p-1.5 rounded-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center text-slate-900 shrink-0 shadow-xs border border-amber-200">
                <ShieldCheck className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Your Data is Safe</h3>
                <p className="text-sm text-slate-600 mt-0.5 font-medium">We follow best security practices</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 p-1.5 rounded-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center text-slate-900 shrink-0 shadow-xs border border-amber-200">
                <Zap className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Get Back to Work</h3>
                <p className="text-sm text-slate-600 mt-0.5 font-medium">Access your account in minutes</p>
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

        {/* Right Side: Reset Form Card with 3D Yellow Envelope Graphic */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center">
          
          {/* 3D Envelope & Paper Airplane Center Illustration */}
          <div className="hidden sm:block absolute -left-20 lg:-left-28 top-1/2 -translate-y-1/2 w-80 h-72 pointer-events-none z-0 opacity-95">
            {/* Open Yellow Envelope SVG */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Back Flap of Envelope */}
              <path d="M30 110 L160 50 L290 110 L290 230 C290 245 280 255 265 255 L55 255 C40 255 30 245 30 230 Z" fill="#FACC15" />
              
              {/* White Letter Card emerging from envelope */}
              <g transform="translate(65, 35) rotate(-6)">
                <rect width="180" height="150" rx="16" fill="#FFFFFF" stroke="#FDE047" strokeWidth="2" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.08))" />
                {/* Yellow Lock Badge on Letter */}
                <rect x="70" y="30" width="40" height="40" rx="10" fill="#FFC800" />
                <path d="M85 45 V40 C85 37 87 35 90 35 C93 35 95 37 95 40 V45" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <rect x="83" y="45" width="14" height="11" rx="2" fill="#0F172A" />
                {/* Placeholder Lines */}
                <rect x="35" y="85" width="110" height="8" rx="4" fill="#E2E8F0" />
                <rect x="50" y="102" width="80" height="6" rx="3" fill="#F1F5F9" />
              </g>

              {/* Front Main Body of Envelope */}
              <path d="M30 120 L160 190 L290 120 L290 230 C290 245 275 255 260 255 L60 255 C45 255 30 245 30 230 Z" fill="#FFD60A" stroke="#EAB308" strokeWidth="2" />
              {/* Left & Right Triangular Side Folds */}
              <path d="M30 120 L140 180 L30 245 Z" fill="#FACC15" opacity="0.9" />
              <path d="M290 120 L180 180 L290 245 Z" fill="#FACC15" opacity="0.9" />
              {/* Front Bottom Triangle Fold */}
              <path d="M30 255 L160 165 L290 255 Z" fill="#FFE066" />

              {/* Dotted Flight Path for Airplane */}
              <path d="M190 60 C 210 30, 250 20, 290 5" stroke="#D97706" strokeWidth="2.5" strokeDasharray="5 5" fill="none" />

              {/* Yellow Paper Airplane Flying Out */}
              <g transform="translate(275, -5) rotate(-20) scale(1.1)">
                <path d="M0 25 L45 0 L25 40 L18 26 Z" fill="#FFC800" stroke="#CA8A04" strokeWidth="1.5" />
                <path d="M0 25 L45 0 L18 26 Z" fill="#FFE066" />
                <path d="M18 26 L25 40 L28 23 Z" fill="#EAB308" />
              </g>
            </svg>
          </div>

          {/* Clean White Reset Card */}
          <div className="w-full max-w-[430px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-amber-500/10 border border-amber-100/80 relative z-10 backdrop-blur-xl">
            
            {/* Logo Badge & Card Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#FFC800] rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-md shadow-amber-500/20 mx-auto mb-3 border border-amber-400">
                P
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Proposal <span className="text-[#CA8A04]">Builder</span>
              </h2>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                Forgot Password?
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Success View */}
            {success ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner border border-amber-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-extrabold text-slate-900">Check Your Email</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed font-medium">
                    We&apos;ve sent a password reset link to <strong className="text-slate-900">{email}</strong>
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center justify-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Error Message Alert */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed text-center">
                    {error}
                  </div>
                )}

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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 bg-slate-50/50 text-slate-900 transition-all font-medium placeholder:text-slate-400 outline-none"
                    />
                  </div>
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>

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

                {/* Back to Sign In Link */}
                <div className="text-center pt-2">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center justify-center gap-2 text-xs font-extrabold text-[#CA8A04] hover:text-amber-700 transition-colors py-1"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Footer Accent */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-500 z-10">
        <p className="text-[11px] text-slate-500 font-medium mx-auto sm:mx-0">
          © 2026 iBees Proposal Builder. All rights reserved.
        </p>
        <div className="hidden sm:flex items-center gap-2 font-medium text-slate-500">
          <span>Simplify Proposals. Accelerate Growth.</span>
          <div className="w-6 h-0.5 bg-[#FFC800] rounded-full" />
        </div>
      </footer>
    </div>
  )
}