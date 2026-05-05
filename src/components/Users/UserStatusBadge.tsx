import {StatusBadge} from '../shared/StatusBadge/StatusBadge'
import type {TUserStatus} from '../../types/user.type'

type TProps = {
    status: TUserStatus
}

const statusMap: Record<
    TUserStatus,
    {
        label: string
        tone: 'green' | 'gray' | 'red'
        pulse?: boolean
    }
> = {
    active: {
        label: 'ACTIVE',
        tone: 'green',
        pulse: true,
    },
    inactive: {
        label: 'INACTIVE',
        tone: 'gray',
        pulse: false,
    },
    blocked: {
        label: 'BANNED',
        tone: 'red',
        pulse: true,
    },
}

export function UserStatusBadge({status}: TProps) {
    const config = statusMap[status]

    return <StatusBadge label={config.label} tone={config.tone} pulse={config.pulse}/>
}
