import {useEffect, useState} from 'react'
import type {TSettingStatItem} from '../../types/settings.type'
import styles from './SettingStatCard.module.css'

type TProps = {
    item: TSettingStatItem
    onClick?: (sectionId: string) => void
}

const iconMap: Record<string, string> = {
    'otp-rules': '🔐',
    clusters: '🗄',
    hardware: '🔧',
    alerts: '🔔',
    preferences: '⚙️',
}

export function SettingStatCard({item, onClick}: TProps) {
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
        <button
            type="button"
            className={`${styles.card} ${styles[`tone_${item.tone}`]}`}
            onClick={() => onClick?.(item.sectionId)}
        >
            <div className={styles.glow}></div>

            <div className={styles.topRow}>
                <div className={styles.heading}>
                    <span className={styles.icon}>{iconMap[item.id] ?? '⚙️'}</span>
                    <span className={styles.label}>{item.label}</span>
                </div>
                <span className={styles.dot}></span>
            </div>

            <h3 className={styles.value}>{display}</h3>
            <p className={styles.helper}>{item.helper}</p>
        </button>
    )
}
