import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Building2, Check, Loader2, User, X, XCircle } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatDateTime, formatRelativeTime } from '../../i18n/format'
import { approveResident, rejectResident, type TPendingResident } from '../../service/approval.service'

type TProps = {
  resident: TPendingResident
  onClose: () => void
  // Đã duyệt hoặc từ chối xong trên server
  onDone: () => void
}

// Xem hồ sơ cư dân đăng ký mới và duyệt hoặc từ chối (chỉ Ban quản lý gọi được API này)
export function ResidentApprovalModal({ resident, onClose, onDone }: TProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const [mode, setMode] = useState<'detail' | 'reject'>('detail')
  const [reason, setReason] = useState('')
  const [acting, setActing] = useState<'approve' | 'reject' | null>(null)

  async function handleApprove() {
    if (acting) return
    setActing('approve')
    try {
      await approveResident(resident._id)
      toast.success(t('approval.approvedToast'))
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('approval.approveFailed'))
      setActing(null)
    }
  }

  async function handleReject() {
    if (acting) return
    if (!reason.trim()) {
      toast.error(t('approval.reasonRequired'))
      return
    }
    setActing('reject')
    try {
      await rejectResident(resident._id, reason.trim())
      toast.success(t('approval.rejectedToast', { name: resident.name }))
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('approval.rejectFailed'))
      setActing(null)
    }
  }

  const fields: { label: string; value: string; mono?: boolean; wide?: boolean; icon?: React.ReactNode }[] = [
    { label: t('approval.fieldName'), value: resident.name, icon: <User className="w-3.5 h-3.5" /> },
    { label: t('approval.fieldPhone'), value: resident.phone, mono: true },
    { label: t('approval.fieldApartment'), value: resident.apartment, icon: <Building2 className="w-3.5 h-3.5" /> },
    { label: 'Email', value: resident.email, mono: true, wide: true },
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={() => !acting && onClose()}
    >
      <div onClick={(e) => e.stopPropagation()} className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{mode === 'reject' ? t('approval.rejectTitle') : t('approval.detailTitle')}</h3>
          <button type="button" onClick={onClose} disabled={!!acting} aria-label={t('common.close')} className="cursor-pointer text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {mode === 'detail' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((f) => (
                  <div key={f.label} className={`flex min-w-0 flex-col gap-0.5 ${f.wide ? 'col-span-2' : ''}`}>
                    <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{f.label}</span>
                    <span className={`text-[13px] font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white ${f.mono ? 'font-mono' : ''}`}>{f.value || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('approval.submittedAt')}</span>
                <span className="text-[13px] font-semibold text-slate-900 dark:text-white">
                  {formatDateTime(resident.createdAt)} ({formatRelativeTime(resident.createdAt)})
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                {t('approval.hint1')} <strong className="text-emerald-600 dark:text-emerald-400">{t('approval.approve')}</strong> {t('approval.hint2')}{' '}
                <strong className="text-red-600 dark:text-red-400">{t('approval.reject')}</strong> {t('approval.hint3')}
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/40">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div>
                  <p className="text-[12.5px] font-semibold text-red-800 dark:text-red-300">{t('approval.rejectBannerTitle', { name: resident.name })}</p>
                  <p className="mt-0.5 text-[11.5px] text-red-600 dark:text-red-400">{t('approval.irreversible')}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                  {t('approval.reasonLabel')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('approval.reasonPlaceholder')}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-900 focus:border-red-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          {mode === 'detail' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('reject')}
                disabled={!!acting}
                className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 text-[12.5px] font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
              >
                <XCircle className="w-3.5 h-3.5" />
                {t('approval.reject')}
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} disabled={!!acting} className="h-9 cursor-pointer rounded-xl border border-slate-200 px-4 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={!!acting}
                  className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-[12.5px] font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  {acting === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {acting === 'approve' ? t('approval.approving') : t('approval.approve')}
                </button>
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setMode('detail')} disabled={!!acting} className="h-9 cursor-pointer rounded-xl border border-slate-200 px-4 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                ← {t('common.back')}
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!!acting || !reason.trim()}
                className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-red-600 px-4 text-[12.5px] font-bold text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {acting === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                {acting === 'reject' ? t('approval.rejecting') : t('approval.confirmReject')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
