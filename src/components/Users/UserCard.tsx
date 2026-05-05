import {useNavigate} from 'react-router-dom'
import {UserRoleBadge} from './UserRoleBadge'
import {UserStatusBadge} from './UserStatusBadge'
import type {TUser} from '../../types/user.type'
import styles from './UserCard.module.css'

type TProps = {
    user: TUser
}

function getInitials(name: string) {
    return name.trim().charAt(0).toUpperCase()
}

function getRelativeLastActive(text: string) {
    return text.includes('2026-04-28') ? 'Active hôm nay' : 'Active gần đây'
}

export function UserCard({user}: TProps) {
    const navigate = useNavigate()

    return (
        <article className={`${styles.card} ${styles[`role_${user.role}`]}`}>
            <div className={styles.header}>
                <p className={styles.code}>{user.userCode}</p>

                <div className={styles.badges}>
                    <UserRoleBadge role={user.role}/>
                    <UserStatusBadge status={user.status}/>
                </div>
            </div>

            <div className={styles.profileRow}>
                <div className={`${styles.avatar} ${styles[`avatar_${user.role}`]}`}>
                    {getInitials(user.fullName)}
                </div>

                <div className={styles.profileContent}>
                    <h3 className={styles.name}>{user.fullName}</h3>
                    <p className={styles.phone}>{user.phone}</p>
                    <p className={styles.email}>{user.email}</p>
                </div>
            </div>

            <div className={styles.infoLine}>
                <span>📅 {user.createdAt.split(' ')[0].split('-').reverse().join('/')}</span>
                <span>🕐 {getRelativeLastActive(user.lastActive)}</span>
                <span>📦 {user.totalShipments} đơn</span>
                <span>👤 {user.role}</span>
            </div>

            {user.note ? <p className={styles.note}>{user.note}</p> : null}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => navigate(`/users/${user.id}`)}
                >
                    Xem chi tiết
                </button>

                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => navigate(`/users/${user.id}/manage`)}
                >
                    Quản lý tài khoản
                </button>
            </div>
        </article>
    )
}
