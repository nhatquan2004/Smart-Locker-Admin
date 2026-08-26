import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import type { TAdminUser } from '../../types/auth.type'
import lockerLogo from '../../assets/locker.png'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'superadmin@smartlocker.vn'
  const SUPER_ADMIN_PASS = import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'SuperAdmin@2026'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)

      if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && password === SUPER_ADMIN_PASS) {
        const superAdminUser: TAdminUser = {
          id: 'sa-01',
          email: SUPER_ADMIN_EMAIL,
          fullName: 'Hoàng Quân (Super Admin)',
          role: 'super_admin',
          orgId: 'all',
          orgName: 'Toàn Hệ Thống (Global)',
        }
        login(superAdminUser)
        navigate('/dashboard')
        return
      }

      if (email.includes('techcorp')) {
        const orgUser: TAdminUser = {
          id: 'oa-01',
          email: 'admin.techcorp@smartlocker.vn',
          fullName: 'Trần Văn Minh (Admin TechCorp)',
          role: 'org_admin',
          orgId: 'org-001',
          orgName: 'TechCorp Office Building',
          orgType: 'enterprise',
        }
        login(orgUser)
        navigate('/dashboard')
        return
      }

      if (email.includes('hoangnam')) {
        const hostelUser: TAdminUser = {
          id: 'oa-02',
          email: 'hoangnam.hostel@gmail.com',
          fullName: 'Nguyễn Hoàng Nam (Chủ Khu Trọ)',
          role: 'org_admin',
          orgId: 'org-002',
          orgName: 'Khu Nhà Trọ Hoàng Nam',
          orgType: 'apartment',
        }
        login(hostelUser)
        navigate('/dashboard')
        return
      }

      const demoUser: TAdminUser = {
        id: `usr-${Date.now()}`,
        email: email,
        fullName: email.split('@')[0],
        role: 'org_admin',
        orgId: 'org-001',
        orgName: 'Tổ Chức Đăng Nhập',
      }
      login(demoUser)
      navigate('/dashboard')
    }, 600)
  }

  function fillDemoSuperAdmin() {
    setEmail(SUPER_ADMIN_EMAIL)
    setPassword(SUPER_ADMIN_PASS)
  }

  function fillDemoTechCorp() {
    setEmail('admin.techcorp@smartlocker.vn')
    setPassword('TechCorp@2026')
  }

  function fillDemoHostel() {
    setEmail('hoangnam.hostel@gmail.com')
    setPassword('Hostel@2026')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-100">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div data-reveal className="w-full max-w-md p-8 rounded-3xl bg-white relative z-10 flex flex-col gap-6 shadow-xl border border-slate-200">
        
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white p-1 shadow-md border border-slate-100">
            <img src={lockerLogo} alt="Smart Locker" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Smart Locker Admin</h1>
            <p className="text-[12px] text-slate-500 mt-1">Đăng nhập vào Hệ thống Quản trị Tủ đồ Thông minh</p>
          </div>
        </div>

        {/* Demo buttons toolbar */}
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px]">
          <span className="eyebrow text-sky-600 font-bold">Quick Demo Logins</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <button
              type="button"
              onClick={fillDemoSuperAdmin}
              className="px-2.5 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-all text-[11px] font-mono font-bold shadow-2xs"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={fillDemoTechCorp}
              className="px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition-all text-[11px] font-medium"
            >
              Admin TechCorp
            </button>
            <button
              type="button"
              onClick={fillDemoHostel}
              className="px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition-all text-[11px] font-medium"
            >
              Admin Khu Trọ
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] text-center leading-relaxed font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-600">
              Email quản trị
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap.email@smartlocker.vn"
              className="h-11 px-4 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-slate-600">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-sky-600 hover:text-sky-700 transition-colors font-medium"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 px-4 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 mt-2 rounded-xl text-[13px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-md shadow-sky-600/20 active:scale-[0.98] shimmer-btn flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
          </button>
        </form>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[12px] text-slate-500">
          <span>Chưa có tài khoản Doanh nghiệp?</span>
          <Link to="/register" className="text-sky-600 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  )
}
