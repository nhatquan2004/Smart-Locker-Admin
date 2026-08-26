import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserRoleBadge } from "../../../components/Users/UserRoleBadge"
import { UserStatusBadge } from "../../../components/Users/UserStatusBadge"
import type { TUser } from "../../../types/user.type"

export function UserDetailPage() {
  const navigate = useNavigate()
  const { userId } = useParams()

  const users = useMemo<TUser[]>(() => {
    return [
      {
        id: '1', userCode: 'USR-001', fullName: 'Nguyễn Văn An', phone: '0901234567',
        email: 'nguyenvanan@gmail.com', role: 'user', status: 'active',
        createdAt: '2026-04-20 08:10', lastActive: '2026-04-28 09:15', totalShipments: 8,
        note: 'Khách hàng nhận hàng thường xuyên',
      },
      {
        id: '2', userCode: 'USR-002', fullName: 'Trần Minh Long', phone: '0912345678',
        email: 'tranminhlong@gmail.com', role: 'shipper', status: 'active',
        createdAt: '2026-04-18 10:30', lastActive: '2026-04-28 08:50', totalShipments: 26,
        note: 'Shipper phụ trách khu A và B',
      },
      {
        id: '3', userCode: 'USR-003', fullName: 'Lê Khánh Vy', phone: '0988123456',
        email: 'lekhanhvy@gmail.com', role: 'user', status: 'inactive',
        createdAt: '2026-04-15 14:20', lastActive: '2026-04-25 18:05', totalShipments: 3,
        note: 'Ít hoạt động trong tuần này',
      },
      {
        id: '4', userCode: 'USR-004', fullName: 'Phạm Gia Hưng', phone: '0977001122',
        email: 'phamgiahung@gmail.com', role: 'org_admin', status: 'active',
        createdAt: '2026-04-10 09:00', lastActive: '2026-04-28 09:30', totalShipments: 0,
        note: 'Quản trị viên hệ thống',
      },
    ]
  }, [])

  const user = useMemo(() => {
    return users.find((item) => item.id === userId) ?? users[0]
  }, [users, userId])

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Không tìm thấy thông tin người dùng</p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-[13px] text-slate-800 hover:bg-slate-200"
        >
          ← Quay lại danh sách Users
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Hero Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 hover:text-sky-700 mb-3 transition-colors cursor-pointer"
          >
            ← Quay lại danh sách Users
          </button>

          <p className="eyebrow mb-1">User Profile</p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight truncate">{user.fullName}</h1>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed max-w-lg">
            Thông tin tài khoản, vai trò trong hệ thống, mức độ hoạt động và lịch sử giao dịch.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
          <UserRoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
        </div>
      </section>

      {/* Grid */}
      <section data-stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile Card */}
        <article className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">Thông tin cá nhân</h2>
          <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Mã người dùng</span>
              <span className="font-mono font-bold text-sky-700">{user.userCode}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Họ và tên</span>
              <span className="font-bold text-slate-900">{user.fullName}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Số điện thoại</span>
              <span className="font-mono font-semibold text-slate-800">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Email</span>
              <span className="text-slate-800 font-medium">{user.email}</span>
            </div>
          </div>
        </article>

        {/* Activity Status Card */}
        <article className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">Trạng thái & Hoạt động</h2>
          <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Vai trò</span>
              <span className="font-mono uppercase font-bold text-sky-700">{user.role}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Ngày tạo tài khoản</span>
              <span className="font-mono text-slate-700">{user.createdAt}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Hoạt động gần nhất</span>
              <span className="font-mono text-slate-700">{user.lastActive}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Tổng đơn giao/nhận</span>
              <span className="font-mono font-bold text-slate-900">{user.totalShipments} đơn</span>
            </div>
          </div>
        </article>

        {/* Actions Card */}
        <article className="md:col-span-2 flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900">Ghi chú & Thao tác</h2>
          <p className="text-[13px] text-slate-700 bg-slate-50 border border-slate-200 p-4 rounded-xl leading-relaxed font-medium">
            💡 {user.note ?? 'Không có ghi chú cho tài khoản này.'}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/users/${user.id}/manage`)}
              className="h-10 px-5 rounded-xl text-[13px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-md shadow-sky-600/20 shimmer-btn cursor-pointer active:scale-95"
            >
              ⚙️ Quản lý tài khoản
            </button>
            <button
              type="button"
              onClick={() => navigate(`/shipments`)}
              className="h-10 px-5 rounded-xl text-[13px] font-bold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 transition-all cursor-pointer active:scale-95"
            >
              📜 Xem lịch sử đơn hàng
            </button>
          </div>
        </article>
      </section>
    </div>
  )
}
