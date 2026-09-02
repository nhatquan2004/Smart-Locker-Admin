import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import type { TAdminUser, TRole } from '../../types/auth.type'
import lockerLogo from '../../assets/locker.png'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'

// Map backend Role enum → frontend TRole
function mapBackendRole(role: string): TRole {
  switch (role) {
    case 'SYSTEM_ADMIN': return 'super_admin'
    case 'BUILDING_ADMIN': return 'org_admin'
    case 'SHIPPER': return 'shipper'
    case 'RESIDENT': return 'resident_employee'
    default: return 'org_admin'
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.'
        setError(Array.isArray(msg) ? msg.join(', ') : msg)
        return
      }

      // Map backend response → frontend TAdminUser
      const backendUser = data.user
      const adminUser: TAdminUser = {
        id: backendUser.id,
        email: backendUser.email,
        fullName: backendUser.name,
        role: mapBackendRole(backendUser.role),
        orgId: backendUser.buildingId || 'all',
        orgName: backendUser.carrierName || undefined,
      }

      login(adminUser, data.accessToken, data.refreshToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Không thể kết nối tới server. Kiểm tra backend đang chạy chưa?')
      } else {
        setError('Không thể kết nối tới server. Kiểm tra backend đang chạy chưa?')
      }
    } finally {
      setLoading(false)
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
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Đăng nhập cổng quản trị hệ thống</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[12.5px] font-semibold border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-[13px] font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all cursor-pointer shadow-md shadow-sky-600/20 active:scale-98 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

        {/* Server info hint */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Kết nối đến: <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{BASE_URL}</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-0.5">
            Đảm bảo Backend server đang chạy trước khi đăng nhập.
          </p>
        </div>

      </div>
    </div>
  )
}
