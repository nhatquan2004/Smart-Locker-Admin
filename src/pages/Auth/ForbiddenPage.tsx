import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react'

export function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
      <div className="flex flex-col items-center text-center max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 shadow-2xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Status Code & Title */}
        <span className="text-[12px] font-mono font-bold text-red-600 dark:text-red-400 tracking-widest uppercase bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-800/80 mb-2">
          HTTP 403 FORBIDDEN
        </span>
        <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">
          Bạn Không Có Quyền Truy Cập
        </h1>

        {/* Description */}
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Trang này chỉ dành cho tài khoản <strong>Super Admin</strong>. Tài khoản của bạn không đủ đặc quyền để xem hoặc chỉnh sửa dữ liệu tại địa chỉ này.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 w-full">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 h-10 px-4 rounded-xl text-[12.5px] font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-all cursor-pointer shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4" />
            Trang Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
