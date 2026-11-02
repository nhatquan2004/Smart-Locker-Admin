import { useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import { formatCurrencyVnd, formatDateTime } from '../../i18n/format'
import type { TranslationKey } from '../../i18n/translations'
import {
  DEFAULT_PRICING_POLICY,
  getPackageFee,
  type TPackageFee,
  type TPricingPolicy,
  type TPricingTierKey,
} from '../../service/payment.service'
import type { TShipment } from '../../types/shipment.type'

type TProps = {
  shipment: TShipment
  // Tăng lên để tải lại phí sau khi thao tác trên bưu kiện
  reloadKey: number
}

const TIERS: TPricingTierKey[] = ['FREE', 'TIER_1', 'TIER_2', 'RETRIEVAL']

// Màu từng chặng: càng để lâu càng nóng
const tierColor: Record<TPricingTierKey, { bar: string; text: string; soft: string }> = {
  FREE: { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', soft: 'bg-emerald-100 dark:bg-emerald-500/25' },
  TIER_1: { bar: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-300', soft: 'bg-amber-100 dark:bg-amber-500/25' },
  TIER_2: { bar: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', soft: 'bg-orange-100 dark:bg-orange-500/25' },
  RETRIEVAL: { bar: 'bg-red-500', text: 'text-red-700 dark:text-red-300', soft: 'bg-red-100 dark:bg-red-500/25' },
}

// Vị trí con trỏ (0 đến 100%) trên thanh 4 chặng chia đều, tính theo số giờ đã để trong tủ
function markerPosition(hours: number, p: TPricingPolicy): number {
  const seg = 25
  if (hours <= p.t1Hours) return (hours / p.t1Hours) * seg
  if (hours <= p.t2Hours) return seg + ((hours - p.t1Hours) / (p.t2Hours - p.t1Hours)) * seg
  if (hours < p.t3Hours) return seg * 2 + ((hours - p.t2Hours) / (p.t3Hours - p.t2Hours)) * seg
  return seg * 3 + seg / 2
}

// Hóa đơn phí lưu kho của bưu kiện theo biểu phí 4 chặng của tòa (GET /payments/package/:id/fee)
export function ShipmentFeeCard({ shipment, reloadKey }: TProps) {
  const { t } = useTranslation()
  const inLocker = shipment.status === 'WAITING_FOR_PICKUP' || shipment.status === 'OVERDUE'
  const [fee, setFee] = useState<TPackageFee | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!inLocker) return
    let active = true
    getPackageFee(shipment.id)
      .then((res) => {
        if (!active) return
        setFee(res)
        setError(null)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : '')
      })
    return () => {
      active = false
    }
  }, [shipment.id, inLocker, reloadKey])

  const policy: TPricingPolicy = { ...DEFAULT_PRICING_POLICY, ...(fee?.policy ?? {}) }
  const rangeLabels = [
    t('pay.rangeFromTo', { from: 0, to: policy.t1Hours }),
    t('pay.rangeFromTo', { from: policy.t1Hours, to: policy.t2Hours }),
    t('pay.rangeFromTo', { from: policy.t2Hours, to: policy.t3Hours }),
    t('pay.rangeAfter', { from: policy.t3Hours }),
  ]

  return (
    <section className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold setting-title-custom">
          <Receipt className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          {t('pay.feeTitle')}
        </h2>
        {fee && (
          <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold ${tierColor[fee.currentTier].soft} ${tierColor[fee.currentTier].text}`}>
            {t(`pay.tier.${fee.currentTier}` as TranslationKey)}
          </span>
        )}
      </div>

      {!inLocker ? (
        <div className="px-6 pb-6 flex flex-col gap-3">
          <p className="text-[13px] setting-desc-custom">{t('pay.feeClosed')}</p>
          <div className="flex items-baseline justify-between border-t border-dashed border-slate-300 dark:border-slate-700 pt-3">
            <span className="text-[13px] font-semibold setting-title-custom">{t('pay.feeTotalPaid')}</span>
            <span className="text-[18px] font-bold setting-title-custom">{formatCurrencyVnd(shipment.totalFeePaid)}</span>
          </div>
        </div>
      ) : error !== null ? (
        <p className="px-6 pb-6 text-[13px] text-red-600 dark:text-red-400">{t('pay.feeLoadFailed', { message: error })}</p>
      ) : !fee ? (
        <p className="px-6 pb-6 text-[13px] setting-desc-custom">{t('common.loading')}</p>
      ) : (
        <div className="flex flex-col gap-5 px-6 pb-6">
          {/* Thanh 4 chặng với con trỏ đang ở đâu */}
          <div className="flex flex-col gap-2">
            <div className="relative pt-5">
              <span
                className="absolute top-0 -translate-x-1/2 text-[11px] font-semibold setting-title-custom whitespace-nowrap"
                style={{ left: `${markerPosition(fee.hoursElapsed, policy)}%` }}
              >
                {t('pay.feeHoursValue', { count: fee.hoursElapsed })}
              </span>
              <span
                className="absolute top-3.5 -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent border-t-slate-700 dark:border-t-slate-200"
                style={{ left: `${markerPosition(fee.hoursElapsed, policy)}%` }}
                aria-hidden="true"
              />
              <div className="flex gap-1">
                {TIERS.map((tier) => {
                  const reached = TIERS.indexOf(tier) <= TIERS.indexOf(fee.currentTier)
                  return (
                    <div
                      key={tier}
                      className={`h-2.5 flex-1 rounded-full ${reached ? tierColor[tier].bar : 'bg-slate-200 dark:bg-slate-700'}`}
                    />
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[10.5px] setting-desc-custom">
              {rangeLabels.map((label, i) => (
                <span key={i} className={TIERS[i] === fee.currentTier ? `font-bold ${tierColor[TIERS[i]].text}` : ''}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Hóa đơn */}
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="flex items-baseline justify-between">
              <span className="setting-desc-custom">{t('pay.feeBase')}</span>
              <span className="font-semibold setting-title-custom">{formatCurrencyVnd(fee.baseFee)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="setting-desc-custom">{t('pay.feeOverdue')}</span>
              <span className="font-semibold setting-title-custom">{formatCurrencyVnd(fee.overdueFee)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="setting-desc-custom">{t('pay.feePaid')}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">− {formatCurrencyVnd(fee.totalFeePaid)}</span>
            </div>

            <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-slate-300 dark:border-slate-700 pt-3">
              <span className="text-[14px] font-bold setting-title-custom">{t('pay.feeDue')}</span>
              <span className={`text-[26px] font-bold leading-none ${fee.feeDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatCurrencyVnd(fee.feeDue)}
              </span>
            </div>
          </div>

          {(fee.isPendingRetrieval || fee.feeDue === 0) && (
            <p className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 px-3.5 py-2.5 text-[12px] leading-relaxed setting-desc-custom">
              {fee.isPendingRetrieval ? t('pay.feeRetrieval') : t('pay.feeNone')}
              {!fee.isPendingRetrieval && fee.paidUntil && ` · ${t('pay.feePaidUntil')} ${formatDateTime(fee.paidUntil)}`}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
