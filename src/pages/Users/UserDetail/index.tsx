import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getShipments } from '../../../service/shipment.service'
import { getActivities } from '../../../service/activity.service'
import { UserRoleBadge } from "../../../components/Users/UserRoleBadge"
import { UserStatusBadge } from "../../../components/Users/UserStatusBadge"
import type { TShipment } from "../../../types/shipment.type"
import type { TActivityItem } from "../../../types/activity.type"
import { useTranslation } from '../../../context/LanguageContext'
import type { TranslationKey } from '../../../i18n/translations'
import {
  User as UserIcon,
  Clock,
  PackageCheck,
  Activity as ActivityIcon,
  ArrowLeft,
} from 'lucide-react'

import { useUserStore } from '../../../store/useUserStore'

export function UserDetailPage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { t } = useTranslation()

  const masterUsers = useUserStore((state) => state.users)
  const [allShipments, setAllShipments] = useState<TShipment[]>([])
  const [allActivities, setAllActivities] = useState<TActivityItem[]>([])
  const [activeTab, setActiveTab] = useState<'shipments' | 'activities'>('shipments')
  const [loading, setLoading] = useState(true)

  const user = useMemo(() => {
    return masterUsers.find((u) => u.id === userId) || null
  }, [masterUsers, userId])

  useEffect(() => {
    setLoading(true)
    Promise.all([getShipments(), getActivities()]).then(
      ([shipments, activities]) => {
        setAllShipments(shipments)
        setAllActivities(activities)
        setLoading(false)
      }
    )
  }, [userId])

  // Filter personal shipments for this specific user
  const userShipments = useMemo(() => {
    if (!user) return []
    const phone = user.phone.trim()
    const name = user.fullName.trim().toLowerCase()

    return allShipments.filter((s) => {
      const matchPhone = s.recipientPhone && s.recipientPhone.includes(phone)
      const matchName = s.recipientName && s.recipientName.toLowerCase().includes(name)
      const matchShipper = s.shipperName && s.shipperName.toLowerCase().includes(name)
      return matchPhone || matchName || matchShipper
    })
  }, [user, allShipments])

  // Filter personal audit logs for this specific user
  const userActivities = useMemo(() => {
    if (!user) return []
    const phone = user.phone.trim()
    const name = user.fullName.trim().toLowerCase()
    const id = user.id

    return allActivities.filter((a) => {
      const matchId = a.actorId === id
      const matchPhone = a.actorPhone && a.actorPhone.includes(phone)
      const matchName = a.actorName && a.actorName.toLowerCase().includes(name)
      return matchId || matchPhone || matchName
    })
  }, [user, allActivities])

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <span className="w-6 h-6 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
        <p className="text-[13px] font-medium">{t('common.loading')}</p>
      </div>
    )
  }

  const shipmentStatusBadges: Record<string, { labelKey: TranslationKey; style: string }> = {
    waiting_pickup: { labelKey: 'ud.ship.waiting_pickup', style: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
    stored: { labelKey: 'ud.ship.stored', style: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
    picked_up: { labelKey: 'ud.ship.picked_up', style: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    expired: { labelKey: 'ud.ship.expired', style: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
    pending: { labelKey: 'ud.ship.pending', style: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Hero Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {t('ud.backToList')}
          </button>

          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono text-sky-800 dark:text-sky-300 font-bold bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              {user.userCode}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">{user.companyName}</span>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight truncate">{user.fullName}</h1>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            {t('ud.desc')}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <UserRoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
          </div>
          <button
            type="button"
            onClick={() => navigate(`/users/${user.id}/manage`)}
            className="h-9.5 px-4 rounded-xl text-[12.5px] font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all cursor-pointer shadow-md shadow-sky-600/20 active:scale-95 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{t('ud.manageBtn')}</span>
          </button>
        </div>
      </section>

      {/* Overview Cards */}
      <section data-stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile Card */}
        <article className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
          <h2 className="setting-title-custom text-[15px] font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            {t('ud.personal')}
          </h2>
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.userCode')}</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{user.userCode}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.fullName')}</span>
              <span className="font-bold setting-title-custom">{user.fullName}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.phone')}</span>
              <span className="font-mono font-semibold setting-title-custom">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Email</span>
              <span className="setting-title-custom font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.org')}</span>
              <span className="font-semibold text-sky-700 dark:text-sky-300">{user.companyName}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.unit')}</span>
              <span className="font-semibold setting-title-custom">{user.unitNumber}</span>
            </div>
          </div>
        </article>

        {/* Activity Status Card */}
        <article className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
          <h2 className="setting-title-custom text-[15px] font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {t('ud.statusSection')}
          </h2>
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.role')}</span>
              <span className="font-mono uppercase font-bold text-sky-600 dark:text-sky-400">{user.role}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.createdAt')}</span>
              <span className="font-mono setting-title-custom">{user.createdAt}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.lastActive')}</span>
              <span className="font-mono setting-title-custom">{user.lastActive}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.totalShipments')}</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[15px]">{t('ud.shipmentCount', { count: userShipments.length })}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">{t('ud.logCount')}</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-[15px]">{userActivities.length} logs</span>
            </div>
          </div>
        </article>

      </section>

      {/* ── DEDICATED PERSONAL HISTORY & SHIPMENT SECTION ── */}
      <section data-reveal className="setting-card-custom rounded-2xl border p-6 flex flex-col gap-5 shadow-xs">

        {/* Section Header & Tab Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
              {t('ud.eyebrow')}
            </span>
            <h2 className="setting-title-custom text-[17px] font-bold mt-1.5">{t('ud.historyTitle', { name: user.fullName })}</h2>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('shipments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${activeTab === 'shipments'
                  ? 'bg-sky-600 text-white dark:bg-sky-500 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <PackageCheck className="w-4 h-4" />
              {t('ud.tabOrders', { count: userShipments.length })}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${activeTab === 'activities'
                  ? 'bg-purple-600 text-white dark:bg-purple-500 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <ActivityIcon className="w-4 h-4" />
              {t('ud.tabLogs', { count: userActivities.length })}
            </button>
          </div>
        </div>

        {/* Tab 1: Personal Shipments Table */}
        {activeTab === 'shipments' && (
          <div className="overflow-x-auto">
            {userShipments.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{t('ud.colOrderCode')}</th>
                    <th className="py-3 px-4">{t('ud.colLockerSize')}</th>
                    <th className="py-3 px-4">{t('ud.colShipper')}</th>
                    <th className="py-3 px-4">{t('ud.colOtp')}</th>
                    <th className="py-3 px-4">{t('ud.colDeposit')}</th>
                    <th className="py-3 px-4 text-right">{t('ud.colStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
                  {userShipments.map((shp) => {
                    const stBadge = shipmentStatusBadges[shp.shipmentStatus] || shipmentStatusBadges.stored
                    return (
                      <tr key={shp.id} className="hover:bg-sky-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-[13px]">
                            {shp.shipmentCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {shp.lockerCode}
                            </span>
                            <span className="text-[10px] font-mono uppercase text-slate-500">
                              ({shp.lockerSize})
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium setting-title-custom">
                          {shp.shipperName}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {shp.otpCode || '----'}
                        </td>
                        <td className="py-3.5 px-4 font-mono setting-desc-custom text-[12px]">
                          {shp.createdAt}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${stBadge.style}`}>
                            {t(stBadge.labelKey)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-[13px]">
                <PackageCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('ud.noOrders')}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Personal Activity Logs Table */}
        {activeTab === 'activities' && (
          <div className="overflow-x-auto">
            {userActivities.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{t('ud.colTime')}</th>
                    <th className="py-3 px-4">{t('ud.colEvent')}</th>
                    <th className="py-3 px-4">{t('ud.colDetail')}</th>
                    <th className="py-3 px-4 text-right">{t('ud.colStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
                  {userActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-sky-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[12px] setting-desc-custom">
                        {act.timeLabel}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold setting-title-custom">{act.title}</span>
                          {act.targetLabel && (
                            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold">
                              {act.targetLabel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 setting-desc-custom text-[12px] max-w-[380px]">
                        {act.description}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${act.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                            act.status === 'warning' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                              'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                          }`}>
                          {act.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-[13px]">
                <ActivityIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('ud.noLogs')}</p>
              </div>
            )}
          </div>
        )}

      </section>

    </div>
  )
}
