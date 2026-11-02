import { apiClient } from './api.client'

export type TApiBoxSize = 'SMALL' | 'MEDIUM' | 'LARGE'

// Trạm tủ trả về từ GET /lockers
export type TApiLocker = {
  _id: string
  name: string
  code: string
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
  totalBoxes: number
  availableBoxes?: number
  occupiedBoxes?: number
  locationDescription?: string
  coordinates?: { latitude: number; longitude: number }
  buildingId?: { _id: string; name: string; code: string; address?: string } | string
}

export type TCreateLockerInput = {
  buildingId: string
  name: string
  code: string
  locationDescription?: string
  macAddress?: string
  sizeS: number
  sizeM: number
  sizeL: number
  coordinates?: { latitude: number; longitude: number }
}

export type TCreatedLocker = {
  _id: string
  code: string
  name: string
  apiKey: string
}

export function getLockerBuildingId(locker: TApiLocker): string | undefined {
  return typeof locker.buildingId === 'string' ? locker.buildingId : locker.buildingId?._id
}

export async function getLockers(): Promise<TApiLocker[]> {
  const res = await apiClient.get<TApiLocker[]>('/lockers')
  return res.data ?? []
}

// Server yêu cầu địa chỉ MAC duy nhất. Khi chưa có phần cứng thật thì sinh MAC tạm.
function placeholderMac(): string {
  const bytes = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
  )
  return `02:00:${bytes.join(':')}`.toUpperCase()
}

// Tạo trạm tủ cùng các ngăn theo cấu hình S/M/L. apiKey chỉ trả về duy nhất lần này.
export async function createLocker(input: TCreateLockerInput): Promise<TCreatedLocker> {
  const sizes: TApiBoxSize[] = [
    ...Array<TApiBoxSize>(input.sizeS).fill('SMALL'),
    ...Array<TApiBoxSize>(input.sizeM).fill('MEDIUM'),
    ...Array<TApiBoxSize>(input.sizeL).fill('LARGE'),
  ]

  const res = await apiClient.post<TCreatedLocker>('/lockers', {
    buildingId: input.buildingId,
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    totalBoxes: sizes.length,
    macAddress: input.macAddress?.trim() || placeholderMac(),
    boxesConfig: sizes.map((size, i) => ({ boxNumber: i + 1, size })),
    ...(input.locationDescription?.trim() ? { locationDescription: input.locationDescription.trim() } : {}),
    ...(input.coordinates ? { coordinates: input.coordinates } : {}),
  })
  return res.data
}

// Gợi ý mã tủ tiếp theo của một doanh nghiệp: LK-{MÃ}-{NN}
export function suggestLockerCode(orgCode: string, existing: TApiLocker[]): string {
  const prefix = `LK-${orgCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}-`
  const used = new Set(existing.map((l) => l.code))
  for (let n = existing.length + 1; n < 1000; n++) {
    const code = `${prefix}${String(n).padStart(2, '0')}`
    if (!used.has(code)) return code
  }
  return `${prefix}${Date.now().toString().slice(-4)}`
}
