import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TAdminUser } from '../types/auth.type'

type TAuthState = {
  user: TAdminUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  selectedOrgId: string
  login: (user: TAdminUser, token: string, refreshToken: string) => void
  updateTokens: (token: string, refreshToken: string) => void
  logout: () => void
  setSelectedOrgId: (orgId: string) => void
}

export const useAuthStore = create<TAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      selectedOrgId: 'all',

      login: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          selectedOrgId: user.orgId || 'all',
        })
      },

      updateTokens: (token, refreshToken) => {
        set({ token, refreshToken })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
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
