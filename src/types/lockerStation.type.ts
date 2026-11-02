export type TCompartmentSize = 'small' | 'medium' | 'large'

export type TCompartmentStatus = 'available' | 'occupied' | 'maintenance' | 'fault'

export type THardwareState = {
  relayLock: 'LOCKED' | 'UNLOCKED'
  irObjectSensor: 'PARCEL_PRESENT' | 'EMPTY'
  doorSwitch: 'DOOR_CLOSED' | 'DOOR_OPEN'
  voltage: string
  lastSignalAt: string
}

export type TCompartmentShipmentInfo = {
  shipmentCode: string
  recipientName: string
  recipientPhone: string
  otpCode?: string
  storedAt: string
  shipperName?: string
}

export type TCompartment = {
  id: string
  // Số thứ tự ngăn trên server, dùng cho các API mở khóa và bảo trì
  boxNumber?: number
  code: string // e.g. 'A-01'
  size: TCompartmentSize
  status: TCompartmentStatus
  hardwareState: THardwareState
  currentShipment?: TCompartmentShipmentInfo
  note?: string
}

export type TLockerStationStatus = 'online' | 'warning' | 'offline'

export type TLockerStation = {
  id: string
  code: string // e.g. 'ST-A01'
  name: string
  orgId: string
  orgName: string
  location: string
  status: TLockerStationStatus
  // Server chưa lưu thông tin bo mạch, chỉ dữ liệu mẫu mới có
  masterController?: {
    ipAddress: string
    gatewayStatus: string
    temperatureCelsius: number
    firmwareVersion: string
  }
  compartments: TCompartment[]
  createdAt: string
  lastHeartbeat: string
  lastHeartbeatAt?: string
}

export type TLockerStationFilter = {
  search: string
  orgId: string
  status: 'all' | TLockerStationStatus
}
