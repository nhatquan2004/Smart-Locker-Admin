import {FilterSelect} from '../shared/FilterSelect/FilterSelect'
import {SearchField} from '../shared/SearchField/SearchField'
import type {TLockerCluster, TLockerFilter, TLockerSize, TLockerStatus} from '../../types/locker.type'
import styles from './LockerFilterBar.module.css'

type TProps = {
    filter: TLockerFilter
    onChange: (nextFilter: TLockerFilter) => void
}

const statusOptions: Array<{ label: string; value: 'all' | TLockerStatus }> = [
    {label: 'Tất cả trạng thái', value: 'all'},
    {label: 'Available', value: 'available'},
    {label: 'Occupied', value: 'occupied'},
    {label: 'Offline', value: 'offline'},
    {label: 'Maintenance', value: 'maintenance'},
]

const sizeOptions: Array<{ label: string; value: 'all' | TLockerSize }> = [
    {label: 'Tất cả kích thước', value: 'all'},
    {label: 'Small', value: 'small'},
    {label: 'Medium', value: 'medium'},
    {label: 'Large', value: 'large'},
]

const clusterOptions: Array<{ label: string; value: 'all' | TLockerCluster }> = [
    {label: 'Tất cả cụm tủ', value: 'all'},
    {label: 'Cluster A', value: 'A'},
    {label: 'Cluster B', value: 'B'},
    {label: 'Cluster C', value: 'C'},
    {label: 'Cluster D', value: 'D'},
]

export function LockerFilterBar({filter, onChange}: TProps) {
    return (
        <section className={styles.wrapper}>
            <div className={styles.searchGroup}>
                <SearchField
                    id="locker-search"
                    label="Tìm locker"
                    value={filter.search}
                    placeholder="Nhập mã tủ, tên tủ hoặc vị trí..."
                    onChange={(value) =>
                        onChange({
                            ...filter,
                            search: value,
                        })
                    }
                />
            </div>

            <FilterSelect
                id="locker-status"
                label="Trạng thái"
                value={filter.status}
                options={statusOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        status: value as TLockerFilter['status'],
                    })
                }
            />

            <FilterSelect
                id="locker-size"
                label="Kích thước"
                value={filter.size}
                options={sizeOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        size: value as TLockerFilter['size'],
                    })
                }
            />

            <FilterSelect
                id="locker-cluster"
                label="Cụm tủ"
                value={filter.cluster}
                options={clusterOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        cluster: value as TLockerFilter['cluster'],
                    })
                }
            />
        </section>
    )
}
