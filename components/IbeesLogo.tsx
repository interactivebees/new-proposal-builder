import Link from 'next/link'

interface IbeesLogoProps {
  variant?: 'full' | 'badge' | 'header'
  className?: string
}

export default function IbeesLogo({ variant = 'header', className = '' }: IbeesLogoProps) {
  if (variant === 'badge') {
    return (
      <div className={`bg-[#FFC800] text-black rounded-xl p-2 font-sans flex items-center gap-2 shadow-sm ${className}`}>
        <span className="font-serif italic font-extrabold text-lg tracking-tight leading-none">
          iBees
        </span>
        <div className="flex flex-col text-[8px] font-serif italic leading-none text-slate-900 border-l border-black/20 pl-1.5">
          <span>we believe,</span>
          <span>we can.</span>
        </div>
      </div>
    )
  }

  return (
    <Link href="/dashboard" className={`flex items-center gap-3 group ${className}`}>
      {/* Yellow Logo Box */}
      <div className="bg-[#FFC800] text-black px-3 py-1.5 rounded-xl shadow-md shadow-amber-500/20 flex flex-col justify-center border border-amber-400 group-hover:scale-105 transition-transform shrink-0">
        <span className="font-serif italic font-black text-xl leading-none tracking-tight text-slate-950">
          iBees
        </span>
        <span className="text-[7.5px] font-serif italic text-slate-900 leading-none mt-0.5 tracking-tight">
          we believe, we can.
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
          Proposal <span className="text-[#CA8A04]">Builder</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
          ENTERPRISE PORTAL
        </span>
      </div>
    </Link>
  )
}
