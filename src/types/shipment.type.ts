// Trạng thái bưu kiện theo đúng enum PackageStatus của server
export type TShipmentStatus = 'WAITING_FOR_PICKUP' | 'PICKED_UP' | 'OVERDUE' | 'RETURNED'

export type TShipmentBoxSize = 'SMALL' | 'MEDIUM' | 'LARGE'

// Bưu kiện hiển thị cho admin. Server không bao giờ trả mã OTP hay mã QR.
export type TShipment = {
  id: string
  trackingNumber: string
  status: TShipmentStatus
  boxNumber: number
  boxSize: TShipmentBoxSize
  carrierName: string
  receiverName: string
  receiverPhone: string
  apartment: string
  shipperName?: string
  shipperPhone: string
  isShipperVerified: boolean
  lockerId?: string
  lockerCode?: string
  lockerName?: string
  buildingName?: string
  droppedOffAt: string
  expiredAt: string
  pickedUpAt?: string
  paidUntil?: string
  totalFeePaid: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type TShipmentQuery = {
  status?: TShipmentStatus
  search?: string
  // Chỉ Super Admin dùng được; Ban quản lý luôn bị giới hạn trong tòa của mình
  buildingId?: string
  lockerId?: string
  page?: number
  limit?: number
}

export type TShipmentPage = {
  items: TShipment[]
  total: number
  page: number
  limit: number
}
