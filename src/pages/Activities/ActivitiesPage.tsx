import { useEffect, useMemo, useState } from 'react'
import { getActivities } from '../../service/activity.service'
import type { TActivityCategory, TActivityFilter, TActivityItem, TActivityRole, TActivityStatus } from '../../types/activity.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { useTranslation } from '../../context/LanguageContext'

const categoryIcons: Record<TActivityCategory, React.ReactNode> = {
  shipment: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
  ),
  otp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  locker: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  hardware: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

export function ActivitiesPage() {
  const { t } = useTranslation()
  const [activities, setActivities] = useState<TActivityItem[]>([])
  const [filter, setFilter] = useState<TActivityFilter>({
    search: '',
    role: 'all',
    category: 'all',
    status: 'all',
  })

  const roleLabels: Record<TActivityRole, { label: string; style: string }> = {
    customer: { label: t('role.user'), style: 'bg-sky-100 text-sky-800 border-sky-200' },
    shipper:  { label: t('role.shipper'),   style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    admin:    { label: t('role.org_admin'), style: 'bg-amber-100 text-amber-800 border-amber-200' },
    system:   { label: 'System Engine',   style: 'bg-purple-100 text-purple-800 border-purple-200' },
  }

  const statusBadges: Record<TActivityStatus, { label: string; style: string }> = {
    success: { label: t('common.success'), style: 'bg-emerald-100 text-emerald-700 border-emerald-300 font-bold' },
    info:    { label: 'INFO',   style: 'bg-sky-100 text-sky-700 border-sky-300 font-bold' },
    warning: { label: 'WARNING',   style: 'bg-amber-100 text-amber-800 border-amber-300 font-bold' },
    error:   { label: t('common.error'), style: 'bg-red-100 text-red-700 border-red-300 font-bold' },
  }

  useEffect(() => {
    getActivities().then(setActivities)
  }, [])

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${act.actorName} ${act.title} ${act.description} ${act.targetLabel ?? ''}`
          .toLowerCase()
          .includes(keyword)

      const matchRole = filter.role === 'all' || act.actorRole === filter.role
      const matchCategory = filter.category === 'all' || act.category === filter.category
      const matchStatus = filter.status === 'all' || act.status === filter.status

      return matchSearch && matchRole && matchCategory && matchStatus
    })
  }, [activities, filter])

  return (
    <div className="flex flex-col gap-5 max-w-[1250px]">

      {/* Streamlined Action Bar Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-700">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-slate-900 leading-tight">{t('activities.title')}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                {filteredActivities.length} {t('activities.logs')}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">{t('activities.desc')}</p>
          </div>
        </div>

        {/* Realtime Status Indicator */}
        <div className="stat-pill flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold">Audit Stream Active</span>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div data-reveal className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-center gap-3 shadow-2xs border border-slate-200">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder={t('activities.searchPlaceholder')}
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full h-10 px-3.5 pl-9 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-purple-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-[14px]">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={filter.role}
            onChange={(e) => setFilter((prev) => ({ ...prev, role: e.target.value as any }))}
            className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">{t('role.all')}</option>
            <option value="shipper">{t('role.shipper')}</option>
            <option value="customer">{t('role.user')}</option>
            <option value="admin">{t('role.org_admin')}</option>
            <option value="system">System Engine</option>
          </select>

          <select
            value={filter.category}
            onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value as any }))}
            className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">{t('activities.categoryAll')}</option>
            <option value="shipment">📦 {t('activities.categoryShipper')}</option>
            <option value="otp">🔑 {t('activities.categoryOtp')}</option>
            <option value="locker">🚪 {t('activities.categoryDoor')}</option>
            <option value="hardware">⚡ {t('activities.categorySystem')}</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div data-reveal className="rounded-2xl glass-card overflow-hidden shadow-xs border border-slate-200">
        {filteredActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-mono text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">{t('activities.colTime')}</th>
                  <th className="py-3.5 px-5">{t('activities.colActor')}</th>
                  <th className="py-3.5 px-5">{t('activities.colEvent')}</th>
                  <th className="py-3.5 px-5">{t('activities.colDesc')}</th>
                  <th className="py-3.5 px-5 text-right">{t('activities.colStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] bg-white">
                {filteredActivities.map((act) => {
                  const roleBadge = roleLabels[act.actorRole] ?? roleLabels.system
                  const statusBadge = statusBadges[act.status] ?? statusBadges.info
                  const catIcon = categoryIcons[act.category] ?? categoryIcons.shipment

                  return (
                    <tr key={act.id} className="hover:bg-sky-50/40 transition-colors">
                      {/* Time & Category Icon */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            {catIcon}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-mono text-slate-800 font-bold text-[12px]">{act.timeLabel}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">{act.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900">{act.actorName}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono border whitespace-nowrap w-max ${roleBadge.style}`}>
                            {roleBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Event Title & Target */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900">{act.title}</span>
                          {act.targetLabel && (
                            <span className="text-[11px] font-mono text-sky-700 font-semibold">
                              {act.targetLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Detail Description */}
                      <td className="py-3.5 px-5 text-[12px] text-slate-600 max-w-[320px]">
                        <p className="line-clamp-2">{act.description}</p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono border whitespace-nowrap ${statusBadge.style}`}>
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
