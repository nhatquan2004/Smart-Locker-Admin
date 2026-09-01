import {StatusBadge} from '../shared/StatusBadge/StatusBadge'
import type {TOtpStatus, TShipmentStatus} from '../../types/shipment.type'

type TProps =
    | {
    type: 'shipment'
    shipmentStatus: TShipmentStatus
    otpStatus?: never
}
    | {
    type: 'otp'
    shipmentStatus?: never
    otpStatus: TOtpStatus
}

const shipmentStatusMap: Record<
    TShipmentStatus,
    {
        label: string
        tone: 'blue' | 'green' | 'orange' | 'red'
        pulse?: boolean
    }
> = {
    pending: {
        label: 'PENDING',
        tone: 'blue',
        pulse: true,
    },
    stored: {
        label: 'STORED',
        tone: 'green',
        pulse: true,
    },
    waiting_pickup: {
        label: 'WAITING PICKUP',
        tone: 'orange',
        pulse: true,
    },
    picked_up: {
        label: 'PICKED UP',
        tone: 'green',
        pulse: true,
    },
    expired: {
        label: 'EXPIRED',
        tone: 'red',
        pulse: true,
    },
    moved_to_storage: {
        label: 'MOVED TO STORAGE',
        tone: 'orange',
        pulse: false,
    },
    failed: {
        label: 'FAILED',
        tone: 'red',
        pulse: true,
    },
}

const otpStatusMap: Record<
    TOtpStatus,
    {
        label: string
        tone: 'blue' | 'green' | 'gray'
        pulse?: boolean
    }
> = {
    active: {
        label: 'OTP ACTIVE',
        tone: 'blue',
        pulse: true,
    },
    used: {
        label: 'OTP USED',
        tone: 'green',
        pulse: false,
    },
    expired: {
        label: 'OTP EXPIRED',
        tone: 'gray',
        pulse: false,
    },
}

export function ShipmentStatusBadge(props: TProps) {
    if (props.type === 'shipment') {
        const config = shipmentStatusMap[props.shipmentStatus]
        return <StatusBadge label={config.label} tone={config.tone} pulse={config.pulse}/>
    }

    const config = otpStatusMap[props.otpStatus]
    return <StatusBadge label={config.label} tone={config.tone} pulse={config.pulse}/>
}
