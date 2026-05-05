import {useEffect, useState} from 'react'
import type {TActivityStatItem} from '../../types/activity.type'
import styles from './ActivityStatCard.module.css'

type TProps = {
    item: TActivityStatItem
}

const iconMap: Record<TActivityStatItem['id'], string> = {
    total: '📊',
    customers: '🛍️',
    shippers: '🚚',
    issues: '⚠️',
}

export function ActivityStatCard({item}: TProps) {
    const [display, setDisplay] = useState(0)

    useEffect(() => {
        const target = Number(item.value)
        let progress = 0

        const timer = window.setInterval(() => {
            progress += 0.05

            if (progress >= 1) {
                progress = 1
                window.clearInterval(timer)
            }

            setDisplay(Math.round(target * progress))
        }, 16)

        return () => window.clearInterval(timer)
    }, [item.value])

    return (
        <article className={`${styles.card} ${styles[`tone_${item.tone}`]}`}>
            <div className={styles.glow}></div>

            <div className={styles.topRow}>
                <div className={styles.heading}>
                    <span className={styles.icon}>{iconMap[item.id] ?? '📌'}</span>
                    <span className={styles.label}>{item.label}</span>
                </div>
                <span className={styles.dot}></span>
            </div>

            <h3 className={styles.value}>{display}</h3>
            <p className={styles.helper}>{item.helper}</p>
        </article>
    )
}
