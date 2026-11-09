import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Cpu, Loader2, Package, RefreshCw, Settings2, ShieldAlert, X } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatRelativeTime } from '../../i18n/format'
import {
  NOTIFICATIONS_CHANGED_EVENT,
  emitNotificationsChanged,
  listNotifications,
  markAllAsRead,
  markAsRead,
  type TNotification,
  type TNotificationCategory,
} from '../../service/notification.service'
import { getNotificationSocket, joinBuildingRoom, leaveBuildingRoom } from '../../service/socket.service'
import { getBellDestination } from '../../utils/notificationLink'

// Server chưa đẩy socket cho mọi loại thông báo, nên hỏi lại định kỳ để thông báo mới hiện trong vài giây
const POLL_MS = 15_000
const PANEL_LIMIT = 8
const MAX_TOASTS_AT_ONCE = 3

const CATEGORY_ICON: Record<TNotificationCategory, { icon: React.ReactNode; tone: string }> = {
  PACKAGE: { icon: <Package className="w-4 h-4" />, tone: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300' },
  HARDWARE: { icon: <Cpu className="w-4 h-4" />, tone: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300' },
  ACCOUNT: { icon: <ShieldAlert className="w-4 h-4" />, tone: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300' },
  SYSTEM: { icon: <Settings2 className="w-4 h-4" />, tone: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
}

// Chuông thông báo: số chưa đọc, vài thông báo gần nhất, bấm vào thì tới đúng trang liên quan
export function NotificationBell() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const isAdmin = user?.role === 'org_admin' || user?.role === 'super_admin'
  const isBuildingAdmin = user?.role === 'org_admin'

  const [items, setItems] = useState<TNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  // Các thông báo đã thấy, để chỉ báo toast cho thông báo thật sự mới
  const seenIds = useRef<Set<string> | null>(null)

  const refresh = useCallback(async () => {
    if (!isAdmin) return
    try {
      const res = await listNotifications({ limit: PANEL_LIMIT })
      setItems(res.data)
      setUnread(res.unreadCount)

      const seen = seenIds.current
      if (seen) {
        const fresh = res.data.filter((n) => !seen.has(n._id) && !n.isRead)
        fresh.slice(0, MAX_TOASTS_AT_ONCE).forEach((n) => toast.info(n.title, 6000))
        // Hộp thư đang mở cũng phải thấy thông báo mới ngay
        if (fresh.length > 0) emitNotificationsChanged()
      }
      seenIds.current = new Set([...(seen ?? []), ...res.data.map((n) => n._id)])
    } catch {
      // Lỗi mạng thoáng qua thì giữ nguyên số cũ, lần hỏi sau sẽ thử lại
    } finally {
      setLoaded(true)
    }
  }, [isAdmin, toast])

  // Bấm làm mới hoặc mở chuông: có vòng xoay báo đang tải
  async function manualRefresh() {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  // Tải lần đầu và hỏi lại định kỳ, hỏi ngay khi quay lại tab
  useEffect(() => {
    if (!isAdmin) return
    const first = window.setTimeout(() => void refresh(), 0)
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh()
    }, POLL_MS)
    const onVisible = () => {
      if (!document.hidden) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isAdmin, refresh])

  // Hộp thư đọc hoặc xóa thông báo thì chuông cập nhật theo
  useEffect(() => {
    if (!isAdmin) return
    const onChanged = () => void refresh()
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged)
  }, [isAdmin, refresh])

  // Các sự kiện socket server đã có: hỏi lại ngay thay vì chờ chu kỳ tiếp theo
  useEffect(() => {
    if (!isAdmin) return
    const socket = getNotificationSocket()
    const buildingId = user?.buildingId || (user?.orgId !== 'all' ? user?.orgId : undefined)
    if (buildingId) joinBuildingRoom(buildingId)

    const onEvent = () => void refresh()
    const events = ['NEW_PENDING_RESIDENT', 'RESIDENT_APPROVAL_RESULT', 'PACKAGE_NEW', 'SYSTEM_ANNOUNCEMENT']
    events.forEach((e) => socket.on(e, onEvent))
    return () => {
      events.forEach((e) => socket.off(e, onEvent))
      if (buildingId) leaveBuildingRoom(buildingId)
    }
  }, [isAdmin, user?.buildingId, user?.orgId, refresh])

  // Bấm ra ngoài thì đóng
  useEffect(() => {
    if (!isOpen) return
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [isOpen])

  if (!isAdmin) return null

  async function handleOpenItem(n: TNotification) {
    setIsOpen(false)
    if (!n.isRead) {
      await markAsRead(n._id)
      emitNotificationsChanged()
    }
    navigate(getBellDestination(n, isBuildingAdmin))
  }

  async function handleMarkAll() {
    if (await markAllAsRead()) {
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnread(0)
      emitNotificationsChanged()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id="approval-bell-btn"
        onClick={() => {
          setIsOpen((v) => !v)
          if (!isOpen) void manualRefresh()
        }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        title={t('bell.title')}
        aria-label={t('bell.title')}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none ring-2 ring-white dark:ring-slate-900">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[1100] mt-2 flex max-h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-slate-900 dark:text-white">{t('bell.title')}</span>
              {unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">{unread}</span>}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button type="button" onClick={handleMarkAll} title={t('bell.markAllRead')} className="flex cursor-pointer items-center gap-1 text-[11.5px] font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400">
                  <CheckCheck className="w-3.5 h-3.5" />
                  {t('bell.readAll')}
                </button>
              )}
              <button type="button" onClick={() => void manualRefresh()} title={t('bell.refresh')} className="cursor-pointer p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label={t('common.close')} className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!loaded ? (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[12px]">{t('bell.loadingNotifs')}</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                <Bell className="w-8 h-8" />
                <span className="text-[12px]">{t('bell.noNotifs')}</span>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((n) => {
                  const cat = CATEGORY_ICON[n.category] ?? CATEGORY_ICON.SYSTEM
                  return (
                    <li key={n._id}>
                      <button
                        type="button"
                        onClick={() => void handleOpenItem(n)}
                        className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${n.isRead ? '' : 'bg-sky-50/50 dark:bg-sky-500/5'}`}
                      >
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cat.tone}`}>{cat.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[13px] leading-snug ${n.isRead ? 'font-medium text-slate-600 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>{n.title}</span>
                          <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-slate-500 dark:text-slate-400">{n.message}</span>
                          <span className="mt-1 block text-[11px] text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                        </span>
                        {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden="true" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate('/notifications')
              }}
              className="w-full cursor-pointer text-center text-[12px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
            >
              {t('bell.viewAllNotifs')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
