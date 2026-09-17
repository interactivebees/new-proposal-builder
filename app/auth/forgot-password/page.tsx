'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ShieldCheck, Zap, ArrowRight, ArrowLeft, CheckCircle2, Lock, Send } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/60 relative overflow-hidden flex flex-col justify-between font-sans">
      {/* Background Decorative Graphic Shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-200/30 via-indigo-100/20 to-transparent rounded-l-[120px] pointer-events-none -z-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <Link href="/auth/signin" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30">
            P
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Proposal <span className="text-blue-600">Builder</span>
          </span>
        </Link>
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
        
        {/* Left Side: Hero Section & Illustration */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-6 relative">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-blue-600 tracking-widest uppercase block">
              Proposal Builder
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Reset Your <br />
              <span className="text-slate-900">Password</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed pt-1">
              No worries! Enter your email address and we&apos;ll send you a secure link to reset your password.
            </p>
          </div>

          {/* 3 Feature Highlight Cards */}
          <div className="space-y-5 max-w-md pt-2">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 p-2 rounded-2xl transition-all hover:bg-white/60">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Quick &amp; Secure</h3>
                <p className="text-sm text-slate-500 mt-0.5">Get a reset link in your inbox</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 p-2 rounded-2xl transition-all hover:bg-white/60">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Your Data is Safe</h3>
                <p className="text-sm text-slate-500 mt-0.5">We follow best security practices</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 p-2 rounded-2xl transition-all hover:bg-white/60">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Get Back to Work</h3>
                <p className="text-sm text-slate-500 mt-0.5">Access your account in minutes</p>
              </div>
            </div>
          </div>

          {/* Handwritten Accent Text */}
          <div className="pt-4 pl-2 relative">
            <span className="font-serif italic text-2xl text-blue-600 tracking-wide inline-block -rotate-3 select-none">
              Ideas to Impact
            </span>
            <svg className="w-48 h-3 text-blue-500/60 mt-1" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 9.5C40 3.5 120 2 197.5 9.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Right Side: Reset Form Card with Floating 3D Envelope Illustration */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center">
          
          {/* 3D Envelope & Paper Airplane Background Graphics */}
          <div className="hidden sm:block absolute -left-24 -top-8 w-72 h-64 pointer-events-none z-0 opacity-90">
            {/* Open Envelope Card */}
            <div className="w-56 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl border border-blue-200 shadow-xl p-4 transform -rotate-12 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-md">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 opacity-60">
                <div className="h-2 bg-blue-400/50 rounded w-3/4 mx-auto" />
                <div className="h-2 bg-blue-300/40 rounded w-1/2 mx-auto" />
              </div>
              {/* Envelope Flap Accent */}
              <div className="absolute inset-x-0 top-0 h-12 bg-blue-200/40 border-b border-blue-300/40 clip-triangle" />
            </div>

            {/* Paper Airplane with Dotted Trail */}
            <div className="absolute right-0 top-2 transform rotate-12">
              <div className="text-blue-500 transform -rotate-45">
                <Send className="w-8 h-8 fill-blue-500/20 stroke-blue-600 stroke-2" />
              </div>
              <svg className="w-24 h-12 text-blue-400/60 absolute -left-16 top-4" viewBox="0 0 100 50" fill="none">
                <path d="M0 45 C 30 40, 60 20, 95 5" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>

          {/* Clean White Reset Card */}
          <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-600/10 border border-slate-100 relative z-10 backdrop-blur-xl">
            
            {/* Logo Badge & Card Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-600/30 mx-auto mb-3">
                P
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Proposal <span className="text-blue-600">Builder</span>
              </h2>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                Forgot Password?
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Success View */}
            {success ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900">Check Your Email</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    We&apos;ve sent a password reset link to <strong className="text-slate-800">{email}</strong>
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50/50 text-slate-900 transition-all font-medium placeholder:text-slate-400 outline-none"
                    />
                  </div>
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    or
                  </span>
                </div>

                {/* Back to Sign In Link */}
                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors py-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Footer Accent */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-400 z-10">
        <p className="text-[11px] text-slate-400 font-medium mx-auto sm:mx-0">
          © 2026 Proposal Builder. All rights reserved.
        </p>
        <div className="hidden sm:block text-right">
          <div className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase space-y-0.5">
            <p>BUILD</p>
            <p>COLLABORATE</p>
            <p>WIN</p>
          </div>
          <div className="w-8 h-0.5 bg-blue-500/40 ml-auto mt-1 rounded-full" />
        </div>
      </footer>
    </div>
  )
}