/**
 * NOTIFICATION SERVICE
 * -------------------------------------------------------------------------
 * Kết nối toàn bộ API thông báo từ Backend Smart Locker Server.
 * Dùng apiClient (tự động gắn Bearer token, xử lý 401 refresh).
 * -------------------------------------------------------------------------
 */

import { apiClient } from './api.client'

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type TNotificationCategory = 'ACCOUNT' | 'HARDWARE' | 'PACKAGE' | 'SYSTEM'
export type TNotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'

export type TNotification = {
  _id: string
  recipientId: string
  title: string
  message: string
  category: TNotificationCategory
  priority: TNotificationPriority
  isRead: boolean
  // Tòa nhà của sự kiện (server chỉ trả mã, không kèm tên)
  buildingId?: string
  type?: string
  // Mã tham chiếu server gắn kèm: residentId, issueId, ticketCode, packageId...
  metadata?: Record<string, unknown>
  actionUrl?: string
  createdAt: string
  updatedAt: string
}

export type TNotificationListResponse = {
  data: TNotification[]
  total: number
  page: number
  limit: number
}

export type TNotificationQuery = {
  page?: number
  limit?: number
  category?: TNotificationCategory
  isRead?: boolean
}

export type TBroadcastPayload = {
  buildingId: string
  title: string
  message: string
  category?: TNotificationCategory
  priority?: TNotificationPriority
  actionUrl?: string
}

export type TBroadcastResult = {
  sent: number
  notifications: TNotification[]
}

// ─── API FUNCTIONS ─────────────────────────────────────────────────────────────

/**
 * Lấy danh sách thông báo của user đang đăng nhập (có phân trang).
 * GET /notifications
 */
export async function getMyNotifications(
  query: TNotificationQuery = {},
): Promise<TNotificationListResponse> {
  const params = new URLSearchParams()
  if (query.page) params.append('page', String(query.page))
  if (query.limit) params.append('limit', String(query.limit))
  if (query.category) params.append('category', query.category)
  if (query.isRead !== undefined) params.append('isRead', String(query.isRead))

  const qs = params.toString()
  const path = qs ? `/notifications?${qs}` : '/notifications'

  try {
    const res = await apiClient.get<TNotificationListResponse>(path)
    // Nếu Server trả về array thẳng thay vì object có pagination
    if (Array.isArray(res.data)) {
      return { data: res.data as unknown as TNotification[], total: (res.data as unknown as TNotification[]).length, page: 1, limit: 50 }
    }
    return res.data
  } catch {
    return { data: [], total: 0, page: 1, limit: 20 }
  }
}

// Báo cho chuông và hộp thư rằng thông báo vừa thay đổi (có thông báo mới, đã đọc, đã xóa) để cùng cập nhật ngay
export const NOTIFICATIONS_CHANGED_EVENT = 'smart-locker:notifications-changed'
export function emitNotificationsChanged() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT))
}

export type TNotificationInbox = { data: TNotification[]; total: number; unreadCount: number }

/**
 * Hộp thư đầy đủ cho trang Thông báo: lọc theo nhóm, mức ưu tiên, đã đọc (server lọc), kèm tổng và số chưa đọc.
 * Khác getMyNotifications, hàm này không nuốt lỗi để trang báo được khi tải thất bại.
 * GET /notifications trả { data, pagination: { total }, unreadCount }
 */
export async function listNotifications(
  query: Pick<TNotificationQuery, 'category' | 'isRead' | 'limit'> & { priority?: TNotificationPriority },
): Promise<TNotificationInbox> {
  const params = new URLSearchParams()
  if (query.limit) params.append('limit', String(query.limit))
  if (query.category) params.append('category', query.category)
  if (query.priority) params.append('priority', query.priority)
  if (query.isRead !== undefined) params.append('isRead', String(query.isRead))
  const qs = params.toString()
  const res = await apiClient.get<{ data?: TNotification[]; pagination?: { total?: number }; unreadCount?: number }>(
    qs ? `/notifications?${qs}` : '/notifications',
  )
  const data = res.data.data ?? []
  return { data, total: res.data.pagination?.total ?? data.length, unreadCount: res.data.unreadCount ?? 0 }
}

/**
 * Lấy số lượng thông báo chưa đọc (dùng cho badge đỏ trên chuông).
 * GET /notifications/unread-count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const res = await apiClient.get<{ unreadCount: number } | number>('/notifications/unread-count')
    if (typeof res.data === 'number') return res.data
    return (res.data as { unreadCount: number }).unreadCount ?? 0
  } catch {
    return 0
  }
}

/**
 * Đánh dấu một thông báo cụ thể là đã đọc.
 * PATCH /notifications/:id/read
 */
export async function markAsRead(notificationId: string): Promise<TNotification | null> {
  try {
    const res = await apiClient.patch<TNotification>(`/notifications/${notificationId}/read`, {})
    return res.data
  } catch {
    return null
  }
}

/**
 * Đánh dấu tất cả thông báo của user là đã đọc.
 * PATCH /notifications/read-all
 */
export async function markAllAsRead(): Promise<boolean> {
  try {
    await apiClient.patch('/notifications/read-all', {})
    return true
  } catch {
    return false
  }
}

/**
 * Xóa một thông báo khỏi hộp thư.
 * DELETE /notifications/:id
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    await apiClient.delete(`/notifications/${notificationId}`)
    return true
  } catch {
    return false
  }
}

/**
 * Ban Quản Lý phát sóng thông báo đến toàn bộ cư dân trong tòa nhà.
 * POST /notifications/broadcast
 * Chỉ dành cho BUILDING_ADMIN và SYSTEM_ADMIN.
 */
export async function broadcastToBuilding(payload: TBroadcastPayload): Promise<TBroadcastResult> {
  // Server trả { message, sentCount }
  const res = await apiClient.post<{ message?: string; sentCount?: number }>('/notifications/broadcast', payload)
  return { sent: res.data.sentCount ?? 0, notifications: [] }
}
