import type { TLocker, TLockerStatItem } from '../types/locker.type'

const lockerMockData: TLocker[] = [
    {
        id: '1',
        code: 'A01',
        name: 'Locker A01',
        cluster: 'A',
        size: 'small',
        status: 'available',
        location: 'Tầng 1 - Khu A',
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
        location: 'Tầng 1 - Khu A',
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
        location: 'Tầng 2 - Khu B',
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
        location: 'Tầng 2 - Khu B',
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
        location: 'Tầng 3 - Khu C',
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
        location: 'Tầng 3 - Khu C',
        currentUser: 'Trần Thị B',
        currentPackage: 'PKG-2048',
        lastUpdated: '10 phút trước',
        note: 'Đang có đơn gửi',
    },
    {
        id: '7',
        code: 'D01',
        name: 'Locker D01',
        cluster: 'D',
        size: 'small',
        status: 'available',
        location: 'Sảnh chính - Khu D',
        lastUpdated: '3 phút trước',
        note: 'Có thể gán đơn mới',
    },
    {
        id: '8',
        code: 'D02',
        name: 'Locker D02',
        cluster: 'D',
        size: 'medium',
        status: 'occupied',
        location: 'Sảnh chính - Khu D',
        currentUser: 'Phạm Văn C',
        currentPackage: 'PKG-3001',
        lastUpdated: '6 phút trước',
        note: 'Khách chưa đến nhận',
    },
]

export async function getLockers(): Promise<TLocker[]> {
    return Promise.resolve(lockerMockData)
}
export async function getLockerStats(): Promise<TLockerStatItem[]> {
    const total = lockerMockData.length
    const available = lockerMockData.filter((item) => item.status === 'available').length
    const occupied = lockerMockData.filter((item) => item.status === 'occupied').length
    const issue = lockerMockData.filter(
        (item) => item.status === 'offline' || item.status === 'maintenance',
    ).length

    return Promise.resolve([
        {
            id: 'total',
            label: 'Tổng số locker',
            value: String(total),
            helper: 'Toàn bộ ngăn tủ trong hệ thống',
            tone: 'blue',
        },
        {
            id: 'available',
            label: 'Đang trống',
            value: String(available),
            helper: 'Sẵn sàng nhận đơn mới',
            tone: 'green',
        },
        {
            id: 'occupied',
            label: 'Đang sử dụng',
            value: String(occupied),
            helper: 'Đang chứa hàng hoặc chờ nhận',
            tone: 'orange',
        },
        {
            id: 'issue',
            label: 'Lỗi / bảo trì',
            value: String(issue),
            helper: 'Cần kiểm tra kỹ thuật',
            tone: 'red',
        },
    ])
}
