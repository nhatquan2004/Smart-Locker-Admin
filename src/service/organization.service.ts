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

type TApiBuilding = {
  _id?: string
  id?: string
  code?: string
  name: string
  address?: string
  totalApartments?: number
  managementEmail?: string
  status?: string
  createdAt?: string
  // GeoJSON: [kinh độ, vĩ độ]
  location?: { coordinates?: [number, number] }
}

function formatCreatedAt(value?: string): string {
  return value ? new Date(value).toISOString().replace('T', ' ').slice(0, 16) : '2026-01-01'
}

// Đếm số trạm tủ của từng doanh nghiệp từ GET /lockers
async function countLockersByBuilding(): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  try {
    const res = await apiClient.get<{ buildingId?: { _id?: string } | string }[]>('/lockers')
    for (const l of res.data ?? []) {
      const bid = typeof l.buildingId === 'string' ? l.buildingId : l.buildingId?._id
      if (bid) counts.set(bid, (counts.get(bid) ?? 0) + 1)
    }
  } catch {
    // Không lấy được danh sách tủ thì để số tủ bằng 0
  }
  return counts
}

export async function getOrganizations(): Promise<TOrganization[]> {
  try {
    const [res, lockerCounts] = await Promise.all([
      apiClient.get<TApiBuilding[]>('/buildings'),
      countLockersByBuilding(),
    ])
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((b) => {
        const id = (b._id || b.id) as string
        const coords = b.location?.coordinates
        return {
          id,
          code: b.code || 'BLD',
          name: b.name,
          type: 'enterprise',
          address: b.address || '—',
          latitude: coords?.[1],
          longitude: coords?.[0],
          totalLockers: lockerCounts.get(id) ?? 0,
          totalMembers: b.totalApartments || 0,
          adminEmail: b.managementEmail || 'admin@smartlocker.vn',
          adminName: 'Ban Quản Lý',
          status: b.status === 'ACTIVE' ? 'active' : 'inactive',
          createdAt: formatCreatedAt(b.createdAt),
        }
      })
    }
  } catch (err) {
    console.warn('Could not fetch buildings from backend, falling back to local list', err)
  }
  return [...mockOrganizations]
}

// Tạo doanh nghiệp thật trên server. Lỗi được ném ra để giao diện báo cho người dùng.
export async function createOrganization(payload: TCreateOrgPayload): Promise<TOrganization> {
  const res = await apiClient.post<TApiBuilding>('/buildings', {
    name: payload.name,
    code: payload.code.toUpperCase(),
    address: payload.address,
    // Server bắt buộc hai trường này, giai đoạn thử nghiệm dùng giá trị mặc định
    totalFloors: 10,
    totalApartments: 50,
    managementEmail: payload.adminEmail,
    ...(payload.latitude !== undefined && payload.longitude !== undefined
      ? { latitude: payload.latitude, longitude: payload.longitude }
      : {}),
  })
  const b = res.data
  return {
    id: (b._id || b.id) as string,
    code: b.code || payload.code.toUpperCase(),
    name: b.name,
    type: payload.type,
    address: b.address || payload.address,
    latitude: payload.latitude,
    longitude: payload.longitude,
    totalLockers: 0,
    totalMembers: b.totalApartments || 0,
    adminEmail: payload.adminEmail,
    adminName: payload.adminName,
    status: 'active',
    createdAt: formatCreatedAt(b.createdAt ?? new Date().toISOString()),
  }
}

export async function deleteOrganization(id: string): Promise<boolean> {
  await apiClient.delete(`/buildings/${id}`)
  return true
}
