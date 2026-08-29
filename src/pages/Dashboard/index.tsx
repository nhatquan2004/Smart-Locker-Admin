import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  PackageCheck,
  ArrowUpRight,
  Search,
  Zap,
  Users,
  ChevronRight,
} from 'lucide-react'
import { ActivityItem } from '../../components/Dashboard/ActivityItem'
import { StatCard } from '../../components/Dashboard/StatCard'
import { SystemStatusCard } from '../../components/Dashboard/SystemStatusCard'
import { AppButton } from '../../components/common'
import { getDashboardOverview } from '../../service/dashboard.service'
import type { TDashboardOverview, TActivityItem } from '../../types/dashboard.type'
import { useTranslation } from '../../context/LanguageContext'

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
          <span className="w-6 h-6 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
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
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">{t('dashboard.title')}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('dashboard.onlineStatus')}
              </span>
            </div>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{t('dashboard.desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <AppButton onClick={() => navigate('/lockers')} className="flex-1 sm:flex-initial !py-2.5 !px-4 !text-[12px] flex items-center justify-center gap-1.5">
            <Boxes className="w-4 h-4" />
            {t('dashboard.btnLockers')}
          </AppButton>
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="btn-sec-custom flex-1 sm:flex-initial h-10 px-4 rounded-xl text-[12px] font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            {t('dashboard.btnShipments')}
          </button>
        </div>
      </section>

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
          <div className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                  {t('dashboard.systemPulse')}
                </span>
                <h2 className="setting-title-custom text-[16px] font-bold mt-1.5">{t('dashboard.pulseTitle')}</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
          <div className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                {t('dashboard.quickActions')}
              </span>
              <h2 className="setting-title-custom text-[16px] font-bold mt-1.5">{t('dashboard.quickActionsTitle')}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {overview.quickActions.map((action, index) => {
                const targetMap: Record<string, string> = {
                  'quick-lockers': '/lockers', 'quick-shipments': '/shipments', 'quick-users': '/users',
                  lockers: '/lockers', shipments: '/shipments', users: '/users',
                }
                const fallbackTargets = ['/lockers', '/shipments', '/users']
                const target = targetMap[action.id] ?? fallbackTargets[index] ?? '/dashboard'

                const actionIcons = [
                  <Boxes key="1" className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
                  <PackageCheck key="2" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
                  <Users key="3" className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
                ]

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => navigate(target)}
                    className="btn-sec-custom group flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 min-h-[95px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center">
                        {actionIcons[index] || <Zap className="w-4 h-4 text-sky-600" />}
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                    <div>
                      <p className="setting-title-custom text-[13px] font-bold leading-tight">{action.label}</p>
                      <p className="setting-desc-custom text-[11px] mt-0.5 truncate">{action.helper}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column — Activity feed (5 cols) */}
        <div className="lg:col-span-5 setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                {t('dashboard.recentFeed')}
              </span>
              <h2 className="setting-title-custom text-[16px] font-bold mt-1.5">{t('dashboard.recentActivities')}</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="flex items-center gap-1 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              {t('dashboard.viewAll')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('dashboard.searchActivities')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Feed */}
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {filteredActivities.length > 0
              ? filteredActivities.map((item: TActivityItem) => <ActivityItem key={item.id} item={item} />)
              : (
                <p className="py-8 text-center text-[13px] setting-desc-custom">
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
