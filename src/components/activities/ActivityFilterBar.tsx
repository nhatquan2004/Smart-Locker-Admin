import type {TActivityCategory, TActivityFilter, TActivityRole, TActivityStatus,} from '../../types/activity.type'
import styles from './ActivityFilterBar.module.css'

type TProps = {
    filter: TActivityFilter
    onChange: (nextFilter: TActivityFilter) => void
}

const roleOptions: Array<'all' | TActivityRole> = ['all', 'customer', 'shipper', 'admin', 'system']
const categoryOptions: Array<'all' | TActivityCategory> = [
    'all',
    'shipment',
    'otp',
    'locker',
    'hardware',
    'settings',
    'user',
]
const statusOptions: Array<'all' | TActivityStatus> = ['all', 'success', 'info', 'warning', 'error']

function getRoleLabel(role: 'all' | TActivityRole) {
    switch (role) {
        case 'all':
            return 'Tất cả vai trò'
        case 'customer':
            return 'Customer'
        case 'shipper':
            return 'Shipper'
        case 'admin':
            return 'Admin'
        case 'system':
            return 'System'
        default:
            return role
    }
}

function getCategoryLabel(category: 'all' | TActivityCategory) {
    switch (category) {
        case 'all':
            return 'Tất cả loại'
        case 'shipment':
            return 'Shipment'
        case 'otp':
            return 'OTP'
        case 'locker':
            return 'Locker'
        case 'hardware':
            return 'Hardware'
        case 'settings':
            return 'Settings'
        case 'user':
            return 'User'
        default:
            return category
    }
}

function getStatusLabel(status: 'all' | TActivityStatus) {
    switch (status) {
        case 'all':
            return 'Tất cả trạng thái'
        case 'success':
            return 'Success'
        case 'info':
            return 'Info'
        case 'warning':
            return 'Warning'
        case 'error':
            return 'Error'
        default:
            return status
    }
}

export function ActivityFilterBar({filter, onChange}: TProps) {
    return (
        <section className={styles.wrapper}>
            <div className={styles.searchGroup}>
                <label className={styles.label} htmlFor="activity-search">
                    Tìm hoạt động
                </label>

                <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🔍</span>
                    <input
                        id="activity-search"
                        type="text"
                        className={styles.input}
                        placeholder="Tên actor, locker, shipment, OTP..."
                        value={filter.search}
                        onChange={(event) =>
                            onChange({
                                ...filter,
                                search: event.target.value,
                            })
                        }
                    />
                </div>
            </div>

            <div className={styles.selectGroup}>
                <label className={styles.label} htmlFor="activity-role">
                    Vai trò
                </label>

                <div className={styles.selectWrap}>
                    <select
                        id="activity-role"
                        className={styles.select}
                        value={filter.role}
                        onChange={(event) =>
                            onChange({
                                ...filter,
                                role: event.target.value as TActivityFilter['role'],
                            })
                        }
                    >
                        {roleOptions.map((role) => (
                            <option key={role} value={role}>
                                {getRoleLabel(role)}
                            </option>
                        ))}
                    </select>

                    <span className={styles.selectArrow}>⌄</span>
                </div>
            </div>

            <div className={styles.selectGroup}>
                <label className={styles.label} htmlFor="activity-category">
                    Danh mục
                </label>

                <div className={styles.selectWrap}>
                    <select
                        id="activity-category"
                        className={styles.select}
                        value={filter.category}
                        onChange={(event) =>
                            onChange({
                                ...filter,
                                category: event.target.value as TActivityFilter['category'],
                            })
                        }
                    >
                        {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                                {getCategoryLabel(category)}
                            </option>
                        ))}
                    </select>

                    <span className={styles.selectArrow}>⌄</span>
                </div>
            </div>

            <div className={styles.selectGroup}>
                <label className={styles.label} htmlFor="activity-status">
                    Trạng thái
                </label>

                <div className={styles.selectWrap}>
                    <select
                        id="activity-status"
                        className={styles.select}
                        value={filter.status}
                        onChange={(event) =>
                            onChange({
                                ...filter,
                                status: event.target.value as TActivityFilter['status'],
                            })
                        }
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {getStatusLabel(status)}
                            </option>
                        ))}
                    </select>

                    <span className={styles.selectArrow}>⌄</span>
                </div>
            </div>
        </section>
    )
}
