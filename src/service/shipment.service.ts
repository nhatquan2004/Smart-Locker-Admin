import type {
  TShipment,
  TShipmentPage,
  TShipmentQuery,
  TShipmentStatus,
} from '../types/shipment.type'
import { apiClient } from './api.client'

// Dữ liệu từ GET /packages và GET /packages/:id (AdminPackageItemDto của server)
type TApiPackage = {
  _id: string
  trackingNumber: string
  status: TShipmentStatus
  boxNumber: number
  boxSize: TShipment['boxSize']
  carrierName: string
  receiverName: string
  receiverPhone: string
  apartment: string
  shipperName?: string
  shipperPhone: string
  isShipperVerified: boolean
  locker?: { _id: string; code: string; name: string }
  building?: { _id: string; name: string }
  droppedOffAt: string
  expiredAt: string
  pickedUpAt?: string
  paidUntil?: string
  totalFeePaid: number
  note?: string
  createdAt: string
  updatedAt: string
}

type TApiPage = { data: TApiPackage[]; total: number; page: number; limit: number }

function mapPackage(p: TApiPackage): TShipment {
  return {
    id: p._id,
    trackingNumber: p.trackingNumber,
    status: p.status,
    boxNumber: p.boxNumber,
    boxSize: p.boxSize,
    carrierName: p.carrierName,
    receiverName: p.receiverName,
    receiverPhone: p.receiverPhone,
    apartment: p.apartment,
    shipperName: p.shipperName,
    shipperPhone: p.shipperPhone,
    isShipperVerified: p.isShipperVerified,
    lockerId: p.locker?._id,
    lockerCode: p.locker?.code,
    lockerName: p.locker?.name,
    buildingName: p.building?.name,
    droppedOffAt: p.droppedOffAt,
    expiredAt: p.expiredAt,
    pickedUpAt: p.pickedUpAt,
    paidUntil: p.paidUntil,
    totalFeePaid: p.totalFeePaid ?? 0,
    note: p.note,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

function toQueryString(query: TShipmentQuery): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

// Danh sách phân trang, lọc và tìm kiếm đều do server xử lý
export async function getShipments(query: TShipmentQuery = {}): Promise<TShipmentPage> {
  const res = await apiClient.get<TApiPage>(`/packages${toQueryString(query)}`)
  return {
    items: (res.data.data ?? []).map(mapPackage),
    total: res.data.total ?? 0,
    page: res.data.page ?? 1,
    limit: res.data.limit ?? query.limit ?? 20,
  }
}

export async function getShipmentById(id: string): Promise<TShipment> {
  const res = await apiClient.get<TApiPackage>(`/packages/${encodeURIComponent(id)}`)
  return mapPackage(res.data)
}

// Server không có API thống kê bưu kiện, nên đếm theo từng trạng thái bằng cách xin 1 bản ghi và đọc total
export async function getShipmentCounts(
  scope: Pick<TShipmentQuery, 'buildingId'> = {},
): Promise<Record<TShipmentStatus | 'all', number>> {
  const statuses: TShipmentStatus[] = ['WAITING_FOR_PICKUP', 'PICKED_UP', 'OVERDUE', 'RETURNED']
  const [all, ...byStatus] = await Promise.all([
    getShipments({ ...scope, limit: 1 }),
    ...statuses.map((status) => getShipments({ ...scope, status, limit: 1 })),
  ])
  const counts = { all: all.total } as Record<TShipmentStatus | 'all', number>
  statuses.forEach((status, i) => {
    counts[status] = byStatus[i].total
  })
  return counts
}

// Thu hồi bưu kiện về kho Ban quản lý: đổi trạng thái, giải phóng ngăn và mở cửa ngăn tủ
export async function returnShipment(
  id: string,
  reason?: string,
): Promise<{ message: string; doorUnlocked: boolean }> {
  const res = await apiClient.post<{ message: string; doorUnlocked: boolean }>(
    `/packages/${encodeURIComponent(id)}/return`,
    reason?.trim() ? { reason: reason.trim() } : {},
  )
  return res.data
}

// Cấp lại OTP: mã mới chỉ được gửi cho cư dân, admin không nhìn thấy mã
export async function resendShipmentOtp(id: string): Promise<string> {
  const res = await apiClient.post<{ message: string }>(
    `/packages/${encodeURIComponent(id)}/resend-otp`,
    {},
  )
  return res.data.message
}
