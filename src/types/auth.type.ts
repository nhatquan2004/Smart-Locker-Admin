import type { TOrgType } from './organization.type'

export type TRole = 'super_admin' | 'org_admin' | 'shipper' | 'resident_employee'

export type TAdminUser = {
  id: string
  email: string
  fullName: string
  role: TRole
  orgId: string // 'all' for super_admin, or 'org-001' etc.
  orgName?: string
  orgType?: TOrgType
  avatar?: string
}
