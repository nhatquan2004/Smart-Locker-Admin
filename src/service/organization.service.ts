import type { TCreateOrgPayload, TOrganization } from '../types/organization.type'

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
  return new Promise((resolve) => {
    setTimeout(() => resolve([...orgStore]), 300)
  })
}

export async function createOrganization(payload: TCreateOrgPayload): Promise<TOrganization> {
  return new Promise((resolve) => {
    setTimeout(() => {
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
      resolve(newOrg)
    }, 400)
  })
}

export async function deleteOrganization(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      orgStore = orgStore.filter((o) => o.id !== id)
      resolve(true)
    }, 300)
  })
}
