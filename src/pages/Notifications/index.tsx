import { useEffect, useMemo, useState } from 'react'
import { Bell, Building2, Check, CheckCheck, Cpu, Loader2, MailOpen, Package, RefreshCw, Settings2, ShieldAlert, Trash2 } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatDate, formatDateTime, formatRelativeTime } from '../../i18n/format'
import type { TranslationKey } from '../../i18n/translations'
import { useAuthStore } from '../../store/useAuthStore'
import { getBuildingNames } from '../../service/buildingNames'
import {
  deleteNotification,
  listNotifications,
  markAllAsRead,
  markAsRead,
  type TNotification,
  type TNotificationCategory,
  type TNotificationPriority,
} from '../../service/notification.service'

// Server chỉ trả tối đa 100 thông báo mỗi lần gọi
const FETCH_LIMIT = 100
const PAGE_STEP = 20

const CATEGORY_CONFIG: Record<TNotificationCategory, { labelKey: TranslationKey; icon: React.ReactNode; tone: string }> = {
  PACKAGE: { labelKey: 'notif.catName.PACKAGE', icon: <Package className="w-[18px] h-[18px]" />, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
  HARDWARE: { labelKey: 'notif.catName.HARDWARE', icon: <Cpu className="w-[18px] h-[18px]" />, tone: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300' },
  ACCOUNT: { labelKey: 'notif.catName.ACCOUNT', icon: <ShieldAlert className="w-[18px] h-[18px]" />, tone: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300' },
  SYSTEM: { labelKey: 'notif.catName.SYSTEM', icon: <Settings2 className="w-[18px] h-[18px]" />, tone: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300' },
}

const CATEGORIES: TNotificationCategory[] = ['SYSTEM', 'PACKAGE', 'HARDWARE', 'ACCOUNT']
const PRIORITIES: TNotificationPriority[] = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW']

// Vạch màu bên trái thông báo quan trọng
const PRIORITY_BAR: Partial<Record<TNotificationPriority, string>> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-amber-400',
}

const selectCls =
  'setting-input-custom h-9 px-3 rounded-xl text-[12.5px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer'

type TLoaded = { key: string; items: TNotification[]; total: number; unread: number; error: string | null }

export function NotificationsPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'super_admin'

  const [unreadOnly, setUnreadOnly] = useState(false)
  const [category, setCategory] = useState<TNotificationCategory | 'all'>('all')
  const [priority, setPriority] = useState<TNotificationPriority | 'all'>('all')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [reloadKey, setReloadKey] = useState(0)
  const [names, setNames] = useState<Map<string, string>>(new Map())
  const [now] = useState(() => Date.now())

  // Bộ lọc nào server hỗ trợ thì server lọc; lọc theo tòa nhà làm ở máy vì server chưa có tham số này
  const serverKey = [unreadOnly, category, priority, reloadKey].join('|')
  const [loaded, setLoaded] = useState<TLoaded | null>(null)
  const loading = loaded?.key !== serverKey

  useEffect(() => {
    if (!isSuperAdmin) return
    getBuildingNames().then(setNames)
  }, [isSuperAdmin])

  useEffect(() => {
    let active = true
    listNotifications({
      limit: FETCH_LIMIT,
      isRead: unreadOnly ? false : undefined,
      category: category === 'all' ? undefined : category,
      priority: priority === 'all' ? undefined : priority,
    })
      .then((res) => {
        if (active) setLoaded({ key: serverKey, items: res.data, total: res.total, unread: res.unreadCount, error: null })
      })
      .catch((err: unknown) => {
        if (active) setLoaded({ key: serverKey, items: [], total: 0, unread: 0, error: err instanceof Error ? err.message : '' })
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKey])

  const items = useMemo(() => loaded?.items ?? [], [loaded])

  // Các tòa nhà có thông báo trong kết quả hiện tại, kèm số lượng
  const buildingOptions = useMemo(() => {
    const count = new Map<string, number>()
    for (const n of items) if (n.buildingId) count.set(n.buildingId, (count.get(n.buildingId) ?? 0) + 1)
    return [...count.entries()].map(([id, n]) => ({ id, label: names.get(id) ?? id, count: n })).sort((a, b) => a.label.localeCompare(b.label))
  }, [items, names])

  const activeBuilding = buildingOptions.some((b) => b.id === buildingFilter) ? buildingFilter : 'all'
  const visible = useMemo(() => (activeBuilding === 'all' ? items : items.filter((n) => n.buildingId === activeBuilding)), [items, activeBuilding])

  // Số thông báo đang hiện, quay về 20 khi đổi bộ lọc
  const viewKey = `${serverKey}|${activeBuilding}`
  const [shown, setShown] = useState({ key: viewKey, n: PAGE_STEP })
  const shownCount = shown.key === viewKey ? shown.n : PAGE_STEP
  const page = visible.slice(0, shownCount)

  // Gom theo ngày: hôm nay, hôm qua, các ngày trước
  const groups = useMemo(() => {
    const todayKey = new Date(now).toDateString()
    const yesterdayKey = new Date(now - 86_400_000).toDateString()
    const out: { key: string; label: string; items: TNotification[] }[] = []
    for (const n of page) {
      const dayKey = new Date(n.createdAt).toDateString()
      let group = out[out.length - 1]
      if (!group || group.key !== dayKey) {
        const label = dayKey === todayKey ? t('notif.today') : dayKey === yesterdayKey ? t('notif.yesterday') : formatDate(n.createdAt)
        group = { key: dayKey, label, items: [] }
        out.push(group)
      }
      group.items.push(n)
    }
    return out
  }, [page, now, t])

  function patchItems(fn: (list: TNotification[]) => TNotification[]) {
    setLoaded((prev) => (prev ? { ...prev, items: fn(prev.items) } : prev))
  }

  async function handleMarkRead(n: TNotification) {
    if (n.isRead) return
    const res = await markAsRead(n._id)
    if (!res) {
      toast.error(t('notif.actionFailed'))
      return
    }
    patchItems((list) => list.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)))
    setLoaded((prev) => (prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev))
  }

  async function handleMarkAllRead() {
    if (!(await markAllAsRead())) {
      toast.error(t('notif.actionFailed'))
      return
    }
    patchItems((list) => list.map((x) => ({ ...x, isRead: true })))
    setLoaded((prev) => (prev ? { ...prev, unread: 0 } : prev))
    toast.success(t('notif.markedAllRead'))
  }

  async function handleDelete(n: TNotification) {
    if (!(await deleteNotification(n._id))) {
      toast.error(t('notif.actionFailed'))
      return
    }
    patchItems((list) => list.filter((x) => x._id !== n._id))
    if (!n.isRead) setLoaded((prev) => (prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev))
    toast.success(t('notif.deleted'))
  }

  const unread = loaded?.unread ?? 0
  const noFilter = category === 'all' && priority === 'all' && activeBuilding === 'all'

  return (
    <div className="flex flex-col gap-6">
      <header data-reveal className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">{t('notif.pageTitle')}</h1>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 max-w-2xl">{isSuperAdmin ? t('notif.descSuper') : t('notif.descAdmin')}</p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="h-9 px-4 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950/80 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t('notif.readAll')} ({unread})
            </button>
          )}
          <button
            type="button"
            onClick={() => setReloadKey((n) => n + 1)}
            disabled={loading}
            className="h-9 px-3.5 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        </div>
      </header>

      <div data-reveal className="flex flex-col gap-4">
        {/* Đã đọc / chưa đọc */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
          {([false, true] as const).map((only) => (
            <button
              key={String(only)}
              type="button"
              onClick={() => setUnreadOnly(only)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors ${
                unreadOnly === only
                  ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {only ? t('notif.filter.unread') : t('notif.filter.all')}
              {only && unread > 0 && <span className="rounded-full bg-sky-100 px-1.5 text-[11px] font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">{unread}</span>}
            </button>
          ))}
        </div>

        {/* Loại, mức ưu tiên và tòa nhà */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`h-9 rounded-full border px-3.5 text-[12.5px] font-semibold cursor-pointer transition-colors ${
                category === c
                  ? 'border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {c === 'all' ? t('notif.filter.all') : t(CATEGORY_CONFIG[c].labelKey)}
            </button>
          ))}

          <span className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden="true" />

          <select value={priority} onChange={(e) => setPriority(e.target.value as TNotificationPriority | 'all')} className={selectCls}>
            <option value="all">{t('notif.allPrio')}</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t(`notif.prioName.${p}` as TranslationKey)}
              </option>
            ))}
          </select>

          {isSuperAdmin && (
            <select value={activeBuilding} onChange={(e) => setBuildingFilter(e.target.value)} className={selectCls}>
              <option value="all">{t('notif.allBuildings')}</option>
              {buildingOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label} ({b.count})
                </option>
              ))}
            </select>
          )}

          <span className="ml-auto text-[12.5px] text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-200">{visible.length}</strong> {t('notif.countSuffix', { count: visible.length })}
          </span>
        </div>
      </div>

      <div data-reveal>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-[13px]">{t('bell.loadingNotifs')}</p>
          </div>
        ) : loaded?.error ? (
          <p className="py-16 text-center text-[13px] text-red-600 dark:text-red-400">{t('notif.loadFailedMsg', { message: loaded.error })}</p>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              {unreadOnly ? <MailOpen className="w-6 h-6 text-slate-400" /> : <Bell className="w-6 h-6 text-slate-400" />}
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-300">
                {unreadOnly ? t('notif.emptyUnread') : noFilter ? t('notif.emptyNone') : t('notif.empty')}
              </p>
              <p className="mt-1 max-w-md text-[12px] text-slate-500 dark:text-slate-400">
                {unreadOnly ? t('notif.emptyUnreadHint') : noFilter ? t('notif.emptyNoneHint') : t('notif.emptyHint')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <section key={group.key} className="flex flex-col gap-2">
                <h2 className="px-1 text-[12px] font-bold text-slate-500 dark:text-slate-400">{group.label}</h2>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                  {group.items.map((n) => {
                    const cat = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.SYSTEM
                    const bar = PRIORITY_BAR[n.priority]
                    const buildingName = isSuperAdmin && n.buildingId ? (names.get(n.buildingId) ?? null) : null
                    return (
                      <li
                        key={n._id}
                        onClick={() => handleMarkRead(n)}
                        className={`group relative flex cursor-pointer gap-3.5 px-5 py-4 transition-colors ${
                          n.isRead ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-sky-50/50 hover:bg-sky-50 dark:bg-sky-500/5 dark:hover:bg-sky-500/10'
                        }`}
                      >
                        {bar && <span className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r ${bar}`} aria-hidden="true" />}
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cat.tone}`}>{cat.icon}</span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            {!n.isRead && <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden="true" />}
                            <p className={`text-[14px] leading-snug ${n.isRead ? 'font-medium text-slate-600 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>{n.title}</p>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">{n.message}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-slate-500 dark:text-slate-400">
                            {buildingName && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <Building2 className="w-3 h-3" />
                                {buildingName}
                              </span>
                            )}
                            <span>{t(cat.labelKey)}</span>
                            {(n.priority === 'CRITICAL' || n.priority === 'HIGH') && (
                              <span className={n.priority === 'CRITICAL' ? 'font-semibold text-red-600 dark:text-red-400' : 'font-semibold text-amber-600 dark:text-amber-400'}>
                                {t(`notif.prioName.${n.priority}` as TranslationKey)}
                              </span>
                            )}
                            <span title={formatDateTime(n.createdAt)}>{formatRelativeTime(n.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-start gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                          {!n.isRead && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkRead(n)
                              }}
                              title={t('notif.markRead')}
                              aria-label={t('notif.markRead')}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-500/15 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(n)
                            }}
                            title={t('bell.deleteNotif')}
                            aria-label={t('bell.deleteNotif')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}

            {visible.length > shownCount && (
              <button
                type="button"
                onClick={() => setShown({ key: viewKey, n: shownCount + PAGE_STEP })}
                className="mx-auto h-10 rounded-xl border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {t('notif.showMore', { count: Math.min(PAGE_STEP, visible.length - shownCount) })}
              </button>
            )}

            {(loaded?.total ?? 0) > FETCH_LIMIT && <p className="text-center text-[12px] text-slate-500 dark:text-slate-400">{t('notif.capNote', { count: FETCH_LIMIT })}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
