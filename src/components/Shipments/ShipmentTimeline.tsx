import { useEffect, useState } from 'react'
import { AlertTriangle, Archive, Check, CheckCircle2, Clock, Package } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import { formatDateTime } from '../../i18n/format'
import type { TShipment } from '../../types/shipment.type'
import { describeDuration } from './duration'

type TProps = {
  shipment: TShipment
}

type TNodeTone = 'done' | 'current' | 'alert' | 'purple' | 'pending'

const nodeStyle: Record<TNodeTone, string> = {
  done: 'bg-emerald-500 text-white border-emerald-500',
  current: 'bg-sky-500 text-white border-sky-500 ring-4 ring-sky-500/20',
  alert: 'bg-red-500 text-white border-red-500 ring-4 ring-red-500/20',
  purple: 'bg-purple-500 text-white border-purple-500',
  pending: 'bg-white text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-600',
}

const titleStyle: Record<TNodeTone, string> = {
  done: 'text-slate-900 dark:text-white',
  current: 'text-sky-700 dark:text-sky-300',
  alert: 'text-red-700 dark:text-red-300',
  purple: 'text-purple-700 dark:text-purple-300',
  pending: 'text-slate-400 dark:text-slate-500',
}

// Hành trình bưu kiện: đã gửi, chờ nhận hoặc quá hạn, kết thúc. Kèm dòng nhắc thời gian còn lại hoặc đã quá hạn.
export function ShipmentTimeline({ shipment }: TProps) {
  const { t } = useTranslation()
  const { status } = shipment
  const finished = status === 'PICKED_UP' || status === 'RETURNED'
  const overdue = status === 'OVERDUE'

  // Giờ hiện tại, cập nhật mỗi phút để dòng "còn lại / quá hạn" luôn đúng khi để trang mở lâu
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const droppedAt = new Date(shipment.droppedOffAt).getTime()
  const expiredAt = new Date(shipment.expiredAt).getTime()
  const endedAt = new Date(status === 'PICKED_UP' && shipment.pickedUpAt ? shipment.pickedUpAt : shipment.updatedAt).getTime()

  const step2Tone: TNodeTone = finished ? 'done' : overdue ? 'alert' : 'current'
  const step3Tone: TNodeTone = status === 'PICKED_UP' ? 'done' : status === 'RETURNED' ? 'purple' : 'pending'

  // Đường nối tô màu tới bước hiện tại
  const progress = finished ? 100 : 50
  const progressColor = overdue ? 'bg-red-400' : finished ? (status === 'RETURNED' ? 'bg-purple-400' : 'bg-emerald-400') : 'bg-sky-400'

  const callout = (() => {
    if (finished) {
      return {
        tone: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700',
        text: t('pkg.d.finishedAfter', { duration: describeDuration(endedAt - droppedAt, t) }),
      }
    }
    if (overdue || now > expiredAt) {
      return {
        tone: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
        text: t('pkg.d.overdueBy', { duration: describeDuration(now - expiredAt, t) }),
      }
    }
    return {
      tone: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
      text: t('pkg.d.remaining', { duration: describeDuration(expiredAt - now, t) }),
    }
  })()

  const steps = [
    {
      tone: 'done' as TNodeTone,
      icon: <Package className="w-[18px] h-[18px]" />,
      title: t('pkg.d.step1'),
      time: formatDateTime(shipment.droppedOffAt),
      caption: t('pkg.d.step1Desc', { name: shipment.shipperName || shipment.carrierName }),
    },
    {
      tone: step2Tone,
      icon: finished ? <Check className="w-[18px] h-[18px]" /> : overdue ? <AlertTriangle className="w-[18px] h-[18px]" /> : <Clock className="w-[18px] h-[18px]" />,
      title: finished ? t('pkg.d.step2Stored') : overdue ? t('pkg.d.step2Overdue') : t('pkg.d.step2Waiting'),
      time: formatDateTime(shipment.expiredAt),
      caption: t('pkg.d.step2Until'),
    },
    {
      tone: step3Tone,
      icon: status === 'RETURNED' ? <Archive className="w-[18px] h-[18px]" /> : <CheckCircle2 className="w-[18px] h-[18px]" />,
      title: status === 'PICKED_UP' ? t('pkg.d.step3Picked') : status === 'RETURNED' ? t('pkg.d.step3Returned') : t('pkg.d.step3Pending'),
      time: finished ? formatDateTime(status === 'PICKED_UP' && shipment.pickedUpAt ? shipment.pickedUpAt : shipment.updatedAt) : '—',
      caption: '',
    },
  ]

  return (
    <section className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col gap-6">
      <h2 className="setting-title-custom text-[15px] font-bold">{t('pkg.d.timelineTitle')}</h2>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
        {/* Đường nối giữa 3 nút, chỉ hiện ở màn hình ngang */}
        <div className="hidden md:block absolute top-[18px] left-[16.66%] right-[16.66%] h-[3px] rounded-full bg-slate-200 dark:bg-slate-700">
          <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${progress}%` }} />
        </div>

        {steps.map((step, i) => (
          <div key={i} className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-3 md:text-center">
            <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${nodeStyle[step.tone]}`}>
              {step.icon}
            </span>
            <div className="min-w-0">
              <p className={`text-[14px] font-bold ${titleStyle[step.tone]}`}>{step.title}</p>
              <p className="mt-0.5 text-[12.5px] font-medium text-slate-700 dark:text-slate-300">{step.time}</p>
              {step.caption && <p className="mt-0.5 text-[11.5px] setting-desc-custom">{step.caption}</p>}
            </div>
          </div>
        ))}
      </div>

      <p className={`rounded-xl border px-4 py-2.5 text-[13px] font-semibold ${callout.tone}`}>{callout.text}</p>
    </section>
  )
}
