import type { TBankAccount } from '../service/payment.service'

export type TOrgType = 'enterprise' | 'dormitory' | 'apartment' | 'commercial'

export type TOrganization = {
  id: string
  code: string
  name: string
  type: TOrgType
  address: string
  latitude?: number
  longitude?: number
  totalLockers: number
  totalMembers: number
  adminEmail: string
  adminName: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type TCreateOrgPayload = {
  name: string
  code: string
  type: TOrgType
  address: string
  latitude?: number
  longitude?: number
  totalFloors: number
  totalApartments: number
  hotline?: string
  // Server bắt buộc có tài khoản nhận tiền khi tạo tòa nhà
  bankAccount: TBankAccount
  adminEmail: string
  adminName: string
}
