import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Archive, KeyRound, X } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { resendShipmentOtp, returnShipment } from '../../service/shipment.service'
import type { TShipment } from '../../types/shipment.type'

type TProps = {
  shipment: TShipment
  // Gọi sau khi thao tác thành công để trang cha tải lại dữ liệu
  onChanged: () => void
}

const REASON_MAX = 200

// Chỉ bưu kiện còn nằm trong ngăn (chờ nhận hoặc quá hạn) mới thu hồi hoặc cấp lại OTP được
const ACTIONABLE = ['WAITING_FOR_PICKUP', 'OVERDUE']

const modalShell =
  'fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in'
const modalCard =
  'w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col p-6 gap-4'
const ghostBtn =
  'h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'

export function ShipmentActions({ shipment, onChanged }: TProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const [modal, setModal] = useState<'return' | 'resend' | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  if (!ACTIONABLE.includes(shipment.status)) return null

  function close() {
    if (busy) return
    setModal(null)
    setReason('')
  }

  async function handleReturn() {
    setBusy(true)
    try {
      const result = await returnShipment(shipment.id, reason)
      // Nếu lệnh mở cửa không gửi được, server vẫn thu hồi thành công nhưng cần mở ngăn thủ công
      if (result.doorUnlocked) toast.success(result.message)
      else toast.warning(result.message)
      setModal(null)
      setReason('')
      onChanged()
    } catch (err) {
      toast.error(t('pkg.returnFailed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setBusy(false)
    }
  }

  async function handleResend() {
    setBusy(true)
    try {
      toast.success(await resendShipmentOtp(shipment.id))
      setModal(null)
      onChanged()
    } catch (err) {
      // Ví dụ: vừa cấp lại trong vòng 60 giây
      toast.error(t('pkg.resendFailed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModal('resend')}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 transition-all text-[11px] font-semibold cursor-pointer active:scale-95"
      >
        <KeyRound className="w-3.5 h-3.5" />
        <span>{t('pkg.btnResend')}</span>
      </button>
      <button
        type="button"
        onClick={() => setModal('return')}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 transition-all text-[11px] font-semibold cursor-pointer active:scale-95"
      >
        <Archive className="w-3.5 h-3.5" />
        <span>{t('pkg.btnReturn')}</span>
      </button>

      {/* Vẽ modal ra body: bảng cha có hiệu ứng làm mờ nên position fixed sẽ bị lệch nếu để trong ô bảng */}
      {modal === 'return' && createPortal(
        <div className={modalShell}>
          <div className={modalCard}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('pkg.returnTitle')}</h3>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {shipment.trackingNumber}
                  {shipment.lockerCode && ` · ${t('pkg.lockerBox', { code: shipment.lockerCode, box: shipment.boxNumber })}`}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t('common.cancel')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-[12px] text-purple-800 dark:text-purple-300 leading-relaxed">
              {t('pkg.returnNotice')}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('pkg.returnReason')}</label>
              <textarea
                rows={2}
                value={reason}
                maxLength={REASON_MAX}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('pkg.returnReasonPh')}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={close} disabled={busy} className={ghostBtn}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleReturn}
                disabled={busy}
                className="h-10 px-4 rounded-xl text-[12.5px] font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <Archive className="w-4 h-4" />
                <span>{busy ? t('pkg.returning') : t('pkg.confirmReturn')}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {modal === 'resend' && createPortal(
        <div className={modalShell}>
          <div className={modalCard}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('pkg.resendTitle')}</h3>
              <button
                type="button"
                onClick={close}
                aria-label={t('common.cancel')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('pkg.resendNotice', { code: shipment.trackingNumber, name: shipment.receiverName })}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={close} disabled={busy} className={ghostBtn}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={busy}
                className="h-10 px-4 rounded-xl text-[12.5px] font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>{busy ? t('common.saving') : t('pkg.confirmResend')}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
