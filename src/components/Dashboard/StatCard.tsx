import type { TDashboardStat } from "../../types/dashboard.type"
import { useEffect, useState } from 'react'

type TProps = {
  stat: TDashboardStat
}

function useCountUp(value: string) {
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const isPercent = value.includes('%')
    const numeric = parseFloat(value.replace('%', ''))
    const decimals = value.includes('.') ? 1 : 0

    let progress = 0
    const timer = window.setInterval(() => {
      progress += 0.05
      if (progress >= 1) {
        progress = 1
        window.clearInterval(timer)
      }
      const current = numeric * progress
      const next = current.toFixed(decimals)
      setDisplay(isPercent ? `${next}%` : `${Math.round(Number(next))}`)
    }, 16)

    return () => window.clearInterval(timer)
  }, [value])

  return display
}

const statCardTheme: Record<string, { bgIcon: string; textIcon: string; badgeStyle: string }> = {
  'total-lockers': {
    bgIcon: 'bg-sky-100 border-sky-200',
    textIcon: 'text-sky-700',
    badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200 font-bold',
  },
  'available-lockers': {
    bgIcon: 'bg-emerald-100 border-emerald-200',
    textIcon: 'text-emerald-700',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
  },
  'active-shipments': {
    bgIcon: 'bg-indigo-100 border-indigo-200',
    textIcon: 'text-indigo-700',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
  },
  'success-rate': {
    bgIcon: 'bg-purple-100 border-purple-200',
    textIcon: 'text-purple-700',
    badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
  },
}

const statIcons: Record<TDashboardStat['id'], React.ReactNode> = {
  'total-lockers': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
  ),
  'available-lockers': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  'active-shipments': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  'success-rate': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
}

export function StatCard({ stat }: TProps) {
  const displayValue = useCountUp(stat.value)
  const theme = statCardTheme[stat.id] || statCardTheme['total-lockers']

  return (
    <article className="group relative flex flex-col justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-sky-300 transition-all duration-200">
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${theme.bgIcon} ${theme.textIcon} shrink-0`}>
          {statIcons[stat.id]}
        </div>
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${theme.badgeStyle}`}>
          {stat.change}
        </span>
      </div>

      {/* Value */}
      <div>
        <div className="text-[28px] font-bold text-slate-900 font-mono tracking-tight leading-none">
          {displayValue}
        </div>
        <p className="mt-1.5 text-[13px] font-bold text-slate-800">{stat.label}</p>
      </div>

      {/* Description */}
      <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{stat.description}</p>
    </article>
  )
}
