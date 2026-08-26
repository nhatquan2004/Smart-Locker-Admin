import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import type { TAdminUser } from '../../types/auth.type'
import type { TOrgType } from '../../types/organization.type'
import lockerLogo from '../../assets/locker.png'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [orgName, setOrgName] = useState('')
  const [orgType, setOrgType] = useState<TOrgType>('enterprise')
  const [adminName, setAdminName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!orgName.trim() || !adminName.trim() || !email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)

      const newOrgUser: TAdminUser = {
        id: `oa-${Date.now()}`,
        email: email,
        fullName: `${adminName} (Admin ${orgName})`,
        role: 'org_admin',
        orgId: `org-${Date.now().toString().slice(-4)}`,
        orgName: orgName,
        orgType: orgType,
      }

      login(newOrgUser)
      navigate('/dashboard')
    }, 700)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#090d16]">
      {/* Glow ambient background circles */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div data-reveal className="w-full max-w-lg p-8 rounded-3xl glass-card relative z-10 flex flex-col gap-6 shadow-2xl border border-white/15 my-8">
        
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white p-1 shadow-lg shadow-sky-500/20">
            <img src={lockerLogo} alt="Smart Locker" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">Đăng Ký Đơn Vị Quản Lý</h1>
            <p className="text-[12px] text-slate-400 mt-1">Đăng ký tài khoản Admin cho Doanh nghiệp, Khu nhà trọ hoặc KTX</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-[12px] text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Org Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-300">
              Mô hình quản lý
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOrgType('enterprise')}
                className={[
                  "p-2.5 rounded-xl text-[12px] font-medium transition-all text-center border cursor-pointer",
                  orgType === 'enterprise'
                    ? "bg-sky-500/20 text-sky-300 border-sky-400 font-bold shadow-sm"
                    : "bg-slate-800/80 text-slate-400 border-white/10 hover:text-white",
                ].join(" ")}
              >
                Doanh nghiệp
              </button>
              <button
                type="button"
                onClick={() => setOrgType('apartment')}
                className={[
                  "p-2.5 rounded-xl text-[12px] font-medium transition-all text-center border cursor-pointer",
                  orgType === 'apartment'
                    ? "bg-sky-500/20 text-sky-300 border-sky-400 font-bold shadow-sm"
                    : "bg-slate-800/80 text-slate-400 border-white/10 hover:text-white",
                ].join(" ")}
              >
                Khu nhà trọ
              </button>
              <button
                type="button"
                onClick={() => setOrgType('dormitory')}
                className={[
                  "p-2.5 rounded-xl text-[12px] font-medium transition-all text-center border cursor-pointer",
                  orgType === 'dormitory'
                    ? "bg-sky-500/20 text-sky-300 border-sky-400 font-bold shadow-sm"
                    : "bg-slate-800/80 text-slate-400 border-white/10 hover:text-white",
                ].join(" ")}
              >
                Ký túc xá
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-300">
              Tên Doanh nghiệp / Khu trọ / KTX
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="VD: TechCorp Office, Nhà Trọ Hoàng Nam, KTX Bách Khoa..."
              className="h-11 px-4 rounded-xl text-[13px] bg-slate-800/90 text-white border border-white/15 focus:outline-none focus:border-sky-400 transition-all placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-slate-300">
                Họ tên Admin quản lý
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="VD: Nguyễn Văn Minh"
                className="h-11 px-4 rounded-xl text-[13px] bg-slate-800/90 text-white border border-white/15 focus:outline-none focus:border-sky-400 transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-slate-300">
                Email đăng nhập
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@doanhnghiep.com"
                className="h-11 px-4 rounded-xl text-[13px] bg-slate-800/90 text-white border border-white/15 focus:outline-none focus:border-sky-400 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-300">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 px-4 rounded-xl text-[13px] bg-slate-800/90 text-white border border-white/15 focus:outline-none focus:border-sky-400 transition-all placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 mt-3 rounded-xl text-[13px] font-bold bg-sky-400 text-slate-950 hover:bg-sky-300 transition-all shadow-lg shadow-sky-500/25 active:scale-[0.98] shimmer-btn flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Đang khởi tạo...' : 'Hoàn Tất Đăng Ký'}
          </button>
        </form>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[12px] text-slate-400">
          <span>Đã có tài khoản quản trị?</span>
          <Link to="/login" className="text-sky-400 font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  )
}
