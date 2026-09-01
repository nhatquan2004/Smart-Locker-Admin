import type { TSystemStatus } from "../../types/dashboard.type"
import { Cpu, Server, Wifi, CheckCircle2 } from 'lucide-react'

type TProps = {
  status: TSystemStatus
}

const statusIcons: Record<string, React.ReactNode> = {
  mcu: <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
  server: <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  gateway: <Wifi className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
}

export function SystemStatusCard({ status }: TProps) {
  const isHealthy = status.tone === 'healthy' || status.tone === 'info'

  return (
    <div className="setting-card-custom flex items-center justify-between gap-4 p-3.5 rounded-xl border hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8.5 h-8.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0">
          {statusIcons[status.id] || <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="setting-title-custom text-[13px] font-bold truncate">{status.label}</span>
          <p className="setting-desc-custom text-[11.5px] font-medium truncate mt-0.5">{status.detail}</p>
        </div>
      </div>

      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border shrink-0 ${
        isHealthy
          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {status.value}
      </span>
    </div>
  )
}
