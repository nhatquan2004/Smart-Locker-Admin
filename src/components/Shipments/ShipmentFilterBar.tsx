import {FilterSelect} from '../shared/FilterSelect/FilterSelect'
import {SearchField} from '../shared/SearchField/SearchField'
import type {TOtpStatus, TShipmentCluster, TShipmentFilter, TShipmentStatus,} from '../../types/shipment.type'
import { useTranslation } from '../../context/LanguageContext'

type TProps = {
    filter: TShipmentFilter
    onChange: (nextFilter: TShipmentFilter) => void
}

export function ShipmentFilterBar({filter, onChange}: TProps) {
    const { t } = useTranslation()

    const shipmentStatusOptions: Array<{ label: string; value: 'all' | TShipmentStatus }> = [
        {label: t('role.all'), value: 'all'},
        {label: 'Pending', value: 'pending'},
        {label: 'Stored', value: 'stored'},
        {label: t('shipments.waitingFilter'), value: 'waiting_pickup'},
        {label: t('shipments.completedFilter'), value: 'picked_up'},
        {label: 'Expired', value: 'expired'},
        {label: 'Failed', value: 'failed'},
    ]

    const otpStatusOptions: Array<{ label: string; value: 'all' | TOtpStatus }> = [
        {label: t('role.all'), value: 'all'},
        {label: 'Active', value: 'active'},
        {label: 'Used', value: 'used'},
        {label: 'Expired', value: 'expired'},
    ]

    const clusterOptions: Array<{ label: string; value: 'all' | TShipmentCluster }> = [
        {label: t('lockers.allClusters'), value: 'all'},
        {label: 'Cluster A', value: 'A'},
        {label: 'Cluster B', value: 'B'},
        {label: 'Cluster C', value: 'C'},
        {label: 'Cluster D', value: 'D'},
    ]

    return (
        <section className="flex flex-wrap gap-3 p-5 rounded-2xl border border-[--color-border] bg-[--color-surface]">
            <div className="flex-1 min-w-[200px]">
                <SearchField
                    id="shipment-search"
                    label={t('common.search')}
                    value={filter.search}
                    placeholder="Mã đơn, tên người nhận, số điện thoại..."
                    onChange={(value) =>
                        onChange({
                            ...filter,
                            search: value,
                        })
                    }
                />
            </div>

            <FilterSelect
                id="shipment-status"
                label={t('common.status')}
                value={filter.shipmentStatus}
                options={shipmentStatusOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        shipmentStatus: value as TShipmentFilter['shipmentStatus'],
                    })
                }
            />

            <FilterSelect
                id="otp-status"
                label={t('shipments.colOtp')}
                value={filter.otpStatus}
                options={otpStatusOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        otpStatus: value as TShipmentFilter['otpStatus'],
                    })
                }
            />

            <FilterSelect
                id="shipment-cluster"
                label={t('lockers.allClusters')}
                value={filter.cluster}
                options={clusterOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        cluster: value as TShipmentFilter['cluster'],
                    })
                }
            />
        </section>
    )
}
