import { useEffect, useState } from 'react'
import { Crosshair, Loader2, Search, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { GeocodeRateLimitError, geocodeAddress } from './geocode'
import type { LockerMapItem } from './types'
import { parseCoord } from './utils'

type Props = {
  locker: LockerMapItem
  lat: string
  lng: string
  // Ẩn tạm thời (không hủy) khi đang ghim trên bản đồ để giữ nguyên dữ liệu đã nhập
  hidden: boolean
  onCoordsChange: (lat: string, lng: string) => void
  onPickOnMap: () => void
  onGeocoded: (lat: number, lng: number) => void
  onSave: (payload: { lat: number; lng: number; locationDescription: string }) => Promise<void>
  onClose: () => void
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/20'

const labelCls = 'mb-1.5 block text-[12px] font-medium text-slate-700 dark:text-slate-300'

export function EditLocationModal({
  locker,
  lat,
  lng,
  hidden,
  onCoordsChange,
  onPickOnMap,
  onGeocoded,
  onSave,
  onClose,
}: Props) {
  const toast = useToast()
  const { t } = useTranslation()
  const [address, setAddress] = useState(
    locker.buildingId?.address || locker.buildingId?.name || '',
  )
  const [description, setDescription] = useState(locker.locationDescription ?? '')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (hidden) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hidden, isSaving, onClose])

  async function handleGeocode() {
    if (!address.trim()) {
      toast.warning(t('map.geoNeedAddress'))
      return
    }
    setIsGeocoding(true)
    try {
      const found = await geocodeAddress(address)
      if (found) {
        onCoordsChange(found.lat.toFixed(6), found.lng.toFixed(6))
        onGeocoded(found.lat, found.lng)
        toast.success(t('map.geoFound', { lat: found.lat.toFixed(5), lng: found.lng.toFixed(5) }))
      } else {
        toast.warning(t('map.geoNotFound'))
      }
    } catch (err) {
      toast.error(
        err instanceof GeocodeRateLimitError
          ? t('map.geoRateLimited')
          : t('map.geoNetwork'),
      )
    } finally {
      setIsGeocoding(false)
    }
  }

  async function handleSave() {
    const latitude = parseCoord(lat, -90, 90)
    const longitude = parseCoord(lng, -180, 180)
    if (latitude === null || longitude === null) {
      toast.warning(t('map.coordRange'))
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        lat: latitude,
        lng: longitude,
        locationDescription: description.trim(),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[1200] items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px] ${
        hidden ? 'hidden' : 'flex'
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose()
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
              {t('map.modalTitle')}
            </h2>
            <p className="mt-0.5 truncate text-[12px] text-slate-500 dark:text-slate-400">
              <span className="font-mono">{locker.code}</span> · {locker.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="custom-scrollbar space-y-4 overflow-y-auto px-5 pb-5 pt-2">
          <div>
            <label className={labelCls}>{t('map.byAddress')}</label>
            <div className="flex gap-2">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleGeocode()
                }}
                placeholder={t('map.addressPh')}
                className={`${inputCls} h-9 flex-1`}
              />
              <button
                type="button"
                onClick={() => void handleGeocode()}
                disabled={isGeocoding}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {isGeocoding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                {t('map.find')}
              </button>
            </div>
            <p className="mt-1.5 text-[11.5px] text-slate-400">
              {t('map.osmNote')}
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
                {t('map.gps')}
              </label>
              <button
                type="button"
                onClick={onPickOnMap}
                className="flex items-center gap-1 text-[12px] font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                <Crosshair className="h-3.5 w-3.5" />
                {t('map.pickOnMap')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="mb-1 block text-[11px] text-slate-400">{t('map.latitude')}</span>
                <input
                  value={lat}
                  onChange={(e) => onCoordsChange(e.target.value, lng)}
                  placeholder="10.842310"
                  inputMode="decimal"
                  className={`${inputCls} h-9 font-mono`}
                />
              </div>
              <div>
                <span className="mb-1 block text-[11px] text-slate-400">{t('map.longitude')}</span>
                <input
                  value={lng}
                  onChange={(e) => onCoordsChange(lat, e.target.value)}
                  placeholder="106.840250"
                  inputMode="decimal"
                  className={`${inputCls} h-9 font-mono`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t('map.descLabel')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('map.descPh')}
              rows={2}
              className={`${inputCls} resize-none py-2`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-9 rounded-lg px-4 text-[12.5px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-sky-600 px-4 text-[12.5px] font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('map.saveLocation')}
          </button>
        </div>
      </div>
    </div>
  )
}
