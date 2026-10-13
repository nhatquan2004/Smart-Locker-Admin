import {StatusBadge} from '../shared/StatusBadge/StatusBadge'
import {useTranslation} from '../../context/LanguageContext'
import type {TranslationKey} from '../../i18n/translations'
import type {TUserStatus} from '../../types/user.type'

type TProps = {
    status: TUserStatus
}

const statusMap: Record<
    TUserStatus,
    {
        labelKey: TranslationKey
        tone: 'green' | 'gray' | 'red'
        pulse?: boolean
    }
> = {
    active: {
        labelKey: 'users.active',
        tone: 'green',
        pulse: true,
    },
    inactive: {
        labelKey: 'users.inactive',
        tone: 'gray',
        pulse: false,
    },
    blocked: {
        labelKey: 'users.blocked',
        tone: 'red',
        pulse: true,
    },
}

export function UserStatusBadge({status}: TProps) {
    const {t} = useTranslation()
    const config = statusMap[status]

    return <StatusBadge label={t(config.labelKey)} tone={config.tone} pulse={config.pulse}/>
}
