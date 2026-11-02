import { MapPin } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'
import type { TDashboardCell, TDashboardStation } from '../../types/dashboard.type'

type TProps = {
  station: TDashboardStation
  onOpen: () => void
}

// Chiều cao ô theo kích cỡ ngăn thật: ngăn lớn cao hơn ngăn nhỏ nên nhìn giống tủ vật lý
const cellHeight: Record<TDashboardCell['size'], string> = {
  small: 'h-4',
  medium: 'h-6',
  large: 'h-9',
}

const cellColor: Record<TDashboardCell['status'], string> = {
  available: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/40',
  occupied: 'bg-sky-500 border-sky-600 dark:bg-sky-500/80 dark:border-sky-400',
  maintenance: 'bg-amber-200 border-amber-400 dark:bg-amber-500/30 dark:border-amber-500/60',
  fault: 'bg-amber-200 border-amber-400 dark:bg-amber-500/30 dark:border-amber-500/60',
}

const statusKey: Record<TDashboardCell['status'], TranslationKey> = {
  available: 'lockers.statusAvailable',
  occupied: 'lockers.statusOccupied',
  maintenance: 'lockers.statusMaintenance',
  fault: 'lockers.statusMaintenance',
}

const sizeKey: Record<TDashboardCell['size'], TranslationKey> = {
  small: 'ld.size.small',
  medium: 'ld.size.medium',
  large: 'ld.size.large',
}

// Số cột của sơ đồ tăng theo số ngăn để tủ lớn không bị kéo quá dài
function columnsFor(count: number): string {
  if (count <= 10) return 'grid-cols-5'
  if (count <= 20) return 'grid-cols-6'
  return 'grid-cols-8'
}

const stripes = {
  backgroundImage: 'repeating-linear-gradient(45deg, rgba(180, 83, 9, 0.35) 0 3px, transparent 3px 7px)',
}

const statusTone = {
  online: {
    pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    border: 'border-slate-200 dark:border-slate-800',
    label: 'dash.stationOnline' as TranslationKey,
  },
  warning: {
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900/60',
    label: 'dash.stationWarning' as TranslationKey,
  },
  offline: {
    pill: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    border: 'border-red-200 dark:border-red-900/60',
    label: 'lk.statusOffline' as TranslationKey,
  },
}

// Thẻ một trạm tủ: sơ đồ các ngăn tô màu theo trạng thái thật, trạm mất kết nối bị làm mờ
export function StationCard({ station, onOpen }: TProps) {
  const { t } = useTranslation()
  const tone = statusTone[station.status]
  const usedPercent = station.total > 0 ? Math.round(((station.total - station.avail) / station.total) * 100) : 0

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group text-left flex flex-col gap-3 p-4 rounded-2xl border bg-white dark:bg-slate-900/60 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${tone.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {station.code}
        </span>
        <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-semibold shrink-0 ${tone.pill}`}>
          {t(tone.label)}
        </span>
      </div>

      <div className="min-w-0">
        <h3
          className="setting-title-custom text-[14.5px] font-bold leading-snug line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"
          title={station.name}
        >
          {station.name}
        </h3>
        <p className="setting-desc-custom mt-1 flex items-center gap-1 text-[11.5px]">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
          <span className="truncate" title={station.location}>{station.location}</span>
        </p>
      </div>

      {/* Sơ đồ tủ: mỗi ô là một ngăn */}
      <div className={`rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-2.5 ${station.status === 'offline' ? 'opacity-50' : ''}`}>
        {station.cells.length === 0 ? (
          <p className="py-2 text-center text-[11.5px] setting-desc-custom">{t('dash.noCells')}</p>
        ) : (
          <div className={`grid ${columnsFor(station.cells.length)} items-end gap-1.5`}>
            {station.cells.map((cell, i) => (
              <span
                key={`${cell.code}-${i}`}
                title={`#${cell.code} · ${t(sizeKey[cell.size])} · ${t(statusKey[cell.status])}`}
                style={cell.status === 'maintenance' || cell.status === 'fault' ? stripes : undefined}
                className={`rounded-[5px] border ${cellHeight[cell.size]} ${cellColor[cell.status]}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
        <span className="setting-desc-custom">
          {t('dash.available')}: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{station.avail}/{station.total}</strong>
        </span>
        <span className="setting-desc-custom truncate">
          {station.status === 'online'
            ? t('dash.usedPercent', { percent: usedPercent })
            : station.lastSignal === t('map.noSignal')
              ? station.lastSignal
              : t('lk.lastSignal', { time: station.lastSignal })}
        </span>
      </div>
    </button>
  )
}
