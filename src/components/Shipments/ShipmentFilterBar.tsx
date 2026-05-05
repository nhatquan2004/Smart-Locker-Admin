import {FilterSelect} from '../shared/FilterSelect/FilterSelect'
import {SearchField} from '../shared/SearchField/SearchField'
import type {TOtpStatus, TShipmentCluster, TShipmentFilter, TShipmentStatus,} from '../../types/shipment.type'
import styles from './ShipmentFilterBar.module.css'

type TProps = {
    filter: TShipmentFilter
    onChange: (nextFilter: TShipmentFilter) => void
}

const shipmentStatusOptions: Array<{ label: string; value: 'all' | TShipmentStatus }> = [
    {label: 'Tất cả trạng thái đơn', value: 'all'},
    {label: 'Pending', value: 'pending'},
    {label: 'Stored', value: 'stored'},
    {label: 'Waiting Pickup', value: 'waiting_pickup'},
    {label: 'Picked Up', value: 'picked_up'},
    {label: 'Expired', value: 'expired'},
    {label: 'Failed', value: 'failed'},
]

const otpStatusOptions: Array<{ label: string; value: 'all' | TOtpStatus }> = [
    {label: 'Tất cả trạng thái OTP', value: 'all'},
    {label: 'Active', value: 'active'},
    {label: 'Used', value: 'used'},
    {label: 'Expired', value: 'expired'},
]

const clusterOptions: Array<{ label: string; value: 'all' | TShipmentCluster }> = [
    {label: 'Tất cả cụm tủ', value: 'all'},
    {label: 'Cluster A', value: 'A'},
    {label: 'Cluster B', value: 'B'},
    {label: 'Cluster C', value: 'C'},
    {label: 'Cluster D', value: 'D'},
]

export function ShipmentFilterBar({filter, onChange}: TProps) {

    return (
        <section className={styles.wrapper}>
            <div className={styles.searchGroup}>
                <SearchField
                    id="shipment-search"
                    label="Tìm đơn hàng"
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
                label="Trạng thái đơn"
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
                label="Trạng thái OTP"
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
                label="Cụm tủ"
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
