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
import { StationCard } from '../../components/Dashboard/StationCard'
import { HealthGauge } from '../../components/Dashboard/HealthGauge'
import { AppButton } from '../../components/common'
import { getDashboardOverview } from '../../service/dashboard.service'
import type { TDashboardOverview, TActivityItem } from '../../types/dashboard.type'
import { useTranslation } from '../../context/LanguageContext'

export function DashboardPage() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const [overview, setOverview] = useState<TDashboardOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getDashboardOverview()
      .then((data) => {
        setOverview(data)
        setError(null)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : ''))
  }, [language])

  if (error !== null && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <p className="text-[13px] text-red-600 dark:text-red-400 text-center">{t('dash.loadFailed', { message: error })}</p>
      </div>
    )
  }

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

  // Trạm không trực tuyến hiện trước, tối đa 8 trạm; danh sách đầy đủ ở trang Quản lý tủ đồ
  const statusOrder = { offline: 0, warning: 1, online: 2 } as const
  const stationSummaries = [...overview.stations]
    .sort((x, y) => statusOrder[x.status] - statusOrder[y.status] || x.name.localeCompare(y.name))
    .slice(0, 8)
  const { online: onlineCount, total: totalCount } = overview.health
  const allOnline = totalCount > 0 && onlineCount === totalCount
  // Công suất toàn bộ ngăn của các trạm đang hiển thị
  const allCells = overview.stations.flatMap((st) => st.cells)
  const cellTotal = allCells.length
  const cellAvail = allCells.filter((c) => c.status === 'available').length
  const cellOccupied = allCells.filter((c) => c.status === 'occupied').length
  const cellMaintenance = cellTotal - cellAvail - cellOccupied
  const cellPercent = (n: number) => (cellTotal > 0 ? (n / cellTotal) * 100 : 0)

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* ── EXECUTIVE CONTROL HERO HEADER ── */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20">
            <LayoutDashboard className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">{t('dashboard.title')}</h1>
              <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap ${
                allOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${allOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {totalCount === 0
                  ? t('dash.healthNoStation')
                  : allOnline
                    ? t('dash.systemOk')
                    : t('dash.healthPartial', { online: onlineCount, total: totalCount })}
              </span>
            </div>
            <p className="text-[12.5px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{t('dashboard.desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <AppButton onClick={() => navigate('/lockers')} className="flex-1 sm:flex-initial !py-2.5 !px-4 !text-[12px] flex items-center justify-center gap-1.5">
            <Boxes className="w-4 h-4" />
            {t('dash.manageClusters')}
          </AppButton>
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="btn-sec-custom flex-1 sm:flex-initial h-10 px-4 rounded-xl text-[12px] font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            {t('dash.lookupParcels')}
          </button>
        </div>
      </section>

      {/* ── 4 REALTIME METRIC CARDS ── */}
      <section data-stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {overview.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      {/* ── STATION LIVE MONITORING SUMMARY GRID ── */}
      <section data-reveal className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="setting-title-custom text-[16px] font-bold">{t('dash.clustersTitle')}</h2>
            <p className="setting-desc-custom text-[12px] mt-0.5 font-medium">
              {t('dash.clustersDesc', { count: totalCount })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/lockers')}
            className="flex items-center gap-1 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap"
          >
            {t('dash.viewAllStations')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Công suất toàn bộ các ngăn: thanh chia theo trạng thái */}
        {cellTotal > 0 && (
          <div className="flex flex-col gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="setting-title-custom text-[13px] font-bold">
                {t('dash.capSummary', { avail: cellAvail, total: cellTotal })}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] setting-desc-custom">
                <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-[3px] bg-emerald-300 dark:bg-emerald-500/60" />{t('dash.available')} {cellAvail}</span>
                <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-[3px] bg-sky-500" />{t('dash.capOccupied')} {cellOccupied}</span>
                <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-[3px] bg-amber-400" />{t('dash.capMaintenance')} {cellMaintenance}</span>
              </div>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full bg-emerald-300 dark:bg-emerald-500/60 transition-all duration-500" style={{ width: `${cellPercent(cellAvail)}%` }} />
              <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${cellPercent(cellOccupied)}%` }} />
              <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${cellPercent(cellMaintenance)}%` }} />
            </div>
          </div>
        )}

        {stationSummaries.length === 0 ? (
          <p className="py-6 text-center text-[13px] setting-desc-custom">{t('dash.stationsEmpty')}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
            {stationSummaries.map((st) => (
              <StationCard
                key={st.id}
                station={st}
                onOpen={() => navigate(`/lockers/${encodeURIComponent(st.id)}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── BOTTOM 2 COLUMNS (SYSTEM HEALTH + RECENT ACTIVITIES) ── */}
      <section data-reveal className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left col: System Hardware & Quick Actions (7 cols on XL) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Hardware & Infrastructure Status */}
          <div className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="setting-title-custom text-[16px] font-bold">{t('dash.infraTitle')}</h2>
                <p className="setting-desc-custom text-[12px] mt-0.5 font-medium">{t('dash.infraDesc')}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <HealthGauge online={onlineCount} total={totalCount} />
              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                {overview.statuses.map((status) => (
                  <SystemStatusCard key={status.id} status={status} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="setting-title-custom text-[16px] font-bold">{t('dash.quickTitle')}</h2>
              <p className="setting-desc-custom text-[12px] mt-0.5 font-medium">{t('dash.quickDesc')}</p>
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
                      <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center">
                        {actionIcons[index] || <Zap className="w-4 h-4 text-sky-600" />}
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="setting-title-custom text-[13px] font-bold leading-tight">{action.label}</p>
                      <p className="setting-desc-custom text-[11px] mt-0.5 truncate">{action.helper}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Right column — Activity feed (5 cols on XL) */}
        <div className="xl:col-span-5 setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="setting-title-custom text-[16px] font-bold">{t('dash.feedTitle')}</h2>
              <p className="setting-desc-custom text-[11.5px] mt-0.5 font-medium">{t('dash.feedDesc')}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="flex items-center gap-1 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap"
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

          {/* Activity Feed */}
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {filteredActivities.length > 0
              ? filteredActivities.map((item: TActivityItem) => <ActivityItem key={item.id} item={item} />)
              : (
                <div className="p-8 text-center text-slate-400 text-[13px]">
                  {t('dash.feedEmpty')}
                </div>
              )}
          </div>
        </div>

      </section>

    </div>
  )
}
