import {StatusBadge} from '../shared/StatusBadge/StatusBadge'
import type {TUserRole} from '../../types/user.type'

type TProps = {
    role: TUserRole
}

const roleMap: Record<
    TUserRole,
    {
        label: string
        tone: 'green' | 'blue' | 'red'
        pulse?: boolean
    }
> = {
    customer: {
        label: 'CUSTOMER',
        tone: 'green',
        pulse: false,
    },
    shipper: {
        label: 'SHIPPER',
        tone: 'blue',
        pulse: false,
    },
    admin: {
        label: 'ADMIN',
        tone: 'red',
        pulse: false,
    },
}

export function UserRoleBadge({role}: TProps) {
    const config = roleMap[role]

    return <StatusBadge label={config.label} tone={config.tone} pulse={config.pulse}/>
}
