import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityItem } from '../../components/Dashboard/ActivityItem'
import { StatCard } from '../../components/Dashboard/StatCard'
import { SystemStatusCard } from '../../components/Dashboard/SystemStatusCard'
import { AppButton, AppInput } from '../../components/common'
import { getDashboardOverview } from '../../service/dashboard.service'
import type { TDashboardOverview, TActivityItem } from '../../types/dashboard.type'
import { useTranslation } from '../../context/LanguageContext'

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

export function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [overview, setOverview] = useState<TDashboardOverview | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getDashboardOverview().then(setOverview)
  }, [])

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <span className="w-6 h-6 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" style={{ animation: "spin 0.7s linear infinite" }} />
          <span className="text-[13px] font-medium">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  const filteredActivities = overview.activities.filter((item: TActivityItem) =>
    `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Executive Control Header Bar */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[19px] font-bold text-slate-900 leading-tight">{t('dashboard.title')}</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('dashboard.onlineStatus')}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">{t('dashboard.desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AppButton onClick={() => navigate('/lockers')} className="!py-2 !text-[12px]">
            📦 {t('dashboard.btnLockers')}
          </AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/shipments')} className="!py-2 !text-[12px]">
            📜 {t('dashboard.btnShipments')}
          </AppButton>
        </div>
      </section>

      {/* ── 4 VIVID STAT CARDS GRID ── */}

      {/* ── 4 VIVID STAT CARDS GRID ── */}
      <section data-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overview.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      {/* ── BOTTOM 2 COLUMNS ── */}
      <section data-reveal className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left col: System Pulse & Quick actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* System status */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1">{t('dashboard.systemPulse')}</p>
                <h2 className="text-[16px] font-bold text-slate-900">{t('dashboard.pulseTitle')}</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {t('dashboard.healthyStatus')}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {overview.statuses.map((status: any) => (
                <SystemStatusCard key={status.id} status={status} />
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
            <div>
              <p className="eyebrow mb-1">{t('dashboard.quickActions')}</p>
              <h2 className="text-[16px] font-bold text-slate-900">{t('dashboard.quickActionsTitle')}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {overview.quickActions.map((action, index) => {
                const targetMap: Record<string, string> = {
                  'quick-lockers': '/lockers', 'quick-shipments': '/shipments', 'quick-users': '/users',
                  lockers: '/lockers', shipments: '/shipments', users: '/users',
                }
                const fallbackTargets = ['/lockers', '/shipments', '/users']
                const target = targetMap[action.id] ?? fallbackTargets[index] ?? '/dashboard'

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => navigate(target)}
                    className="btn-sec-custom group flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 min-h-[90px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400">0{index + 1}</span>
                      <span className="text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all">
                        <ArrowRightIcon />
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold leading-tight">{action.label}</p>
                      <p className="text-[11px] opacity-75 mt-0.5 truncate">{action.helper}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column — Activity feed (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow mb-1">{t('dashboard.recentFeed')}</p>
              <h2 className="text-[16px] font-bold text-slate-900">{t('dashboard.recentActivities')}</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="flex items-center gap-1.5 text-[12px] font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
            >
              {t('dashboard.viewAll')} <ArrowRightIcon />
            </button>
          </div>

          {/* Search */}
          <AppInput
            id="activity-search"
            placeholder={t('dashboard.searchActivities')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Feed */}
          <div className="flex flex-col divide-y divide-slate-100">
            {filteredActivities.length > 0
              ? filteredActivities.map((item: TActivityItem) => <ActivityItem key={item.id} item={item} />)
              : (
                <p className="py-8 text-center text-[13px] text-slate-400">
                  {t('dashboard.noActivities')}
                </p>
              )
            }
          </div>
        </div>
      </section>

    </div>
  )
}
