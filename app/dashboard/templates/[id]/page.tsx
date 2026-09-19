'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit3, Plus, Layers, Sparkles, Save, FileText } from 'lucide-react'

interface Template {
  id: string
  name: string
  category?: string
  description?: string
  sections: any
  createdAt: string
  creator?: {
    name: string
    email: string
  }
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  useEffect(() => {
    // Automatically redirect to the template section editor page for seamless section management
    router.replace(`/dashboard/templates/${templateId}/edit`)
  }, [templateId, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        <p className="text-xs font-bold text-slate-500">Opening Template Section Editor...</p>
      </div>
    </div>
  )
}
