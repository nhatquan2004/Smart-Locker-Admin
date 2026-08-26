import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TAdminUser } from '../types/auth.type'

type TAuthState = {
  user: TAdminUser | null
  token: string | null
  isAuthenticated: boolean
  selectedOrgId: string // 'all' or specific org ID for filtering
  login: (user: TAdminUser, token?: string) => void
  logout: () => void
  setSelectedOrgId: (orgId: string) => void
}

const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'superadmin@smartlocker.vn'
const SUPER_ADMIN_NAME = import.meta.env.VITE_SUPER_ADMIN_NAME || 'Hoàng Quân (Super Admin)'

const defaultSuperAdmin: TAdminUser = {
  id: 'sa-01',
  email: SUPER_ADMIN_EMAIL,
  fullName: SUPER_ADMIN_NAME,
  role: 'super_admin',
  orgId: 'all',
  orgName: 'Toàn Hệ Thống (Global)',
}

export const useAuthStore = create<TAuthState>()(
  persist(
    (set) => ({
      user: defaultSuperAdmin,
      token: 'mock-jwt-token-super-admin',
      isAuthenticated: true,
      selectedOrgId: 'all',

      login: (user, token = 'mock-jwt-token') => {
        set({
          user,
          token,
          isAuthenticated: true,
          selectedOrgId: user.orgId || 'all',
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          selectedOrgId: 'all',
        })
      },

      setSelectedOrgId: (orgId) => set({ selectedOrgId: orgId }),
    }),
    {
      name: 'smart-locker-admin-auth',
    }
  )
)
