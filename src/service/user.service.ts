import type { TUser, TUserStatItem } from '../types/user.type'

const userMockData: TUser[] = [
    {
        id: '1',
        userCode: 'USR-001',
        fullName: 'Nguyễn Văn An',
        phone: '0901234567',
        email: 'nguyenvanan@gmail.com',
        role: 'customer',
        status: 'active',
        createdAt: '2026-04-20 08:10',
        lastActive: '2026-04-28 09:15',
        totalShipments: 8,
        note: 'Khách hàng nhận hàng thường xuyên',
    },
    {
        id: '2',
        userCode: 'USR-002',
        fullName: 'Trần Minh Long',
        phone: '0912345678',
        email: 'tranminhlong@gmail.com',
        role: 'shipper',
        status: 'active',
        createdAt: '2026-04-18 10:30',
        lastActive: '2026-04-28 08:50',
        totalShipments: 26,
        note: 'Shipper phụ trách khu A và B',
    },
    {
        id: '3',
        userCode: 'USR-003',
        fullName: 'Lê Khánh Vy',
        phone: '0988123456',
        email: 'lekhanhvy@gmail.com',
        role: 'customer',
        status: 'inactive',
        createdAt: '2026-04-15 14:20',
        lastActive: '2026-04-25 18:05',
        totalShipments: 3,
        note: 'Ít hoạt động trong tuần này',
    },
    {
        id: '4',
        userCode: 'USR-004',
        fullName: 'Phạm Gia Hưng',
        phone: '0977001122',
        email: 'phamgiahung@gmail.com',
        role: 'admin',
        status: 'active',
        createdAt: '2026-04-10 09:00',
        lastActive: '2026-04-28 09:40',
        totalShipments: 0,
        note: 'Quản trị viên hệ thống',
    },
    {
        id: '5',
        userCode: 'USR-005',
        fullName: 'Đặng Hoài Nam',
        phone: '0933222111',
        email: 'danghoainam@gmail.com',
        role: 'shipper',
        status: 'blocked',
        createdAt: '2026-04-12 11:45',
        lastActive: '2026-04-22 16:20',
        totalShipments: 14,
        note: 'Tạm khóa do lỗi giao hàng nhiều lần',
    },
    {
        id: '6',
        userCode: 'USR-006',
        fullName: 'Hoàng Gia Bảo',
        phone: '0944556677',
        email: 'hoanggiabao@gmail.com',
        role: 'customer',
        status: 'active',
        createdAt: '2026-04-16 07:50',
        lastActive: '2026-04-28 07:55',
        totalShipments: 11,
        note: 'Tần suất nhận hàng cao',
    },
]

export async function getUsers(): Promise<TUser[]> {
    return Promise.resolve(userMockData)
}

export async function getUserStats(): Promise<TUserStatItem[]> {
    const total = userMockData.length
    const customers = userMockData.filter((item) => item.role === 'customer').length
    const shippers = userMockData.filter((item) => item.role === 'shipper').length
    const admins = userMockData.filter((item) => item.role === 'admin').length
    const blocked = userMockData.filter((item) => item.status === 'blocked').length
    return Promise.resolve([
        {
            id: 'total',
            label: 'Tổng người dùng',
            value: String(total),
            helper: 'Tất cả tài khoản trong hệ thống',
            tone: 'blue',
        },
        {
            id: 'customers',
            label: 'Khách hàng',
            value: String(customers),
            helper: 'Người nhận hàng / sử dụng locker',
            tone: 'green',
        },
        {
            id: 'shippers',
            label: 'Shipper',
            value: String(shippers),
            helper: 'Người gửi hàng vào locker',
            tone: 'orange',
        },
        {
            id: 'admins',
            label: 'Admin',
            value: String(admins),
            helper: 'Tài khoản quản trị hệ thống',
            tone: 'red',
        },
        {
            id: 'blocked',
            label: 'Đang bị khóa',
            value: String(blocked),
            helper: 'Tài khoản cần kiểm tra lại',
            tone: 'red',
        },
    ])
}
