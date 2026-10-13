import type { TranslationKey } from '../../i18n/translations'
import type { LockerFilter, LockerStatus } from './types'

// Tạm ẩn nút "Chi tiết" vì trang chi tiết tủ vẫn đang dùng dữ liệu mock.
// Bật lại thành true sau khi LockersPage / LockerDetail đồng bộ với API thật.
export const SHOW_DETAIL_LINK = false

// Tâm bản đồ mặc định (TP.HCM) khi chưa có trạm tủ nào có tọa độ
export const DEFAULT_CENTER: [number, number] = [10.762622, 106.660172]

export const STATUS_META: Record<
  LockerStatus,
  { labelKey: TranslationKey; hex: string; dot: string; text: string; soft: string }
> = {
  ONLINE: {
    labelKey: 'map.status.ONLINE',
    hex: '#10b981',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    soft: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  OFFLINE: {
    labelKey: 'map.status.OFFLINE',
    hex: '#f43f5e',
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
    soft: 'bg-rose-50 dark:bg-rose-500/10',
  },
  MAINTENANCE: {
    labelKey: 'map.status.MAINTENANCE',
    hex: '#f59e0b',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    soft: 'bg-amber-50 dark:bg-amber-500/10',
  },
}

export const FILTER_OPTIONS: { id: LockerFilter; labelKey: TranslationKey }[] = [
  { id: 'ALL', labelKey: 'map.filter.ALL' },
  { id: 'ONLINE', labelKey: 'map.status.ONLINE' },
  { id: 'OFFLINE', labelKey: 'map.status.OFFLINE' },
  { id: 'MAINTENANCE', labelKey: 'map.status.MAINTENANCE' },
  { id: 'HAS_ISSUES', labelKey: 'map.filter.HAS_ISSUES' },
]
