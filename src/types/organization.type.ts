export type TOrgType = 'enterprise' | 'dormitory' | 'apartment' | 'commercial'

export type TOrganization = {
  id: string
  code: string
  name: string
  type: TOrgType
  address: string
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
  totalLockers: number
  adminEmail: string
  adminName: string
}
