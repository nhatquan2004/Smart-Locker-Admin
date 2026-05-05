import type {TDashboardStat} from "../../types/dashboard.type.ts";
import styles from './StatCard.module.css'
import {useEffect, useState} from 'react'

type TProps = {
    stat: TDashboardStat
}

function useCountUpDisplay(value: string) {
    const [display, setDisplay] = useState('0')

    useEffect(() => {
        const isPercent = value.includes('%')
        const numeric = parseFloat(value.replace('%', ''))
        const decimals = value.includes('.') ? 1 : 0

        let progress = 0
        const timer = window.setInterval(() => {
            progress += 0.05
            if (progress >= 1) {
                progress = 1
                window.clearInterval(timer)
            }

            const current = numeric * progress
            const next = current.toFixed(decimals)
            setDisplay(isPercent ? `${next}%` : `${Math.round(Number(next))}`)
        }, 16)

        return () => window.clearInterval(timer)
    }, [value])

    return display
}

const iconMap: Record<TDashboardStat['id'], string> = {
    'total-lockers': '🗄️',
    'available-lockers': '📭',
    'active-shipments': '📦',
    'success-rate': '✅',
}

export function StatCard({stat}: TProps) {
    const displayValue = useCountUpDisplay(stat.value)
    return (
        <article className={`${styles.card} ${styles[`accent_${stat.accent}`]}`}>
            <div className={styles.glow}/>
            <div className={styles.topRow}>
                <div className={styles.heading}>
                    <span className={styles.icon}>{iconMap[stat.id]}</span>
                    <span className={styles.label}>{stat.label}</span>
                </div>
                <span className={`${styles.trend} ${styles[`trend_${stat.trend}`]}`}>{stat.change}</span>
            </div>

            <h3 className={styles.value}>{displayValue}</h3>
            <p className={styles.description}>{stat.description}</p>
        </article>
    )
}
