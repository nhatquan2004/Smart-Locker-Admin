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
  MapPin,
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

  const mockStationSummaries = [
    {
      id: 'station-1',
      code: 'ST-TC01',
      name: 'Trạm Tủ A - TechCorp Office',
      location: 'Tầng 1 - Sảnh Lễ Tân TechCorp',
      total: 12,
      avail: 7,
      status: 'online',
      org: 'TechCorp Office Building',
    },
    {
      id: 'station-2',
      code: 'ST-HN01',
      name: 'Trạm Tủ B - Nhà Trọ Hoàng Nam',
      location: 'Sân Trước - Cổng Vào Nhà Trọ',
      total: 10,
      avail: 6,
      status: 'online',
      org: 'Khu Nhà Trọ Hoàng Nam',
    },
    {
      id: 'station-3',
      code: 'ST-BK01',
      name: 'Trạm Tủ C - KTX ĐH Bách Khoa',
      location: 'Tầng 1 - Sảnh Nhà KTX A3',
      total: 16,
      avail: 3,
      status: 'warning',
      org: 'Ký Túc Xá Đại Học Bách Khoa',
    },
    {
      id: 'station-4',
      code: 'ST-VH01',
      name: 'Trạm Tủ D - Vinhomes Central',
      location: 'Tháp Landmark 1 - Sảnh Cư Dân',
      total: 10,
      avail: 10,
      status: 'online',
      org: 'Vinhomes Central Park',
    },
  ]

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
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hệ thống 100% Hoạt động
              </span>
            </div>
            <p className="text-[12.5px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{t('dashboard.desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <AppButton onClick={() => navigate('/lockers')} className="flex-1 sm:flex-initial !py-2.5 !px-4 !text-[12px] flex items-center justify-center gap-1.5">
            <Boxes className="w-4 h-4" />
            Quản Lý Cụm Tủ
          </AppButton>
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="btn-sec-custom flex-1 sm:flex-initial h-10 px-4 rounded-xl text-[12px] font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Tra Cứu Bưu Kiện
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
            <h2 className="setting-title-custom text-[16px] font-bold">Trạng thái các cụm tủ đang vận hành</h2>
            <p className="setting-desc-custom text-[12px] mt-0.5 font-medium">
              Theo dõi dung lượng lưu trữ khả dụng và kết quả kết nối phần cứng của 4 cụm tủ toàn hệ thống
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/lockers')}
            className="flex items-center gap-1 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap"
          >
            Xem tất cả trạm <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {mockStationSummaries.map((st) => {
            const usedPercent = Math.round(((st.total - st.avail) / st.total) * 100)
            return (
              <div
                key={st.id}
                onClick={() => navigate(`/lockers/${st.id}/hardware`)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 bg-white/50 dark:bg-slate-900/50 transition-all cursor-pointer shadow-2xs flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {st.code}
                    </span>
                    <h3 className="setting-title-custom text-[13.5px] font-bold mt-1.5 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" title={st.name}>
                      {st.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold shrink-0 pt-0.5">
                    <span className={`w-2 h-2 rounded-full ${
                      st.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
                    }`} />
                    <span className={st.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                      {st.status === 'online' ? 'Online' : 'Cảnh báo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11.5px] setting-desc-custom truncate">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate">{st.location}</span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="setting-desc-custom font-medium">Trống: <strong className="text-emerald-600 dark:text-emerald-400">{st.avail}/{st.total}</strong></span>
                    <span className="setting-desc-custom font-bold">{usedPercent}% Sử dụng</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        usedPercent > 80 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── BOTTOM 2 COLUMNS (SYSTEM HEALTH + RECENT ACTIVITIES) ── */}
      <section data-reveal className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left col: System Hardware & Quick Actions (7 cols on XL) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Hardware & Infrastructure Status */}
          <div className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="setting-title-custom text-[16px] font-bold">Giám sát hạ tầng phần cứng & IoT</h2>
                <p className="setting-desc-custom text-[12px] mt-0.5 font-medium">Trạng thái kết nối tín hiệu bo mạch RS485 và cảm biến vật lý</p>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Khả dụng</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {overview.statuses.map((status: any) => (
                <SystemStatusCard key={status.id} status={status} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="setting-title-custom text-[16px] font-bold">Lối tắt thao tác nhanh</h2>
              <p className="setting-desc-custom text-[12px] mt-0.5 font-medium">Truy cập nhanh vào các tính năng điều khiển trung tâm</p>
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
              <h2 className="setting-title-custom text-[16px] font-bold">Nhật ký hoạt động mới nhất</h2>
              <p className="setting-desc-custom text-[11.5px] mt-0.5 font-medium">Ghi lại toàn bộ luồng gửi/nhận và thao tác trên hệ thống</p>
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
                  Không tìm thấy nhật ký hoạt động phù hợp.
                </div>
              )}
          </div>
        </div>

      </section>

    </div>
  )
}
