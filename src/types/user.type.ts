export type TUserRole = 'customer' | 'shipper' | 'admin'

export type TUserStatus = 'active' | 'inactive' | 'blocked'

export type TUser = {
    id: string
    userCode: string
    fullName: string
    phone: string
    email: string
    role: TUserRole
    status: TUserStatus
    createdAt: string
    lastActive: string
    totalShipments: number
    note?: string
}

export type TUserFilter = {
    search: string
    role: 'all' | TUserRole
    status: 'all' | TUserStatus
}

export type TUserStatItem = {
    id: string
    label: string
    value: string
    helper: string
    tone: 'blue' | 'green' | 'orange' | 'red'
}
