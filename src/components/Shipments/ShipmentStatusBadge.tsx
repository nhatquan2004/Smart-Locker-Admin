import {StatusBadge} from '../shared/StatusBadge/StatusBadge'
import type {TOtpStatus, TShipmentStatus} from '../../types/shipment.type'
import {useTranslation} from '../../context/LanguageContext'
import type {TranslationKey} from '../../i18n/translations'

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
        labelKey: TranslationKey
        tone: 'blue' | 'green' | 'orange' | 'red'
        pulse?: boolean
    }
> = {
    pending: {
        labelKey: 'sh.st.pending',
        tone: 'blue',
        pulse: true,
    },
    stored: {
        labelKey: 'sh.st.stored',
        tone: 'green',
        pulse: true,
    },
    waiting_pickup: {
        labelKey: 'sh.st.waiting_pickup',
        tone: 'orange',
        pulse: true,
    },
    picked_up: {
        labelKey: 'sh.st.picked_up',
        tone: 'green',
        pulse: true,
    },
    expired: {
        labelKey: 'sh.st.expired',
        tone: 'red',
        pulse: true,
    },
    moved_to_storage: {
        labelKey: 'sh.st.moved_to_storage',
        tone: 'orange',
        pulse: false,
    },
    failed: {
        labelKey: 'sh.st.failed',
        tone: 'red',
        pulse: true,
    },
}

const otpStatusMap: Record<
    TOtpStatus,
    {
        labelKey: TranslationKey
        tone: 'blue' | 'green' | 'gray'
        pulse?: boolean
    }
> = {
    active: {
        labelKey: 'sh.otp.active',
        tone: 'blue',
        pulse: true,
    },
    used: {
        labelKey: 'sh.otp.used',
        tone: 'green',
        pulse: false,
    },
    expired: {
        labelKey: 'sh.otp.expired',
        tone: 'gray',
        pulse: false,
    },
}

export function ShipmentStatusBadge(props: TProps) {
    const {t} = useTranslation()
    if (props.type === 'shipment') {
        const config = shipmentStatusMap[props.shipmentStatus]
        return <StatusBadge label={t(config.labelKey)} tone={config.tone} pulse={config.pulse}/>
    }

    const config = otpStatusMap[props.otpStatus]
    return <StatusBadge label={t(config.labelKey)} tone={config.tone} pulse={config.pulse}/>
}
