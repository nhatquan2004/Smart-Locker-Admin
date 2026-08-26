import type { TCreateUserPayload, TUser, TUserStatItem } from '../types/user.type'

const mockUsers: TUser[] = [
  // Super Admin & Org Admins
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

  // Users (Employees, Residents, Students)
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
    id: 'user-201', userCode: 'RES-001', fullName: 'Trần Thị B', phone: '0912345678',
    email: 'b.tran@gmail.com', role: 'user', orgId: 'org-002', companyName: 'Khu Nhà Trọ Hoàng Nam',
    unitNumber: 'Phòng 201 - Tầng 2', status: 'active', createdAt: '2026-02-15', lastActive: '15 phút trước', totalShipments: 9,
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

  // Shippers
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

export async function getUsers(companyId?: string): Promise<TUser[]> {
  if (companyId && companyId !== 'all') {
    return Promise.resolve(mockUsers.filter((u) => u.orgId === companyId))
  }
  return Promise.resolve(mockUsers)
}

export async function getUserById(id: string): Promise<TUser | undefined> {
  const found = mockUsers.find((u) => u.id === id)
  return Promise.resolve(found)
}

export async function createUser(payload: TCreateUserPayload): Promise<TUser> {
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
    lastActive: 'Vừa xong',
    totalShipments: 0,
  }
  mockUsers.unshift(newUser)
  return Promise.resolve(newUser)
}

export async function getUserStats(): Promise<TUserStatItem[]> {
  const total = mockUsers.length
  const orgAdmins = mockUsers.filter((u) => u.role === 'org_admin' || u.role === 'super_admin').length
  const normalUsers = mockUsers.filter((u) => u.role === 'user').length
  const shippers = mockUsers.filter((u) => u.role === 'shipper').length

  return Promise.resolve([
    { id: 'total-users', label: 'TỔNG TÀI KHOẢN', value: `${total}`, helper: 'Toàn bộ tài khoản hệ thống', tone: 'blue' },
    { id: 'admins', label: 'ADMIN QUẢN TRỊ', value: `${orgAdmins}`, helper: 'Super Admin & Admin đơn vị', tone: 'green' },
    { id: 'users', label: 'NGƯỜI DÙNG', value: `${normalUsers}`, helper: 'Cư dân, Nhân viên, Sinh viên', tone: 'orange' },
    { id: 'shippers', label: 'SHIPPER GIAO HÀNG', value: `${shippers}`, helper: 'Đối tác giao nhận bưu kiện', tone: 'blue' },
  ])
}
