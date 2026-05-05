import {FilterSelect} from '../shared/FilterSelect/FilterSelect'
import {SearchField} from '../shared/SearchField/SearchField'
import type {TUserFilter, TUserRole, TUserStatus} from '../../types/user.type'
import styles from './UserFilterBar.module.css'

type TProps = {
    filter: TUserFilter
    onChange: (nextFilter: TUserFilter) => void
}

const roleOptions: Array<{ label: string; value: 'all' | TUserRole }> = [
    {label: 'Tất cả vai trò', value: 'all'},
    {label: 'Customer', value: 'customer'},
    {label: 'Shipper', value: 'shipper'},
    {label: 'Admin', value: 'admin'},
]

const statusOptions: Array<{ label: string; value: 'all' | TUserStatus }> = [
    {label: 'Tất cả trạng thái', value: 'all'},
    {label: 'Active', value: 'active'},
    {label: 'Inactive', value: 'inactive'},
    {label: 'Banned', value: 'blocked'},
]

export function UserFilterBar({filter, onChange}: TProps) {
    return (
        <section className={styles.wrapper}>
            <div className={styles.searchGroup}>
                <SearchField
                    id="user-search"
                    label="Tìm người dùng"
                    value={filter.search}
                    placeholder="Tên, số điện thoại, email hoặc mã user..."
                    onChange={(value) =>
                        onChange({
                            ...filter,
                            search: value,
                        })
                    }
                />
            </div>

            <FilterSelect
                id="user-role"
                label="Vai trò"
                value={filter.role}
                options={roleOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        role: value as TUserFilter['role'],
                    })
                }
            />

            <FilterSelect
                id="user-status"
                label="Trạng thái"
                value={filter.status}
                options={statusOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        status: value as TUserFilter['status'],
                    })
                }
            />
        </section>
    )
}
