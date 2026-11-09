import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { Crosshair, Loader2, MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from '../../context/LanguageContext'

export type TPinSource = 'address' | 'gps' | 'paste' | 'map'
export type TPin = { lat: number; lng: number; source: TPinSource; accuracy?: number }

type TProps = {
  pin: TPin | null
  onPin: (pin: TPin) => void
  confirmed: boolean
  onConfirm: (value: boolean) => void
  // Vị trí tìm được theo địa chỉ, dùng để so xem ghim có lệch xa không
  addressPoint: { lat: number; lng: number } | null
}

// Tâm bản đồ mặc định (TP.HCM) khi chưa có ghim
const DEFAULT_CENTER: [number, number] = [10.762622, 106.660172]
// Cảnh báo khi ghim cách vị trí theo địa chỉ quá ngưỡng này (mét)
const FAR_METERS = 500
// Cảnh báo khi định vị của trình duyệt sai số quá ngưỡng này (mét)
const WEAK_ACCURACY_METERS = 150

const PIN_ICON = L.divIcon({
  className: '',
  html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#0284c7;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45)"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 34],
})

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  return L.latLng(a.lat, a.lng).distanceTo(L.latLng(b.lat, b.lng))
}

// Đọc "10.845740, 106.771790" (dạng Google Maps hiện khi bấm vào một điểm)
function parseLatLng(raw: string): { lat: number; lng: number } | null {
  const m = raw.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/)
  if (!m) return null
  const lat = Number(m[1])
  const lng = Number(m[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

const insideVietnam = (p: { lat: number; lng: number }) => p.lat >= 8 && p.lat <= 24 && p.lng >= 102 && p.lng <= 110

// Đưa bản đồ tới ghim mỗi khi vị trí đổi từ bên ngoài (tìm địa chỉ, GPS, dán tọa độ)
function Follow({ pin }: { pin: TPin | null }) {
  const map = useMap()
  useEffect(() => {
    if (!pin) return
    map.setView([pin.lat, pin.lng], Math.max(map.getZoom(), 17), { animate: true })
    // Chỉ theo dõi toạ độ, không phụ thuộc đối tượng map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.lat, pin?.lng])
  return null
}

function ClickToPin({ onPin }: { onPin: (pin: TPin) => void }) {
  useMapEvents({
    click(e) {
      onPin({ lat: e.latlng.lat, lng: e.latlng.lng, source: 'map' })
    },
  })
  return null
}

// Chọn và xác nhận vị trí tòa nhà: tìm theo địa chỉ, dùng GPS, dán tọa độ Google Maps hoặc kéo ghim trên bản đồ
export function LocationPicker({ pin, onPin, confirmed, onConfirm, addressPoint }: TProps) {
  const { t } = useTranslation()
  const [satellite, setSatellite] = useState(false)
  const [gpsBusy, setGpsBusy] = useState(false)
  const [paste, setPaste] = useState('')
  const [note, setNote] = useState<{ tone: 'ok' | 'warn' | 'err'; text: string } | null>(null)

  function useMyLocation() {
    if (!window.isSecureContext) return setNote({ tone: 'err', text: t('org.w.gpsInsecure') })
    if (!('geolocation' in navigator)) return setNote({ tone: 'err', text: t('org.w.gpsUnsupported') })
    setGpsBusy(true)
    setNote(null)
    navigator.geolocation.getCurrentPosition(
      (res) => {
        setGpsBusy(false)
        const accuracy = Math.round(res.coords.accuracy)
        onPin({ lat: res.coords.latitude, lng: res.coords.longitude, source: 'gps', accuracy })
        setNote(
          accuracy > WEAK_ACCURACY_METERS
            ? { tone: 'warn', text: t('org.w.gpsWeak', { m: accuracy }) }
            : { tone: 'ok', text: t('org.w.gpsOk', { m: accuracy }) },
        )
      },
      (err) => {
        setGpsBusy(false)
        setNote({ tone: 'err', text: err.code === err.PERMISSION_DENIED ? t('org.w.gpsDenied') : t('org.w.gpsFail') })
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  function applyPaste() {
    const parsed = parseLatLng(paste)
    if (!parsed) return setNote({ tone: 'err', text: t('org.w.pasteBad') })
    if (!insideVietnam(parsed)) return setNote({ tone: 'err', text: t('org.w.pasteOutside') })
    onPin({ ...parsed, source: 'paste' })
    setNote(null)
    setPaste('')
  }

  const dist = pin && addressPoint && pin.source !== 'address' ? distanceMeters(pin, addressPoint) : null
  const distText = dist === null ? '' : dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${Math.round(dist)} m`
  const sourceKey = { address: 'org.w.srcAddress', gps: 'org.w.srcGps', paste: 'org.w.srcPaste', map: 'org.w.srcMap' } as const

  const toneCls = {
    ok: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-600 dark:text-amber-400',
    err: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">{t('org.w.mapTitle')}</h4>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">{t('org.w.mapHint')}</p>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <MapContainer center={pin ? [pin.lat, pin.lng] : DEFAULT_CENTER} zoom={pin ? 17 : 12} style={{ height: 260, width: '100%' }}>
          {satellite ? (
            <TileLayer
              key="sat"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              attribution="Tiles &copy; Esri"
            />
          ) : (
            <TileLayer
              key="osm"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          )}
          <Follow pin={pin} />
          <ClickToPin onPin={onPin} />
          {pin && (
            <Marker
              position={[pin.lat, pin.lng]}
              icon={PIN_ICON}
              draggable
              eventHandlers={{
                dragend(e) {
                  const ll = (e.target as L.Marker).getLatLng()
                  onPin({ lat: ll.lat, lng: ll.lng, source: 'map' })
                },
              }}
            />
          )}
        </MapContainer>

        <div className="absolute right-2 top-2 z-[500] flex overflow-hidden rounded-lg border border-slate-200 bg-white text-[11.5px] font-semibold shadow-sm dark:border-slate-600 dark:bg-slate-800">
          {([false, true] as const).map((sat) => (
            <button
              key={String(sat)}
              type="button"
              onClick={() => setSatellite(sat)}
              className={`px-2.5 py-1 cursor-pointer ${satellite === sat ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}
            >
              {sat ? t('org.w.mapSat') : t('org.w.mapStreet')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={gpsBusy}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 text-[12.5px] font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-60 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 cursor-pointer"
        >
          {gpsBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          {gpsBusy ? t('org.w.gpsLocating') : t('org.w.useGps')}
        </button>
        <div className="flex gap-2">
          <input
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyPaste()
              }
            }}
            placeholder={t('org.w.pastePh')}
            aria-label={t('org.w.pasteLabel')}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-[12.5px] text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="button"
            onClick={applyPaste}
            disabled={!paste.trim()}
            className="h-10 shrink-0 rounded-xl border border-slate-200 px-3 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            {t('org.w.pasteBtn')}
          </button>
        </div>
      </div>

      {note && <p className={`text-[12px] ${toneCls[note.tone]}`}>{note.text}</p>}

      <div className="rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/60">
        {pin ? (
          <div className="flex flex-col gap-1.5">
            <p className="flex flex-wrap items-center gap-x-2 text-[12.5px] text-slate-700 dark:text-slate-200">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-600" />
              <span className="font-mono font-semibold">
                {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
              </span>
              <span className="text-slate-500 dark:text-slate-400">({t(sourceKey[pin.source])})</span>
            </p>
            {dist !== null && (
              <p className={`text-[12px] ${dist > FAR_METERS ? toneCls.warn : 'text-slate-500 dark:text-slate-400'}`}>
                {t(dist > FAR_METERS ? 'org.w.distFar' : 'org.w.distNear', { distance: distText })}
              </p>
            )}
            <label className="mt-1 flex cursor-pointer items-start gap-2 text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">
              <input type="checkbox" checked={confirmed} onChange={(e) => onConfirm(e.target.checked)} className="mt-0.5 h-4 w-4 cursor-pointer accent-sky-600" />
              {t('org.w.confirmPin')}
            </label>
          </div>
        ) : (
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400">{t('org.w.noPin')}</p>
        )}
      </div>
    </div>
  )
}
