export type TShipmentStatus =
    | 'pending'
    | 'stored'
    | 'waiting_pickup'
    | 'picked_up'
    | 'expired'
    | 'failed'

export type TOtpStatus = 'active' | 'used' | 'expired'

export type TShipmentCluster = 'A' | 'B' | 'C' | 'D'

export type TShipment = {
    id: string
    shipmentCode: string
    recipientName: string
    recipientPhone: string
    lockerCode: string
    cluster: TShipmentCluster
    lockerSize: 'small' | 'medium' | 'large'
    otpCode: string
    otpStatus: TOtpStatus
    shipmentStatus: TShipmentStatus
    createdAt: string
    updatedAt: string
    shipperName: string
    note?: string
}

export type TShipmentFilter = {
    search: string
    shipmentStatus: 'all' | TShipmentStatus
    otpStatus: 'all' | TOtpStatus
    cluster: 'all' | TShipmentCluster
}

export type TShipmentStatItem = {
    id: string
    label: string
    value: string
    helper: string
    tone: 'blue' | 'green' | 'orange' | 'red'
}
