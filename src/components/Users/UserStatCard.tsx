import {useEffect, useState} from 'react'
import type {TUserStatItem} from '../../types/user.type'
import styles from './UserStatCard.module.css'

type TProps = {
    item: TUserStatItem
}

const iconMap: Record<TUserStatItem['id'], string> = {
    total: '👥',
    customers: '🛍️',
    shippers: '🚚',
    admins: '⚙️',
    blocked: '🔒',
}

const shortLabelMap: Record<TUserStatItem['id'], string> = {
    total: 'Tổng',
    customers: 'Khách hàng',
    shippers: 'Shipper',
    admins: 'Admin',
    blocked: 'Bị khóa',
}

export function UserStatCard({item}: TProps) {
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
                    <span className={styles.icon}>{iconMap[item.id]}</span>
                    <span className={styles.label}>{shortLabelMap[item.id]}</span>
                </div>
                <span className={styles.dot}></span>
            </div>

            <h3 className={styles.value}>{display}</h3>
            <p className={styles.helper}>{item.helper}</p>
        </article>
    )
}
