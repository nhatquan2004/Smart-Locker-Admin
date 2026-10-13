import { useState } from 'react'
import { X, Megaphone, Loader2, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'
import { broadcastToBuilding } from '../../service/notification.service'
import type { TNotificationCategory, TNotificationPriority } from '../../service/notification.service'

type Props = {
  onClose: () => void
}

const CATEGORIES: { value: TNotificationCategory; labelKey: TranslationKey; color: string }[] = [
  { value: 'SYSTEM', labelKey: 'notif.cat.SYSTEM', color: 'text-slate-600 dark:text-slate-300' },
  { value: 'PACKAGE', labelKey: 'notif.cat.PACKAGE', color: 'text-sky-600 dark:text-sky-400' },
  { value: 'HARDWARE', labelKey: 'notif.cat.HARDWARE', color: 'text-orange-600 dark:text-orange-400' },
  { value: 'ACCOUNT', labelKey: 'notif.cat.ACCOUNT', color: 'text-purple-600 dark:text-purple-400' },
]

const PRIORITIES: { value: TNotificationPriority; labelKey: TranslationKey; style: string }[] = [
  { value: 'NORMAL', labelKey: 'notif.prio.NORMAL', style: 'text-slate-600 dark:text-slate-400' },
  { value: 'HIGH', labelKey: 'notif.prio.HIGH', style: 'text-amber-600 dark:text-amber-400' },
  { value: 'CRITICAL', labelKey: 'notif.prio.CRITICAL', style: 'text-red-600 dark:text-red-400' },
]

export function BroadcastModal({ onClose }: Props) {
  const { user } = useAuthStore()
  const toast = useToast()
  const { t } = useTranslation()

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState<TNotificationCategory>('SYSTEM')
  const [priority, setPriority] = useState<TNotificationPriority>('NORMAL')
  const [isSending, setIsSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)

  const buildingId = user?.buildingId || user?.orgId || ''

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      toast.error(t('broadcast.missingFields'))
      return
    }
    if (!buildingId || buildingId === 'all') {
      toast.error(t('broadcast.noBuilding'))
      return
    }

    setIsSending(true)
    try {
      const result = await broadcastToBuilding({
        buildingId,
        title: title.trim(),
        message: message.trim(),
        category,
        priority,
      })
      setSentCount(result?.sent ?? 0)
      toast.success(`📢 ${t('broadcast.sentToast', { count: result?.sent ?? 0 })}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('broadcast.failed')
      toast.error(msg)
    } finally {
      setIsSending(false)
    }
  }

  function handleClose() {
    if (isSending) return
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">{t('broadcast.title')}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('broadcast.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSending}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {sentCount !== null ? (
          // Thành công
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-900 dark:text-white">{t('broadcast.successTitle')}</p>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                {t('broadcast.sentTo')} <strong className="text-emerald-600 dark:text-emerald-400">{t('broadcast.residentsCount', { count: sentCount ?? 0 })}</strong> {t('broadcast.inBuilding')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 h-9 px-6 rounded-xl text-[13px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Warning banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-amber-800 dark:text-amber-300 leading-relaxed">
                {t('broadcast.warning1')} <strong>{t('broadcast.warningAll')}</strong> {t('broadcast.warning2')}
              </p>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                {t('broadcast.fieldTitle')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                placeholder={t('broadcast.titlePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              />
              <span className="text-[10.5px] text-slate-400 text-right">{title.length}/150</span>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                {t('broadcast.fieldMessage')} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                placeholder={t('broadcast.messagePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors resize-none"
              />
              <span className="text-[10.5px] text-slate-400 text-right">{message.length}/1000</span>
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('broadcast.fieldCategory')}</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TNotificationCategory)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[12.5px] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('broadcast.fieldPriority')}</label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TNotificationPriority)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[12.5px] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {sentCount === null && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSending}
              className="h-9 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !title.trim() || !message.trim()}
              className="h-9 px-5 rounded-xl text-[12.5px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('broadcast.sending')}</>
                : <><Megaphone className="w-3.5 h-3.5" />{t('broadcast.send')}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
