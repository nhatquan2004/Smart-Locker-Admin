import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShipmentStatusBadge } from '../../../components/Shipments/ShipmentStatusBadge'
import type { TShipment } from "../../../types/shipment.type"
import { useTranslation } from '../../../context/LanguageContext'

export function ShipmentDetailPage() {
  const navigate = useNavigate()
  const { shipmentId } = useParams()
  const { t } = useTranslation()
  const [copiedOtp, setCopiedOtp] = useState(false)

  const shipments = useMemo<TShipment[]>(() => {
    return [
      {
        id: '1', shipmentCode: 'SHP-2026-001', recipientName: 'Nguyễn Văn A', recipientPhone: '0901234567',
        lockerCode: 'A02', cluster: 'A', lockerSize: 'medium', otpCode: '482913', otpStatus: 'active',
        shipmentStatus: 'waiting_pickup', createdAt: '2026-04-28 08:20', updatedAt: '2026-04-28 08:30',
        shipperName: 'Shipper Minh', note: 'Khách sẽ nhận trong sáng nay',
      },
      {
        id: '2', shipmentCode: 'SHP-2026-002', recipientName: 'Trần Thị B', recipientPhone: '0912345678',
        lockerCode: 'C02', cluster: 'C', lockerSize: 'large', otpCode: '731205', otpStatus: 'active',
        shipmentStatus: 'stored', createdAt: '2026-04-28 07:45', updatedAt: '2026-04-28 07:50',
        shipperName: 'Shipper Long', note: 'Đã lưu ảnh kiện hàng',
      },
      {
        id: '3', shipmentCode: 'SHP-2026-003', recipientName: 'Phạm Văn C', recipientPhone: '0987654321',
        lockerCode: 'D02', cluster: 'D', lockerSize: 'medium', otpCode: '664120', otpStatus: 'used',
        shipmentStatus: 'picked_up', createdAt: '2026-04-28 06:30', updatedAt: '2026-04-28 07:10',
        shipperName: 'Shipper Hùng', note: 'Khách đã lấy hàng thành công',
      },
    ]
  }, [])

  const shipment = useMemo(() => {
    return shipments.find((item) => item.id === shipmentId) ?? shipments[0]
  }, [shipments, shipmentId])

  if (!shipment) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{t('common.noData')}</p>
        <button
          type="button"
          onClick={() => navigate('/shipments')}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-[13px] text-slate-800 hover:bg-slate-200"
        >
          ← {t('common.back')}
        </button>
      </div>
    )
  }

  function handleCopyOtp() {
    if (shipment.otpCode) {
      navigator.clipboard.writeText(shipment.otpCode)
      setCopiedOtp(true)
      setTimeout(() => setCopiedOtp(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Header Banner */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs border border-slate-200">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 hover:text-sky-700 mb-3 transition-colors cursor-pointer"
          >
            ← {t('common.back')}
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-slate-900 leading-tight truncate">
              {t('shipments.detailTitle')}: {shipment.shipmentCode}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Realtime IoT Monitoring
            </span>
          </div>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed max-w-lg">
            {t('shipments.desc')}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
          <ShipmentStatusBadge type="shipment" shipmentStatus={shipment.shipmentStatus} />
          <ShipmentStatusBadge type="otp" otpStatus={shipment.otpStatus} />
        </div>
      </section>

      {/* Live Stepper Progress Bar */}
      <section data-reveal className="p-6 rounded-2xl glass-card border border-slate-200 shadow-xs flex flex-col gap-4">
        <h2 className="text-[14px] font-bold text-slate-900 font-mono uppercase tracking-wider">{t('shipments.colProgress')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border flex flex-col gap-1 ${shipment.shipmentStatus !== 'pending' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <span className="text-[11px] font-mono font-bold uppercase">{t('shipments.step1')}</span>
            <p className="text-[14px] font-bold">Shipper Deposit</p>
            <span className="text-[11px] font-mono text-slate-500">{shipment.createdAt}</span>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col gap-1 ${shipment.otpStatus === 'active' ? 'bg-sky-50 border-sky-300 text-sky-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <span className="text-[11px] font-mono font-bold uppercase">{t('shipments.step2')}</span>
            <p className="text-[14px] font-bold">OTP: {shipment.otpCode || 'N/A'}</p>
            <span className="text-[11px] font-mono text-slate-500">{shipment.recipientPhone}</span>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col gap-1 ${shipment.shipmentStatus === 'picked_up' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <span className="text-[11px] font-mono font-bold uppercase">{t('shipments.step3')}</span>
            <p className="text-[14px] font-bold">{shipment.shipmentStatus === 'picked_up' ? t('shipments.completedFilter') : t('shipments.waitingFilter')}</p>
            <span className="text-[11px] font-mono text-slate-500">{shipment.shipmentStatus === 'picked_up' ? shipment.updatedAt : '—'}</span>
          </div>
        </div>
      </section>

      {/* Detail Grid */}
      <section data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Recipient & Shipper Info Card */}
        <article className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs border border-slate-200">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">{t('shipments.colRecipient')}</h2>
          <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">{t('shipments.recipient')}:</span>
              <span className="font-bold text-slate-900">{shipment.recipientName}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">SĐT:</span>
              <span className="font-mono font-semibold text-slate-800">{shipment.recipientPhone}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">{t('shipments.sender')}:</span>
              <span className="font-medium text-slate-800">{shipment.shipperName || 'Shipper'}</span>
            </div>
          </div>
        </article>

        {/* Locker Location & OTP Card */}
        <article className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs border border-slate-200">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">{t('shipments.otpModalTitle')}</h2>
          <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Locker:</span>
              <span className="font-mono font-bold text-sky-700 text-[14px]">Locker {shipment.lockerCode}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Cluster:</span>
              <span className="font-bold text-slate-800">Cluster {shipment.cluster}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">OTP:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-700 text-[15px] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {shipment.otpCode || '------'}
                </span>
                {shipment.otpCode && (
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                  >
                    {copiedOtp ? '✓' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Audit Log Timeline Card */}
        <article className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs border border-slate-200">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">{t('activities.colTime')}</h2>
          <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">{t('shipments.depositedAt')}:</span>
              <span className="font-mono text-slate-700">{shipment.createdAt}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">{t('activities.colTime')}:</span>
              <span className="font-mono text-slate-700">{shipment.updatedAt}</span>
            </div>
          </div>
        </article>

      </section>

    </div>
  )
}
