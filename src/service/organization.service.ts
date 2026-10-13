import type { TCreateOrgPayload, TOrganization } from '../types/organization.type'
import { apiClient } from './api.client'

const mockOrganizations: TOrganization[] = [
  {
    id: 'org-001',
    code: 'TECHCORP',
    name: 'TechCorp Office Building',
    type: 'enterprise',
    address: 'Số 10 Tòa nhà TechCorp, Quận Cầu Giấy, Hà Nội',
    totalLockers: 16,
    totalMembers: 142,
    adminEmail: 'admin.techcorp@smartlocker.vn',
    adminName: 'Trần Văn Minh',
    status: 'active',
    createdAt: '2026-01-15 08:30',
  },
  {
    id: 'org-002',
    code: 'HOANGNAM',
    name: 'Khu Nhà Trọ Hoàng Nam',
    type: 'apartment',
    address: 'Số 45 Ngõ 120 Đường Hoàng Quốc Việt, Hà Nội',
    totalLockers: 12,
    totalMembers: 48,
    adminEmail: 'hoangnam.hostel@gmail.com',
    adminName: 'Nguyễn Hoàng Nam',
    status: 'active',
    createdAt: '2026-02-01 10:15',
  },
  {
    id: 'org-003',
    code: 'KTX-BACHKHOA',
    name: 'Ký Túc Xá Đại Học Bách Khoa',
    type: 'dormitory',
    address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
    totalLockers: 20,
    totalMembers: 320,
    adminEmail: 'bql.ktx@hust.edu.vn',
    adminName: 'Lê Thanh Tùng',
    status: 'active',
    createdAt: '2026-02-10 14:00',
  },
  {
    id: 'org-004',
    code: 'AEON-MALL',
    name: 'Trung Tâm Thương Mại Aeon',
    type: 'commercial',
    address: 'Số 27 Cổ Linh, Long Biên, Hà Nội',
    totalLockers: 24,
    totalMembers: 95,
    adminEmail: 'contact@aeonmall.vn',
    adminName: 'Phạm Thu Trang',
    status: 'active',
    createdAt: '2026-03-05 09:20',
  },
]

let orgStore = [...mockOrganizations]

export async function getOrganizations(): Promise<TOrganization[]> {
  try {
    const res = await apiClient.get<any[]>('/buildings')
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((b) => ({
        id: b._id || b.id,
        code: b.code || 'BLD',
        name: b.name,
        type: 'enterprise',
        address: b.address || '—',
        totalLockers: b.totalFloors || 10,
        totalMembers: b.totalApartments || 0,
        adminEmail: b.managementEmail || 'admin@smartlocker.vn',
        adminName: 'Ban Quản Lý',
        status: b.status === 'ACTIVE' ? 'active' : 'inactive',
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString().replace('T', ' ').slice(0, 16) : '2026-01-01',
      }))
    }
  } catch (err) {
    console.warn('Could not fetch buildings from backend, falling back to local list', err)
  }
  return [...orgStore]
}

export async function createOrganization(payload: TCreateOrgPayload): Promise<TOrganization> {
  try {
    const res = await apiClient.post<any>('/buildings', {
      name: payload.name,
      code: payload.code.toUpperCase(),
      address: payload.address,
      totalFloors: payload.totalLockers || 10,
      totalApartments: 50,
      managementEmail: payload.adminEmail,
    })
    const b = res.data
    const newOrg: TOrganization = {
      id: b._id || b.id,
      code: b.code,
      name: b.name,
      type: payload.type,
      address: b.address,
      totalLockers: b.totalFloors || payload.totalLockers,
      totalMembers: b.totalApartments || 0,
      adminEmail: payload.adminEmail,
      adminName: payload.adminName,
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }
    return newOrg
  } catch {
    const newOrg: TOrganization = {
      id: `org-${Date.now().toString().slice(-4)}`,
      code: payload.code.toUpperCase(),
      name: payload.name,
      type: payload.type,
      address: payload.address,
      totalLockers: payload.totalLockers,
      totalMembers: 0,
      adminEmail: payload.adminEmail,
      adminName: payload.adminName,
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }
    orgStore = [newOrg, ...orgStore]
    return newOrg
  }
}

export async function deleteOrganization(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/buildings/${id}`)
    return true
  } catch {
    orgStore = orgStore.filter((o) => o.id !== id)
    return true
  }
}
