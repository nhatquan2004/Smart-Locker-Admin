import type { TSystemStatus } from "../../types/dashboard.type"

type TProps = {
  status: TSystemStatus
}

export function SystemStatusCard({ status }: TProps) {
  const isHealthy = status.tone === 'healthy' || status.tone === 'info'

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50/50 hover:border-sky-200 transition-colors">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-semibold text-slate-500">{status.label}</span>
        <p className="text-[13px] font-bold text-slate-900 truncate">{status.detail}</p>
      </div>

      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border shrink-0 ${
        isHealthy
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-amber-100 text-amber-800 border-amber-300'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {status.value}
      </span>
    </div>
  )
}
