import { ArrowRight, Database, Gauge, Lock, PackageCheck, PackageOpen, Archive, Truck, Cpu } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'

type TRow = { label: TranslationKey; value: string }

// Màu từng chặng giống màu trạng thái bưu kiện ở các trang khác
const TONES = {
  sky: { badge: 'bg-sky-600 text-white', soft: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-700 dark:text-sky-300', bar: 'bg-sky-500' },
  amber: { badge: 'bg-amber-500 text-white', soft: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-400' },
  emerald: { badge: 'bg-emerald-600 text-white', soft: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500' },
  purple: { badge: 'bg-purple-600 text-white', soft: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-300', bar: 'bg-purple-500' },
} as const

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-[12.5px] leading-snug text-slate-600 dark:text-slate-300">{label}</span>
      <span className="max-w-[55%] text-right text-[12.5px] font-semibold leading-snug text-slate-900 dark:text-white">{value}</span>
    </div>
  )
}

// Thông số vận hành: giá trị lấy từ mã nguồn server, chưa có API cấu hình nên chỉ để xem
export function SettingsPage() {
  const { t } = useTranslation()

  const sec = (n: number) => t('set.u.sec', { count: n })
  const min = (n: number) => t('set.u.min', { count: n })
  const hour = (n: number) => t('set.u.hour', { count: n })
  const day = (n: number) => t('set.u.day', { count: n })
  const lock = (max: number, window: number, lockMin: number) => t('set.v.lock', { max, window, lock: lockMin })

  const steps: { icon: React.ReactNode; title: TranslationKey; tone: keyof typeof TONES; rows: TRow[] }[] = [
    {
      icon: <Truck className="w-[18px] h-[18px]" />,
      title: 'set.s1.title',
      tone: 'sky',
      rows: [
        { label: 'set.s1.otp', value: min(3) },
        { label: 'set.s1.resend', value: sec(60) },
        { label: 'set.s1.sendMax', value: t('set.v.perHour', { count: 5 }) },
        { label: 'set.s1.unlock', value: sec(10) },
        { label: 'set.s1.confirm', value: t('set.v.upTo', { value: min(10) }) },
      ],
    },
    {
      icon: <Archive className="w-[18px] h-[18px]" />,
      title: 'set.s2.title',
      tone: 'amber',
      rows: [
        { label: 'set.s2.free', value: t('set.v.byTier1') },
        { label: 'set.s2.warn', value: hour(12) },
        { label: 'set.s2.overdue', value: t('set.v.byTier3') },
        { label: 'set.s2.cron', value: t('set.v.everyHour') },
      ],
    },
    {
      icon: <PackageCheck className="w-[18px] h-[18px]" />,
      title: 'set.s3.title',
      tone: 'emerald',
      rows: [
        { label: 'set.s3.methods', value: t('set.v.methods') },
        { label: 'set.s3.reissue', value: sec(60) },
        { label: 'set.s3.appLock', value: lock(5, 15, 15) },
        { label: 'set.s3.faceLock', value: lock(10, 5, 5) },
      ],
    },
    {
      icon: <PackageOpen className="w-[18px] h-[18px]" />,
      title: 'set.s4.title',
      tone: 'purple',
      rows: [
        { label: 'set.s4.who', value: t('set.v.manager') },
        { label: 'set.s4.action', value: t('set.v.returnAction') },
        { label: 'set.s4.pickup', value: t('set.v.returnPickup') },
      ],
    },
  ]

  const groups: { icon: React.ReactNode; title: TranslationKey; desc: TranslationKey; rows: TRow[] }[] = [
    {
      icon: <Cpu className="w-[18px] h-[18px]" />,
      title: 'set.dev.title',
      desc: 'set.dev.desc',
      rows: [
        { label: 'set.dev.offline', value: sec(75) },
        { label: 'set.dev.unlock', value: sec(10) },
      ],
    },
    {
      icon: <Gauge className="w-[18px] h-[18px]" />,
      title: 'set.sec.title',
      desc: 'set.sec.desc',
      rows: [
        { label: 'set.sec.api', value: t('set.v.perMin', { count: 60 }) },
        { label: 'set.sec.auth', value: t('set.v.perMin', { count: 5 }) },
      ],
    },
    {
      icon: <Database className="w-[18px] h-[18px]" />,
      title: 'set.data.title',
      desc: 'set.data.desc',
      rows: [
        { label: 'set.data.log', value: day(365) },
        { label: 'set.data.notif', value: day(90) },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header data-reveal className="flex flex-col gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">{t('set.title')}</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-slate-600 dark:text-slate-400">{t('set.desc')}</p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
          <p className="text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">
            <strong className="mr-1.5 text-slate-900 dark:text-white">{t('set.noteTitle')}.</strong>
            {t('set.noteBody')}
          </p>
        </div>
      </header>

      {/* Vòng đời bưu kiện */}
      <section data-reveal className="flex flex-col gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('set.life.title')}</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500 dark:text-slate-400">{t('set.life.desc')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, i) => {
            const tone = TONES[step.tone]
            return (
              <div key={step.title} className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className={`h-1 w-full ${tone.bar}`} aria-hidden="true" />
                <div className={`flex items-center gap-3 px-5 py-4 ${tone.soft}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.badge}`}>{step.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-bold ${tone.text}`}>{i + 1} / {steps.length}</p>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{t(step.title)}</h3>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
                  {step.rows.map((row) => (
                    <ParamRow key={row.label} label={t(row.label)} value={row.value} />
                  ))}
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-[13px] top-7 z-10 hidden h-6 w-6 rounded-full bg-white p-1 text-slate-400 ring-1 ring-slate-200 xl:block dark:bg-slate-900 dark:ring-slate-700" aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Tủ, truy cập và dữ liệu */}
      <section data-reveal className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{g.icon}</span>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{t(g.title)}</h3>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400">{t(g.desc)}</p>
              </div>
            </div>
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {g.rows.map((row) => (
                <ParamRow key={row.label} label={t(row.label)} value={row.value} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
