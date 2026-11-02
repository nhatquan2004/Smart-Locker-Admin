import type {
  TCompartment,
  TCompartmentStatus,
  TLockerStation,
  TLockerStationStatus,
} from '../types/lockerStation.type'
import { apiClient } from './api.client'
import type { TApiLocker } from './lockerApi.service'
import { formatDateTime, formatRelativeTime } from '../i18n/format'
import { tNow } from '../i18n/translate'

// ── Dữ liệu thật từ server: GET /lockers và GET /lockers/:code/boxes ──

type TApiBox = {
  _id: string
  boxNumber: number
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  doorStatus: 'OPEN' | 'CLOSED'
  hasItem: boolean
  // Chỉ có ở GET /lockers/:code/boxes/admin, không bao giờ chứa OTP hay mã QR
  currentPackage?: {
    _id: string
    trackingNumber: string
    receiverName: string
    receiverPhone: string
    apartment: string
    status: string
    droppedOffAt: string
    expiredAt: string
  }
}

type TApiLockerFull = TApiLocker & { lastHeartbeatAt?: string; createdAt?: string }

const stationStatusMap: Record<TApiLocker['status'], TLockerStationStatus> = {
  ONLINE: 'online',
  MAINTENANCE: 'warning',
  OFFLINE: 'offline',
}

const boxStatusMap: Record<TApiBox['status'], TCompartmentStatus> = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
}

function mapBox(box: TApiBox, signal: string): TCompartment {
  const pkg = box.currentPackage
  return {
    id: box._id,
    boxNumber: box.boxNumber,
    code: String(box.boxNumber).padStart(2, '0'),
    currentShipment: pkg
      ? {
          shipmentCode: pkg.trackingNumber,
          recipientName: pkg.receiverName,
          recipientPhone: pkg.receiverPhone,
          storedAt: formatDateTime(pkg.droppedOffAt),
        }
      : undefined,
    size: box.size.toLowerCase() as TCompartment['size'],
    status: boxStatusMap[box.status] ?? 'available',
    // Server chỉ có trạng thái cửa và có hàng hay không, các cảm biến khác chưa có
    hardwareState: {
      relayLock: box.doorStatus === 'OPEN' ? 'UNLOCKED' : 'LOCKED',
      irObjectSensor: box.hasItem ? 'PARCEL_PRESENT' : 'EMPTY',
      doorSwitch: box.doorStatus === 'OPEN' ? 'DOOR_OPEN' : 'DOOR_CLOSED',
      voltage: '—',
      lastSignalAt: signal,
    },
  }
}

// admin = true dùng endpoint dành cho admin, có thêm bưu kiện đang nằm trong từng ngăn
async function fetchBoxes(code: string, admin: boolean): Promise<TApiBox[]> {
  try {
    const res = await apiClient.get<{ boxes: TApiBox[] }>(
      `/lockers/${encodeURIComponent(code)}/boxes${admin ? '/admin' : ''}`,
    )
    return res.data?.boxes ?? []
  } catch {
    return []
  }
}

async function mapLocker(l: TApiLockerFull, admin = false): Promise<TLockerStation> {
  const building = typeof l.buildingId === 'object' ? l.buildingId : undefined
  const signal = l.lastHeartbeatAt ? formatRelativeTime(l.lastHeartbeatAt) : tNow('map.noSignal')
  const boxes = await fetchBoxes(l.code, admin)
  return {
    // Dùng mã tủ làm id để đường dẫn chi tiết là /lockers/{CODE}
    id: l.code,
    code: l.code,
    name: l.name,
    orgId: building?._id ?? '',
    orgName: building?.name ?? '—',
    location: l.locationDescription || building?.address || '—',
    status: stationStatusMap[l.status] ?? 'offline',
    compartments: boxes.map((b) => mapBox(b, signal)),
    createdAt: l.createdAt ? l.createdAt.slice(0, 10) : '',
    lastHeartbeat: signal,
    lastHeartbeatAt: l.lastHeartbeatAt,
  }
}

export async function getLockerStations(): Promise<TLockerStation[]> {
  const res = await apiClient.get<TApiLockerFull[]>('/lockers')
  return Promise.all((res.data ?? []).map((l) => mapLocker(l)))
}

export async function getLockerStationById(code: string): Promise<TLockerStation | undefined> {
  const res = await apiClient.get<TApiLockerFull[]>('/lockers')
  const found = (res.data ?? []).find((l) => l.code === code || l._id === code)
  return found ? mapLocker(found, true) : undefined
}

// Đổi trạng thái một ngăn giữa sẵn sàng và bảo trì. Server từ chối khi ngăn đang chứa bưu kiện.
export async function setBoxStatus(
  code: string,
  boxNumber: number,
  status: 'AVAILABLE' | 'MAINTENANCE',
  reason: string,
): Promise<{ changed: boolean; message: string }> {
  const res = await apiClient.patch<{ changed: boolean; message: string }>(
    `/lockers/${encodeURIComponent(code)}/boxes/${boxNumber}`,
    { status, reason },
  )
  return res.data
}

// Mở khóa từ xa một ngăn qua MQTT. Chỉ mở cửa vật lý, không đổi trạng thái bưu kiện.
export async function unlockBox(code: string, boxNumber: number, reason: string): Promise<string> {
  const res = await apiClient.post<{ message: string }>(
    `/lockers/${encodeURIComponent(code)}/boxes/${boxNumber}/unlock`,
    { reason },
  )
  return res.data.message
}
