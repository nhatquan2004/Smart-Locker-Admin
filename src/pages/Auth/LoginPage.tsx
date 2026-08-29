import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import type { TAdminUser } from '../../types/auth.type'
import lockerLogo from '../../assets/locker.png'
import { Lock, Mail, ArrowRight } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'superadmin@smartlocker.vn'
  const SUPER_ADMIN_PASS = import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'SuperAdmin@2026'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Email / Tên đăng nhập và Mật khẩu.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)

      const inputVal = email.toLowerCase().trim()

      // 1. Super Admin
      if (inputVal === SUPER_ADMIN_EMAIL.toLowerCase() || inputVal === 'superadmin') {
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

      // 2. Admin Quản Lý Shipper (Shipper Station Admin)
      if (inputVal.includes('shipper') || inputVal.includes('manager')) {
        const shipperAdminUser: TAdminUser = {
          id: 'sa-mgr-01',
          email: 'shipper.manager@smartlocker.vn',
          fullName: 'Vũ Quốc Huy (Quản Lý Trạm Shipper)',
          role: 'shipper_admin',
          orgId: 'org-001',
          orgName: 'Trạm Giao Nhận Shipper Central Hub',
        }
        login(shipperAdminUser)
        navigate('/dashboard')
        return
      }

      // 3. Admin Khu Trọ / Tòa Nhà (Building Admin)
      if (inputVal.includes('hoangnam') || inputVal.includes('tro')) {
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

      // Default Org Admin Login
      const defaultUser: TAdminUser = {
        id: 'oa-01',
        email: email,
        fullName: email.includes('@') ? email.split('@')[0] : email,
        role: 'org_admin',
        orgId: 'org-001',
        orgName: 'TechCorp Office Building',
        orgType: 'enterprise',
      }
      login(defaultUser)
      navigate('/dashboard')
    }, 500)
  }

  function fillDemo(role: 'super' | 'shipper_admin' | 'hostel') {
    if (role === 'super') {
      setEmail(SUPER_ADMIN_EMAIL)
      setPassword(SUPER_ADMIN_PASS)
    } else if (role === 'shipper_admin') {
      setEmail('shipper.manager@smartlocker.vn')
      setPassword('ShipperAdmin@2026')
    } else {
      setEmail('hoangnam.hostel@gmail.com')
      setPassword('Hostel@2026')
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
      
      {/* Background soft glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-sky-200/40 dark:bg-sky-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div data-reveal className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 relative z-10 flex flex-col gap-6 shadow-xl border border-slate-200 dark:border-slate-800">
        
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white p-1 shadow-md border border-slate-100 dark:border-slate-800">
            <img src={lockerLogo} alt="Smart Locker" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">Smart Locker Admin</h1>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Đăng nhập cổng quản trị Super Admin & Quản lý Trạm</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[12px] font-bold border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Standard Single Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Email / Tên đăng nhập</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Nhập email hoặc tên đăng nhập..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-[13px] font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all cursor-pointer shadow-md shadow-sky-600/20 active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Chips Toolbar */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Tài khoản thử nghiệm nhanh (Demo):</span>
          <div className="grid grid-cols-3 gap-1.5 mt-0.5">
            <button
              type="button"
              onClick={() => fillDemo('super')}
              className="py-1.5 px-2 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-[11px] truncate cursor-pointer"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('shipper_admin')}
              className="py-1.5 px-2 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all text-[11px] truncate cursor-pointer"
            >
              QL Shipper
            </button>
            <button
              type="button"
              onClick={() => fillDemo('hostel')}
              className="py-1.5 px-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-[11px] truncate cursor-pointer"
            >
              Admin Trọ
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
