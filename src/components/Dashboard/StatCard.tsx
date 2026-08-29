import type { TDashboardStat } from "../../types/dashboard.type"
import { useEffect, useState } from 'react'
import { Boxes, CheckCircle2, PackageCheck, TrendingUp } from 'lucide-react'

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

const statCardTheme: Record<string, { bgIcon: string; textIcon: string; accentBorder: string; badgeStyle: string }> = {
  'total-lockers': {
    bgIcon: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    textIcon: 'text-sky-600 dark:text-sky-400',
    accentBorder: 'border-t-2 border-t-sky-500',
    badgeStyle: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-bold',
  },
  'available-lockers': {
    bgIcon: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    textIcon: 'text-emerald-600 dark:text-emerald-400',
    accentBorder: 'border-t-2 border-t-emerald-500',
    badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold',
  },
  'active-shipments': {
    bgIcon: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    textIcon: 'text-indigo-600 dark:text-indigo-400',
    accentBorder: 'border-t-2 border-t-indigo-500',
    badgeStyle: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-bold',
  },
  'success-rate': {
    bgIcon: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    textIcon: 'text-purple-600 dark:text-purple-400',
    accentBorder: 'border-t-2 border-t-purple-500',
    badgeStyle: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-bold',
  },
}

const statIcons: Record<TDashboardStat['id'], React.ReactNode> = {
  'total-lockers': <Boxes className="w-5 h-5" />,
  'available-lockers': <CheckCircle2 className="w-5 h-5" />,
  'active-shipments': <PackageCheck className="w-5 h-5" />,
  'success-rate': <TrendingUp className="w-5 h-5" />,
}

export function StatCard({ stat }: TProps) {
  const displayValue = useCountUp(stat.value)
  const theme = statCardTheme[stat.id] || statCardTheme['total-lockers']

  return (
    <article className={`setting-card-custom group relative flex flex-col justify-between gap-4 p-5 rounded-2xl border shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${theme.accentBorder}`}>
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${theme.bgIcon} ${theme.textIcon} shrink-0`}>
          {statIcons[stat.id]}
        </div>
        <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${theme.badgeStyle}`}>
          {stat.change}
        </span>
      </div>

      {/* Value */}
      <div>
        <div className="setting-title-custom text-[28px] font-bold font-mono tracking-tight leading-none">
          {displayValue}
        </div>
        <p className="setting-title-custom mt-1.5 text-[13px] font-bold">{stat.label}</p>
      </div>

      {/* Description */}
      <p className="setting-desc-custom text-[12px] leading-relaxed font-medium">{stat.description}</p>
    </article>
  )
}
