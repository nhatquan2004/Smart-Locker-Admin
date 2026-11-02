import { useEffect, useState } from 'react'
import { getActivities, getActivityStats } from '../../service/activity.service'
import { getOrganizations } from '../../service/organization.service'
import { useAuthStore } from '../../store/useAuthStore'
import type {
  TActivityCategory,
  TActivityItem,
  TActivityQuery,
  TActivityRole,
  TActivityStats,
  TActivityStatus,
} from '../../types/activity.type'
import type { TOrganization } from '../../types/organization.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { useTranslation } from '../../context/LanguageContext'
import { formatDate, formatDateTime, formatRelativeTime } from '../../i18n/format'
import type { TranslationKey } from '../../i18n/translations'
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Info,
  Key,
  Lock,
  PackageCheck,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  User,
  XCircle,
  Zap,
} from 'lucide-react'

const PAGE_SIZE = 20

const categoryIcons: Record<TActivityCategory, React.ReactNode> = {
  PACKAGE: <PackageCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
  PICKUP: <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
  LOCKER: <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  HARDWARE: <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  SETTINGS: <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
  USER: <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  PAYMENT: <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
  ISSUE: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
}

const categories = Object.keys(categoryIcons) as TActivityCategory[]
const levels: TActivityStatus[] = ['SUCCESS', 'INFO', 'WARNING', 'ERROR']

const roleMeta: Record<TActivityRole, { labelKey: TranslationKey; style: string }> = {
  SYSTEM_ADMIN: { labelKey: 'role.super_admin', style: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' },
  BUILDING_ADMIN: { labelKey: 'role.org_admin', style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  SHIPPER: { labelKey: 'role.shipper', style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  RESIDENT: { labelKey: 'role.user', style: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
  KIOSK: { labelKey: 'act.role.KIOSK', style: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800' },
  DEVICE: { labelKey: 'act.role.DEVICE', style: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  SYSTEM: { labelKey: 'act.systemEngine', style: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' },
}

const statusMeta: Record<TActivityStatus, { labelKey: TranslationKey; icon: React.ReactNode; style: string }> = {
  SUCCESS: { labelKey: 'act.st.SUCCESS', icon: <CheckCircle2 className="w-3 h-3" />, style: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-bold' },
  INFO: { labelKey: 'act.st.INFO', icon: <Info className="w-3 h-3" />, style: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800 font-bold' },
  WARNING: { labelKey: 'act.st.WARNING', icon: <AlertTriangle className="w-3 h-3" />, style: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-bold' },
  ERROR: { labelKey: 'act.st.ERROR', icon: <XCircle className="w-3 h-3" />, style: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 font-bold' },
}

type TRange = 'all' | 'today' | '7d' | '30d'

// Đổi khoảng thời gian đã chọn thành from/to (ISO) gửi lên server
function rangeToQuery(range: TRange): Pick<TActivityQuery, 'from' | 'to'> {
  if (range === 'all') return {}
  const now = new Date()
  const from = new Date(now)
  if (range === 'today') from.setHours(0, 0, 0, 0)
  else from.setDate(from.getDate() - (range === '7d' ? 7 : 30))
  return { from: from.toISOString(), to: now.toISOString() }
}

export function ActivitiesPage() {
  const { t } = useTranslation()
  const isSuperAdmin = useAuthStore((s) => s.user?.role === 'super_admin')

  const [items, setItems] = useState<TActivityItem[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<TActivityStats | null>(null)
  const [orgsList, setOrgsList] = useState<TOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [buildingId, setBuildingId] = useState('')
  const [role, setRole] = useState<'' | TActivityRole>('')
  const [category, setCategory] = useState<'' | TActivityCategory>('')
  const [level, setLevel] = useState<'' | TActivityStatus>('')
  const [range, setRange] = useState<TRange>('all')

  // Đổi bất kỳ bộ lọc nào thì quay về trang 1
  const filterKey = [search, buildingId, role, category, level, range].join('|')
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1
  const setPage = (next: number) => setPageState({ key: filterKey, page: next })

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!isSuperAdmin) return
    getOrganizations().then(setOrgsList).catch(() => setOrgsList([]))
  }, [isSuperAdmin])

  useEffect(() => {
    const base: Omit<TActivityQuery, 'page' | 'limit'> = {
      search,
      buildingId: buildingId || undefined,
      actorRole: role || undefined,
      category: category || undefined,
      status: level || undefined,
      ...rangeToQuery(range),
    }
    let active = true
    getActivities({ ...base, page, limit: PAGE_SIZE })
      .then((res) => {
        if (!active) return
        setItems(res.items)
        setTotal(res.total)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : '')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    // Thống kê theo cùng bộ lọc, nếu không chọn khoảng thời gian thì server dùng 30 ngày gần nhất
    getActivityStats(base)
      .then((s) => {
        if (active) setStats(s)
      })
      .catch(() => {
        if (active) setStats(null)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, page, reloadKey])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const selectCls =
    'setting-input-custom h-10 px-3 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer'

  const tiles: { key: string; label: string; value: number; tone: string }[] = [
    { key: 'total', label: t('act.stat.total'), value: stats?.total ?? 0, tone: 'text-slate-900 dark:text-white' },
    { key: 'success', label: t('act.stat.success'), value: stats?.byStatus.SUCCESS ?? 0, tone: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'warning', label: t('act.stat.warning'), value: stats?.byStatus.WARNING ?? 0, tone: 'text-amber-600 dark:text-amber-400' },
    { key: 'error', label: t('act.stat.error'), value: stats?.byStatus.ERROR ?? 0, tone: 'text-red-600 dark:text-red-400' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">{t('activities.title')}</h1>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
                {total} {t('activities.logs')}
              </span>
            </div>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{t('activities.desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <div className="stat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[11px] font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('act.streamActive')}</span>
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((n) => n + 1)}
            className="btn-sec-custom h-10 px-3.5 rounded-xl text-[12px] font-bold border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title={t('act.refreshTitle')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </button>
        </div>
      </section>

      {/* Thống kê theo bộ lọc hiện tại */}
      <section data-reveal className="flex flex-col gap-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tiles.map((tile) => (
            <div key={tile.key} className="setting-card-custom rounded-2xl border p-4 shadow-2xs">
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{tile.label}</p>
              <p className={`mt-1 text-[26px] font-bold font-mono leading-none ${tile.tone}`}>{tile.value}</p>
            </div>
          ))}
        </div>
        {stats && (
          <p className="flex items-center gap-1.5 text-[11.5px] text-slate-500 dark:text-slate-400">
            <CalendarCheck className="w-3.5 h-3.5" />
            {t('act.statsRange', { from: formatDate(stats.from), to: formatDate(stats.to) })}
          </p>
        )}
      </section>

      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col gap-3 shadow-2xs border">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t('activities.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {isSuperAdmin && (
            <select value={buildingId} onChange={(e) => setBuildingId(e.target.value)} aria-label={t('usr.allOrgs')} className={selectCls}>
              <option value="">{t('usr.allOrgs')}</option>
              {orgsList.map((org) => (
                <option key={org.id} value={org.id}>{org.name} ({org.code})</option>
              ))}
            </select>
          )}

          <select value={role} onChange={(e) => setRole(e.target.value as '' | TActivityRole)} aria-label={t('role.all')} className={selectCls}>
            <option value="">{t('role.all')}</option>
            {(Object.keys(roleMeta) as TActivityRole[]).map((r) => (
              <option key={r} value={r}>{t(roleMeta[r].labelKey)}</option>
            ))}
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value as '' | TActivityCategory)} aria-label={t('act.allCats')} className={selectCls}>
            <option value="">{t('act.allCats')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{t(`act.cat.${c}` as TranslationKey)}</option>
            ))}
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value as '' | TActivityStatus)} aria-label={t('act.allLevels')} className={selectCls}>
            <option value="">{t('act.allLevels')}</option>
            {levels.map((l) => (
              <option key={l} value={l}>{t(statusMeta[l].labelKey)}</option>
            ))}
          </select>

          <select value={range} onChange={(e) => setRange(e.target.value as TRange)} aria-label={t('act.range.all')} className={selectCls}>
            {(['all', 'today', '7d', '30d'] as TRange[]).map((r) => (
              <option key={r} value={r}>{t(`act.range.${r}` as TranslationKey)}</option>
            ))}
          </select>
        </div>
      </div>

      <div data-reveal className="setting-card-custom rounded-2xl overflow-hidden shadow-xs border">
        {loading ? (
          <div className="p-10 text-center text-[13px] text-slate-500 dark:text-slate-400">{t('common.loading')}</div>
        ) : error !== null ? (
          <EmptyState title={t('common.noData')} description={t('act.loadFailed', { message: error })} />
        ) : items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <th className="py-3.5 px-5">{t('activities.colTime')}</th>
                    <th className="py-3.5 px-5">{t('activities.colActor')}</th>
                    <th className="py-3.5 px-5">{t('act.colOrg')}</th>
                    <th className="py-3.5 px-5">{t('activities.colEvent')}</th>
                    <th className="py-3.5 px-5">{t('activities.colDesc')}</th>
                    <th className="py-3.5 px-5 text-right">{t('activities.colStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px] bg-white dark:bg-slate-900">
                  {items.map((act) => {
                    const roleBadge = roleMeta[act.actorRole] ?? roleMeta.SYSTEM
                    const statusBadge = statusMeta[act.status] ?? statusMeta.INFO
                    return (
                      <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0">
                              {categoryIcons[act.category]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-mono text-slate-900 dark:text-white font-bold text-[12px]">{formatDateTime(act.createdAt)}</span>
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                                {formatRelativeTime(act.createdAt)} · {t(`act.cat.${act.category}` as TranslationKey)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-900 dark:text-white">{act.actorName}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border whitespace-nowrap w-max ${roleBadge.style}`}>
                              {t(roleBadge.labelKey)}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 w-max">
                            <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{act.orgName || t('store.systemWide')}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                            {act.targetLabel && (
                              <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold">{act.targetLabel}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-[12px] text-slate-600 dark:text-slate-300 max-w-[300px]">
                          <p className="line-clamp-2 leading-relaxed">{act.description}</p>
                        </td>

                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono border whitespace-nowrap ${statusBadge.style}`}>
                            {statusBadge.icon}
                            {t(statusBadge.labelKey)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[12px] text-slate-600 dark:text-slate-400">
                <span>{t('act.pageInfo', { page, pages: totalPages, total })}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className="page-btn-custom h-9 px-3 rounded-xl border flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> {t('act.prev')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className="page-btn-custom h-9 px-3 rounded-xl border flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {t('act.next')} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState title={t('common.noData')} description={t('act.emptyDesc')} />
        )}
      </div>

    </div>
  )
}
