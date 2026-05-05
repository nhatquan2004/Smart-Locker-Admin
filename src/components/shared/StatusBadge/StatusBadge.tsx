import styles from './StatusBadge.module.css'

type TStatusTone = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'

type TProps = {
    label: string
    tone: TStatusTone
    pulse?: boolean
}

export function StatusBadge({label, tone, pulse = false}: TProps) {
    return (
        <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}>
      <span className={`${styles.dot} ${pulse ? styles.dotPulse : ''}`}></span>
            {label}
    </span>
    )
}
