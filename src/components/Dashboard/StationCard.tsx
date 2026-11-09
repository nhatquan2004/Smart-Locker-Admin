import { MapPin } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'
import type { TDashboardCell, TDashboardStation } from '../../types/dashboard.type'
import './StationCard.css'

type TProps = {
  station: TDashboardStation
  onOpen: () => void
}

type TSize = TDashboardCell['size']

// Tủ thật xếp ngăn nhỏ ở trên, ngăn lớn ở dưới. Ngăn lớn cao hơn ngăn nhỏ.
const SIZE_ORDER: TSize[] = ['small', 'medium', 'large']
const SIZE_WEIGHT: Record<TSize, number> = { small: 1, medium: 1.4, large: 2 }
const SIZE_LETTER: Record<TSize, string> = { small: 'S', medium: 'M', large: 'L' }

const statusKey: Record<TDashboardCell['status'], TranslationKey> = {
  available: 'lockers.statusAvailable',
  occupied: 'lockers.statusOccupied',
  maintenance: 'lockers.statusMaintenance',
  fault: 'lockers.statusMaintenance',
}

const sizeKey: Record<TSize, TranslationKey> = {
  small: 'ld.size.small',
  medium: 'ld.size.medium',
  large: 'ld.size.large',
}

// Số cột cửa tăng theo số ngăn, cột điều khiển bên trái luôn có một cột
function doorColumnsFor(count: number): number {
  if (count <= 4) return 1
  if (count <= 12) return 2
  if (count <= 20) return 3
  return 4
}

// Bề rộng tủ theo số cột cửa, để mỗi cửa vẫn đủ chỗ cho số thứ tự
const CABINET_WIDTH = [0, 160, 172, 190, 200]

const statusTone = {
  online: {
    pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    border: 'border-slate-200 dark:border-slate-800',
    label: 'dash.stationOnline' as TranslationKey,
    bar: 'bg-sky-500',
  },
  warning: {
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900/60',
    label: 'dash.stationWarning' as TranslationKey,
    bar: 'bg-amber-500',
  },
  offline: {
    pill: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    border: 'border-red-200 dark:border-red-900/60',
    label: 'lk.statusOffline' as TranslationKey,
    bar: 'bg-slate-400',
  },
}

// Thẻ một trạm tủ: tủ gỗ 3D theo mô hình thật, mỗi cửa là một ngăn có đèn LED theo trạng thái thật, trạm mất kết nối bị làm xám
export function StationCard({ station, onOpen }: TProps) {
  const { t } = useTranslation()
  const tone = statusTone[station.status]
  const used = station.total - station.avail
  const usedPercent = station.total > 0 ? Math.round((used / station.total) * 100) : 0

  // Xếp ngăn từ nhỏ đến lớn rồi chia đều vào các cột cửa
  const sorted = SIZE_ORDER.flatMap((size) => station.cells.filter((c) => c.size === size))
  const doorCols = doorColumnsFor(sorted.length)
  const perCol = Math.ceil(sorted.length / doorCols)
  const columns = Array.from({ length: doorCols }, (_, i) => sorted.slice(i * perCol, (i + 1) * perCol)).filter((c) => c.length > 0)
  // Thanh trên màn hình thể hiện tỉ lệ ngăn trống
  const litBars = station.total > 0 ? Math.round((station.avail / station.total) * 5) : 0

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group text-left flex flex-col gap-3 p-4 rounded-2xl border bg-white dark:bg-slate-900/60 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${tone.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {station.code}
        </span>
        <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-semibold shrink-0 ${tone.pill}`}>
          {t(tone.label)}
        </span>
      </div>

      {/* Sân khấu 3D */}
      <div className="sc-stage">
        <span className="sc-floor" aria-hidden="true" />
        {sorted.length === 0 ? (
          <p className="mb-16 text-[11.5px] setting-desc-custom">{t('dash.noCells')}</p>
        ) : (
          <div
            className={`sc-cab ${station.status === 'offline' ? 'sc-offline' : ''}`}
            style={{ ['--sc-w' as string]: `${CABINET_WIDTH[columns.length]}px` }}
          >
            <div className="sc-front">
              {/* Cột điều khiển: camera, màn hình, bảng tên, bàn phím, cửa kỹ thuật */}
              <div className="sc-control">
                <div className="sc-panel sc-panel--top">
                  <span className="sc-camera" />
                  <div className="sc-screen" data-tone={station.status}>
                    <span className="sc-screen__value">
                      {station.avail}/{station.total}
                    </span>
                    <span className="sc-screen__bar">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <i key={n} className={n < litBars ? 'on' : ''} />
                      ))}
                    </span>
                  </div>
                  <span className="sc-nameplate">{station.code}</span>
                  <span className="sc-keypad" aria-hidden="true">
                    {Array.from({ length: 9 }, (_, n) => (
                      <i key={n} />
                    ))}
                  </span>
                </div>
                <div className="sc-panel sc-panel--bottom" />
              </div>

              {/* Các cột cửa ngăn tủ bằng gỗ, đèn LED báo trạng thái */}
              <div className="sc-doors">
                {columns.map((col, ci) => (
                  <div key={ci} className="sc-col">
                    {col.map((cell, i) => {
                      const status = cell.status === 'fault' ? 'maintenance' : cell.status
                      return (
                        <span
                          key={`${cell.code}-${i}`}
                          title={`#${cell.code} · ${t(sizeKey[cell.size])} · ${t(statusKey[cell.status])}`}
                          className={`sc-door sc-wood sc-door--${status}`}
                          style={{ flex: `${SIZE_WEIGHT[cell.size]} 1 0` }}
                        >
                          <span className="sc-door__tint" />
                          <span className="sc-door__no">
                            {cell.code}
                            <small>{SIZE_LETTER[cell.size]}</small>
                          </span>
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="sc-side" aria-hidden="true" />
            <div className="sc-side-left" aria-hidden="true" />
            <div className="sc-plinth" aria-hidden="true">
              <span className="sc-plinth__side" />
            </div>
            <div className="sc-top" aria-hidden="true" />
          </div>
        )}
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

      <div className="flex flex-col gap-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`} style={{ width: `${usedPercent}%` }} />
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
      </div>
    </button>
  )
}
