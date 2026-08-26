import type { TActivityItem } from "../../types/dashboard.type"

type TProps = {
  item: TActivityItem
}

const toneBadges: Record<string, { label: string; style: string }> = {
  green:  { label: '🔓 Thao tác', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  blue:   { label: '🔑 Sinh OTP', style: 'bg-sky-100 text-sky-800 border-sky-200' },
  purple: { label: '⚡ Cập nhật', style: 'bg-purple-100 text-purple-800 border-purple-200' },
  orange: { label: '⚠️ Cảnh báo', style: 'bg-amber-100 text-amber-800 border-amber-200' },
}

export function ActivityItem({ item }: TProps) {
  const badge = toneBadges[item.tone] || toneBadges.green

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0 hover:bg-sky-50/40 px-2 rounded-xl transition-colors">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.style}`}>
            {badge.label}
          </span>
          <p className="text-[13px] font-bold text-slate-900 truncate">{item.title}</p>
        </div>
        <span className="text-[11px] text-slate-500">{item.description}</span>
      </div>

      <span className="text-[11px] font-mono text-slate-400 shrink-0 font-medium">{item.time}</span>
    </div>
  )
}
