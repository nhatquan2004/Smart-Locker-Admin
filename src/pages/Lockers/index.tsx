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
        `${s.code} ${s.name} ${s.location} ${s.orgName}`.toLowerCase().includes(keyword)
      const matchCompany = filter.companyId === 'all' || s.orgId === filter.companyId
      const matchStatus = filter.status === 'all' || s.status === filter.status

      return matchSearch && matchCompany && matchStatus
    })
  }, [stations, filter])

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">
      
      {/* Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-[20px]">
            📦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">{t('lockers.title')}</h1>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">{t('lockers.desc')}</p>
          </div>
        </div>

        <div className="stat-pill px-4 py-2 rounded-2xl border text-center shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Tổng số trạm tủ</span>
          <strong className="text-[18px] font-bold text-slate-900 dark:text-white font-mono">{stations.length}</strong>
        </div>
      </section>

      {/* Filter Bar */}
      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t('lockers.searchPlaceholder')}
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="flex flex-col gap-1 w-full md:w-48">
            <select
              value={filter.companyId}
              onChange={(e) => setFilter((prev) => ({ ...prev, companyId: e.target.value }))}
              className="h-10 px-3.5 rounded-xl text-[13px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả đơn vị / khu trọ</option>
              <option value="org-001" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TechCorp Office Building</option>
              <option value="org-002" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Khu Nhà Trọ Hoàng Nam</option>
              <option value="org-003" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ký Túc Xá Đại Học Bách Khoa</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-44">
            <select
              value={filter.status}
              onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
              className="h-10 px-3.5 rounded-xl text-[13px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả trạng thái</option>
              <option value="online" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Hoạt động</option>
              <option value="warning" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cảnh báo</option>
              <option value="offline" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ngoại tuyến</option>
            </select>
          </div>

        </div>
      </div>

      {/* Stations List Card Grid */}
      {filteredStations.length > 0 ? (
        <section data-stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {filteredStations.map((s) => {
            const smallCount = s.compartments.filter((c) => c.size === 'small').length
            const mediumCount = s.compartments.filter((c) => c.size === 'medium').length
            const largeCount = s.compartments.filter((c) => c.size === 'large').length
            const availCount = s.compartments.filter((c) => c.status === 'available').length
            const totalCount = s.compartments.length
            const availPercent = Math.round((availCount / totalCount) * 100) || 0

            return (
              <article key={s.id} className="setting-card-custom flex flex-col gap-4 p-5 sm:p-6 rounded-2xl border shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 min-w-0">
                {/* Station Code + Status Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-block">
                      {s.code}
                    </span>
                    <h3 className="setting-title-custom text-[15px] sm:text-[16px] font-bold mt-1.5 truncate" title={s.name}>{s.name}</h3>
                    <p className="setting-desc-custom text-[12px] font-medium truncate mt-0.5 flex items-center gap-1" title={s.location}>
                      <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="truncate">{s.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[12px] font-semibold shrink-0">
                    <span className={`w-2 h-2 rounded-full ${
                      s.status === 'online' ? 'bg-emerald-500 animate-pulse' : s.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                    }`} />
                    <span className={s.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' : s.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                      {s.status === 'online' ? 'Hoạt động' : s.status === 'warning' ? 'Cảnh báo' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>

                {/* Organization Ownership */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-[12.5px] flex justify-between items-center border border-slate-200/80 dark:border-slate-700/80">
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
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11.5px] font-mono">
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
                <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
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
