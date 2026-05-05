import {useNavigate} from 'react-router-dom'
import {LockerStatusBadge} from './LockerStatusBadge'
import type {TLocker} from '../../types/locker.type'
import styles from './LockerGridCard.module.css'

type TProps = {
    locker: TLocker
}

export function LockerGridCard({locker}: TProps) {
    const navigate = useNavigate()

    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <div>
                    <p className={styles.code}>{locker.code}</p>
                    <h3 className={styles.name}>{locker.name}</h3>
                </div>

                <LockerStatusBadge status={locker.status}/>
            </div>

            <div className={styles.infoLine}>
                <span>📍 {locker.location}</span>
                <span>📐 {locker.size}</span>
                <span>🔢 Cluster {locker.cluster}</span>
            </div>

            <div className={styles.metaBlock}>
                <p className={styles.metaLine}>👤 {locker.currentUser ?? 'Chưa có người dùng'}</p>
                <p className={styles.metaLine}>📦 {locker.currentPackage ?? 'Chưa có package'}</p>
            </div>

            {locker.note ? <p className={styles.note}>{locker.note}</p> : null}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => navigate(`/lockers/${locker.id}`)}
                >
                    Xem chi tiết
                </button>

                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => navigate(`/lockers/${locker.id}`)}
                >
                    Kiểm tra ngay
                </button>
            </div>
        </article>
    )
}
