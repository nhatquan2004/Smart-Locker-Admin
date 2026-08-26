export type TResidentRole = 'resident' | 'employee' | 'student' | 'shipper'

export type TResident = {
  id: string
  code: string // e.g. RES-101, EMP-001, SV-2026
  fullName: string
  phone: string
  email: string
  orgId: string
  orgName: string
  unitNumber: string // e.g. "Phòng 302", "Tầng 5 - Dept Marketing", "Khu A - P402"
  role: TResidentRole
  assignedLockerCode?: string
  status: 'active' | 'inactive' | 'blocked'
  createdAt: string
  lastActive: string
  note?: string
}

export type TCreateResidentPayload = {
  fullName: string
  phone: string
  email?: string
  orgId: string
  orgName: string
  unitNumber: string
  role: TResidentRole
  note?: string
}
