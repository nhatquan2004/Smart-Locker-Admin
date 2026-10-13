import type { TLockerStatus } from '../../types/locker.type'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'

type TProps = {
  status: TLockerStatus
}

const statusBadges: Record<TLockerStatus, { labelKey: TranslationKey; style: string }> = {
  available:   { labelKey: 'lk.badge.available', style: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
  occupied:    { labelKey: 'lk.badge.occupied', style: 'bg-sky-100 text-sky-800 border-sky-300 font-bold' },
  offline:     { labelKey: 'lk.badge.offline', style: 'bg-red-100 text-red-800 border-red-300 font-bold' },
  maintenance: { labelKey: 'lk.badge.maintenance', style: 'bg-amber-100 text-amber-800 border-amber-300 font-bold' },
}

export function LockerStatusBadge({ status }: TProps) {
  const { t } = useTranslation()
  const badge = statusBadges[status] || statusBadges.available

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${badge.style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {t(badge.labelKey)}
    </span>
  )
}
