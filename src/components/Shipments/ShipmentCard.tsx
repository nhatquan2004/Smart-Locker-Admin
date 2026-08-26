import { useNavigate } from 'react-router-dom'
import { ShipmentStatusBadge } from './ShipmentStatusBadge'
import type { TShipment } from '../../types/shipment.type'
import { useTranslation } from '../../context/LanguageContext'

type TProps = {
  shipment: TShipment
}

export function ShipmentCard({ shipment }: TProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <article className="group flex flex-col gap-4 p-5 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-border-2] hover:bg-[--color-surface-2] hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-[--color-muted] uppercase tracking-wider">{shipment.shipmentCode}</p>
          <h3 className="mt-0.5 text-[14px] font-semibold text-[--color-heading] truncate">{shipment.recipientName}</h3>
          <p className="text-[12px] text-[--color-muted]">{shipment.recipientPhone}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ShipmentStatusBadge type="shipment" shipmentStatus={shipment.shipmentStatus} />
          <ShipmentStatusBadge type="otp" otpStatus={shipment.otpStatus} />
        </div>
      </div>

      {/* Info tags */}
      <div className="flex flex-wrap gap-2 text-[11px] text-[--color-secondary]">
        <span className="bg-[--color-surface-2] border border-[--color-border] px-2 py-0.5 rounded-md font-mono">
          {shipment.lockerCode}
        </span>
        <span className="bg-[--color-surface-2] border border-[--color-border] px-2 py-0.5 rounded-md">
          CL-{shipment.cluster}
        </span>
        <span className="bg-[--color-surface-2] border border-[--color-border] px-2 py-0.5 rounded-md capitalize">
          {shipment.lockerSize}
        </span>
        <span className="bg-[--color-accent-bg] border border-[--color-accent-border] text-[--color-accent] px-2 py-0.5 rounded-md font-mono">
          OTP: {shipment.otpCode}
        </span>
      </div>

      {/* Meta info */}
      <div className="flex flex-col gap-1.5 text-[12px] text-[--color-secondary]">
        <p className="truncate">{t('shipments.sender')}: <span className="text-[--color-text]">{shipment.shipperName}</span></p>
        <p>{t('shipments.depositedAt')}: <span className="font-mono text-[--color-muted]">{shipment.createdAt}</span></p>
      </div>

      {shipment.note && (
        <p className="text-[11px] text-[--color-warning] bg-[--color-warning-bg] border border-[--color-warning]/20 px-3 py-2 rounded-lg leading-relaxed">
          {shipment.note}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => navigate(`/shipments/${shipment.id}`)}
          className="flex-1 h-8 rounded-lg text-[12px] font-medium bg-[--color-accent-bg] text-[--color-accent] border border-[--color-accent-border] hover:bg-[--color-accent] hover:text-[--color-bg] transition-all duration-150"
        >
          {t('shipments.btnDetail')}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/shipments/${shipment.id}/otp`)}
          className="flex-1 h-8 rounded-lg text-[12px] font-medium bg-[--color-surface-2] text-[--color-secondary] border border-[--color-border] hover:border-[--color-border-2] hover:text-[--color-text] transition-all duration-150"
        >
          OTP
        </button>
      </div>
    </article>
  )
}
