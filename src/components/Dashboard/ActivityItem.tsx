import type { TActivityItem } from "../../types/dashboard.type"
import { Lock, Key, RefreshCw, AlertTriangle } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'

type TProps = {
  item: TActivityItem
}

const toneBadges: Record<string, { labelKey: TranslationKey; icon: React.ReactNode; style: string }> = {
  green:  { labelKey: 'dash.tone.green', icon: <Lock className="w-3 h-3 text-slate-500" />, style: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  blue:   { labelKey: 'dash.tone.blue', icon: <Key className="w-3 h-3 text-slate-500" />, style: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  purple: { labelKey: 'dash.tone.purple', icon: <RefreshCw className="w-3 h-3 text-slate-500" />, style: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  orange: { labelKey: 'dash.tone.orange', icon: <AlertTriangle className="w-3 h-3 text-amber-500" />, style: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
}

export function ActivityItem({ item }: TProps) {
  const { t } = useTranslation()
  const badge = toneBadges[item.tone] || toneBadges.green

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800/80 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${badge.style}`}>
            {badge.icon}
            {t(badge.labelKey)}
          </span>
          <p className="setting-title-custom text-[13px] font-bold truncate">{item.title}</p>
        </div>
        <span className="setting-desc-custom text-[11.5px] font-medium">{item.description}</span>
      </div>

      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 font-medium">{item.time}</span>
    </div>
  )
}
