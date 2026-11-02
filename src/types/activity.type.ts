// Giá trị theo đúng enum của module activity-logs trên server
export type TActivityRole =
  | 'SYSTEM_ADMIN'
  | 'BUILDING_ADMIN'
  | 'SHIPPER'
  | 'RESIDENT'
  | 'KIOSK'
  | 'SYSTEM'
  | 'DEVICE'

export type TActivityCategory =
  | 'PACKAGE'
  | 'PICKUP'
  | 'LOCKER'
  | 'HARDWARE'
  | 'SETTINGS'
  | 'USER'
  | 'PAYMENT'
  | 'ISSUE'

export type TActivityStatus = 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR'

export type TActivityTargetType = 'LOCKER' | 'PACKAGE' | 'USER' | 'BUILDING' | 'ISSUE' | 'SYSTEM'

export type TActivityItem = {
  id: string
  actorId?: string
  actorName: string
  actorRole: TActivityRole
  actorPhone?: string
  buildingId?: string
  orgName?: string
  category: TActivityCategory
  status: TActivityStatus
  title: string
  description?: string
  targetType?: TActivityTargetType
  targetId?: string
  targetLabel?: string
  createdAt: string
}

export type TActivityQuery = {
  category?: TActivityCategory
  status?: TActivityStatus
  actorRole?: TActivityRole
  actorId?: string
  buildingId?: string
  search?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export type TActivityPage = { items: TActivityItem[]; total: number; page: number; limit: number }

// Thống kê của server: mặc định 30 ngày gần nhất, tối đa 366 ngày
export type TActivityStats = {
  from: string
  to: string
  total: number
  byStatus: Partial<Record<TActivityStatus, number>>
  byCategory: Partial<Record<TActivityCategory, number>>
  byDay: { date: string; count: number }[]
}
