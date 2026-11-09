import type { TranslationKey } from '../i18n/translations'
import type { TNotification } from '../service/notification.service'

export type TNotificationTarget =
  // Mở hộp thoại duyệt hồ sơ ngay trong hộp thư (chỉ Ban quản lý duyệt được)
  | { kind: 'review-resident'; residentId: string; labelKey: TranslationKey }
  // Chuyển tới trang liên quan
  | { kind: 'route'; path: string; labelKey: TranslationKey; labelParams?: Record<string, string> }

function meta(n: TNotification, key: string): string | undefined {
  const v = n.metadata?.[key]
  return typeof v === 'string' && v ? v : undefined
}

// Thông báo này dẫn tới đâu: hồ sơ cư dân, phiếu sự cố, bưu kiện hay trạm tủ. Không có thì trả null.
export function getNotificationTarget(n: TNotification, isBuildingAdmin: boolean): TNotificationTarget | null {
  const type = n.type ?? ''

  if (type === 'RESIDENT_REGISTRATION_PENDING') {
    const residentId = meta(n, 'residentId')
    if (!residentId) return null
    return isBuildingAdmin
      ? { kind: 'review-resident', residentId, labelKey: 'notif.reviewResident' }
      : { kind: 'route', path: `/users/${residentId}`, labelKey: 'notif.go.resident' }
  }

  if (type.startsWith('ISSUE_')) {
    const issueId = meta(n, 'issueId')
    if (!issueId) return null
    return {
      kind: 'route',
      path: `/issues?open=${encodeURIComponent(issueId)}`,
      labelKey: 'notif.go.issue',
      labelParams: { code: meta(n, 'ticketCode') ?? '' },
    }
  }

  if (type.startsWith('PACKAGE_')) {
    if (!isBuildingAdmin) return null
    const packageId = meta(n, 'packageId')
    if (!packageId) return null
    return { kind: 'route', path: `/shipments/${encodeURIComponent(packageId)}`, labelKey: 'notif.go.package' }
  }

  if (type.startsWith('LOCKER_')) {
    return { kind: 'route', path: '/lockers', labelKey: 'notif.go.locker' }
  }

  return null
}

// Bấm vào một thông báo ở chuông: thông báo có trang riêng thì tới thẳng đó, còn lại mở trong hộp thư
export function getBellDestination(n: TNotification, isBuildingAdmin: boolean): string {
  const target = getNotificationTarget(n, isBuildingAdmin)
  if (target?.kind === 'route' && !n.type?.startsWith('RESIDENT_')) return target.path
  return `/notifications?open=${encodeURIComponent(n._id)}`
}
