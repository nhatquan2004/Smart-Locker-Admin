import { useEffect, useState, useCallback } from 'react'
import {
  Bell, Package, Cpu, ShieldAlert, Settings2, Trash2, CheckCheck,
  Clock, RefreshCw, Loader2, Filter, MailOpen,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatDateTime, formatRelativeTime } from '../../i18n/format'
import { tNow } from '../../i18n/translate'
import type { TranslationKey } from '../../i18n/translations'
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type TNotification,
  type TNotificationCategory,
} from '../../service/notification.service'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<TNotificationCategory, { labelKey: TranslationKey; icon: React.ReactNode; bg: string; badge: string }> = {
  PACKAGE: {
    labelKey: 'notif.catName.PACKAGE',
    icon: <Package className="w-4 h-4 text-sky-500" />,
    bg: 'bg-sky-100 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    badge: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  },
  HARDWARE: {
    labelKey: 'notif.catName.HARDWARE',
    icon: <Cpu className="w-4 h-4 text-orange-500" />,
    bg: 'bg-orange-100 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  },
  ACCOUNT: {
    labelKey: 'notif.catName.ACCOUNT',
    icon: <ShieldAlert className="w-4 h-4 text-purple-500" />,
    bg: 'bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  },
  SYSTEM: {
    labelKey: 'notif.catName.SYSTEM',
    icon: <Settings2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  },
}

const PRIORITY_BADGE: Record<string, string> = {
  CRITICAL: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  HIGH: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  NORMAL: '',
  LOW: '',
}

const FILTER_TABS: { value: 'all' | 'unread' | TNotificationCategory; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'notif.filter.all' },
  { value: 'unread', labelKey: 'notif.filter.unread' },
  { value: 'SYSTEM', labelKey: 'notif.cat.SYSTEM' },
  { value: 'PACKAGE', labelKey: 'notif.cat.PACKAGE' },
  { value: 'HARDWARE', labelKey: 'notif.cat.HARDWARE' },
  { value: 'ACCOUNT', labelKey: 'notif.cat.ACCOUNT' },
]

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const toast = useToast()
  const { t } = useTranslation()

  const [notifications, setNotifications] = useState<TNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | TNotificationCategory>('all')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [result, count] = await Promise.all([
        getMyNotifications({ limit: 50 }),
        getUnreadCount(),
      ])
      const items = Array.isArray(result) ? result : (result?.data ?? [])
      setNotifications(items)
      setUnreadCount(count)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tNow('notif.loadFailed')
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Filter ──────────────────────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !n.isRead
    return n.category === activeFilter
  })

  // ── Mark single as read ──────────────────────────────────────────────────
  async function handleMarkRead(notif: TNotification) {
    if (notif.isRead) return
    await markAsRead(notif._id)
    setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, isRead: true } : n))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  // ── Mark all as read ──────────────────────────────────────────────────────
  async function handleMarkAllRead() {
    const ok = await markAllAsRead()
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success(t('notif.markedAllRead'))
    }
  }

  // ── Delete notification ──────────────────────────────────────────────────
  async function handleDelete(id: string) {
    const ok = await deleteNotification(id)
    if (ok) {
      setNotifications((prev) => {
        const removed = prev.find((n) => n._id === id)
        if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1))
        return prev.filter((n) => n._id !== id)
      })
      toast.success(t('notif.deleted'))
    }
  }

  return (
    <div className="flex flex-col h-full gap-0">
      {/* ── Page Header ── */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-sky-500" />
              {t('notif.pageTitle')}
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              {t('notif.pageDesc')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="h-9 px-4 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/80 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t('notif.readAll')} ({unreadCount})
              </button>
            )}
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="h-9 px-3.5 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400">
            <Bell className="w-3.5 h-3.5" />
            <span><strong className="text-slate-700 dark:text-slate-200">{notifications.length}</strong> {t('notif.countSuffix', { count: notifications.length })}</span>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-1.5 text-[12.5px] text-sky-600 dark:text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span><strong>{unreadCount}</strong> {t('notif.unreadSuffix')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto pb-0">
          {FILTER_TABS.map((tab) => {
            const count = tab.value === 'unread'
              ? unreadCount
              : tab.value === 'all'
              ? notifications.length
              : notifications.filter((n) => n.category === tab.value).length
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`whitespace-nowrap px-3.5 py-2.5 text-[12px] font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeFilter === tab.value
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t(tab.labelKey)}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeFilter === tab.value
                      ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Notification List ── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-[13px]">{t('bell.loadingNotifs')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {activeFilter === 'unread' ? (
                <MailOpen className="w-7 h-7 text-slate-400" />
              ) : (
                <Filter className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-300">
                {activeFilter === 'unread' ? t('notif.emptyUnread') : t('notif.empty')}
              </p>
              <p className="text-[12px] text-slate-400 mt-1">
                {activeFilter === 'unread' ? t('notif.emptyUnreadHint') : t('notif.emptyHint')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((n) => {
              const cat = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.SYSTEM
              const priorityStyle = PRIORITY_BADGE[n.priority] || ''
              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkRead(n)}
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    !n.isRead
                      ? 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-900/60 hover:bg-sky-50 dark:hover:bg-sky-950/30'
                      : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Unread dot */}
                  {!n.isRead && (
                    <span className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
                  )}

                  {/* Category icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cat.bg}`}>
                    {cat.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className={`text-[13.5px] font-semibold leading-tight ${
                        n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {n.title}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badge}`}>
                        {t(cat.labelKey)}
                      </span>
                      {(n.priority === 'HIGH' || n.priority === 'CRITICAL') && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle}`}>
                          {n.priority === 'CRITICAL' ? t('notif.prio.CRITICAL') : t('notif.prio.HIGH')}
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[11px] text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                      <span className="text-[11px] text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(n.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(n._id) }}
                    className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    title={t('bell.deleteNotif')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
