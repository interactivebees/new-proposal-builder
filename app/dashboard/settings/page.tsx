'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import PasswordInput from '@/components/PasswordInput'
import { 
  Settings, 
  Lock, 
  Upload, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Percent, 
  KeyRound, 
  Check, 
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
  Sliders
} from 'lucide-react'

interface CompanySettings {
  id?: string
  companyName: string
  logoUrl: string
  address: string
  phone: string
  email: string
  website: string
  defaultPaymentTerms: string
  defaultValidityDays: number
  taxRate: number
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: 'Interactive Bees Pvt. Ltd.',
    logoUrl: '',
    address: 'Plot No. 42, Sector 44, Institutional Area, Gurugram, Haryana - 122003',
    phone: '+91 124 4567890',
    email: 'contact@interactivebees.com',
    website: 'https://www.interactivebees.com',
    defaultPaymentTerms: '50% advance upon project signoff, 30% upon milestone completion',
    defaultValidityDays: 30,
    taxRate: 18.0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Password Drawer State
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data && data.companyName) {
          setSettings(data)
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setSettings({ ...settings, logoUrl: data.url })
      toast.success('Company logo uploaded successfully')
    } catch (err) {
      toast.error('Failed to upload logo')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      toast.success('System settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setPasswordLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      if (response.ok) {
        toast.success('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowPasswordForm(false)
      } else {
        const err = await response.json()
        toast.error(err.error || 'Failed to change password')
      }
    } catch (err) {
      toast.error('Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-12 font-sans max-w-6xl mx-auto">
      
      {/* 1. Top Warm Golden Hero Banner */}
      <div className="bg-gradient-to-r from-[#FFFDF0] via-[#FFF5B8] to-[#FFD84D] rounded-3xl p-6 lg:p-7 border border-amber-300/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Banner Left Info */}
        <div className="space-y-3 z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-950 uppercase block">
            WORKSPACE CONFIGURATION
          </span>
          
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              System &amp; Company Settings
            </h1>
            
            {/* Handwritten 'we believe. we can.' graphic accent */}
            <div className="relative inline-flex items-center px-2.5 py-0.5 transform -rotate-2 bg-amber-100/70 border border-amber-300/80 rounded-md">
              <span className="font-serif italic text-xs font-black text-amber-950 tracking-tight">
                we believe. we can.
              </span>
              <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-amber-400 rounded-full" />
            </div>
          </div>
          
          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed max-w-xl">
            Configure organization profile, default proposal terms, tax rates, and account security.
          </p>
        </div>

        {/* Banner Right Artwork & Cursive Badge */}
        <div className="relative w-full lg:w-96 h-40 shrink-0 flex items-center justify-end z-10 gap-4">
          
          {/* Blue Gear / Cog Graphic */}
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-700 shrink-0">
            <Settings className="w-8 h-8 text-amber-400 stroke-[2] animate-spin-slow" />
          </div>

          {/* Mounted Yellow iBees Signboard Graphic Card */}
          <div className="bg-white rounded-2xl p-2.5 shadow-xl border border-amber-200 flex flex-col items-center justify-center transform rotate-2">
            <div className="bg-[#FFC800] text-slate-950 px-3 py-1.5 rounded-xl border border-amber-300 text-center">
              <span className="font-serif italic font-black text-base text-slate-950 block leading-none">
                iBees
              </span>
              <span className="text-[7px] font-bold text-slate-900 block leading-none mt-0.5">
                we believe. we can.
              </span>
            </div>
          </div>

          {/* Cursive script badge */}
          <div className="hidden xl:block font-serif italic font-black text-sm text-amber-950 leading-tight">
            <p>Your Brand</p>
            <p>Our Platform</p>
            <p className="-mt-0.5 text-xs text-amber-900">Greater Possibilities.</p>
          </div>

        </div>

      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Card Section 1: Account Security */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Account Security
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Keep your account secure with a strong password.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Change Password</span>
              <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
            </button>
          </div>

          {/* Collapsible Change Password Drawer */}
          {showPasswordForm && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Update Account Password
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <PasswordInput
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Section 2: Company Logo & Branding */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Company Logo &amp; Branding
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Upload your company logo and set your organization name.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Logo Preview & Upload Dropzone (Span 6) */}
            <div className="lg:col-span-6 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Company Logo</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Yellow iBees Logo Box Preview */}
                <div className="h-28 bg-[#FFC800] rounded-2xl border border-amber-400 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                  <span className="font-serif italic font-black text-2xl text-slate-950 block leading-none">
                    iBees
                  </span>
                  <span className="text-[9px] font-bold text-slate-900 block leading-none mt-1">
                    we believe. we can.
                  </span>
                </div>

                {/* Upload Logo Box */}
                <div className="h-28 border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/30 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <Upload className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Upload Logo</span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">PNG, JPG, GIF up to 2MB</span>
                  <span className="mt-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 shadow-2xs">
                    Browse Files
                  </span>
                </div>
              </div>
            </div>

            {/* Company Name Field (Span 6) */}
            <div className="lg:col-span-6 space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
              />
              <p className="text-[10px] text-slate-400 font-medium pt-1">
                This name will be used across proposals, invoices and communications.
              </p>
            </div>

          </div>
        </div>

        {/* Card Section 3: Contact Information */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Contact Information
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Update your official contact details for templates and communications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Address</span>
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 text-xs font-medium bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Website</span>
              </label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
              />
            </div>

          </div>
        </div>

        {/* Card Section 4: Default Proposal Settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Default Proposal Settings
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Set up default terms, validity period and tax configuration for new proposals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Payment Terms (Span 6) */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Payment Terms</span>
              </label>
              <select
                value={settings.defaultPaymentTerms}
                onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-2xl outline-none cursor-pointer focus:border-amber-500"
              >
                <option value="50% advance upon project signoff, 30% upon milestone completion">
                  50% advance upon project signoff, 30% upon milestone completion
                </option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="100% Advance">100% Advance</option>
                <option value="50% Advance, 50% On Delivery">50% Advance, 50% On Delivery</option>
              </select>
            </div>

            {/* Validity Days (Span 3) */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Validity Days</span>
              </label>
              <select
                value={settings.defaultValidityDays}
                onChange={(e) => setSettings({ ...settings, defaultValidityDays: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-2xl outline-none cursor-pointer focus:border-amber-500"
              >
                <option value={15}>15 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            {/* Tax Rate (%) (Span 3) */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-slate-400" />
                <span>Tax Rate (%)</span>
              </label>
              <select
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-2xl outline-none cursor-pointer focus:border-amber-500"
              >
                <option value={0}>0% (Tax Exempt)</option>
                <option value={18}>18% (Standard GST)</option>
                <option value={12}>12% (Reduced Tax)</option>
                <option value={5}>5% (Special Rate)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Bottom Form Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#FFC800] hover:bg-[#F5BF00] text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}
