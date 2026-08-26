import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserRoleBadge } from "../../../components/Users/UserRoleBadge"
import { UserStatusBadge } from '../../../components/Users/UserStatusBadge'
import type { TUser } from '../../../types/user.type'

export function UserManagePage() {
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
    ]
  }, [])

  const user = useMemo(() => {
    return users.find((item) => item.id === userId) ?? users[0]
  }, [users, userId])

  const [role, setRole] = useState(user.role)
  const [status, setStatus] = useState(user.status)
  const [note, setNote] = useState(user.note ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  function handleSave() {
    setIsSaving(true)
    window.setTimeout(() => {
      setIsSaving(false)
      setIsSaved(true)
      window.setTimeout(() => setIsSaved(false), 1500)
    }, 800)
  }

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

      {/* Hero */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 hover:text-sky-700 mb-3 transition-colors cursor-pointer"
          >
            ← Quay lại User Detail
          </button>

          <p className="eyebrow mb-1">Account Management</p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight truncate">
            Quản lý tài khoản {user.fullName}
          </h1>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed max-w-lg">
            Thay đổi vai trò (Customer/Shipper/Admin), khóa/mở tài khoản và cập nhật ghi chú hệ thống.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
          <UserRoleBadge role={role} />
          <UserStatusBadge status={status} />
        </div>
      </section>

      {/* Form */}
      <section data-stagger className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Role & Status Config */}
        <article className="flex flex-col gap-5 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">Phân quyền & Trạng thái</h2>

          {/* Role select */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-slate-600">
              Vai trò
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={[
                  "h-10 px-3 rounded-xl text-[12px] font-bold transition-all border cursor-pointer active:scale-95",
                  role === 'user'
                    ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
                ].join(" ")}
              >
                Người Dùng
              </button>

              <button
                type="button"
                onClick={() => setRole('shipper')}
                className={[
                  "h-10 px-3 rounded-xl text-[12px] font-bold transition-all border cursor-pointer active:scale-95",
                  role === 'shipper'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
                ].join(" ")}
              >
                Shipper
              </button>

              <button
                type="button"
                onClick={() => setRole('org_admin')}
                className={[
                  "h-10 px-3 rounded-xl text-[12px] font-bold transition-all border cursor-pointer active:scale-95",
                  role === 'org_admin'
                    ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
                ].join(" ")}
              >
                Admin Quản Trị
              </button>
            </div>
          </div>

          {/* Status select */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-[12px] font-medium text-slate-600">
              Trạng thái tài khoản
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={[
                  "h-10 px-3 rounded-xl text-[12px] font-bold transition-all border cursor-pointer active:scale-95",
                  status === 'active'
                    ? "bg-emerald-100 text-emerald-800 border-emerald-400 font-bold shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
                ].join(" ")}
              >
                Active
              </button>

              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={[
                  "h-10 px-3 rounded-xl text-[12px] font-bold transition-all border cursor-pointer active:scale-95",
                  status === 'inactive'
                    ? "bg-slate-200 text-slate-800 border-slate-400 font-bold shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
                ].join(" ")}
              >
                Inactive
              </button>

              <button
                type="button"
                onClick={() => setStatus('blocked')}
                className={[
                  "h-10 px-3 rounded-xl text-[12px] font-bold transition-all border cursor-pointer active:scale-95",
                  status === 'blocked'
                    ? "bg-red-100 text-red-800 border-red-400 font-bold shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
                ].join(" ")}
              >
                Blocked
              </button>
            </div>
          </div>
        </article>

        {/* Note Config */}
        <article className="flex flex-col gap-5 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">Ghi chú Admin</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">
              Ghi chú nội bộ
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho tài khoản này..."
              className="w-full p-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 resize-none font-medium"
            />
          </div>
        </article>

        {/* Save bar */}
        <article className="lg:col-span-2 flex items-center justify-between p-6 rounded-2xl glass-card shadow-xs">
          <p className="text-[13px] text-slate-600 font-medium">
            Nhấn lưu để cập nhật thay đổi vai trò và trạng thái cho người dùng này.
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-6 rounded-xl text-[13px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-md shadow-sky-600/20 shimmer-btn cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : isSaved ? '✓ Đã lưu' : 'Lưu thay đổi'}
          </button>
        </article>
      </section>
    </div>
  )
}
