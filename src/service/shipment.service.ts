import type { TShipment, TShipmentStatItem } from '../types/shipment.type'

const shipmentMockData: TShipment[] = [
    {
        id: '1',
        shipmentCode: 'SHP-2026-001',
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0901234567',
        lockerCode: 'A02',
        cluster: 'A',
        lockerSize: 'medium',
        otpCode: '482913',
        otpStatus: 'active',
        shipmentStatus: 'waiting_pickup',
        createdAt: '2026-04-28 08:20',
        updatedAt: '2026-04-28 08:30',
        shipperName: 'Shipper Minh',
        note: 'Khách sẽ nhận trong sáng nay',
    },
    {
        id: '2',
        shipmentCode: 'SHP-2026-002',
        recipientName: 'Trần Thị B',
        recipientPhone: '0912345678',
        lockerCode: 'C02',
        cluster: 'C',
        lockerSize: 'large',
        otpCode: '731205',
        otpStatus: 'active',
        shipmentStatus: 'stored',
        createdAt: '2026-04-28 07:45',
        updatedAt: '2026-04-28 07:50',
        shipperName: 'Shipper Long',
        note: 'Đã lưu ảnh kiện hàng',
    },
    {
        id: '3',
        shipmentCode: 'SHP-2026-003',
        recipientName: 'Phạm Văn C',
        recipientPhone: '0987654321',
        lockerCode: 'D02',
        cluster: 'D',
        lockerSize: 'medium',
        otpCode: '664120',
        otpStatus: 'used',
        shipmentStatus: 'picked_up',
        createdAt: '2026-04-28 06:30',
        updatedAt: '2026-04-28 07:10',
        shipperName: 'Shipper Hùng',
        note: 'Khách đã nhận thành công',
    },
    {
        id: '4',
        shipmentCode: 'SHP-2026-004',
        recipientName: 'Lê Thị D',
        recipientPhone: '0971112233',
        lockerCode: 'B01',
        cluster: 'B',
        lockerSize: 'large',
        otpCode: '900112',
        otpStatus: 'expired',
        shipmentStatus: 'expired',
        createdAt: '2026-04-27 18:10',
        updatedAt: '2026-04-28 09:00',
        shipperName: 'Shipper Phúc',
        note: 'OTP đã hết hạn, cần xử lý lại',
    },
    {
        id: '5',
        shipmentCode: 'SHP-2026-005',
        recipientName: 'Hoàng Gia Bảo',
        recipientPhone: '0933334444',
        lockerCode: 'A01',
        cluster: 'A',
        lockerSize: 'small',
        otpCode: '553901',
        otpStatus: 'active',
        shipmentStatus: 'pending',
        createdAt: '2026-04-28 09:05',
        updatedAt: '2026-04-28 09:05',
        shipperName: 'Shipper Nam',
        note: 'Đơn mới tạo, đang chờ xác nhận lưu tủ',
    },
    {
        id: '6',
        shipmentCode: 'SHP-2026-006',
        recipientName: 'Đặng Minh Khang',
        recipientPhone: '0944445555',
        lockerCode: 'B02',
        cluster: 'B',
        lockerSize: 'small',
        otpCode: '117204',
        otpStatus: 'expired',
        shipmentStatus: 'failed',
        createdAt: '2026-04-28 05:50',
        updatedAt: '2026-04-28 06:20',
        shipperName: 'Shipper Việt',
        note: 'Lỗi xác thực hoặc locker không phản hồi',
    },
]

export async function getShipments(): Promise<TShipment[]> {
    return Promise.resolve(shipmentMockData)
}

export async function getShipmentStats(): Promise<TShipmentStatItem[]> {
    const total = shipmentMockData.length
    const waitingPickup = shipmentMockData.filter(
        (item) => item.shipmentStatus === 'waiting_pickup',
    ).length
    const completed = shipmentMockData.filter(
        (item) => item.shipmentStatus === 'picked_up',
    ).length
    const issue = shipmentMockData.filter(
        (item) => item.shipmentStatus === 'expired' || item.shipmentStatus === 'failed',
    ).length

    return Promise.resolve([
        {
            id: 'total',
            label: 'Tổng đơn hàng',
            value: String(total),
            helper: 'Tất cả shipment trong hệ thống',
            tone: 'blue',
        },
        {
            id: 'waiting',
            label: 'Chờ nhận hàng',
            value: String(waitingPickup),
            helper: 'Khách chưa mở tủ để nhận',
            tone: 'green',
        },
        {
            id: 'completed',
            label: 'Đã hoàn tất',
            value: String(completed),
            helper: 'Khách đã nhận hàng thành công',
            tone: 'orange',
        },
        {
            id: 'issue',
            label: 'Lỗi / quá hạn',
            value: String(issue),
            helper: 'Cần admin kiểm tra xử lý',
            tone: 'red',
        },
    ])
}

export async function updateShipmentStatus(
    shipmentId: string,
    newStatus: TShipment['shipmentStatus'],
    locationNote?: string
): Promise<TShipment | undefined> {
    const item = shipmentMockData.find((s) => s.id === shipmentId)
    if (item) {
        item.shipmentStatus = newStatus
        if (locationNote) {
            item.storageLocationNote = locationNote
        }
        item.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
    }
    return Promise.resolve(item)
}

