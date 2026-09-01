import type { TCompartmentStatus, TLockerStation } from '../types/lockerStation.type'

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
  return Promise.resolve([...mockStations])
}

export async function getLockerStationById(id: string): Promise<TLockerStation | undefined> {
  const station = mockStations.find((s) => s.id === id)
  return Promise.resolve(station)
}

export type TCreateLockerStationPayload = {
  name: string
  code: string
  orgId: string
  orgName: string
  location: string
  sizeS: number
  sizeM: number
  sizeL: number
}

export async function createLockerStation(payload: TCreateLockerStationPayload): Promise<TLockerStation> {
  const stationId = `station-${Date.now().toString().slice(-4)}`
  const prefix = payload.code.replace(/[^A-Za-z0-9]/g, '').slice(-2).toUpperCase() || 'ST'
  
  const compartments: any[] = []
  let boxIndex = 1

  // Generate Size S compartments
  for (let i = 0; i < payload.sizeS; i++) {
    const codeNum = boxIndex < 10 ? `0${boxIndex}` : `${boxIndex}`
    compartments.push({
      id: `c-${stationId}-s${i + 1}`,
      code: `${prefix}-${codeNum}`,
      size: 'small',
      status: 'available',
      hardwareState: {
        relayLock: 'LOCKED',
        irObjectSensor: 'EMPTY',
        doorSwitch: 'DOOR_CLOSED',
        voltage: '12.1V',
        lastSignalAt: 'Vừa kết nối',
      },
    })
    boxIndex++
  }

  // Generate Size M compartments
  for (let i = 0; i < payload.sizeM; i++) {
    const codeNum = boxIndex < 10 ? `0${boxIndex}` : `${boxIndex}`
    compartments.push({
      id: `c-${stationId}-m${i + 1}`,
      code: `${prefix}-${codeNum}`,
      size: 'medium',
      status: 'available',
      hardwareState: {
        relayLock: 'LOCKED',
        irObjectSensor: 'EMPTY',
        doorSwitch: 'DOOR_CLOSED',
        voltage: '12.1V',
        lastSignalAt: 'Vừa kết nối',
      },
    })
    boxIndex++
  }

  // Generate Size L compartments
  for (let i = 0; i < payload.sizeL; i++) {
    const codeNum = boxIndex < 10 ? `0${boxIndex}` : `${boxIndex}`
    compartments.push({
      id: `c-${stationId}-l${i + 1}`,
      code: `${prefix}-${codeNum}`,
      size: 'large',
      status: 'available',
      hardwareState: {
        relayLock: 'LOCKED',
        irObjectSensor: 'EMPTY',
        doorSwitch: 'DOOR_CLOSED',
        voltage: '12.1V',
        lastSignalAt: 'Vừa kết nối',
      },
    })
    boxIndex++
  }

  const newStation: TLockerStation = {
    id: stationId,
    code: payload.code.toUpperCase(),
    name: payload.name,
    orgId: payload.orgId,
    orgName: payload.orgName,
    location: payload.location || 'Sảnh Tòa Nhà Main Hall',
    status: 'online',
    masterController: {
      ipAddress: `192.168.${Math.floor(Math.random() * 10 + 1)}.${Math.floor(Math.random() * 200 + 10)}`,
      gatewayStatus: 'RS485 Gateway Connected',
      temperatureCelsius: 28.5,
      firmwareVersion: 'v2.4.12-pro',
    },
    createdAt: new Date().toISOString().slice(0, 10),
    lastHeartbeat: 'Vừa xong',
    compartments,
  }

  mockStations.unshift(newStation)
  return Promise.resolve(newStation)
}

export async function updateCompartmentStatus(
  stationId: string,
  compartmentId: string,
  newStatus: TCompartmentStatus,
  note?: string
): Promise<boolean> {
  const station = mockStations.find((s) => s.id === stationId)
  if (!station) return Promise.resolve(false)
  const comp = station.compartments.find((c) => c.id === compartmentId)
  if (!comp) return Promise.resolve(false)

  comp.status = newStatus
  if (note !== undefined) {
    comp.note = note
  }
  if (newStatus === 'available') {
    delete comp.currentShipment
    comp.hardwareState.irObjectSensor = 'EMPTY'
  } else if (newStatus === 'maintenance' || newStatus === 'fault') {
    comp.hardwareState.irObjectSensor = 'EMPTY'
  }
  return Promise.resolve(true)
}

export async function freeCompartmentByLockerCode(lockerCode: string): Promise<boolean> {
  const cleanTarget = lockerCode.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
  for (const station of mockStations) {
    const comp = station.compartments.find(
      (c) =>
        c.code.toLowerCase() === lockerCode.toLowerCase() ||
        c.code.replace(/[^A-Za-z0-9]/g, '').toLowerCase() === cleanTarget
    )
    if (comp) {
      comp.status = 'available'
      delete comp.currentShipment
      comp.hardwareState.irObjectSensor = 'EMPTY'
      return Promise.resolve(true)
    }
  }
  return Promise.resolve(false)
}

export async function getAvailableCompartments(stationId?: string): Promise<any[]> {
  const targetStations = stationId ? mockStations.filter((s) => s.id === stationId) : mockStations
  const availList = targetStations.flatMap((station) =>
    station.compartments.filter((c) => c.status === 'available')
  )
  return Promise.resolve(availList)
}

