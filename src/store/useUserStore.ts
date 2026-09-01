import { create } from 'zustand'
import type { TUser, TCreateUserPayload, TUserStatItem } from '../types/user.type'
import type { TResident, TCreateResidentPayload } from '../types/resident.type'

/**
 * USER & RESIDENT ZUSTAND STORE
 * -------------------------------------------------------------------------
 * ARCHITECTURE NOTE FOR FUTURE BACKEND INTEGRATION:
 * 1. Single Source of Truth cho toàn bộ User (/users) và Resident (/residents).
 * 2. Mọi thao tác cập nhật/thêm/xóa sẽ tự động trigger re-render đồng bộ trên mọi trang
 *    ngay tức thì mà không cần reload trang (F5).
 * 3. Khi tích hợp Backend REST API thật (/api/users & /api/residents), chỉ cần thay thế
 *    nội dung thực thi bên trong các hàm async này (gọi fetch/axios) mà không cần sửa lại
 *    code của các trang UI đang gọi chúng.
 * -------------------------------------------------------------------------
 */

const initialMasterUsers: TUser[] = [
  {
    id: 'user-001', userCode: 'ADM-001', fullName: 'Hoàng Quân (Super Admin)', phone: '0900000000',
    email: 'superadmin@smartlocker.vn', role: 'super_admin', orgId: 'all', companyName: 'Toàn Hệ Thống',
    unitNumber: 'Ban Quản Trị Hệ Thống', status: 'active', createdAt: '2026-01-01', lastActive: 'Vừa xong', totalShipments: 42,
  },
  {
    id: 'user-002', userCode: 'ADM-002', fullName: 'Hoàng Văn Minh', phone: '0901112233',
    email: 'admin.techcorp@smartlocker.vn', role: 'org_admin', orgId: 'org-001', companyName: 'TechCorp Office Building',
    unitNumber: 'Quản Lý Tòa Nhà TechCorp', status: 'active', createdAt: '2026-01-10', lastActive: '5 phút trước', totalShipments: 18,
  },
  {
    id: 'user-003', userCode: 'ADM-003', fullName: 'Lê Hoàng Nam', phone: '0977112233',
    email: 'hoangnam.hostel@gmail.com', role: 'org_admin', orgId: 'org-002', companyName: 'Khu Nhà Trọ Hoàng Nam',
    unitNumber: 'Chủ Khu Nhà Trọ', status: 'active', createdAt: '2026-02-01', lastActive: '12 phút trước', totalShipments: 12,
  },
  {
    id: 'user-101', userCode: 'EMP-001', fullName: 'Nguyễn Văn An', phone: '0901234567',
    email: 'an.nguyen@techcorp.com', role: 'user', orgId: 'org-001', companyName: 'TechCorp Office Building',
    unitNumber: 'Phòng Marketing - Tầng 4', status: 'active', createdAt: '2026-01-15', lastActive: '10 phút trước', totalShipments: 8,
  },
  {
    id: 'user-102', userCode: 'EMP-002', fullName: 'Phạm Thu Hà', phone: '0977001122',
    email: 'ha.pham@techcorp.com', role: 'user', orgId: 'org-001', companyName: 'TechCorp Office Building',
    unitNumber: 'Phòng Kế Toán - Tầng 3', status: 'active', createdAt: '2026-01-18', lastActive: '1 giờ trước', totalShipments: 5,
  },
  {
    id: 'user-103', userCode: 'EMP-003', fullName: 'Phạm Văn C', phone: '0987654321',
    email: 'c.pham@techcorp.com', role: 'user', orgId: 'org-001', companyName: 'TechCorp Office Building',
    unitNumber: 'Phòng Công Nghệ - Tầng 5', status: 'active', createdAt: '2026-02-01', lastActive: '2 giờ trước', totalShipments: 6,
  },
  {
    id: 'user-201', userCode: 'RES-001', fullName: 'Trần Thị Bích', phone: '0912345678',
    email: 'tranthibich@gmail.com', role: 'user', orgId: 'org-002', companyName: 'Khu Nhà Trọ Hoàng Nam',
    unitNumber: 'Phòng 102 - Tầng 1', status: 'active', createdAt: '2026-02-15', lastActive: '15 phút trước', totalShipments: 9,
  },
  {
    id: 'user-202', userCode: 'RES-002', fullName: 'Lê Minh Khánh', phone: '0988123456',
    email: 'khanh.le@gmail.com', role: 'user', orgId: 'org-002', companyName: 'Khu Nhà Trọ Hoàng Nam',
    unitNumber: 'Phòng 304 - Tầng 3', status: 'active', createdAt: '2026-02-20', lastActive: 'Hôm qua', totalShipments: 3,
  },
  {
    id: 'user-301', userCode: 'STU-001', fullName: 'Vũ Minh Đức', phone: '0933445566',
    email: 'duc.vm2100@sis.hust.edu.vn', role: 'user', orgId: 'org-003', companyName: 'Ký Túc Xá Đại Học Bách Khoa',
    unitNumber: 'KTX A3 - Phòng 402', status: 'active', createdAt: '2026-03-01', lastActive: '30 phút trước', totalShipments: 7,
  },
  {
    id: 'user-401', userCode: 'SHP-001', fullName: 'Shipper Nguyễn Văn Minh', phone: '0909998877',
    email: 'minh.shipper@ghn.vn', role: 'shipper', orgId: 'all', companyName: 'Giao Hàng Nhanh (GHN)',
    unitNumber: 'Đội Giao Hàng Cầu Giấy', status: 'active', createdAt: '2026-01-05', lastActive: '3 phút trước', totalShipments: 124,
  },
  {
    id: 'user-402', userCode: 'SHP-002', fullName: 'Shipper Trần Quốc Long', phone: '0911223344',
    email: 'long.shipper@shopee.vn', role: 'shipper', orgId: 'all', companyName: 'Shopee Express',
    unitNumber: 'Đội Giao Hàng Hoàng Quốc Việt', status: 'active', createdAt: '2026-01-10', lastActive: '8 phút trước', totalShipments: 98,
  },
]

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
      orgName: u.companyName || 'Đơn Vị',
      unitNumber: u.unitNumber || 'Tầng 1',
      role: residentRole,
      status: u.status,
      createdAt: u.createdAt,
      lastActive: u.lastActive,
      note: u.note || `Tài khoản ${u.role}`,
    }
  })
}

export type TUserStore = {
  users: TUser[]
  isLoading: boolean

  // Generic data access & mutation actions
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
  users: initialMasterUsers,
  isLoading: false,

  fetchUsers: async (companyId?: string) => {
    const all = get().users
    if (companyId && companyId !== 'all') {
      return all.filter((u) => u.orgId === companyId)
    }
    return all
  },

  fetchResidents: async (orgId?: string) => {
    return mapUsersToResidents(get().users, orgId)
  },

  getUserById: async (id: string) => {
    return get().users.find((u) => u.id === id)
  },

  getUserStats: async () => {
    const all = get().users
    const total = all.length
    const orgAdmins = all.filter((u) => u.role === 'org_admin' || u.role === 'super_admin').length
    const normalUsers = all.filter((u) => u.role === 'user').length
    const shippers = all.filter((u) => u.role === 'shipper').length

    return [
      { id: 'total-users', label: 'TỔNG TÀI KHOẢN', value: `${total}`, helper: 'Toàn bộ tài khoản hệ thống', tone: 'blue' },
      { id: 'admins', label: 'ADMIN QUẢN TRỊ', value: `${orgAdmins}`, helper: 'Super Admin & Admin đơn vị', tone: 'green' },
      { id: 'users', label: 'NGƯỜI DÙNG', value: `${normalUsers}`, helper: 'Cư dân, Nhân viên, Sinh viên', tone: 'orange' },
      { id: 'shippers', label: 'SHIPPER GIAO HÀNG', value: `${shippers}`, helper: 'Đối tác giao nhận bưu kiện', tone: 'blue' },
    ]
  },

  createUser: async (payload: TCreateUserPayload) => {
    const newId = `user-${Date.now()}`
    const newCode = `USR-${Math.floor(100 + Math.random() * 900)}`
    const newUser: TUser = {
      id: newId,
      userCode: newCode,
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      role: payload.role || 'user',
      orgId: payload.orgId,
      companyName: payload.companyName,
      unitNumber: payload.unitNumber || 'Vị trí / Phòng',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Vừa tạo',
      totalShipments: 0,
    }

    set((state) => ({ users: [newUser, ...state.users] }))
    return newUser
  },

  createResident: async (payload: TCreateResidentPayload) => {
    const newId = `user-${Date.now()}`
    const newCode = `RES-${Math.floor(100 + Math.random() * 900)}`
    const newUser: TUser = {
      id: newId,
      userCode: newCode,
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email || `${payload.phone}@smartlocker.vn`,
      role: payload.role === 'shipper' ? 'shipper' : 'user',
      orgId: payload.orgId,
      companyName: payload.orgName,
      unitNumber: payload.unitNumber,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Vừa tạo',
      totalShipments: 0,
      note: payload.note,
    }

    set((state) => ({ users: [newUser, ...state.users] }))
    const residents = mapUsersToResidents(get().users)
    return residents[0]
  },

  updateUser: async (idOrPhone: string, updates: Partial<TUser> & { orgName?: string }) => {
    let updated = false
    set((state) => {
      const nextUsers = state.users.map((u) => {
        if (u.id === idOrPhone || u.phone === idOrPhone) {
          updated = true
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
    return updated
  },

  deleteUser: async (idOrPhone: string) => {
    let deleted = false
    set((state) => {
      const nextUsers = state.users.filter((u) => {
        if (u.id === idOrPhone || u.phone === idOrPhone) {
          deleted = true
          return false
        }
        return true
      })
      return { users: nextUsers }
    })
    return deleted
  },
}))
