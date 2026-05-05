export type TLockerStatus = 'available' | 'occupied' | 'offline' | 'maintenance'

export type TLockerSize = 'small' | 'medium' | 'large'

export type TLockerCluster = 'A' | 'B' | 'C' | 'D'

export type TLocker = {
    id: string
    code: string
    name: string
    cluster: TLockerCluster
    size: TLockerSize
    status: TLockerStatus
    location: string
    currentUser?: string
    currentPackage?: string
    lastUpdated: string
    note?: string
}

export type TLockerFilter = {
    search: string
    status: 'all' | TLockerStatus
    size: 'all' | TLockerSize
    cluster: 'all' | TLockerCluster
}

export type TLockerStatItem = {
    id: string
    label: string
    value: string
    helper: string
    tone: 'blue' | 'green' | 'orange' | 'red'
}
