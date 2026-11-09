import { useEffect, useState } from 'react'
import { AlertTriangle, Check, Copy, Cpu, ExternalLink, Loader2, MapPin, Navigation, Pencil, Route, X } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import { getLockerStationById } from '../../service/lockerStation.service'
import type { TCompartment } from '../../types/lockerStation.type'
import { formatDistance, formatDuration, googleDirectionsUrl, haversineM, type LatLng, type RouteResult } from '../../utils/routing'
import type { LockerMapItem } from './types'
import { formatRelativeTime, hasCoords, statusMeta } from './utils'

type Props = {
  locker: LockerMapItem
  issueCount: number
  myPos: (LatLng & { accuracy: number }) | null
  route: RouteResult | null
  // Đang lấy vị trí của người dùng hoặc đang tìm đường
  navBusy: 'locating' | 'routing' | null
  onClose: () => void
  onEdit: () => void
  onDirections: () => void
  onClearRoute: () => void
  onOpenFull: () => void
  onOpenIssues: () => void
}

type Tab = 'boxes' | 'location'

const boxTone: Record<TCompartment['status'], string> = {
  available: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300',
  occupied: 'border-sky-500 bg-sky-500 text-white dark:border-sky-400 dark:bg-sky-500',
  maintenance: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300',
  fault: 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300',
}

const sizeLetter: Record<TCompartment['size'], string> = { small: 'S', medium: 'M', large: 'L' }

function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      title={t('map2.copy')}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        } catch {
          // Trình duyệt chặn clipboard thì người dùng vẫn bôi đen để sao chép được
        }
      }}
      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <div className="text-[13px] font-medium text-slate-900 dark:text-white">{children}</div>
    </div>
  )
}

// Ngăn chi tiết của một trạm tủ: tab Ngăn tủ (xem từng ngăn) và tab Vị trí (xem chuẩn xác trên bản đồ, chỉ đường)
export function LockerDetailDrawer({
  locker,
  issueCount,
  myPos,
  route,
  navBusy,
  onClose,
  onEdit,
  onDirections,
  onClearRoute,
  onOpenFull,
  onOpenIssues,
}: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('boxes')
  const [boxState, setBoxState] = useState<{ code: string; boxes: TCompartment[] } | null>(null)

  useEffect(() => {
    let active = true
    getLockerStationById(locker.code)
      .then((station) => {
        if (active) setBoxState({ code: locker.code, boxes: station?.compartments ?? [] })
      })
      .catch(() => {
        if (active) setBoxState({ code: locker.code, boxes: [] })
      })
    return () => {
      active = false
    }
  }, [locker.code])

  const boxes = boxState?.code === locker.code ? boxState.boxes : null
  const meta = statusMeta(locker.status)
  const located = hasCoords(locker)
  const dest: LatLng | null = located ? { lat: locker.coordinates!.latitude, lng: locker.coordinates!.longitude } : null
  const coordText = dest ? `${dest.lat.toFixed(6)}, ${dest.lng.toFixed(6)}` : ''

  const free = boxes?.filter((b) => b.status === 'available').length ?? 0
  const used = boxes?.filter((b) => b.status === 'occupied').length ?? 0
  const maint = boxes?.filter((b) => b.status === 'maintenance' || b.status === 'fault').length ?? 0

  return (
    <aside className="absolute bottom-10 right-3 top-16 z-10 flex w-[min(392px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_10px_40px_rgba(15,23,42,0.18)] backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/95">
      {/* Đầu ngăn */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 pb-3 pt-4 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.soft} ${meta.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {t(meta.labelKey)}
            </span>
            <span className="truncate font-mono text-[11.5px] text-slate-500 dark:text-slate-400">{locker.code}</span>
          </div>
          <h2 className="mt-1.5 text-[17px] font-bold leading-snug text-slate-900 dark:text-white">{locker.name}</h2>
          <p className="mt-0.5 truncate text-[12px] text-slate-500 dark:text-slate-400">{locker.buildingId?.name ?? '—'}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-slate-800 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab */}
      <div className="flex gap-1 border-b border-slate-100 px-3 dark:border-slate-800">
        {(['boxes', 'location'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px cursor-pointer border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors ${
              tab === id
                ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t(id === 'boxes' ? 'map2.tabBoxes' : 'map2.tabLocation')}
          </button>
        ))}
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {issueCount > 0 && (
          <button
            type="button"
            onClick={onOpenIssues}
            className="mb-4 flex w-full cursor-pointer items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-left text-[12.5px] font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t('map.openIssues', { count: issueCount })}
          </button>
        )}

        {tab === 'boxes' ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t('map2.boxFree'), value: free, cls: 'text-emerald-600 dark:text-emerald-400' },
                { label: t('map2.boxUsed'), value: used, cls: 'text-sky-600 dark:text-sky-400' },
                { label: t('map2.boxMaint'), value: maint, cls: 'text-amber-600 dark:text-amber-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                  <p className={`font-mono text-[22px] font-bold leading-none ${s.cls}`}>{boxes ? s.value : '—'}</p>
                  <p className="mt-1 text-[11.5px] text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {boxes === null ? (
              <div className="flex items-center justify-center gap-2 py-8 text-[12.5px] text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('map2.boxesLoading')}
              </div>
            ) : boxes.length === 0 ? (
              <p className="py-6 text-center text-[12.5px] text-slate-500 dark:text-slate-400">{t('map2.boxesEmpty')}</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {boxes.map((b) => (
                  <div
                    key={b.id}
                    title={t('map2.boxTip', { n: b.code, status: t(`map2.box.${b.status}` as 'map2.box.available') })}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 ${boxTone[b.status]}`}
                  >
                    <span className="font-mono text-[15px] font-bold leading-none">{b.code}</span>
                    <span className="mt-1 text-[10px] font-semibold opacity-80">{sizeLetter[b.size]}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border-2 border-emerald-300 bg-emerald-50" />{t('map2.boxFree')}</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-sky-500" />{t('map2.boxUsed')}</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border-2 border-amber-300 bg-amber-50" />{t('map2.boxMaint')}</span>
              <span>S · M · L</span>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3.5 dark:border-slate-700">
              <h3 className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                <Cpu className="h-3.5 w-3.5" />
                {t('map2.info')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('map2.totalBoxes')}>{locker.totalBoxes}</Field>
                <Field label={t('map2.signal')}>{formatRelativeTime(locker.lastHeartbeatAt)}</Field>
                <div className="col-span-2">
                  <Field label={t('map2.mac')}>
                    <span className="font-mono text-[12.5px]">{locker.macAddress ?? '—'}</span>
                  </Field>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenFull}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('map2.openFull')}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3.5 dark:border-slate-700">
              <Field label={t('map2.building')}>
                <p>{locker.buildingId?.name ?? '—'}</p>
                {locker.buildingId?.address && <p className="mt-0.5 text-[12.5px] font-normal text-slate-600 dark:text-slate-300">{locker.buildingId.address}</p>}
              </Field>
              <Field label={t('map2.place')}>{locker.locationDescription || <span className="font-normal text-slate-400">{t('map2.noPlace')}</span>}</Field>
              <Field label={t('map2.coords')}>
                {dest ? (
                  <span className="flex items-center gap-1">
                    <span className="font-mono text-[12.5px]">{coordText}</span>
                    <CopyButton value={coordText} />
                  </span>
                ) : (
                  <span className="font-normal text-slate-400">—</span>
                )}
              </Field>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-3.5 w-3.5" />
                {dest ? t('map.btnEdit') : t('map.setLocation')}
              </button>
            </div>

            {dest ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5 dark:border-sky-500/30 dark:bg-sky-500/10">
                <h3 className="flex items-center gap-1.5 text-[12.5px] font-bold text-sky-800 dark:text-sky-200">
                  <Route className="h-4 w-4" />
                  {t('map2.navTitle')}
                </h3>

                {route ? (
                  <>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">
                      {t('map2.navResult', { dist: formatDistance(route.distanceM), time: formatDuration(route.durationS) })}
                    </p>
                    {route.source === 'straight' && <p className="text-[12px] text-amber-700 dark:text-amber-300">{t('map2.navStraight')}</p>}
                  </>
                ) : myPos ? (
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-300">{t('map2.navAway', { dist: formatDistance(haversineM(myPos, dest)) })}</p>
                ) : (
                  <p className="text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">{t('map2.navNeedLoc')}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onDirections}
                    disabled={navBusy !== null}
                    className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-[13px] font-bold text-white hover:bg-sky-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    {navBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    {navBusy === 'locating' ? t('map2.navLocating') : navBusy === 'routing' ? t('map2.navRouting') : t('map2.navBtn')}
                  </button>
                  <a
                    href={googleDirectionsUrl(dest, myPos ?? undefined)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-sky-300 bg-white px-4 text-[13px] font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-500/40 dark:bg-transparent dark:text-sky-200"
                  >
                    {t('map2.navGoogle')}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                {route && (
                  <button type="button" onClick={onClearRoute} className="w-fit cursor-pointer text-[12px] font-semibold text-slate-500 hover:underline dark:text-slate-400">
                    {t('map2.navClear')}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3.5 text-[12.5px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {t('map2.noCoordsMsg')}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
