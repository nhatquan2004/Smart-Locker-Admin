import styles from './EmptyState.module.css'

type TProps = {
    icon?: string
    title: string
    description: string
}

export function EmptyState({icon = '📭', title, description}: TProps) {
    return (
        <section className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>{icon}</div>
            <h3 className={styles.emptyStateTitle}>{title}</h3>
            <p className={styles.emptyStateText}>{description}</p>
        </section>
    )
}
