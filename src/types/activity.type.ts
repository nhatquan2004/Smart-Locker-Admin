export type TActivityRole = 'customer' | 'shipper' | 'admin' | 'system'

export type TActivityCategory =
    | 'shipment'
    | 'otp'
    | 'locker'
    | 'hardware'
    | 'settings'
    | 'user'

export type TActivityStatus = 'success' | 'info' | 'warning' | 'error'

export type TActivityTargetType = 'locker' | 'shipment' | 'user' | 'system'

export type TActivityItem = {
    id: string
    actorId?: string
    actorName: string
    actorRole: TActivityRole
    category: TActivityCategory
    status: TActivityStatus
    title: string
    description: string
    targetId?: string
    targetType?: TActivityTargetType
    targetLabel?: string
    createdAt: string
    timeLabel: string
}

export type TActivityStatItem = {
    id: string
    label: string
    value: string
    helper: string
    tone: 'blue' | 'green' | 'orange' | 'red'
}

export type TActivityFilter = {
    search: string
    role: 'all' | TActivityRole
    category: 'all' | TActivityCategory
    status: 'all' | TActivityStatus
}
