import type {TSystemStatus} from "../../types/dashboard.type.ts";
import styles from './SystemStatusCard.module.css'

type TProps = {
    status: TSystemStatus
}

const toneLabelMap = {
    healthy: '● HEALTHY',
    warning: '⚠️ WARNING',
    critical: '● CRITICAL',
    info: '● INFO',
} as const

export function SystemStatusCard({status}: TProps) {
    const progress = status.id === 'sensor-sync' ? 95.8 : null
    return (
        <article className={`${styles.card} ${styles[`card_${status.tone}`]}`}>
            <div className={styles.row}>
                <div>
                    <p className={styles.label}>{status.label}</p>
                    <h4 className={styles.value}>{status.value}</h4>
                </div>
                <span className={`${styles.badge} ${styles[`badge_${status.tone}`]}`}>
          {toneLabelMap[status.tone]}
        </span>
            </div>

            <p className={styles.detail}>{status.detail}</p>

            {progress !== null ? (
                <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                        <div className={styles.progressBar} style={{width: `${progress}%`}}></div>
                    </div>
                    <span className={styles.progressText}>{progress}%</span>
                </div>
            ) : null}
        </article>
    )
}
