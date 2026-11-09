export type LockerStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'

// Dữ liệu trạm tủ trả về từ GET /lockers
export interface LockerMapItem {
  _id: string
  name: string
  code: string
  status: LockerStatus
  totalBoxes: number
  availableBoxes?: number
  occupiedBoxes?: number
  locationDescription?: string
  lastHeartbeatAt?: string
  macAddress?: string
  coordinates?: { latitude: number; longitude: number }
  buildingId?: { _id: string; name: string; code: string; address?: string }
}

export type LockerFilter = 'ALL' | LockerStatus | 'HAS_ISSUES'

export type FlyTarget = { lat: number; lng: number; id: string }

// Các tủ cùng một doanh nghiệp được gộp thành một ghim trên bản đồ
export interface LockerGroup {
  key: string
  lockers: LockerMapItem[]
  position: [number, number]
  status: LockerStatus
}
