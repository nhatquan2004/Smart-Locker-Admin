import type {TLockerStatus} from '../../types/locker.type'
import {StatusBadge} from '../shared/StatusBadge/StatusBadge'

type TProps = {
    status: TLockerStatus
}

const statusMap: Record<
    TLockerStatus,
    {
        label: string
        tone: 'green' | 'orange' | 'red' | 'purple'
        pulse?: boolean
    }
> = {
    available: {
        label: 'AVAILABLE',
        tone: 'green',
        pulse: true,
    },
    occupied: {
        label: 'OCCUPIED',
        tone: 'orange',
        pulse: true,
    },
    offline: {
        label: 'OFFLINE',
        tone: 'red',
        pulse: true,
    },
    maintenance: {
        label: 'MAINTENANCE',
        tone: 'purple',
        pulse: true,
    },
}

export function LockerStatusBadge({status}: TProps) {
    const config = statusMap[status]

    return <StatusBadge label={config.label} tone={config.tone} pulse={config.pulse}/>
}
