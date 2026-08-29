import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLockerStations } from '../../service/lockerStation.service'
import type { TLockerStation } from '../../types/lockerStation.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { useTranslation } from '../../context/LanguageContext'
import { Boxes, Cpu, MapPin, Search } from 'lucide-react'

type TLockerFilter = {
  search: string
  companyId: string
  status: string
}

export function LockersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [stations, setStations] = useState<TLockerStation[]>([])
  const [filter, setFilter] = useState<TLockerFilter>({
    search: '',
    companyId: 'all',
    status: 'all',
  })

  useEffect(() => {
    getLockerStations().then(setStations)
  }, [])

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${s.name} ${s.code} ${s.location} ${s.orgName}`.toLowerCase().includes(keyword)

      const matchCompany = filter.companyId === 'all' || s.orgId === filter.companyId
      const matchStatus = filter.status === 'all' || s.status === filter.status

      return matchSearch && matchCompany && matchStatus
    })
  }, [stations, filter])

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Hero Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="relative z-10 flex-1 min-w-0">
          <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
            Smart Locker Station Directory
          </span>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight mt-1.5 truncate">{t('lockers.title')}</h1>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            Theo dõi trạng thái thời gian thực các ngăn tủ trống, đang sử dụng, quá hạn hoặc lỗi phần cứng.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="stat-pill px-4 py-2 rounded-2xl border flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">TỔNG SỐ</span>
            <span className="text-[20px] font-bold font-mono text-sky-600 dark:text-sky-400 leading-none mt-0.5">{filteredStations.length}</span>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col gap-4 shadow-2xs border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono setting-desc-custom uppercase font-semibold">TÌM KIẾM...</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder={t('lockers.searchPlaceholder')}
                value={filter.search}
                onChange={(e) => setFilter((prev: TLockerFilter) => ({ ...prev, search: e.target.value }))}
                className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Org Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono setting-desc-custom uppercase font-semibold">{t('users.colOrg')}</label>
            <select
              value={filter.companyId}
              onChange={(e) => setFilter((prev: TLockerFilter) => ({ ...prev, companyId: e.target.value }))}
              className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.all')}</option>
              <option value="org-001" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TechCorp Office Building</option>
              <option value="org-002" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Khu Nhà Trọ Hoàng Nam</option>
              <option value="org-003" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ký Túc Xá ĐH Bách Khoa</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono setting-desc-custom uppercase font-semibold">{t('common.status')}</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter((prev: TLockerFilter) => ({ ...prev, status: e.target.value }))}
              className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('lockers.allStatuses')}</option>
              <option value="online" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Online 100%</option>
              <option value="warning" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Warning / Weak Signal</option>
              <option value="offline" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Offline</option>
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
              <article key={s.id} className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                {/* Station Code + Status Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="stat-pill text-[10px] font-semibold px-2 py-0.5 rounded border font-mono">
                      {s.code}
                    </span>
                    <h3 className="setting-title-custom text-[16px] font-bold mt-1 truncate">{s.name}</h3>
                    <p className="setting-desc-custom text-[12px] font-medium truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      {s.location}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${s.status === 'online'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      : s.status === 'warning'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {s.status.toUpperCase()}
                  </span>
                </div>

                {/* Organization Ownership */}
                <div className="p-3 rounded-xl setting-input-custom text-[12px] flex justify-between items-center border">
                  <span className="setting-desc-custom font-medium">{t('users.colOrg')}:</span>
                  <span className="font-bold setting-title-custom truncate max-w-[170px]">{s.orgName}</span>
                </div>

                {/* Compartment breakdown */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="setting-desc-custom font-medium">Tổng số ngăn tủ:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{availCount}/{totalCount} Trống ({availPercent}%)</span>
                  </div>

                  {/* Size Pills */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-mono">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 font-bold">
                      S: {smallCount}
                    </div>
                    <div className="p-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800 font-bold">
                      M: {mediumCount}
                    </div>
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 font-bold">
                      L: {largeCount}
                    </div>
                  </div>
                </div>

                {/* Master controller IoT status */}
                <div className="flex items-center justify-between text-[11px] font-mono setting-desc-custom pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>MCU Temp: {s.masterController.temperatureCelsius}°C</span>
                  <span>IP: {s.masterController.ipAddress}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => navigate(`/lockers/${s.id}`)}
                    className="flex-1 h-10 rounded-xl text-[12px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all cursor-pointer shadow-md shadow-sky-600/20 shimmer-btn active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Boxes className="w-4 h-4" />
                    {t('common.viewDetail')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/lockers/${s.id}/hardware`)}
                    className="btn-sec-custom h-10 px-3.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Cpu className="w-4 h-4" />
                    Hardware
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
