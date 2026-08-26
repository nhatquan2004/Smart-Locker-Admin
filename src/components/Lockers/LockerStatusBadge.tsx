import type { TLockerStatus } from '../../types/locker.type'

type TProps = {
  status: TLockerStatus
}

const statusBadges: Record<TLockerStatus, { label: string; style: string }> = {
  available:   { label: 'Sẵn sàng (Available)', style: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
  occupied:    { label: 'Đã có hàng (Occupied)', style: 'bg-sky-100 text-sky-800 border-sky-300 font-bold' },
  offline:     { label: 'Mat kết nối (Offline)', style: 'bg-red-100 text-red-800 border-red-300 font-bold' },
  maintenance: { label: 'Bảo trì (Maintenance)', style: 'bg-amber-100 text-amber-800 border-amber-300 font-bold' },
}

export function LockerStatusBadge({ status }: TProps) {
  const badge = statusBadges[status] || statusBadges.available

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${badge.style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {badge.label}
    </span>
  )
}
