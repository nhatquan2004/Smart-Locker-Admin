import { useEffect, useMemo, useState } from 'react'
import { getActivities } from '../../service/activity.service'
import { getOrganizations } from '../../service/organization.service'
import { useAuthStore } from '../../store/useAuthStore'
import type { TActivityCategory, TActivityFilter, TActivityItem, TActivityRole, TActivityStatus } from '../../types/activity.type'
import type { TOrganization } from '../../types/organization.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { useTranslation } from '../../context/LanguageContext'
import {
  Activity,
  Key,
  Lock,
  Zap,
  Settings,
  User,
  Building2,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  PackageCheck,
} from 'lucide-react'

const categoryIcons: Record<TActivityCategory, React.ReactNode> = {
  shipment: <PackageCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
  otp: <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
  locker: <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  hardware: <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  settings: <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
  user: <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
}

export function ActivitiesPage() {
  const { t } = useTranslation()
  const { user: loggedUser } = useAuthStore()
  const [activities, setActivities] = useState<TActivityItem[]>([])
  const [orgsList, setOrgsList] = useState<TOrganization[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState<TActivityFilter>({
    search: '',
    companyId: 'all',
    role: 'all',
    category: 'all',
    status: 'all',
  })

  const isSuperAdmin = loggedUser?.role === 'super_admin'
  const userOrgId = loggedUser?.orgId

  const roleLabels: Record<TActivityRole, { label: string; style: string }> = {
    customer: { label: t('role.user'), style: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
    shipper:  { label: t('role.shipper'),   style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
    admin:    { label: t('role.org_admin'), style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
    system:   { label: 'System Engine',   style: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' },
  }

  const statusBadges: Record<TActivityStatus, { label: string; icon: React.ReactNode; style: string }> = {
    success: { label: t('common.success'), icon: <CheckCircle2 className="w-3 h-3" />, style: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-bold' },
    info:    { label: 'INFO', icon: <Info className="w-3 h-3" />, style: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800 font-bold' },
    warning: { label: 'WARNING', icon: <AlertTriangle className="w-3 h-3" />, style: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-bold' },
    error:   { label: t('common.error'), icon: <XCircle className="w-3 h-3" />, style: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 font-bold' },
  }

  const loadData = () => {
    setIsRefreshing(true)
    Promise.all([getActivities(), getOrganizations()]).then(([acts, orgs]) => {
      setActivities(acts)
      setOrgsList(orgs)
      setTimeout(() => setIsRefreshing(false), 300)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (!isSuperAdmin && userOrgId && userOrgId !== 'all') {
        if (act.orgId && act.orgId !== 'all' && act.orgId !== userOrgId) {
          return false
        }
      }

      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${act.actorName} ${act.title} ${act.description} ${act.orgName ?? ''} ${act.targetLabel ?? ''}`
          .toLowerCase()
          .includes(keyword)

      const matchOrg = filter.companyId === 'all' || act.orgId === filter.companyId
      const matchRole = filter.role === 'all' || act.actorRole === filter.role
      const matchCategory = filter.category === 'all' || act.category === filter.category
      const matchStatus = filter.status === 'all' || act.status === filter.status

      return matchSearch && matchOrg && matchRole && matchCategory && matchStatus
    })
  }, [activities, filter, isSuperAdmin, userOrgId])

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Streamlined Action Bar Hero Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">{t('activities.title')}</h1>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
                {filteredActivities.length} {t('activities.logs')}
              </span>
            </div>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{t('activities.desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          {/* Realtime Stream Indicator */}
          <div className="stat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[11px] font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Audit Stream Active</span>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isRefreshing}
            className="btn-sec-custom h-10 px-3.5 rounded-xl text-[12px] font-bold border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Làm mới nhật ký"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-2xs border">
        
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t('activities.searchPlaceholder')}
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Dropdown Filters Group */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          
          {/* Organization Filter (Super Admin Only) */}
          {isSuperAdmin && (
            <select
              value={filter.companyId}
              onChange={(e) => setFilter((prev) => ({ ...prev, companyId: e.target.value }))}
              className="setting-input-custom h-10 px-3 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer w-56 shrink-0"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả Doanh Nghiệp / Khu Trọ</option>
              {orgsList.map((org) => (
                <option key={org.id} value={org.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          )}

          {/* Role Filter */}
          <select
            value={filter.role}
            onChange={(e) => setFilter((prev) => ({ ...prev, role: e.target.value as any }))}
            className="setting-input-custom h-10 px-3 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.all')}</option>
            <option value="shipper" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.shipper')}</option>
            <option value="customer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.user')}</option>
            <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.org_admin')}</option>
            <option value="system" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">System Engine</option>
          </select>

          {/* Category Filter */}
          <select
            value={filter.category}
            onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value as any }))}
            className="setting-input-custom h-10 px-3 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('activities.categoryAll')}</option>
            <option value="shipment" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('activities.categoryShipper')}</option>
            <option value="otp" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('activities.categoryOtp')}</option>
            <option value="locker" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('activities.categoryDoor')}</option>
            <option value="hardware" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('activities.categorySystem')}</option>
          </select>
        </div>

      </div>

      {/* Audit Log Timeline Table Container */}
      <div data-reveal className="setting-card-custom rounded-2xl overflow-hidden shadow-xs border">
        {filteredActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-5">{t('activities.colTime')}</th>
                  <th className="py-3.5 px-5">{t('activities.colActor')}</th>
                  <th className="py-3.5 px-5">Khu Trọ / Doanh Nghiệp</th>
                  <th className="py-3.5 px-5">{t('activities.colEvent')}</th>
                  <th className="py-3.5 px-5">{t('activities.colDesc')}</th>
                  <th className="py-3.5 px-5 text-right">{t('activities.colStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px] bg-white dark:bg-slate-900">
                {filteredActivities.map((act) => {
                  const roleBadge = roleLabels[act.actorRole] ?? roleLabels.system
                  const statusBadge = statusBadges[act.status] ?? statusBadges.info
                  const catIcon = categoryIcons[act.category] ?? categoryIcons.shipment

                  return (
                    <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      
                      {/* Time & Category Icon */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0">
                            {catIcon}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-mono text-slate-900 dark:text-white font-bold text-[12px]">{act.timeLabel}</span>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">{act.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 dark:text-white">{act.actorName}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border whitespace-nowrap w-max ${roleBadge.style}`}>
                            {roleBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Organization / Building Badge */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 w-max">
                          <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{act.orgName || 'Toàn Hệ Thống'}</span>
                        </div>
                      </td>

                      {/* Event Title & Target */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                          {act.targetLabel && (
                            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold">
                              {act.targetLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Detail Description */}
                      <td className="py-3.5 px-5 text-[12px] text-slate-600 dark:text-slate-300 max-w-[300px]">
                        <p className="line-clamp-2 leading-relaxed">{act.description}</p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono border whitespace-nowrap ${statusBadge.style}`}>
                          {statusBadge.icon}
                          {statusBadge.label}
                        </span>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={t('common.noData')}
            description="Thử thay đổi bộ lọc tìm kiếm hoặc vai trò actor."
          />
        )}
      </div>

    </div>
  )
}
