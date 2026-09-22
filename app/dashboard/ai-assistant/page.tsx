'use client'

import { useState } from 'react'
import { 
  Sparkles, 
  Wand2, 
  Copy, 
  Check, 
  FileText, 
  MessageSquare, 
  RefreshCw,
  Send,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('Executive')
  const [moduleType, setModuleType] = useState('Executive Summary')
  const [generating, setGenerating] = useState(false)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (type: string) => {
    setGenerating(true)
    setModuleType(type)
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, tone })
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      setOutput(data.text || data.error)
      toast.success(`${type} generated successfully!`)
    } catch (err) {
      console.error(err)
      toast.error('AI generation failed')
      setOutput('')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Generated text copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5 pb-6 font-sans">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            ARTIFICIAL INTELLIGENCE
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              AI Proposal Assistant
            </h1>
            
            {/* Handwritten 'we believe. we can.' graphic accent */}
            <div className="relative inline-flex items-center px-2.5 py-0.5 transform -rotate-2 bg-amber-100/70 border border-amber-300/80 rounded-md">
              <span className="font-serif italic text-xs font-black text-amber-950 tracking-tight">
                we believe. we can.
              </span>
              <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-amber-400 rounded-full" />
            </div>
          </div>
          
          <p className="text-xs font-medium text-slate-500 mt-1.5 max-w-2xl">
            Generate executive summaries, technical scopes of work, SLA clauses, and FAQs powered by GenAI models.
          </p>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Controls (1/3) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wand2 className="w-4 h-4 text-amber-600" />
            AI Prompt &amp; Controls
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Proposal Topic / Client Brief</label>
            <textarea
              rows={4}
              placeholder="e.g. Enterprise Web Portal for Healthcare Patient Records Management..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tone &amp; Style</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
            >
              <option value="Executive">Executive &amp; Formal</option>
              <option value="Technical">Technical &amp; Detailed</option>
              <option value="Persuasive">Persuasive &amp; Sales-focused</option>
              <option value="Concise">Short &amp; Concise</option>
            </select>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Generate Module
            </span>

            <button
              onClick={() => handleGenerate('Executive Summary')}
              disabled={generating}
              className="w-full py-2.5 px-3 bg-[#FEF08A] hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all border border-amber-300/80 text-left flex items-center justify-between disabled:opacity-50"
            >
              <span>Executive Summary</span>
              <Zap className="w-3.5 h-3.5 text-slate-950" />
            </button>

            <button
              onClick={() => handleGenerate('Scope of Work')}
              disabled={generating}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all text-left flex items-center justify-between disabled:opacity-50"
            >
              <span>Scope of Work</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => handleGenerate('SLA Clauses')}
              disabled={generating}
              className="w-full py-2.5 px-3 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-left flex items-center justify-between disabled:opacity-50"
            >
              <span>SLA &amp; Security Clauses</span>
              <Zap className="w-3.5 h-3.5 text-amber-600" />
            </button>

            <button
              onClick={() => handleGenerate('FAQs')}
              disabled={generating}
              className="w-full py-2.5 px-3 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-left flex items-center justify-between disabled:opacity-50"
            >
              <span>Frequently Asked Questions</span>
              <Zap className="w-3.5 h-3.5 text-purple-600" />
            </button>
          </div>

        </div>

        {/* Right Output Sandbox (2/3) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Generated Output Sandbox ({moduleType})
              </h3>

              {output && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Text</span>
                </button>
              )}
            </div>

            {generating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="text-xs font-bold text-slate-600">Generating proposal text with AI...</p>
              </div>
            ) : output ? (
              <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-100 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {output}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-2">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Ready to Generate</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Select a module from the left panel to generate executive proposal copy automatically.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
            AI generated copy can be copied directly into the Proposal Editor.
          </div>
        </div>

      </div>

    </div>
  )
}
