import type { TLocker, TLockerStatItem } from '../types/locker.type'

const lockerMockData: TLocker[] = [
    {
        id: '1',
        code: 'A01',
        name: 'Locker A01',
        cluster: 'A',
        size: 'small',
        status: 'available',
        location: 'Tầng 1 - TechCorp Building',
        orgId: 'org-001',
        orgName: 'TechCorp Office Building',
        lastUpdated: '2 phút trước',
        note: 'Sẵn sàng nhận hàng',
    },
    {
        id: '2',
        code: 'A02',
        name: 'Locker A02',
        cluster: 'A',
        size: 'medium',
        status: 'occupied',
        location: 'Tầng 1 - TechCorp Building',
        orgId: 'org-001',
        orgName: 'TechCorp Office Building',
        currentUser: 'Nguyễn Văn A',
        currentPackage: 'PKG-1024',
        lastUpdated: '5 phút trước',
        note: 'Đang chứa hàng chờ nhận',
    },
    {
        id: '3',
        code: 'B01',
        name: 'Locker B01',
        cluster: 'B',
        size: 'large',
        status: 'maintenance',
        location: 'Khu A - Nhà Trọ Hoàng Nam',
        orgId: 'org-002',
        orgName: 'Khu Nhà Trọ Hoàng Nam',
        lastUpdated: '12 phút trước',
        note: 'Đang kiểm tra khóa điện từ',
    },
    {
        id: '4',
        code: 'B02',
        name: 'Locker B02',
        cluster: 'B',
        size: 'small',
        status: 'offline',
        location: 'Khu B - Nhà Trọ Hoàng Nam',
        orgId: 'org-002',
        orgName: 'Khu Nhà Trọ Hoàng Nam',
        lastUpdated: '8 phút trước',
        note: 'Mất kết nối cảm biến',
    },
    {
        id: '5',
        code: 'C01',
        name: 'Locker C01',
        cluster: 'C',
        size: 'medium',
        status: 'available',
        location: 'Tầng 1 - KTX Bách Khoa',
        orgId: 'org-003',
        orgName: 'Ký Túc Xá Đại Học Bách Khoa',
        lastUpdated: '1 phút trước',
        note: 'Hoạt động ổn định',
    },
    {
        id: '6',
        code: 'C02',
        name: 'Locker C02',
        cluster: 'C',
        size: 'large',
        status: 'occupied',
        location: 'Tầng 2 - KTX Bách Khoa',
        orgId: 'org-003',
        orgName: 'Ký Túc Xá Đại Học Bách Khoa',
        currentUser: 'Trần Thị B',
        currentPackage: 'PKG-2048',
        lastUpdated: '3 phút trước',
        note: 'Đang có đơn gửi',
    },
]

export async function getLockers(): Promise<TLocker[]> {
    return Promise.resolve(lockerMockData)
}

export async function getLockerById(id: string): Promise<TLocker | undefined> {
    const item = lockerMockData.find((l) => l.id === id)
    return Promise.resolve(item)
}

export async function getLockerStats(): Promise<TLockerStatItem[]> {
    return Promise.resolve([
        {
            id: 'total',
            label: 'TỔNG TỦ ĐỒ',
            value: `${lockerMockData.length}`,
            helper: 'Tổng ngăn tủ hệ thống',
            tone: 'blue',
        },
        {
            id: 'available',
            label: 'SẴN SÀNG',
            value: `${lockerMockData.filter((l) => l.status === 'available').length}`,
            helper: 'Ngăn tủ trống',
            tone: 'green',
        },
        {
            id: 'occupied',
            label: 'ĐANG LƯU TRỮ',
            value: `${lockerMockData.filter((l) => l.status === 'occupied').length}`,
            helper: 'Có hàng chờ nhận',
            tone: 'orange',
        },
        {
            id: 'issue',
            label: 'BẢO TRÌ / OFFLINE',
            value: `${lockerMockData.filter((l) => l.status === 'maintenance' || l.status === 'offline').length}`,
            helper: 'Cần kiểm tra',
            tone: 'red',
        },
    ])
}
