import styles from './ActivityFeedCard.module.css'
import type {TActivityItem} from '../../types/activity.type'

type TProps = {
    item: TActivityItem
}

function getRoleLabel(role: TActivityItem['actorRole']) {
    switch (role) {
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

function getStatusLabel(status: TActivityItem['status']) {
    switch (status) {
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

function getCategoryLabel(category: TActivityItem['category']) {
    switch (category) {
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

export function ActivityFeedCard({item}: TProps) {
    return (
        <article className={`${styles.card} ${styles[`status_${item.status}`]}`}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <p className={styles.category}>{getCategoryLabel(item.category)}</p>
                    <h3 className={styles.title}>{item.title}</h3>
                </div>

                <div className={styles.badges}>
          <span className={`${styles.badge} ${styles[`role_${item.actorRole}`]}`}>
            {getRoleLabel(item.actorRole)}
          </span>
                    <span className={`${styles.badge} ${styles[`statusBadge_${item.status}`]}`}>
            {getStatusLabel(item.status)}
          </span>
                </div>
            </div>

            <p className={styles.description}>{item.description}</p>

            <div className={styles.metaLine}>
        <span>
          👤 <strong>{item.actorName}</strong>
        </span>
                {item.targetLabel ? (
                    <span>
            🎯 <strong>{item.targetLabel}</strong>
          </span>
                ) : null}
                <span>
          🕒 <strong>{item.timeLabel}</strong>
        </span>
            </div>
        </article>
    )
}
