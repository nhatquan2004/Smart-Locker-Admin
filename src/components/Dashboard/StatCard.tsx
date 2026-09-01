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

const statIcons: Record<TDashboardStat['id'], React.ReactNode> = {
  'total-lockers': <Boxes className="w-5 h-5" />,
  'available-lockers': <CheckCircle2 className="w-5 h-5" />,
  'active-shipments': <PackageCheck className="w-5 h-5" />,
  'success-rate': <TrendingUp className="w-5 h-5" />,
}

export function StatCard({ stat }: TProps) {
  const displayValue = useCountUp(stat.value)

  return (
    <article className="setting-card-custom group flex flex-col justify-between gap-4 p-5 rounded-2xl border shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {/* Top row: icon + clean text tag */}
      <div className="flex items-center justify-between gap-2">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
          {statIcons[stat.id]}
        </div>
        <span className="text-[12px] font-mono font-medium text-slate-500 dark:text-slate-400">
          {stat.change}
        </span>
      </div>

      {/* Value & Label */}
      <div>
        <div className="setting-title-custom text-[28px] font-bold font-mono tracking-tight leading-none">
          {displayValue}
        </div>
        <p className="setting-title-custom mt-1.5 text-[13.5px] font-bold">{stat.label}</p>
      </div>

      {/* Description */}
      <p className="setting-desc-custom text-[12px] leading-relaxed font-medium">{stat.description}</p>
    </article>
  )
}
