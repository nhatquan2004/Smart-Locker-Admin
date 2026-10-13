import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, X, Check, XCircle, Clock, User, Building2, Loader2, AlertTriangle,
  Package, Cpu, ShieldAlert, Settings2, Trash2, CheckCheck, RefreshCw,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatDateTime, formatRelativeTime } from '../../i18n/format'
import { tNow } from '../../i18n/translate'
import {
  getPendingResidents,
  approveResident,
  rejectResident,
  type TPendingResident,
} from '../../service/approval.service'
import { logActivity } from '../../service/activity.service'
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type TNotification,
  type TNotificationCategory,
} from '../../service/notification.service'
import {
  getNotificationSocket,
  joinBuildingRoom,
  leaveBuildingRoom,
  type TNewPendingResidentEvent,
  type TResidentApprovalResultEvent,
  type TPackageNewEvent,
} from '../../service/socket.service'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function categoryIcon(cat: TNotificationCategory) {
  switch (cat) {
    case 'PACKAGE': return <Package className="w-4 h-4 text-sky-500" />
    case 'HARDWARE': return <Cpu className="w-4 h-4 text-orange-500" />
    case 'ACCOUNT': return <ShieldAlert className="w-4 h-4 text-purple-500" />
    default: return <Settings2 className="w-4 h-4 text-slate-500" />
  }
}

function categoryBg(cat: TNotificationCategory) {
  switch (cat) {
    case 'PACKAGE': return 'bg-sky-100 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800'
    case 'HARDWARE': return 'bg-orange-100 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800'
    case 'ACCOUNT': return 'bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800'
    default: return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
  }
}

type Tab = 'pending' | 'notifications'

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function ApprovalBell() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const isAdmin = user?.role === 'org_admin' || user?.role === 'super_admin'

  // ── State: tab ──
  const [activeTab, setActiveTab] = useState<Tab>('pending')

  // ── State: pending residents ──
  const [pendingList, setPendingList] = useState<TPendingResident[]>([])
  const [isPendingLoading, setIsPendingLoading] = useState(false)
  const [pendingError, setPendingError] = useState<string | null>(null)

  // ── State: system notifications ──
  const [notifList, setNotifList] = useState<TNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotifLoading, setIsNotifLoading] = useState(false)

  // ── State: dropdown & modal ──
  const [isOpen, setIsOpen] = useState(false)
  const [selectedResident, setSelectedResident] = useState<TPendingResident | null>(null)
  const [modalMode, setModalMode] = useState<'detail' | 'reject'>('detail')
  const [rejectReason, setRejectReason] = useState('')
  const [isActioning, setIsActioning] = useState<'approve' | 'reject' | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // ── Fetch pending residents ──
  const fetchPending = useCallback(async () => {
    if (!isAdmin) return
    try {
      const data = await getPendingResidents()
      setPendingList(data)
      setPendingError(null)
    } catch (err: unknown) {
      if (err instanceof Error) setPendingError(err.message)
    }
  }, [isAdmin])

  // ── Fetch system notifications ──
  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) return
    setIsNotifLoading(true)
    try {
      const [result, count] = await Promise.all([
        getMyNotifications({ limit: 20 }),
        getUnreadCount(),
      ])
      const items = Array.isArray(result) ? result : (result?.data ?? [])
      setNotifList(items)
      setUnreadCount(count)
    } catch {
      // silent fail
    } finally {
      setIsNotifLoading(false)
    }
  }, [isAdmin])

  // 1. Initial fetch
  useEffect(() => {
    if (!isAdmin) return
    setIsPendingLoading(true)
    fetchPending().finally(() => setIsPendingLoading(false))
    fetchNotifications()
  }, [isAdmin, fetchPending, fetchNotifications])

  // 2. Real-time WebSocket
  useEffect(() => {
    if (!isAdmin) return
    const socket = getNotificationSocket()
    const targetBuildingId = user?.buildingId || (user?.orgId !== 'all' ? user?.orgId : undefined)

    if (targetBuildingId) joinBuildingRoom(targetBuildingId)

    const handleNewResident = (event: TNewPendingResidentEvent) => {
      console.log('⚡ [Socket] NEW_PENDING_RESIDENT:', event)
      toast.info(`🔔 ${event.title || tNow('bell.newRegistration')}: ${event.message || tNow('bell.newRegistrationMsg')}`, 6000)
      fetchPending()
    }

    const handleApprovalResult = (event: TResidentApprovalResultEvent) => {
      console.log('⚡ [Socket] RESIDENT_APPROVAL_RESULT:', event)
      fetchPending()
    }

    const handleNewPackage = (event: TPackageNewEvent) => {
      console.log('⚡ [Socket] PACKAGE_NEW:', event)
      toast.info(`📦 ${event.title || tNow('bell.newParcel')}: ${event.message}`, 6000)
      setUnreadCount((c) => c + 1)
      fetchNotifications()
    }

    const handleBroadcast = (event: { title?: string; message?: string }) => {
      console.log('⚡ [Socket] BROADCAST:', event)
      setUnreadCount((c) => c + 1)
      fetchNotifications()
    }

    socket.on('NEW_PENDING_RESIDENT', handleNewResident)
    socket.on('RESIDENT_APPROVAL_RESULT', handleApprovalResult)
    socket.on('PACKAGE_NEW', handleNewPackage)
    socket.on('SYSTEM_ANNOUNCEMENT', handleBroadcast)

    return () => {
      socket.off('NEW_PENDING_RESIDENT', handleNewResident)
      socket.off('RESIDENT_APPROVAL_RESULT', handleApprovalResult)
      socket.off('PACKAGE_NEW', handleNewPackage)
      socket.off('SYSTEM_ANNOUNCEMENT', handleBroadcast)
      if (targetBuildingId) leaveBuildingRoom(targetBuildingId)
    }
  }, [isAdmin, user?.buildingId, user?.orgId, fetchPending, fetchNotifications, toast])

  // 3. Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (!isAdmin) return null

  // Total badge = pending residents + unread system notifications
  const totalBadge = pendingList.length + unreadCount

  // ── APPROVE ──────────────────────────────────────────────────────────────
  async function handleApprove() {
    if (!selectedResident || isActioning) return
    setIsActioning('approve')
    try {
      await approveResident(selectedResident._id)
      setPendingList((prev) => prev.filter((r) => r._id !== selectedResident._id))
      logActivity({
        actorName: user?.fullName || 'Admin',
        actorRole: 'admin',
        title: t('approval.logApproveTitle'),
        description: t('approval.logApproveDesc', { name: selectedResident.name, phone: selectedResident.phone, apartment: selectedResident.apartment }),
        targetId: selectedResident._id,
        targetType: 'user',
        targetLabel: selectedResident.name,
        category: 'user',
        status: 'success',
      })
      toast.success(t('approval.approvedToast'))
      setSelectedResident(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('approval.approveFailed')
      toast.error(msg)
    } finally {
      setIsActioning(null)
    }
  }

  // ── REJECT ────────────────────────────────────────────────────────────────
  async function handleReject() {
    if (!selectedResident || isActioning) return
    if (!rejectReason.trim()) { toast.error(t('approval.reasonRequired')); return }
    setIsActioning('reject')
    try {
      await rejectResident(selectedResident._id, rejectReason.trim())
      setPendingList((prev) => prev.filter((r) => r._id !== selectedResident._id))
      logActivity({
        actorName: user?.fullName || 'Admin',
        actorRole: 'admin',
        title: t('approval.logRejectTitle'),
        description: t('approval.logRejectDesc', { name: selectedResident.name, phone: selectedResident.phone, reason: rejectReason.trim() }),
        targetId: selectedResident._id,
        targetType: 'user',
        targetLabel: selectedResident.name,
        category: 'user',
        status: 'warning',
      })
      toast.success(t('approval.rejectedToast', { name: selectedResident.name }))
      setSelectedResident(null)
      setRejectReason('')
      setModalMode('detail')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('approval.rejectFailed')
      toast.error(msg)
    } finally {
      setIsActioning(null)
    }
  }

  // ── Mark single notification as read ────────────────────────────────────
  async function handleMarkRead(notif: TNotification) {
    if (notif.isRead) return
    await markAsRead(notif._id)
    setNotifList((prev) => prev.map((n) => n._id === notif._id ? { ...n, isRead: true } : n))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  // ── Mark all as read ──────────────────────────────────────────────────────
  async function handleMarkAllRead() {
    await markAllAsRead()
    setNotifList((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  // ── Delete notification ──────────────────────────────────────────────────
  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await deleteNotification(id)
    setNotifList((prev) => {
      const removed = prev.find((n) => n._id === id)
      if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1))
      return prev.filter((n) => n._id !== id)
    })
  }

  function openDetail(resident: TPendingResident) {
    setSelectedResident(resident)
    setModalMode('detail')
    setRejectReason('')
    setIsOpen(false)
  }

  function closeModal() {
    setSelectedResident(null)
    setModalMode('detail')
    setRejectReason('')
    setIsActioning(null)
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── BELL BUTTON ── */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          id="approval-bell-btn"
          onClick={() => {
            setIsOpen((v) => {
              if (!v) {
                // Refresh data when opening
                fetchPending()
                fetchNotifications()
              }
              return !v
            })
          }}
          className="relative h-8.5 w-8.5 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
          title={t('bell.title')}
        >
          <Bell className="w-4 h-4" />
          {totalBadge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-md animate-pulse">
              {totalBadge > 99 ? '99+' : totalBadge}
            </span>
          )}
        </button>

        {/* ── DROPDOWN PANEL ── */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[520px] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-[1100] overflow-hidden">

            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="text-[13.5px] font-bold text-slate-900 dark:text-white">{t('bell.title')}</span>
                {totalBadge > 0 && (
                  <span className="text-[11px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">{totalBadge}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {activeTab === 'notifications' && unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
                    title={t('bell.markAllRead')}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {t('bell.readAll')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => activeTab === 'pending' ? fetchPending() : fetchNotifications()}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5"
                  title={t('bell.refresh')}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-2.5 text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'pending'
                    ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                {t('bell.tabPending')}
                {pendingList.length > 0 && (
                  <span className="text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded-full">{pendingList.length}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-2.5 text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                {t('bell.tabSystem')}
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-white bg-sky-500 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">

              {/* ── TAB: PENDING RESIDENTS ── */}
              {activeTab === 'pending' && (
                <>
                  {isPendingLoading && pendingList.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[12px]">{t('common.loading')}</span>
                    </div>
                  ) : pendingError ? (
                    <div className="py-8 flex flex-col items-center gap-2 text-slate-400">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                      <span className="text-[12px] text-center px-4">{t('bell.loadError')}</span>
                    </div>
                  ) : pendingList.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                      <Check className="w-8 h-8 text-emerald-400" />
                      <span className="text-[12px]">{t('bell.noPending')}</span>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pendingList.map((r) => (
                        <li key={r._id}>
                          <button
                            type="button"
                            onClick={() => openDetail(r)}
                            className="w-full text-left px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                                <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{r.name}</p>
                                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate">{t('bell.apartmentLine', { phone: r.phone, apartment: r.apartment })}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="text-[11px] text-slate-400">{formatRelativeTime(r.createdAt)}</span>
                                </div>
                              </div>
                              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mt-0.5">
                                {t('bell.pendingBadge')}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {/* ── TAB: SYSTEM NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <>
                  {isNotifLoading && notifList.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[12px]">{t('bell.loadingNotifs')}</span>
                    </div>
                  ) : notifList.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                      <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="text-[12px]">{t('bell.noNotifs')}</span>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {notifList.map((n) => (
                        <li key={n._id}>
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n)}
                            className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer relative group ${
                              !n.isRead ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${categoryBg(n.category)}`}>
                                {categoryIcon(n.category)}
                              </div>
                              {/* Content */}
                              <div className="flex-1 min-w-0 pr-6">
                                <p className={`text-[13px] font-semibold truncate ${n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                  {n.title}
                                </p>
                                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 text-left">{n.message}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="text-[11px] text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                                  {!n.isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 ml-1" />
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={(e) => handleDelete(n._id, e)}
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                              title={t('bell.deleteNotif')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            {/* Panel Footer */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
              {activeTab === 'pending' ? (
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); navigate('/pending-approvals') }}
                  className="w-full text-center text-[12px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  {t('bell.viewAllApprovals')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); navigate('/notifications') }}
                  className="w-full text-center text-[12px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  {t('bell.viewAllNotifs')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DETAIL / ACTION MODAL (Pending Resident) ── */}
      {selectedResident && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {modalMode === 'reject' ? t('approval.rejectTitle') : t('approval.detailTitle')}
              </h3>
              <button type="button" onClick={closeModal} disabled={!!isActioning} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {modalMode === 'detail' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t('approval.fieldName'), value: selectedResident.name, icon: <User className="w-3.5 h-3.5" /> },
                      { label: t('approval.fieldPhone'), value: selectedResident.phone, mono: true },
                      { label: 'Email', value: selectedResident.email, mono: true },
                      { label: t('approval.fieldApartment'), value: selectedResident.apartment, icon: <Building2 className="w-3.5 h-3.5" /> },
                    ].map((f) => (
                      <div key={f.label} className="flex flex-col gap-0.5">
                        <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{f.label}</span>
                        <span className={`text-[13px] font-semibold text-slate-900 dark:text-white ${f.mono ? 'font-mono' : ''}`}>{f.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('approval.submittedAt')}</span>
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(selectedResident.createdAt)} ({formatRelativeTime(selectedResident.createdAt)})
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t('approval.hint1')} <strong className="text-emerald-600 dark:text-emerald-400">{t('approval.approve')}</strong> {t('approval.hint2')} <strong className="text-red-600 dark:text-red-400">{t('approval.reject')}</strong> {t('approval.hint3')}
                  </p>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12.5px] font-semibold text-red-800 dark:text-red-300">{t('approval.rejectBannerTitle', { name: selectedResident.name })}</p>
                      <p className="text-[11.5px] text-red-600 dark:text-red-400 mt-0.5">{t('approval.irreversible')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      {t('approval.reasonLabel')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t('approval.reasonPlaceholder')}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-400 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              {modalMode === 'detail' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setModalMode('reject')}
                    disabled={!!isActioning}
                    className="h-9 px-4 rounded-xl text-[12.5px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 hover:bg-red-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {t('approval.reject')}
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={closeModal} disabled={!!isActioning} className="h-9 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50">
                      {t('common.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={!!isActioning}
                      className="h-9 px-4 rounded-xl text-[12.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isActioning === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {isActioning === 'approve' ? t('approval.approving') : t('approval.approve')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setModalMode('detail')} disabled={!!isActioning} className="h-9 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50">
                    ← {t('common.back')}
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={!!isActioning || !rejectReason.trim()}
                    className="h-9 px-4 rounded-xl text-[12.5px] font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActioning === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isActioning === 'reject' ? t('approval.rejecting') : t('approval.confirmReject')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
