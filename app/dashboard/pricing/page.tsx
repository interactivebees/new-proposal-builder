'use client'

import { useState } from 'react'
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  IndianRupee, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Sparkles,
  PieChart,
  Percent,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LineItem {
  id: string
  description: string
  quantity: number
  unitCost: number
  frequency: 'One-time' | 'Monthly' | 'Yearly'
  isOptional: boolean
  discountPercent: number
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', rate: 1, name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', rate: 0.012, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 0.011, name: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.0094, name: 'British Pound' }
]

const PRESETS = [
  {
    name: 'Web Portal Starter Pack',
    items: [
      { id: '1', description: 'UI/UX Design & Prototyping', quantity: 1, unitCost: 150000, frequency: 'One-time', isOptional: false, discountPercent: 0 },
      { id: '2', description: 'Next.js Frontend & API Integration', quantity: 1, unitCost: 350000, frequency: 'One-time', isOptional: false, discountPercent: 5 },
      { id: '3', description: 'Cloud Infrastructure & Managed Maintenance', quantity: 12, unitCost: 15000, frequency: 'Monthly', isOptional: true, discountPercent: 0 }
    ]
  },
  {
    name: 'Enterprise ERP Suite',
    items: [
      { id: '1', description: 'Core ERP License & Configuration', quantity: 1, unitCost: 850000, frequency: 'One-time', isOptional: false, discountPercent: 10 },
      { id: '2', description: 'Data Migration & ETL Setup', quantity: 1, unitCost: 250000, frequency: 'One-time', isOptional: false, discountPercent: 0 },
      { id: '3', description: 'Staff Training & Onboarding (per batch)', quantity: 3, unitCost: 50000, frequency: 'One-time', isOptional: true, discountPercent: 0 }
    ]
  }
]

export default function PricingPage() {
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [taxRate, setTaxRate] = useState(18) // 18% GST default
  const [marginPercent, setMarginPercent] = useState(35) // 35% margin default
  const [copied, setCopied] = useState(false)

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Enterprise Web Application Development', quantity: 1, unitCost: 450000, frequency: 'One-time', isOptional: false, discountPercent: 5 },
    { id: '2', description: 'AWS Cloud Infrastructure Setup & Hardening', quantity: 1, unitCost: 120000, frequency: 'One-time', isOptional: false, discountPercent: 0 },
    { id: '3', description: '24/7 Managed SLA & Technical Support', quantity: 12, unitCost: 20000, frequency: 'Monthly', isOptional: true, discountPercent: 0 },
  ])

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'Custom Service / Deliverable',
      quantity: 1,
      unitCost: 50000,
      frequency: 'One-time',
      isOptional: false,
      discountPercent: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const loadPreset = (presetItems: any[]) => {
    setItems(presetItems.map(i => ({ ...i, id: Date.now().toString() + Math.random() })))
    toast.success('Preset BOM loaded!')
  }

  // Financial Calculations
  const activeItems = items.filter(i => !i.isOptional)
  
  const subtotal = activeItems.reduce((acc, i) => {
    const itemTotal = i.quantity * i.unitCost
    const discount = itemTotal * (i.discountPercent / 100)
    return acc + (itemTotal - discount)
  }, 0)

  const totalDiscount = activeItems.reduce((acc, i) => {
    return acc + (i.quantity * i.unitCost * (i.discountPercent / 100))
  }, 0)

  const taxAmount = subtotal * (taxRate / 100)
  const totalContractValue = subtotal + taxAmount

  const estimatedProfit = subtotal * (marginPercent / 100)
  const baseCost = subtotal - estimatedProfit

  // ARR Calculation (Monthly items * 12 + Yearly items)
  const arr = activeItems.reduce((acc, i) => {
    const lineVal = (i.quantity * i.unitCost) * (1 - i.discountPercent / 100)
    if (i.frequency === 'Monthly') return acc + (lineVal * 12)
    if (i.frequency === 'Yearly') return acc + lineVal
    return acc
  }, 0)

  const formatMoney = (amount: number) => {
    const converted = amount * currency.rate
    return `${currency.symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const handleCopyBOM = () => {
    const bomData = {
      currency: currency.code,
      subtotal,
      taxAmount,
      totalContractValue,
      items
    }
    navigator.clipboard.writeText(JSON.stringify(bomData, null, 2))
    setCopied(true)
    toast.success('BOM JSON copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5 pb-6 font-sans">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            FINANCIAL MODELING
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pricing &amp; BOM Calculator
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
            Build itemized Bill of Materials (BOM), multi-currency estimates, tax rules, and profit margins.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopyBOM}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
            <span>Export BOM JSON</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Currency, Presets, Tax Rate */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Currency Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Currency</label>
          <div className="flex gap-1.5">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c)}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl border transition-all ${
                  currency.code === c.code
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Packages */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Load Preset Template</label>
          <select
            onChange={(e) => {
              const preset = PRESETS.find(p => p.name === e.target.value)
              if (preset) loadPreset(preset.items)
            }}
            defaultValue=""
            className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white focus:border-blue-500"
          >
            <option value="" disabled>Select pre-built package...</option>
            {PRESETS.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Tax Rate & Target Margin */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profit Margin (%)</label>
            <input
              type="number"
              value={marginPercent}
              onChange={(e) => setMarginPercent(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-blue-500"
            />
          </div>
        </div>

      </div>

      {/* Main Grid: BOM Calculator Table & Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Interactive BOM Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Bill of Materials (BOM) Items
            </h2>
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Deliverable Description</th>
                  <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-28">Unit Cost</th>
                  <th className="py-2.5 px-3 w-24">Freq</th>
                  <th className="py-2.5 px-3 w-20 text-center">Disc %</th>
                  <th className="py-2.5 px-3 w-28 text-right">Net Line</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {items.map((item) => {
                  const rawTotal = item.quantity * item.unitCost
                  const netTotal = rawTotal * (1 - item.discountPercent / 100)
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/60 transition-colors ${item.isOptional ? 'opacity-60 bg-slate-50/40' : ''}`}>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none"
                        />
                        <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isOptional}
                            onChange={(e) => updateItem(item.id, 'isOptional', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-0"
                          />
                          <span className="text-[10px] font-semibold text-slate-400">Optional Add-on</span>
                        </label>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-12 text-center font-bold border border-slate-200 rounded-lg py-1 outline-none focus:border-blue-500"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateItem(item.id, 'unitCost', Number(e.target.value))}
                          className="w-24 font-mono font-medium border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={item.frequency}
                          onChange={(e) => updateItem(item.id, 'frequency', e.target.value)}
                          className="w-full font-medium border border-slate-200 rounded-lg px-1.5 py-1 outline-none bg-white text-[11px]"
                        >
                          <option value="One-time">One-time</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discountPercent}
                          onChange={(e) => updateItem(item.id, 'discountPercent', Number(e.target.value))}
                          className="w-14 text-center font-mono border border-slate-200 rounded-lg py-1 outline-none focus:border-blue-500"
                        />
                      </td>

                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        {formatMoney(netTotal)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 rounded text-slate-300 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1/3): Financial Summary Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-400" />
                Financial Summary
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                {currency.code} ({currency.symbol})
              </span>
            </div>

            {/* Financial Rows */}
            <div className="space-y-2.5 text-xs font-medium text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal (Net):</span>
                <span className="font-bold text-white">{formatMoney(subtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Total Discount Applied:</span>
                  <span className="font-bold">-{formatMoney(totalDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Tax ({taxRate}% GST/VAT):</span>
                <span className="font-bold text-white">{formatMoney(taxAmount)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800 text-slate-400">
                <span>Estimated Target Margin ({marginPercent}%):</span>
                <span className="font-bold text-emerald-400">{formatMoney(estimatedProfit)}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Est. Annual Recurring (ARR):</span>
                <span className="font-bold text-purple-300">{formatMoney(arr)}</span>
              </div>
            </div>

            {/* TCV Highlight Box */}
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                Total Contract Value (TCV)
              </span>
              <div className="text-3xl font-black text-white tracking-tight">
                {formatMoney(totalContractValue)}
              </div>
            </div>

          </div>

          <div className="text-[11px] text-slate-400 text-center font-medium">
            Calculated in real-time based on active non-optional line items.
          </div>
        </div>

      </div>

    </div>
  )
}
