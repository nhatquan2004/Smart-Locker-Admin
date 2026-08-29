import type { TActivityItem } from "../../types/dashboard.type"
import { Lock, Key, RefreshCw, AlertTriangle } from 'lucide-react'

type TProps = {
  item: TActivityItem
}

const toneBadges: Record<string, { label: string; icon: React.ReactNode; style: string }> = {
  green:  { label: 'Thao tác', icon: <Lock className="w-3 h-3" />, style: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  blue:   { label: 'Sinh OTP', icon: <Key className="w-3 h-3" />, style: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
  purple: { label: 'Cập nhật', icon: <RefreshCw className="w-3 h-3" />, style: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  orange: { label: 'Cảnh báo', icon: <AlertTriangle className="w-3 h-3" />, style: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
}

export function ActivityItem({ item }: TProps) {
  const badge = toneBadges[item.tone] || toneBadges.green

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800/80 last:border-0 hover:bg-sky-50/40 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.style}`}>
            {badge.icon}
            {badge.label}
          </span>
          <p className="setting-title-custom text-[13px] font-bold truncate">{item.title}</p>
        </div>
        <span className="setting-desc-custom text-[11px] font-medium">{item.description}</span>
      </div>

      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 font-medium">{item.time}</span>
    </div>
  )
}
