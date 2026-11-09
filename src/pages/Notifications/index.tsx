import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Bell, Building2, CheckCheck, ChevronDown, Cpu, Inbox, Loader2, MailOpen, Package, RefreshCw, Settings2, ShieldAlert, Trash2 } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatDate, formatDateTime, formatRelativeTime } from '../../i18n/format'
import type { TranslationKey } from '../../i18n/translations'
import { useAuthStore } from '../../store/useAuthStore'
import { getBuildingNames } from '../../service/buildingNames'
import { getPendingResidents, type TPendingResident } from '../../service/approval.service'
import { ResidentApprovalModal } from '../../components/notifications/ResidentApprovalModal'
import { getNotificationTarget } from '../../utils/notificationLink'
import {
  NOTIFICATIONS_CHANGED_EVENT,
  deleteNotification,
  emitNotificationsChanged,
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
  PACKAGE: { labelKey: 'notif.catName.PACKAGE', icon: <Package className="w-[17px] h-[17px]" />, tone: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300' },
  HARDWARE: { labelKey: 'notif.catName.HARDWARE', icon: <Cpu className="w-[17px] h-[17px]" />, tone: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300' },
  ACCOUNT: { labelKey: 'notif.catName.ACCOUNT', icon: <ShieldAlert className="w-[17px] h-[17px]" />, tone: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300' },
  SYSTEM: { labelKey: 'notif.catName.SYSTEM', icon: <Settings2 className="w-[17px] h-[17px]" />, tone: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
}

const CATEGORIES: TNotificationCategory[] = ['SYSTEM', 'PACKAGE', 'HARDWARE', 'ACCOUNT']
const PRIORITIES: TNotificationPriority[] = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW']

type TFolder = 'all' | 'unread' | TNotificationCategory
type TLoaded = { key: number; items: TNotification[]; total: number; unread: number; error: string | null }

const selectCls =
  'setting-input-custom h-9 w-full px-3 rounded-lg text-[12.5px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer'

export function NotificationsPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'super_admin'
  const isBuildingAdmin = user?.role === 'org_admin'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Chuông chuyển tới đây kèm ?open=<mã thông báo> để mở sẵn thông báo đó
  const openParam = searchParams.get('open')

  const [folder, setFolder] = useState<TFolder>('all')
  const [priority, setPriority] = useState<TNotificationPriority | 'all'>('all')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [openState, setOpenState] = useState<{ param: string | null; id: string | null } | null>(null)
  const expandedId = openState && openState.param === openParam ? openState.id : openParam
  const [reviewing, setReviewing] = useState<TPendingResident | null>(null)
  // Tăng lên khi có thông báo mới hoặc thay đổi ở nơi khác, để tải lại âm thầm không hiện vòng xoay
  const [liveTick, setLiveTick] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [names, setNames] = useState<Map<string, string>>(new Map())
  const [now] = useState(() => Date.now())

  const [loaded, setLoaded] = useState<TLoaded | null>(null)
  const loading = loaded?.key !== reloadKey

  useEffect(() => {
    if (!isSuperAdmin) return
    getBuildingNames().then(setNames)
  }, [isSuperAdmin])

  // Tải 100 thông báo mới nhất rồi lọc ngay trên máy, để số đếm ở từng thư mục luôn đúng
  useEffect(() => {
    let active = true
    listNotifications({ limit: FETCH_LIMIT })
      .then((res) => {
        if (active) setLoaded({ key: reloadKey, items: res.data, total: res.total, unread: res.unreadCount, error: null })
      })
      .catch((err: unknown) => {
        if (active) setLoaded({ key: reloadKey, items: [], total: 0, unread: 0, error: err instanceof Error ? err.message : '' })
      })
    return () => {
      active = false
    }
  }, [reloadKey, liveTick])

  // Chuông báo có thông báo mới hoặc vừa đổi: tải lại ngay
  useEffect(() => {
    const onChanged = () => setLiveTick((n) => n + 1)
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged)
  }, [])

  const items = useMemo(() => loaded?.items ?? [], [loaded])

  // Các tòa nhà có thông báo, kèm số lượng
  const buildingOptions = useMemo(() => {
    const count = new Map<string, number>()
    for (const n of items) if (n.buildingId) count.set(n.buildingId, (count.get(n.buildingId) ?? 0) + 1)
    return [...count.entries()].map(([id, n]) => ({ id, label: names.get(id) ?? id, count: n })).sort((a, b) => a.label.localeCompare(b.label))
  }, [items, names])
  const activeBuilding = buildingOptions.some((b) => b.id === buildingFilter) ? buildingFilter : 'all'

  const categoryCount = useMemo(() => {
    const out: Record<string, number> = {}
    for (const n of items) out[n.category] = (out[n.category] ?? 0) + 1
    return out
  }, [items])

  const visible = useMemo(
    () =>
      items.filter((n) => {
        if (folder === 'unread' && n.isRead) return false
        if (folder !== 'all' && folder !== 'unread' && n.category !== folder) return false
        if (priority !== 'all' && n.priority !== priority) return false
        if (activeBuilding !== 'all' && n.buildingId !== activeBuilding) return false
        return true
      }),
    [items, folder, priority, activeBuilding],
  )

  // Số thông báo đang hiện, quay về 20 khi đổi bộ lọc
  const viewKey = `${reloadKey}|${folder}|${priority}|${activeBuilding}`
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
    emitNotificationsChanged()
  }

  function handleToggle(n: TNotification) {
    const opening = expandedId !== n._id
    setOpenState({ param: openParam, id: opening ? n._id : null })
    if (opening) handleMarkRead(n)
  }

  // Mở thông báo từ chuông: đánh dấu đã đọc và cuộn tới nó
  useEffect(() => {
    if (!openParam || loaded?.key !== reloadKey) return
    const target = loaded.items.find((n) => n._id === openParam)
    if (!target) return
    if (!target.isRead) {
      void markAsRead(target._id).then((res) => {
        if (!res) return
        patchItems((list) => list.map((x) => (x._id === target._id ? { ...x, isRead: true } : x)))
        setLoaded((prev) => (prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev))
        emitNotificationsChanged()
      })
    }
    const timer = window.setTimeout(() => document.getElementById(`notif-${openParam}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80)
    return () => window.clearTimeout(timer)
    // Chỉ chạy khi đổi thông báo cần mở hoặc dữ liệu vừa tải xong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openParam, loaded?.key])

  // Mở hồ sơ cư dân chờ duyệt để duyệt ngay trong hộp thư
  async function handleReview(residentId: string) {
    try {
      const pending = await getPendingResidents()
      const found = pending.find((r) => r._id === residentId)
      if (!found) {
        toast.info(t('notif.residentDone'))
        return
      }
      setReviewing(found)
    } catch (err) {
      toast.error(t('notif.residentLoadFailed', { message: err instanceof Error ? err.message : '' }))
    }
  }

  async function handleMarkAllRead() {
    if (!(await markAllAsRead())) {
      toast.error(t('notif.actionFailed'))
      return
    }
    patchItems((list) => list.map((x) => ({ ...x, isRead: true })))
    setLoaded((prev) => (prev ? { ...prev, unread: 0 } : prev))
    emitNotificationsChanged()
    toast.success(t('notif.markedAllRead'))
  }

  async function handleDelete(n: TNotification) {
    if (!(await deleteNotification(n._id))) {
      toast.error(t('notif.actionFailed'))
      return
    }
    patchItems((list) => list.filter((x) => x._id !== n._id))
    if (!n.isRead) setLoaded((prev) => (prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev))
    setOpenState({ param: openParam, id: null })
    emitNotificationsChanged()
    toast.success(t('notif.deleted'))
  }

  const unread = loaded?.unread ?? 0
  const noFilter = folder === 'all' && priority === 'all' && activeBuilding === 'all'

  const folders: { id: TFolder; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: t('notif.filter.all'), icon: <Inbox className="w-4 h-4" />, count: items.length },
    { id: 'unread', label: t('notif.filter.unread'), icon: <MailOpen className="w-4 h-4" />, count: unread },
    ...CATEGORIES.map((c) => ({ id: c as TFolder, label: t(CATEGORY_CONFIG[c].labelKey), icon: CATEGORY_CONFIG[c].icon, count: categoryCount[c] ?? 0 })),
  ]

  return (
    <div className="flex flex-col gap-6">
      <header data-reveal>
        <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">{t('notif.pageTitle')}</h1>
        <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 max-w-2xl">{isSuperAdmin ? t('notif.descSuper') : t('notif.descAdmin')}</p>
      </header>

      <div data-reveal className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-5 items-start">
        {/* Cột trái: thư mục và bộ lọc */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-2">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {folders.map((f, i) => (
              <div key={f.id} className="contents">
                {i === 2 && <span className="hidden lg:block mx-2 my-1 h-px bg-slate-100 dark:bg-slate-800" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => setFolder(f.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold cursor-pointer transition-colors ${
                    folder === f.id
                      ? 'bg-sky-600 text-white shadow-xs dark:bg-sky-500'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.icon}
                  <span className="flex-1 whitespace-nowrap text-left">{f.label}</span>
                  {f.count > 0 && (
                    <span className={`text-[11.5px] font-bold ${folder === f.id ? 'text-white/90' : f.id === 'unread' ? 'text-sky-600 dark:text-sky-300' : 'text-slate-400'}`}>{f.count}</span>
                  )}
                </button>
              </div>
            ))}
          </nav>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400">{t('notif.moreFilters')}</p>
            <label className="flex flex-col gap-1">
              <span className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('notif.prioLabel')}</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TNotificationPriority | 'all')} className={selectCls}>
                <option value="all">{t('notif.allPrio')}</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {t(`notif.prioName.${p}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </label>
            {isSuperAdmin && (
              <label className="flex flex-col gap-1">
                <span className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('notif.buildingLabel')}</span>
                <select value={activeBuilding} onChange={(e) => setBuildingFilter(e.target.value)} className={selectCls}>
                  <option value="all">{t('notif.allBuildings')}</option>
                  {buildingOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} ({b.count})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </aside>

        {/* Cột phải: danh sách thư */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-100">{visible.length}</strong> {t('notif.countSuffix', { count: visible.length })}
            </p>
            <div className="flex items-center gap-1.5">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/10 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {t('notif.readAll')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setReloadKey((n) => n + 1)}
                disabled={loading}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-[13px]">{t('bell.loadingNotifs')}</p>
            </div>
          ) : loaded?.error ? (
            <p className="py-20 text-center text-[13px] text-red-600 dark:text-red-400">{t('notif.loadFailedMsg', { message: loaded.error })}</p>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                {folder === 'unread' ? <MailOpen className="w-6 h-6 text-slate-400" /> : <Bell className="w-6 h-6 text-slate-400" />}
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-300">
                  {folder === 'unread' ? t('notif.emptyUnread') : noFilter ? t('notif.emptyNone') : t('notif.empty')}
                </p>
                <p className="mx-auto mt-1 max-w-md text-[12px] text-slate-500 dark:text-slate-400">
                  {folder === 'unread' ? t('notif.emptyUnreadHint') : noFilter ? t('notif.emptyNoneHint') : t('notif.emptyHint')}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {groups.map((group) => (
                <div key={group.key}>
                  <h2 className="bg-slate-50 px-5 py-1.5 text-[11.5px] font-bold text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">{group.label}</h2>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {group.items.map((n) => {
                      const cat = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.SYSTEM
                      const open = expandedId === n._id
                      const target = getNotificationTarget(n, isBuildingAdmin)
                      const buildingName = isSuperAdmin && n.buildingId ? (names.get(n.buildingId) ?? null) : null
                      const important = n.priority === 'CRITICAL' || n.priority === 'HIGH'
                      return (
                        <li key={n._id} id={`notif-${n._id}`} className={open ? 'bg-sky-50/40 dark:bg-sky-500/5' : ''}>
                          <button type="button" onClick={() => handleToggle(n)} className="flex w-full cursor-pointer items-start gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cat.tone}`}>{cat.icon}</span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden="true" />}
                                <span className={`truncate text-[14px] ${n.isRead ? 'font-medium text-slate-600 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>{n.title}</span>
                                {important && (
                                  <span
                                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-bold ${
                                      n.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                    }`}
                                  >
                                    {t(`notif.prioName.${n.priority}` as TranslationKey)}
                                  </span>
                                )}
                              </span>
                              {!open && <span className="mt-0.5 block truncate text-[12.5px] text-slate-500 dark:text-slate-400">{n.message}</span>}
                            </span>
                            <span className="flex shrink-0 items-center gap-2 pt-0.5 text-[11.5px] text-slate-400">
                              {formatRelativeTime(n.createdAt)}
                              <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                            </span>
                          </button>

                          {open && (
                            <div className="pb-4 pl-[70px] pr-5">
                              <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-200">{n.message}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-slate-500 dark:text-slate-400">
                                <span>{formatDateTime(n.createdAt)}</span>
                                <span>· {t(cat.labelKey)}</span>
                                {buildingName && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {buildingName}
                                  </span>
                                )}
                                {target && (
                                  <button
                                    type="button"
                                    onClick={() => (target.kind === 'review-resident' ? void handleReview(target.residentId) : navigate(target.path))}
                                    className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 font-semibold text-white hover:bg-sky-700"
                                  >
                                    {t(target.labelKey, target.kind === 'route' ? target.labelParams : undefined)}
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDelete(n)}
                                  className={`${target ? '' : 'ml-auto'} flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  {t('bell.deleteNotif')}
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}

              {visible.length > shownCount && (
                <div className="border-t border-slate-100 p-4 text-center dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShown({ key: viewKey, n: shownCount + PAGE_STEP })}
                    className="h-9 rounded-lg px-5 text-[13px] font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/10 cursor-pointer"
                  >
                    {t('notif.showMore', { count: Math.min(PAGE_STEP, visible.length - shownCount) })}
                  </button>
                </div>
              )}

              {(loaded?.total ?? 0) > FETCH_LIMIT && <p className="border-t border-slate-100 px-5 py-3 text-center text-[12px] text-slate-500 dark:border-slate-800 dark:text-slate-400">{t('notif.capNote', { count: FETCH_LIMIT })}</p>}
            </div>
          )}
        </section>
      </div>
      {reviewing && (
        <ResidentApprovalModal
          resident={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null)
            setLiveTick((n) => n + 1)
            emitNotificationsChanged()
          }}
        />
      )}
    </div>
  )
}
