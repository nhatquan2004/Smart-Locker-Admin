import type { TLockerStation } from '../types/lockerStation.type'

const mockStations: TLockerStation[] = [
  {
    id: 'station-001',
    code: 'ST-TC01',
    name: 'Trạm Tủ A - Sảnh Lễ Tân TechCorp',
    orgId: 'org-001',
    orgName: 'TechCorp Office Building',
    location: 'Tầng 1 - Sảnh Lễ Tân Chính',
    status: 'online',
    masterController: {
      ipAddress: '192.168.1.105',
      gatewayStatus: 'RS485 Gateway Connected',
      temperatureCelsius: 27.4,
      firmwareVersion: 'v2.4.12-pro',
    },
    createdAt: '2026-01-10',
    lastHeartbeat: 'vừa xong',
    compartments: [
      {
        id: 'c-01', code: 'A-01', size: 'small', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.1V', lastSignalAt: '1 giây trước' },
      },
      {
        id: 'c-02', code: 'A-02', size: 'small', status: 'occupied',
        currentShipment: { shipmentCode: 'SHP-2026-001', recipientName: 'Nguyễn Văn An', recipientPhone: '0901234567', otpCode: '882910', storedAt: '09:30 AM', shipperName: 'Shipper GHN' },
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'PARCEL_PRESENT', doorSwitch: 'DOOR_CLOSED', voltage: '12.0V', lastSignalAt: '3 giây trước' },
      },
      {
        id: 'c-03', code: 'A-03', size: 'small', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.2V', lastSignalAt: '2 giây trước' },
      },
      {
        id: 'c-04', code: 'A-04', size: 'medium', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.1V', lastSignalAt: '1 giây trước' },
      },
      {
        id: 'c-05', code: 'A-05', size: 'medium', status: 'occupied',
        currentShipment: { shipmentCode: 'SHP-2026-003', recipientName: 'Phạm Văn C', recipientPhone: '0987654321', otpCode: '102948', storedAt: '10:15 AM', shipperName: 'Shipper ViettelPost' },
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'PARCEL_PRESENT', doorSwitch: 'DOOR_CLOSED', voltage: '12.1V', lastSignalAt: '5 giây trước' },
      },
      {
        id: 'c-06', code: 'A-06', size: 'large', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.0V', lastSignalAt: '2 giây trước' },
      },
      {
        id: 'c-07', code: 'A-07', size: 'large', status: 'fault',
        note: 'Cảnh báo: Cảm biến hồng ngoại chập chờn',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'PARCEL_PRESENT', doorSwitch: 'DOOR_OPEN', voltage: '11.4V', lastSignalAt: '10 phút trước' },
      },
    ],
  },
  {
    id: 'station-002',
    code: 'ST-HN01',
    name: 'Trạm Tủ B - Khu Nhà Trọ Hoàng Nam',
    orgId: 'org-002',
    orgName: 'Khu Nhà Trọ Hoàng Nam',
    location: 'Sân Trước - Cổng Vào Nhà Trọ',
    status: 'online',
    masterController: {
      ipAddress: '192.168.2.88',
      gatewayStatus: 'RS485 Gateway Connected',
      temperatureCelsius: 29.1,
      firmwareVersion: 'v2.4.12-pro',
    },
    createdAt: '2026-02-15',
    lastHeartbeat: '2 phút trước',
    compartments: [
      {
        id: 'c-10', code: 'B-01', size: 'small', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.1V', lastSignalAt: '1 giây trước' },
      },
      {
        id: 'c-11', code: 'B-02', size: 'small', status: 'occupied',
        currentShipment: { shipmentCode: 'SHP-2026-002', recipientName: 'Trần Thị B', recipientPhone: '0912345678', otpCode: '991204', storedAt: '08:45 AM', shipperName: 'Shipper ShopeeExpress' },
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'PARCEL_PRESENT', doorSwitch: 'DOOR_CLOSED', voltage: '12.1V', lastSignalAt: '4 giây trước' },
      },
      {
        id: 'c-12', code: 'B-03', size: 'medium', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.0V', lastSignalAt: '2 giây trước' },
      },
      {
        id: 'c-13', code: 'B-04', size: 'medium', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.1V', lastSignalAt: '1 giây trước' },
      },
      {
        id: 'c-14', code: 'B-05', size: 'large', status: 'maintenance',
        note: 'Đang bảo trì chốt khóa tự động',
        hardwareState: { relayLock: 'UNLOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_OPEN', voltage: '11.8V', lastSignalAt: '15 phút trước' },
      },
    ],
  },
  {
    id: 'station-003',
    code: 'ST-BK01',
    name: 'Trạm Tủ C - Ký Túc Xá ĐH Bách Khoa',
    orgId: 'org-003',
    orgName: 'Ký Túc Xá Đại Học Bách Khoa',
    location: 'Tầng 1 - Sảnh Nhà KTX A3',
    status: 'warning',
    masterController: {
      ipAddress: '192.168.3.12',
      gatewayStatus: 'Signal Weak 4G',
      temperatureCelsius: 31.0,
      firmwareVersion: 'v2.3.8',
    },
    createdAt: '2026-03-01',
    lastHeartbeat: '5 phút trước',
    compartments: [
      {
        id: 'c-20', code: 'C-01', size: 'small', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.1V', lastSignalAt: '2 giây trước' },
      },
      {
        id: 'c-21', code: 'C-02', size: 'medium', status: 'occupied',
        currentShipment: { shipmentCode: 'SHP-2026-008', recipientName: 'Lê Hoàng Nam', recipientPhone: '0977112233', otpCode: '554321', storedAt: '11:00 AM', shipperName: 'Shipper J&T' },
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'PARCEL_PRESENT', doorSwitch: 'DOOR_CLOSED', voltage: '12.0V', lastSignalAt: '6 giây trước' },
      },
      {
        id: 'c-22', code: 'C-03', size: 'large', status: 'available',
        hardwareState: { relayLock: 'LOCKED', irObjectSensor: 'EMPTY', doorSwitch: 'DOOR_CLOSED', voltage: '12.1V', lastSignalAt: '3 giây trước' },
      },
    ],
  },
]

export async function getLockerStations(): Promise<TLockerStation[]> {
  return Promise.resolve(mockStations)
}

export async function getLockerStationById(id: string): Promise<TLockerStation | undefined> {
  const station = mockStations.find((s) => s.id === id)
  return Promise.resolve(station)
}
