import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { getLockerStations } from '../../service/lockerStation.service'
import type { TLockerStation, TLockerStationFilter } from '../../types/lockerStation.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { useTranslation } from '../../context/LanguageContext'

export function LockersPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const [stations, setStations] = useState<TLockerStation[]>([])
  const [filter, setFilter] = useState<TLockerStationFilter>({
    search: '',
    orgId: 'all',
    status: 'all',
  })

  useEffect(() => {
    getLockerStations().then((list) => {
      if (user?.role === 'org_admin' && user.orgId && user.orgId !== 'all') {
        setStations(list.filter((s) => s.orgId === user.orgId))
      } else {
        setStations(list)
      }
    })
  }, [user])

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${s.code} ${s.name} ${s.orgName} ${s.location}`.toLowerCase().includes(keyword)

      const matchOrg = filter.orgId === 'all' || s.orgId === filter.orgId
      const matchStatus = filter.status === 'all' || s.status === filter.status

      return matchSearch && matchOrg && matchStatus
    })
  }, [stations, filter])

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Hero Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="relative z-10 flex-1 min-w-0">
          <p className="eyebrow mb-1">Smart Locker Station Directory</p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight">
            {t('lockers.title')}
          </h1>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed max-w-lg">
            {t('lockers.desc')}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="stat-pill px-4 py-2.5 rounded-xl border text-center shadow-2xs">
            <span className="text-[10px] font-semibold opacity-70 uppercase">{t('common.total')}</span>
            <p className="text-[20px] font-bold font-mono leading-none mt-1">{stations.length}</p>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div data-reveal className="p-5 rounded-2xl glass-card flex flex-col gap-4 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">{t('common.search')}</label>
            <input
              type="text"
              placeholder={t('lockers.searchPlaceholder')}
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Org Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">{t('users.colOrg')}</label>
            <select
              value={filter.orgId}
              onChange={(e) => setFilter((prev) => ({ ...prev, orgId: e.target.value }))}
              className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">{t('role.all')}</option>
              <option value="org-001">TechCorp Office Building</option>
              <option value="org-002">Khu Nhà Trọ Hoàng Nam</option>
              <option value="org-003">Ký Túc Xá Đại Học Bách Khoa</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">{t('common.status')}</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value as any }))}
              className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">{t('lockers.allStatuses')}</option>
              <option value="online">Online 100%</option>
              <option value="warning">Warning / Weak Signal</option>
              <option value="offline">Offline</option>
            </select>
          </div>

        </div>
      </div>

      {/* Stations List Grid */}
      {filteredStations.length > 0 ? (
        <section data-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStations.map((s) => {
            const smallCount = s.compartments.filter((c) => c.size === 'small').length
            const mediumCount = s.compartments.filter((c) => c.size === 'medium').length
            const largeCount = s.compartments.filter((c) => c.size === 'large').length
            const availCount = s.compartments.filter((c) => c.status === 'available').length
            const totalCount = s.compartments.length
            const availPercent = Math.round((availCount / totalCount) * 100) || 0

            return (
              <article key={s.id} className="flex flex-col gap-4 p-6 rounded-2xl glass-card border border-slate-200 shadow-xs hover:border-sky-300 transition-all duration-200">
                {/* Station Code + Org Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="stat-pill text-[10px] font-semibold px-2 py-0.5 rounded border font-mono">
                      {s.code}
                    </span>
                    <h3 className="text-[16px] font-bold text-slate-900 mt-1 truncate">{s.name}</h3>
                    <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5">📍 {s.location}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${s.status === 'online'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : s.status === 'warning'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {s.status.toUpperCase()}
                  </span>
                </div>

                {/* Organization Ownership */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{t('users.colOrg')}:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[170px]">{s.orgName}</span>
                </div>

                {/* Compartment breakdown */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-600 font-medium">{totalCount} {t('lockers.title')}:</span>
                    <span className="font-mono font-bold text-emerald-700">{availCount} {t('lockers.statusAvailable')} ({availPercent}%)</span>
                  </div>

                  {/* Size Pills */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-mono">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold">
                      S: {smallCount}
                    </div>
                    <div className="p-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                      M: {mediumCount}
                    </div>
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                      L: {largeCount}
                    </div>
                  </div>
                </div>

                {/* Master controller IoT status */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                  <span>MCU Temp: {s.masterController.temperatureCelsius}°C</span>
                  <span>IP: {s.masterController.ipAddress}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => navigate(`/lockers/${s.id}`)}
                    className="flex-1 h-10 rounded-xl text-[12px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all cursor-pointer shadow-md shadow-sky-600/20 shimmer-btn active:scale-95"
                  >
                    📦 {t('common.viewDetail')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/lockers/${s.id}/hardware`)}
                    className="h-10 px-3.5 rounded-xl text-[12px] font-bold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    🔧 Hardware
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <EmptyState
          title={t('common.noData')}
          description="Thử chọn lại bộ lọc Doanh nghiệp/Khu trọ hoặc từ khóa tìm kiếm."
        />
      )}

    </div>
  )
}
