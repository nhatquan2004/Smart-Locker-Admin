import { useTranslation } from '../../context/LanguageContext'

type TProps = {
  online: number
  total: number
}

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Vòng đo tỷ lệ trạm tủ đang trực tuyến: xanh khi đủ, vàng khi thiếu, đỏ khi không trạm nào kết nối
export function HealthGauge({ online, total }: TProps) {
  const { t } = useTranslation()
  const hasData = total > 0
  const percent = hasData ? Math.round((online / total) * 100) : 0
  const allOnline = hasData && online === total

  const stroke = !hasData
    ? 'stroke-slate-300 dark:stroke-slate-600'
    : allOnline
      ? 'stroke-emerald-500'
      : online === 0
        ? 'stroke-red-500'
        : 'stroke-amber-500'

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="56" cy="56" r={RADIUS} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-700" />
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
            className={`${stroke} transition-[stroke-dashoffset] duration-700 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="setting-title-custom text-[26px] font-bold leading-none">{hasData ? `${percent}%` : '—'}</span>
        </div>
      </div>
      <p className="setting-desc-custom text-[12px] font-medium text-center">
        {hasData ? t('dash.gaugeCaption', { online, total }) : t('dash.healthNoStation')}
      </p>
    </div>
  )
}
