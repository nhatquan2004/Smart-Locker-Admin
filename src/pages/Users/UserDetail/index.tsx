import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsers } from '../../../service/user.service'
import { getShipments } from '../../../service/shipment.service'
import { getActivities } from '../../../service/activity.service'
import { UserRoleBadge } from "../../../components/Users/UserRoleBadge"
import { UserStatusBadge } from "../../../components/Users/UserStatusBadge"
import type { TUser } from "../../../types/user.type"
import type { TShipment } from "../../../types/shipment.type"
import type { TActivityItem } from "../../../types/activity.type"
import { useTranslation } from '../../../context/LanguageContext'
import {
  User as UserIcon,
  Clock,
  PackageCheck,
  Activity as ActivityIcon,
  ArrowLeft,
} from 'lucide-react'

export function UserDetailPage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { t } = useTranslation()

  const [user, setUser] = useState<TUser | null>(null)
  const [allShipments, setAllShipments] = useState<TShipment[]>([])
  const [allActivities, setAllActivities] = useState<TActivityItem[]>([])
  const [activeTab, setActiveTab] = useState<'shipments' | 'activities'>('shipments')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getUsers(), getShipments(), getActivities()]).then(
      ([users, shipments, activities]) => {
        const found = users.find((u) => u.id === userId) || users[0]
        setUser(found || null)
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

  const shipmentStatusBadges: Record<string, { label: string; style: string }> = {
    waiting_pickup: { label: 'Chờ nhận hàng', style: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
    stored: { label: 'Đã lưu tủ', style: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
    picked_up: { label: 'Đã hoàn thành', style: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    expired: { label: 'Quá hạn', style: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
    pending: { label: 'Chờ xử lý', style: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
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
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Users
          </button>

          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono text-sky-800 dark:text-sky-300 font-bold bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              {user.userCode}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">{user.companyName}</span>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight truncate">{user.fullName}</h1>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            Thông tin chi tiết hồ sơ tài khoản, đơn vị công tác và toàn bộ lịch sử đơn hàng cá nhân.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
          <UserRoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
        </div>
      </section>

      {/* Overview Cards */}
      <section data-stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile Card */}
        <article className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
          <h2 className="setting-title-custom text-[15px] font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Thông tin cá nhân
          </h2>
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Mã người dùng</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{user.userCode}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Họ và tên</span>
              <span className="font-bold setting-title-custom">{user.fullName}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Số điện thoại</span>
              <span className="font-mono font-semibold setting-title-custom">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Email</span>
              <span className="setting-title-custom font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Doanh nghiệp / Khu trọ</span>
              <span className="font-semibold text-sky-700 dark:text-sky-300">{user.companyName}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Vị trí / Vị trí phòng</span>
              <span className="font-semibold setting-title-custom">{user.unitNumber}</span>
            </div>
          </div>
        </article>

        {/* Activity Status Card */}
        <article className="setting-card-custom flex flex-col gap-4 p-6 rounded-2xl border shadow-xs">
          <h2 className="setting-title-custom text-[15px] font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Trạng thái & Hoạt động
          </h2>
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Vai trò hệ thống</span>
              <span className="font-mono uppercase font-bold text-sky-600 dark:text-sky-400">{user.role}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Ngày tạo tài khoản</span>
              <span className="font-mono setting-title-custom">{user.createdAt}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Hoạt động gần nhất</span>
              <span className="font-mono setting-title-custom">{user.lastActive}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Tổng đơn giao/nhận</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[15px]">{userShipments.length} đơn</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="setting-desc-custom font-medium">Số nhật ký ghi nhận</span>
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
              Personal Audit & Shipments
            </span>
            <h2 className="setting-title-custom text-[17px] font-bold mt-1.5">Lịch Sử Cá Nhân: {user.fullName}</h2>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('shipments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                activeTab === 'shipments'
                  ? 'bg-sky-600 text-white dark:bg-sky-500 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              Đơn Hàng ({userShipments.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                activeTab === 'activities'
                  ? 'bg-purple-600 text-white dark:bg-purple-500 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ActivityIcon className="w-4 h-4" />
              Nhật Ký Thao Tác ({userActivities.length})
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
                    <th className="py-3 px-4">Mã Đơn Hàng</th>
                    <th className="py-3 px-4">Locker & Size</th>
                    <th className="py-3 px-4">Shipper Giao</th>
                    <th className="py-3 px-4">Mã OTP</th>
                    <th className="py-3 px-4">Thời Gian Nạp Tủ</th>
                    <th className="py-3 px-4 text-right">Trạng Thái</th>
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
                            {stBadge.label}
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
                <p>Chưa có lịch sử đơn hàng nào được ghi nhận cho người dùng này.</p>
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
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Sự Kiện & Thao Tác</th>
                    <th className="py-3 px-4">Chi Tiết Thao Tác</th>
                    <th className="py-3 px-4 text-right">Trạng Thái</th>
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
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                          act.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
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
                <p>Chưa có nhật ký thao tác cá nhân nào được ghi nhận cho người dùng này.</p>
              </div>
            )}
          </div>
        )}

      </section>

    </div>
  )
}
