export type TUserRole =
  | 'super_admin'
  | 'org_admin'
  | 'user'
  | 'shipper'

export type TUserStatus = 'active' | 'inactive' | 'blocked'

export type TUser = {
  id: string
  userCode: string
  fullName: string
  phone: string
  email: string
  role: TUserRole
  orgId?: string
  companyName?: string
  unitNumber?: string // Department / Room number (e.g. 'Phòng Marketing - Tầng 4' or 'Phòng 101')
  status: TUserStatus
  createdAt: string
  lastActive: string
  totalShipments: number
  note?: string
  // Trạng thái duyệt gốc của server, dùng để biết có khóa/mở khóa được hay không
  approvalStatus?: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED'
  apartment?: string
}

export type TCreateUserPayload = {
  fullName: string
  phone: string
  email: string
  password?: string
  role: TUserRole
  orgId: string
  companyName: string
  unitNumber?: string
}

export type TUserFilter = {
  search: string
  companyId: string // 'all' or orgId
  role: 'all' | TUserRole
  status: 'all' | TUserStatus
}

export type TUserStatItem = {
  id: string
  label: string
  value: string
  helper: string
  tone: 'blue' | 'green' | 'orange' | 'red'
}
