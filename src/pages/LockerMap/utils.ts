import type { LockerMapItem, LockerStatus } from './types'
import { STATUS_META } from './constants'
import { formatRelativeTime as formatRelative } from '../../i18n/format'
import { tNow } from '../../i18n/translate'

// Bỏ dấu tiếng Việt và chuyển về chữ thường để tìm kiếm không phân biệt dấu
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
}

export function hasCoords(l: LockerMapItem): boolean {
  return (
    typeof l.coordinates?.latitude === 'number' &&
    typeof l.coordinates?.longitude === 'number'
  )
}

export function statusMeta(status: LockerStatus) {
  return STATUS_META[status] ?? STATUS_META.OFFLINE
}

// Chuyển chuỗi nhập tay thành số trong khoảng cho phép, trả về null nếu không hợp lệ
export function parseCoord(value: string, min: number, max: number): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num < min || num > max) return null
  return num
}

export function formatRelativeTime(iso?: string): string {
  if (!iso || Number.isNaN(new Date(iso).getTime())) return tNow('map.noSignal')
  return formatRelative(iso)
}

// Các tủ cùng doanh nghiệp dùng chung một khóa nhóm; tủ chưa gắn doanh nghiệp đứng riêng
export function groupKey(l: LockerMapItem): string {
  return l.buildingId?._id ?? l._id
}

// Trạng thái "tệ nhất" của nhóm: có tủ Offline thì đỏ, rồi đến Bảo trì, còn lại là xanh
export function worstStatus(lockers: LockerMapItem[]): LockerStatus {
  if (lockers.some((l) => l.status === 'OFFLINE')) return 'OFFLINE'
  if (lockers.some((l) => l.status === 'MAINTENANCE')) return 'MAINTENANCE'
  return 'ONLINE'
}
