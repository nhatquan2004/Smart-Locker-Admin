import { useEffect } from 'react'
import { Check, Crosshair } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'

type Props = {
  lockerCode: string
  lat: string
  lng: string
  onConfirm: () => void
  onCancel: () => void
}

// Thanh nổi hiển thị khi đang ghim vị trí: Xác nhận giữ tọa độ, Hủy khôi phục tọa độ cũ
export function PickingBar({ lockerCode, lat, lng, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()
  const hasPoint = Boolean(lat && lng)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed left-1/2 top-20 z-[1200] flex w-[92vw] max-w-lg -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-900 sm:w-auto">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
          <Crosshair className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
            {t('map.pickTitle')} <span className="font-mono">{lockerCode}</span>
          </p>
          <p className="truncate text-[12px] text-slate-500 dark:text-slate-400">
            {hasPoint ? (
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {lat}, {lng}
              </span>
            ) : (
              t('map.pickHint')
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-lg px-3 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!hasPoint}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-sky-600 px-3 text-[12px] font-medium text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {t('map.confirm')}
        </button>
      </div>
    </div>
  )
}
