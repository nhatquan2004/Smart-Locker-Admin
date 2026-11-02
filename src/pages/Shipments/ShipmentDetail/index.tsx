import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Building2, Copy, MapPin, Phone, Truck } from 'lucide-react'
import { ShipmentStatusBadge } from '../../../components/Shipments/ShipmentStatusBadge'
import { ShipmentActions } from '../../../components/Shipments/ShipmentActions'
import { ShipmentFeeCard } from '../../../components/Shipments/ShipmentFeeCard'
import { ShipmentTimeline } from '../../../components/Shipments/ShipmentTimeline'
import { CompartmentArt } from '../../../components/Shipments/CompartmentArt'
import { getShipmentById } from '../../../service/shipment.service'
import type { TShipment } from '../../../types/shipment.type'
import { useTranslation } from '../../../context/LanguageContext'
import { useToast } from '../../../context/ToastContext'
import { formatCurrencyVnd } from '../../../i18n/format'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Một người liên quan tới bưu kiện: avatar chữ cái đầu, tên, số điện thoại bấm gọi được
function PersonCard({
  title,
  name,
  phone,
  tone,
  children,
}: {
  title: string
  name: string
  phone: string
  tone: 'sky' | 'amber'
  children?: React.ReactNode
}) {
  const avatar =
    tone === 'sky'
      ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'

  return (
    <article className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col gap-4">
      <h2 className="text-[12px] font-semibold uppercase tracking-wide setting-desc-custom">{title}</h2>
      <div className="flex items-center gap-3 min-w-0">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${avatar}`}>
          {initials(name)}
        </span>
        <div className="min-w-0">
          <p className="setting-title-custom text-[16px] font-bold truncate" title={name}>{name}</p>
          <a
            href={`tel:${phone}`}
            className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-sky-600 dark:text-sky-400 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            {phone}
          </a>
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </article>
  )
}

const chip =
  'inline-flex items-center gap-1.5 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 text-[12px] font-medium text-slate-700 dark:text-slate-300'

export function ShipmentDetailPage() {
  const navigate = useNavigate()
  const { shipmentId } = useParams()
  const { t } = useTranslation()
  const toast = useToast()

  const [shipment, setShipment] = useState<TShipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const reload = useCallback(() => setReloadKey((n) => n + 1), [])

  useEffect(() => {
    let active = true
    getShipmentById(shipmentId ?? '')
      .then((res) => {
        if (active) setShipment(res)
      })
      .catch(() => {
        if (active) setShipment(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [shipmentId, reloadKey])

  if (loading) {
    return <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>
  }

  if (!shipment) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{t('pkg.notFound')}</p>
        <button
          type="button"
          onClick={() => navigate('/shipments')}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-[13px] text-slate-800 hover:bg-slate-200 cursor-pointer"
        >
          ← {t('common.back')}
        </button>
      </div>
    )
  }

  async function copyTracking() {
    if (!shipment) return
    try {
      await navigator.clipboard.writeText(shipment.trackingNumber)
      toast.success(t('pkg.d.copied', { code: shipment.trackingNumber }))
    } catch {
      // Trình duyệt chặn clipboard thì người dùng vẫn bôi đen mã để sao chép
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Đầu trang: mã vận đơn là nhân vật chính */}
      <section data-reveal className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col gap-5">
        <button
          type="button"
          onClick={() => navigate('/shipments')}
          className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">{t('pkg.d.eyebrow')}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] leading-tight font-bold setting-title-custom break-all">{shipment.trackingNumber}</h1>
              <button
                type="button"
                onClick={copyTracking}
                aria-label={t('pkg.d.copy')}
                title={t('pkg.d.copy')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <ShipmentStatusBadge status={shipment.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {shipment.buildingName && (
                <span className={chip}><Building2 className="w-3.5 h-3.5" />{shipment.buildingName}</span>
              )}
              {shipment.lockerCode && (
                <span className={chip}>
                  <MapPin className="w-3.5 h-3.5" />
                  {t('pkg.lockerBox', { code: shipment.lockerCode, box: shipment.boxNumber })}
                </span>
              )}
              <span className={chip}><Truck className="w-3.5 h-3.5" />{shipment.carrierName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <ShipmentActions shipment={shipment} onChanged={reload} />
          </div>
        </div>
      </section>

      <ShipmentTimeline shipment={shipment} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PersonCard title={t('pkg.colReceiver')} name={shipment.receiverName} phone={shipment.receiverPhone} tone="sky">
              <span className={chip}>{t('pkg.apartment', { apartment: shipment.apartment })}</span>
            </PersonCard>

            <PersonCard
              title={t('pkg.colShipper')}
              name={shipment.shipperName || shipment.carrierName}
              phone={shipment.shipperPhone}
              tone="amber"
            >
              <span className={chip}>{shipment.carrierName}</span>
              <span
                className={`inline-flex items-center gap-1.5 h-7 rounded-full px-2.5 text-[12px] font-semibold ${
                  shipment.isShipperVerified
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                {shipment.isShipperVerified ? t('pkg.d.verified') : t('pkg.d.notVerified')}
              </span>
            </PersonCard>
          </div>

          {/* Vị trí lưu hàng */}
          <article className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col sm:flex-row gap-6 sm:items-center">
            <CompartmentArt boxNumber={shipment.boxNumber} size={shipment.boxSize} />
            <div className="flex-1 min-w-0">
              <h2 className="setting-title-custom text-[15px] font-bold">{t('pkg.d.locationTitle')}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                <div>
                  <dt className="setting-desc-custom text-[12px]">{t('pkg.fieldLocker')}</dt>
                  <dd className="mt-0.5 font-semibold setting-title-custom">{shipment.lockerCode ?? '—'}</dd>
                  {shipment.lockerName && <dd className="text-[12px] setting-desc-custom truncate">{shipment.lockerName}</dd>}
                </div>
                <div>
                  <dt className="setting-desc-custom text-[12px]">{t('pkg.d.building')}</dt>
                  <dd className="mt-0.5 font-semibold setting-title-custom">{shipment.buildingName ?? '—'}</dd>
                </div>
                <div>
                  <dt className="setting-desc-custom text-[12px]">{t('pkg.fieldBox')}</dt>
                  <dd className="mt-0.5 font-semibold setting-title-custom">#{shipment.boxNumber}</dd>
                </div>
                <div>
                  <dt className="setting-desc-custom text-[12px]">{t('pkg.fieldFee')}</dt>
                  <dd className="mt-0.5 font-semibold setting-title-custom">{formatCurrencyVnd(shipment.totalFeePaid)}</dd>
                </div>
              </dl>
            </div>
          </article>

          {shipment.note && (
            <article className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-xs p-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide setting-desc-custom">{t('pkg.fieldNote')}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed setting-title-custom">{shipment.note}</p>
            </article>
          )}
        </div>

        {/* Hóa đơn phí lưu kho luôn nằm trong tầm mắt khi cuộn */}
        <div className="xl:sticky xl:top-0">
          <ShipmentFeeCard shipment={shipment} reloadKey={reloadKey} />
        </div>
      </div>
    </div>
  )
}
