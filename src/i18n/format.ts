import { getLocale } from './language'

type DateInput = string | number | Date

function toDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// Các hàm định dạng dưới đây tự theo ngôn ngữ đang chọn. Component gọi chúng nên dùng
// useTranslation() để được render lại khi người dùng đổi ngôn ngữ.
export function formatDate(value: DateInput, options?: Intl.DateTimeFormatOptions): string {
  const date = toDate(value)
  return date ? date.toLocaleDateString(getLocale(), options) : '—'
}

export function formatDateTime(value: DateInput, options?: Intl.DateTimeFormatOptions): string {
  const date = toDate(value)
  return date ? date.toLocaleString(getLocale(), options) : '—'
}

export function formatTime(value: DateInput = new Date(), options?: Intl.DateTimeFormatOptions): string {
  const date = toDate(value)
  return date ? date.toLocaleTimeString(getLocale(), options) : '—'
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString(getLocale(), options)
}

export function formatCurrencyVnd(value: number): string {
  return value.toLocaleString(getLocale(), { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}

// "5 phút trước" / "5 minutes ago", "vừa xong" / "now"
export function formatRelativeTime(value: DateInput): string {
  const date = toDate(value)
  if (!date) return '—'

  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' })
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000)
  const abs = Math.abs(diffSec)

  if (abs < 60) return rtf.format(0, 'second')
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour')
  return rtf.format(Math.round(diffSec / 86400), 'day')
}
