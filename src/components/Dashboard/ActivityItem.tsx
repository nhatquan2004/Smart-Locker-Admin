import type {TActivityItem} from '../../types/activity.type'
import styles from './ActivityItem.module.css'

type TProps = {
    item: TActivityItem
}

function getToneClass(status: TActivityItem['status']) {
    switch (status) {
        case 'success':
            return styles.dot_green
        case 'info':
            return styles.dot_blue
        case 'warning':
            return styles.dot_orange
        case 'error':
            return styles.dot_purple
        default:
            return styles.dot_blue
    }
}

export function ActivityItem({item}: TProps) {
    return (
        <article className={styles.item}>
            <div className={`${styles.dot} ${getToneClass(item.status)}`}/>

            <div className={styles.content}>
                <div className={styles.row}>
                    <h4 className={styles.title}>{item.title}</h4>
                    <span className={styles.time}>{item.timeLabel}</span>
                </div>

                <p className={styles.description}>{item.description}</p>
                <span className={styles.actor}>{item.actorName}</span>
            </div>
        </article>
    )
}
