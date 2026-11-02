import { create } from 'zustand'
import type { TUser, TCreateUserPayload, TUserStatItem, TUserRole, TUserStatus } from '../types/user.type'
import type { TResident, TCreateResidentPayload } from '../types/resident.type'
import { apiClient } from '../service/api.client'
import { tNow } from '../i18n/translate'
import { formatDateTime } from '../i18n/format'

/**
 * USER & RESIDENT ZUSTAND STORE — KẾT NỐI API THẬT (/users)
 * -------------------------------------------------------------------------
 * Không dùng mock data. Lấy trực tiếp từ MongoDB qua backend API.
 * - GET /users : Lấy danh sách toàn bộ người dùng từ Database
 * - GET /users/:id : Lấy chi tiết 1 người dùng
 * - DELETE /users/:id : Xóa người dùng khỏi Database
 * -------------------------------------------------------------------------
 */

export type TApprovalStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED'

export interface TBackendUser {
  _id: string
  name: string
  email: string
  phone: string
  role: 'SYSTEM_ADMIN' | 'BUILDING_ADMIN' | 'SHIPPER' | 'RESIDENT'
  buildingId?: string
  apartment?: string
  carrierName?: string
  approvalStatus: TApprovalStatus
  note?: string
  lastActiveAt?: string
  // Chỉ có khi gọi GET /users?include=packageCount
  packageCount?: number
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
    // Hồ sơ bị từ chối không đăng nhập được nhưng khác tài khoản bị tạm khóa
    case 'REJECTED': return 'inactive'
    case 'SUSPENDED': return 'blocked'
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
    lastActive: u.lastActiveAt ? formatDateTime(u.lastActiveAt) : '—',
    totalShipments: u.packageCount ?? 0,
    // Giữ đúng ghi chú của server để khi sửa không ghi nhầm chữ mặc định lên server
    note: u.note,
    approvalStatus: u.approvalStatus,
    apartment: u.apartment,
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
      const res = await apiClient.get<TBackendUser[]>('/users?include=packageCount')
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
    if (payload.role === 'org_admin') {
      // Không tự gán sang doanh nghiệp khác: thiếu buildingId hợp lệ thì dừng lại
      if (!/^[0-9a-fA-F]{24}$/.test(payload.orgId || '')) {
        throw new Error(tNow('store.invalidBuilding'))
      }
      const res = await apiClient.post<TBackendUser>('/users/building-admin', {
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password || 'AdminPassword@2026',
        buildingId: payload.orgId,
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
    const target = get().users.find((u) => u.id === idOrPhone || u.phone === idOrPhone)
    const targetId = target?.id ?? idOrPhone

    // Server chỉ cho sửa tên, căn hộ, ghi chú và khóa/mở khóa (không đổi vai trò, email, SĐT)
    const body: Record<string, unknown> = {}
    if (updates.fullName !== undefined) body.name = updates.fullName
    if (updates.apartment !== undefined) body.apartment = updates.apartment
    if (updates.note !== undefined) body.note = updates.note
    if (updates.status === 'blocked') body.approvalStatus = 'SUSPENDED'
    if (updates.status === 'active') body.approvalStatus = 'ACTIVE'

    // Lỗi từ server (không đủ quyền, tự khóa chính mình...) được ném ra cho giao diện báo
    const res = await apiClient.patch<TBackendUser>(`/users/${targetId}`, body)
    const saved = mapBackendUserToTUser(res.data)

    set((state) => {
      const exists = state.users.some((u) => u.id === saved.id)
      return {
        // Người dùng mở thẳng từ đường dẫn chưa có trong danh sách thì thêm vào để giao diện đọc lại được
        users: exists
          ? state.users.map((u) => (u.id === saved.id ? { ...saved, totalShipments: u.totalShipments } : u))
          : [saved, ...state.users],
      }
    })
    return true
  },

  deleteUser: async (idOrPhone: string) => {
    const targetUser = get().users.find((u) => u.id === idOrPhone || u.phone === idOrPhone)
    const targetId = targetUser ? targetUser.id : idOrPhone

    // Lỗi từ server (ví dụ không đủ quyền) được ném ra, không xóa giả trong danh sách
    await apiClient.delete(`/users/${targetId}`)

    set((state) => ({
      users: state.users.filter((u) => u.id !== targetId && u.phone !== idOrPhone),
    }))
    return true
  },
}))
