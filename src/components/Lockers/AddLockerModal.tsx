import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, Copy, MapPin, X } from 'lucide-react'
import { AppButton } from '../common'
import { useTranslation } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import {
  createLocker,
  getLockerBuildingId,
  getLockers,
  suggestLockerCode,
  type TCreatedLocker,
} from '../../service/lockerApi.service'

type TProps = {
  org: { id: string; code: string; name: string; latitude?: number; longitude?: number }
  onClose: () => void
  // Gọi sau khi tạo xong để trang cha tải lại danh sách
  onCreated?: () => void
}

const inputCls =
  'h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500'
const labelCls = 'text-[12px] font-semibold text-slate-700 dark:text-slate-300'

function CopyRow({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Trình duyệt chặn clipboard thì người dùng vẫn có thể bôi đen để sao chép
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={labelCls}>{label}</span>
      <div className="flex items-center gap-2">
        <code className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[12px] font-mono font-bold text-slate-800 dark:text-slate-200 break-all select-all">
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          className="h-9 px-3 rounded-xl text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? t('ci.copied') : t('ci.copy')}
        </button>
      </div>
    </div>
  )
}

export function AddLockerModal({ org, onClose, onCreated }: TProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [location, setLocation] = useState('')
  const [mac, setMac] = useState('')
  const [sizeS, setSizeS] = useState(4)
  const [sizeM, setSizeM] = useState(4)
  const [sizeL, setSizeL] = useState(2)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<TCreatedLocker | null>(null)

  const total = sizeS + sizeM + sizeL
  const hasCoords = org.latitude !== undefined && org.longitude !== undefined

  // Gợi ý tên và mã dựa trên số tủ doanh nghiệp đã có
  useEffect(() => {
    let active = true
    getLockers()
      .then((all) => {
        if (!active) return
        const mine = all.filter((l) => getLockerBuildingId(l) === org.id)
        setName((prev) => prev || `Tủ ${mine.length + 1}`)
        setCode((prev) => prev || suggestLockerCode(org.code, mine))
      })
      .catch(() => {
        if (!active) return
        setName((prev) => prev || 'Tủ 1')
        setCode((prev) => prev || suggestLockerCode(org.code, []))
      })
    return () => {
      active = false
    }
  }, [org.id, org.code])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !code.trim() || total < 1) return

    setSubmitting(true)
    try {
      const result = await createLocker({
        buildingId: org.id,
        name,
        code,
        locationDescription: location,
        macAddress: mac,
        sizeS,
        sizeM,
        sizeL,
        // Tủ dùng chung vị trí của doanh nghiệp để bản đồ gộp về một ghim
        coordinates: hasCoords ? { latitude: org.latitude!, longitude: org.longitude! } : undefined,
      })
      setCreated(result)
      onCreated?.()
    } catch (err) {
      toast.error(t('al.failed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setSubmitting(false)
    }
  }

  const sizeInput = (label: string, value: number, set: (n: number) => void) => (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => set(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
        className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-mono font-bold text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
      />
    </div>
  )

  // ── Bước 2: thông tin kết nối phần cứng (apiKey chỉ hiện một lần) ──
  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col my-8">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">{t('ci.title')}</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{created.name}</p>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[12.5px] text-amber-800 dark:text-amber-300 leading-relaxed flex gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t('ci.warn')}</span>
            </div>
            <CopyRow label={t('ci.code')} value={created.code} />
            <CopyRow label={t('ci.apiKey')} value={created.apiKey} />
            <CopyRow label={t('ci.topic')} value={`smartlocker/${created.code}/status`} />
          </div>

          <div className="flex flex-wrap justify-end gap-2.5 p-5 pt-0">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('ci.done')}
            </button>
            <AppButton
              onClick={() => {
                onClose()
                navigate(`/locker-map?focus=${encodeURIComponent(created.code)}`)
              }}
              className="flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              {t('ci.viewOnMap')}
            </AppButton>
          </div>
        </div>
      </div>
    )
  }

  // ── Bước 1: biểu mẫu thêm trạm tủ ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col my-8">
        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">{t('al.title')}</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{t('al.desc', { org: org.name })}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {!hasCoords && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[12px] text-amber-800 dark:text-amber-300">
              {t('al.noCoords')}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('al.name')} <span className="text-red-500">*</span></label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} font-bold`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('al.code')} <span className="text-red-500">*</span></label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={`${inputCls} font-mono font-bold`}
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('al.codeHint')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('al.location')}</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('al.locationPh')}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('al.mac')}</label>
            <input
              value={mac}
              onChange={(e) => setMac(e.target.value)}
              placeholder="AA:BB:CC:11:22:33"
              className={`${inputCls} font-mono`}
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('al.macHint')}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3">
            <h4 className="text-[12px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center justify-between">
              <span>{t('al.sizes')}</span>
              <span className="text-sky-600 dark:text-sky-400 font-extrabold">{t('al.total', { count: total })}</span>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {sizeInput(t('org.sizeS'), sizeS, setSizeS)}
              {sizeInput(t('org.sizeM'), sizeM, setSizeM)}
              {sizeInput(t('org.sizeL'), sizeL, setSizeL)}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('al.skip')}
            </button>
            <AppButton type="submit" disabled={submitting || !name.trim() || !code.trim() || total < 1}>
              {submitting ? t('al.creating') : t('al.submit')}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  )
}
