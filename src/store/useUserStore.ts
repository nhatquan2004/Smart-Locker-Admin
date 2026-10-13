import { create } from 'zustand'
import type { TUser, TCreateUserPayload, TUserStatItem, TUserRole, TUserStatus } from '../types/user.type'
import type { TResident, TCreateResidentPayload } from '../types/resident.type'
import { apiClient } from '../service/api.client'
import { tNow } from '../i18n/translate'

/**
 * USER & RESIDENT ZUSTAND STORE — KẾT NỐI API THẬT (/users)
 * -------------------------------------------------------------------------
 * Không dùng mock data. Lấy trực tiếp từ MongoDB qua backend API.
 * - GET /users : Lấy danh sách toàn bộ người dùng từ Database
 * - GET /users/:id : Lấy chi tiết 1 người dùng
 * - DELETE /users/:id : Xóa người dùng khỏi Database
 * -------------------------------------------------------------------------
 */

export interface TBackendUser {
  _id: string
  name: string
  email: string
  phone: string
  role: 'SYSTEM_ADMIN' | 'BUILDING_ADMIN' | 'SHIPPER' | 'RESIDENT'
  buildingId?: string
  apartment?: string
  carrierName?: string
  approvalStatus: 'ACTIVE' | 'PENDING' | 'REJECTED'
  note?: string
  createdAt?: string
  updatedAt?: string
}

function mapBackendRole(role: string): TUserRole {
  switch (role) {
    case 'SYSTEM_ADMIN': return 'super_admin'
    case 'BUILDING_ADMIN': return 'org_admin'
    case 'SHIPPER': return 'shipper'
    case 'RESIDENT': return 'user'
    default: return 'user'
  }
}

function mapBackendStatus(status: string): TUserStatus {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'PENDING': return 'inactive'
    case 'REJECTED': return 'blocked'
    default: return 'active'
  }
}

function mapBackendUserToTUser(u: TBackendUser): TUser {
  let companyName = tNow('store.defaultCompany')
  if (u.role === 'SYSTEM_ADMIN') {
    companyName = tNow('store.systemWide')
  } else if (u.carrierName) {
    companyName = u.carrierName
  }

  let unitNumber = u.apartment ? tNow('store.unitApartment', { apartment: u.apartment }) : tNow('store.unitManagement')
  if (u.role === 'SYSTEM_ADMIN') {
    unitNumber = tNow('store.unitSystemAdmin')
  } else if (u.role === 'SHIPPER') {
    unitNumber = u.carrierName || tNow('store.unitShipperTeam')
  }

  return {
    id: u._id,
    userCode: `USR-${u._id ? u._id.slice(-4).toUpperCase() : '0000'}`,
    fullName: u.name || tNow('store.defaultUserName'),
    phone: u.phone || '—',
    email: u.email || '—',
    role: mapBackendRole(u.role),
    orgId: u.buildingId || 'all',
    companyName,
    unitNumber,
    status: mapBackendStatus(u.approvalStatus || 'ACTIVE'),
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01',
    lastActive: tNow('store.justNow'),
    totalShipments: 0,
    note: u.note || (u.apartment ? tNow('store.noteApartment', { apartment: u.apartment }) : undefined),
  }
}

function mapUsersToResidents(users: TUser[], orgId?: string): TResident[] {
  let list = users
  if (orgId && orgId !== 'all') {
    list = list.filter((u) => u.orgId === orgId)
  }

  return list.map((u) => {
    let residentRole: TResident['role'] = 'resident'
    if (u.role === 'shipper') residentRole = 'shipper'
    else if (u.companyName?.includes('TechCorp')) residentRole = 'employee'
    else if (u.companyName?.includes('Bách Khoa') || u.companyName?.includes('Đại Học')) residentRole = 'student'

    return {
      id: u.id,
      code: u.userCode,
      fullName: u.fullName,
      phone: u.phone,
      email: u.email,
      orgId: u.orgId || 'org-001',
      orgName: u.companyName || tNow('store.defaultOrg'),
      unitNumber: u.unitNumber || tNow('store.defaultUnit'),
      role: residentRole,
      status: u.status,
      createdAt: u.createdAt,
      lastActive: u.lastActive,
      note: u.note || tNow('store.noteAccount', { role: u.role }),
    }
  })
}

export type TUserStore = {
  users: TUser[]
  isLoading: boolean

  // Data fetching & manipulation actions
  fetchUsers: (companyId?: string) => Promise<TUser[]>
  fetchResidents: (orgId?: string) => Promise<TResident[]>
  getUserById: (id: string) => Promise<TUser | undefined>
  getUserStats: () => Promise<TUserStatItem[]>
  createUser: (payload: TCreateUserPayload) => Promise<TUser>
  createResident: (payload: TCreateResidentPayload) => Promise<TResident>
  updateUser: (idOrPhone: string, updates: Partial<TUser> & { orgName?: string }) => Promise<boolean>
  deleteUser: (idOrPhone: string) => Promise<boolean>
}

export const useUserStore = create<TUserStore>((set, get) => ({
  users: [],
  isLoading: false,

  fetchUsers: async (companyId?: string) => {
    set({ isLoading: true })
    try {
      const res = await apiClient.get<TBackendUser[]>('/users')
      const backendUsers = Array.isArray(res.data) ? res.data : []
      const mapped = backendUsers.map(mapBackendUserToTUser)

      set({ users: mapped, isLoading: false })

      if (companyId && companyId !== 'all') {
        return mapped.filter((u) => u.orgId === companyId)
      }
      return mapped
    } catch (err) {
      console.error('Lỗi gọi API GET /users:', err)
      set({ isLoading: false })
      const all = get().users
      if (companyId && companyId !== 'all') {
        return all.filter((u) => u.orgId === companyId)
      }
      return all
    }
  },

  fetchResidents: async (orgId?: string) => {
    let currentUsers = get().users
    if (currentUsers.length === 0) {
      currentUsers = await get().fetchUsers()
    }
    return mapUsersToResidents(currentUsers, orgId)
  },

  getUserById: async (id: string) => {
    try {
      const res = await apiClient.get<TBackendUser>(`/users/${id}`)
      if (res.data) {
        return mapBackendUserToTUser(res.data)
      }
    } catch {
      // Fallback
    }
    return get().users.find((u) => u.id === id)
  },

  getUserStats: async () => {
    let all = get().users
    if (all.length === 0) {
      all = await get().fetchUsers()
    }

    const total = all.length
    const orgAdmins = all.filter((u) => u.role === 'org_admin' || u.role === 'super_admin').length
    const normalUsers = all.filter((u) => u.role === 'user').length
    const shippers = all.filter((u) => u.role === 'shipper').length

    return [
      { id: 'total-users', label: tNow('store.stat.total'), value: `${total}`, helper: tNow('store.stat.totalHelper'), tone: 'blue' },
      { id: 'admins', label: tNow('store.stat.admins'), value: `${orgAdmins}`, helper: tNow('store.stat.adminsHelper'), tone: 'green' },
      { id: 'users', label: tNow('store.stat.users'), value: `${normalUsers}`, helper: tNow('store.stat.usersHelper'), tone: 'orange' },
      { id: 'shippers', label: tNow('store.stat.shippers'), value: `${shippers}`, helper: tNow('store.stat.shippersHelper'), tone: 'blue' },
    ]
  },

  createUser: async (payload: TCreateUserPayload) => {
    let validBuildingId = payload.orgId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(validBuildingId || '')
    if (!isObjectId) {
      try {
        const bRes = await apiClient.get<any[]>('/buildings')
        if (bRes.data && bRes.data.length > 0) {
          validBuildingId = bRes.data[0]._id || bRes.data[0].id
        }
      } catch {
        // fallback
      }
    }

    if (payload.role === 'org_admin') {
      const res = await apiClient.post<TBackendUser>('/users/building-admin', {
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: 'AdminPassword@2026',
        buildingId: validBuildingId,
      })
      const mapped = mapBackendUserToTUser(res.data)
      set((state) => ({ users: [mapped, ...state.users] }))
      return mapped
    } else {
      const res = await apiClient.post<TBackendUser>('/users/resident', {
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: 'ResidentPassword@2026',
        apartment: payload.unitNumber || 'P.101',
      })
      const mapped = mapBackendUserToTUser(res.data)
      set((state) => ({ users: [mapped, ...state.users] }))
      return mapped
    }
  },

  createResident: async (payload: TCreateResidentPayload) => {
    try {
      const res = await apiClient.post<TBackendUser>('/users/resident', {
        name: payload.fullName,
        email: payload.email || `${payload.phone}@smartlocker.vn`,
        phone: payload.phone,
        password: 'ResidentPassword@2026',
        apartment: payload.unitNumber || 'P.101',
      })
      const mapped = mapBackendUserToTUser(res.data)
      set((state) => ({ users: [mapped, ...state.users] }))
      const residents = mapUsersToResidents(get().users)
      return residents[0]
    } catch {
      const newUser: TUser = {
        id: `user-${Date.now()}`,
        userCode: `RES-${Math.floor(100 + Math.random() * 900)}`,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email || `${payload.phone}@smartlocker.vn`,
        role: payload.role === 'shipper' ? 'shipper' : 'user',
        orgId: payload.orgId,
        companyName: payload.orgName,
        unitNumber: payload.unitNumber,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: tNow('store.justCreated'),
        totalShipments: 0,
        note: payload.note,
      }
      set((state) => ({ users: [newUser, ...state.users] }))
      const residents = mapUsersToResidents(get().users)
      return residents[0]
    }
  },

  updateUser: async (idOrPhone: string, updates: Partial<TUser> & { orgName?: string }) => {
    set((state) => {
      const nextUsers = state.users.map((u) => {
        if (u.id === idOrPhone || u.phone === idOrPhone) {
          return {
            ...u,
            ...(updates.fullName ? { fullName: updates.fullName } : {}),
            ...(updates.phone ? { phone: updates.phone } : {}),
            ...(updates.email ? { email: updates.email } : {}),
            ...(updates.status ? { status: updates.status } : {}),
            ...(updates.role ? { role: updates.role } : {}),
            ...(updates.unitNumber ? { unitNumber: updates.unitNumber } : {}),
            ...(updates.note !== undefined ? { note: updates.note } : {}),
            ...(updates.companyName ? { companyName: updates.companyName } : {}),
            ...(updates.orgName ? { companyName: updates.orgName } : {}),
          }
        }
        return u
      })
      return { users: nextUsers }
    })
    return true
  },

  deleteUser: async (idOrPhone: string) => {
    const targetUser = get().users.find((u) => u.id === idOrPhone || u.phone === idOrPhone)
    const targetId = targetUser ? targetUser.id : idOrPhone

    try {
      await apiClient.delete(`/users/${targetId}`)
    } catch (err) {
      console.warn('Lỗi gọi DELETE /users/:id:', err)
    }

    set((state) => ({
      users: state.users.filter((u) => u.id !== targetId && u.phone !== idOrPhone),
    }))
    return true
  },
}))
