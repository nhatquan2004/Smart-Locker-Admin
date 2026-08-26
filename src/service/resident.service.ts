import type { TCreateResidentPayload, TResident } from '../types/resident.type'

const mockResidents: TResident[] = [
  {
    id: 'res-001',
    code: 'RES-101',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'nguyenvanan@gmail.com',
    orgId: 'org-002',
    orgName: 'Khu Nhà Trọ Hoàng Nam',
    unitNumber: 'Phòng 101 - Tầng 1',
    role: 'resident',
    assignedLockerCode: 'A01',
    status: 'active',
    createdAt: '2026-04-20 08:10',
    lastActive: '10 phút trước',
    note: 'Cư dân thuê trọ dài hạn',
  },
  {
    id: 'res-002',
    code: 'RES-102',
    fullName: 'Trần Thị Bích',
    phone: '0912345678',
    email: 'tranthibich@gmail.com',
    orgId: 'org-002',
    orgName: 'Khu Nhà Trọ Hoàng Nam',
    unitNumber: 'Phòng 102 - Tầng 1',
    role: 'resident',
    assignedLockerCode: 'A02',
    status: 'active',
    createdAt: '2026-04-18 10:30',
    lastActive: '1 giờ trước',
    note: 'Đang lưu kiện hàng tại tủ A02',
  },
  {
    id: 'res-003',
    code: 'EMP-001',
    fullName: 'Lê Minh Khánh',
    phone: '0988123456',
    email: 'khanh.le@techcorp.vn',
    orgId: 'org-001',
    orgName: 'TechCorp Office Building',
    unitNumber: 'Phòng Marketing - Tầng 4',
    role: 'employee',
    assignedLockerCode: 'B01',
    status: 'active',
    createdAt: '2026-04-15 14:20',
    lastActive: '25 phút trước',
    note: 'Nhân viên chính thức TechCorp',
  },
  {
    id: 'res-004',
    code: 'EMP-002',
    fullName: 'Phạm Thu Hà',
    phone: '0977001122',
    email: 'ha.pham@techcorp.vn',
    orgId: 'org-001',
    orgName: 'TechCorp Office Building',
    unitNumber: 'Phòng Kế Toán - Tầng 3',
    role: 'employee',
    assignedLockerCode: 'B02',
    status: 'active',
    createdAt: '2026-04-10 09:00',
    lastActive: 'Hôm qua',
    note: 'Thường xuyên nhận hồ sơ qua tủ',
  },
  {
    id: 'res-005',
    code: 'SV-2026-01',
    fullName: 'Hoàng Gia Bảo',
    phone: '0944556677',
    email: 'bao.hg26@sis.hust.edu.vn',
    orgId: 'org-003',
    orgName: 'Ký Túc Xá Đại Học Bách Khoa',
    unitNumber: 'Phòng 402 - KTX B9',
    role: 'student',
    assignedLockerCode: 'C01',
    status: 'active',
    createdAt: '2026-04-16 11:00',
    lastActive: '5 phút trước',
    note: 'Sinh viên K67 CNTT',
  },
]

let residentStore = [...mockResidents]

export async function getResidents(orgId?: string): Promise<TResident[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (orgId && orgId !== 'all') {
        resolve(residentStore.filter((r) => r.orgId === orgId))
      } else {
        resolve([...residentStore])
      }
    }, 300)
  })
}

export async function createResident(payload: TCreateResidentPayload): Promise<TResident> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRes: TResident = {
        id: `res-${Date.now().toString().slice(-4)}`,
        code: `RES-${(residentStore.length + 100).toString()}`,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email || `${payload.phone}@smartlocker.vn`,
        orgId: payload.orgId,
        orgName: payload.orgName,
        unitNumber: payload.unitNumber,
        role: payload.role,
        status: 'active',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        lastActive: 'Vừa tạo',
        note: payload.note || 'Tạo từ Admin Panel',
      }
      residentStore = [newRes, ...residentStore]
      resolve(newRes)
    }, 400)
  })
}
