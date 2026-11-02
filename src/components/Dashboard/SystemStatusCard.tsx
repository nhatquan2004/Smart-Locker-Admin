import { Link } from 'react-router-dom'
import { ChevronRight, ShieldAlert, Wifi, Wrench, CheckCircle2 } from 'lucide-react'
import type { TSystemStatus } from "../../types/dashboard.type"

type TProps = {
  status: TSystemStatus
}

const statusIcons: Record<string, React.ReactNode> = {
  'stations-online': <Wifi className="w-[18px] h-[18px]" />,
  'boxes-maintenance': <Wrench className="w-[18px] h-[18px]" />,
  'issues-open': <ShieldAlert className="w-[18px] h-[18px]" />,
}

// Màu theo mức độ: vạch bên trái, ô icon và giá trị cùng tông
const tones: Record<TSystemStatus['tone'], { accent: string; chip: string; value: string; bg: string }> = {
  healthy: {
    accent: 'border-l-emerald-400',
    chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    value: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-white dark:bg-slate-900/60',
  },
  info: {
    accent: 'border-l-sky-400',
    chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    value: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-white dark:bg-slate-900/60',
  },
  warning: {
    accent: 'border-l-amber-400',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    value: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50/60 dark:bg-amber-500/10',
  },
  critical: {
    accent: 'border-l-red-500',
    chip: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
    value: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50/60 dark:bg-red-500/10',
  },
}

// Một dòng tình trạng vận hành, bấm vào để sang trang xử lý tương ứng
export function SystemStatusCard({ status }: TProps) {
  const tone = tones[status.tone]
  const className = `group flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 ${tone.accent} ${tone.bg} shadow-2xs transition-all duration-150 ${
    status.to ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
  }`

  const body = (
    <>
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone.chip}`}>
        {statusIcons[status.id] ?? <CheckCircle2 className="w-[18px] h-[18px]" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="setting-title-custom text-[13px] font-bold truncate">{status.label}</p>
        <p className="setting-desc-custom text-[11.5px] mt-0.5 line-clamp-2">{status.detail}</p>
      </div>
      <span className={`text-[14px] font-bold whitespace-nowrap ${tone.value}`}>{status.value}</span>
      {status.to && (
        <ChevronRight className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
      )}
    </>
  )

  return status.to ? (
    <Link to={status.to} className={className}>{body}</Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
