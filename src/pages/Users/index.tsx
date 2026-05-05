import {useEffect, useMemo, useState} from 'react'
import {UserCard} from '../../components/Users/UserCard'
import {UserFilterBar} from '../../components/Users/UserFilterBar'
import {UserStatCard} from '../../components/Users/UserStatCard'
import {getUsers, getUserStats} from '../../service/user.service'
import type {TUser, TUserFilter, TUserStatItem} from '../../types/user.type'
import styles from './Users.module.css'
import {EmptyState} from '../../components/shared/EmptyState/EmptyState'

function useCountUp(target: number, duration = 1200) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        let progress = 0
        const step = 16 / duration

        const timer = window.setInterval(() => {
            progress += step
            if (progress >= 1) {
                progress = 1
                window.clearInterval(timer)
            }

            setValue(Math.round(target * progress))
        }, 16)

        return () => window.clearInterval(timer)
    }, [target, duration])

    return value
}

export function UsersPage() {
    const [users, setUsers] = useState<TUser[]>([])
    const [stats, setStats] = useState<TUserStatItem[]>([])
    const [filter, setFilter] = useState<TUserFilter>({
        search: '',
        role: 'all',
        status: 'all',
    })

    useEffect(() => {
        getUsers().then(setUsers)
        getUserStats().then(setStats)
    }, [])

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const keyword = filter.search.trim().toLowerCase()

            const matchSearch =
                !keyword ||
                `${user.userCode} ${user.fullName} ${user.phone} ${user.email}`
                    .toLowerCase()
                    .includes(keyword)

            const matchRole = filter.role === 'all' || user.role === filter.role
            const matchStatus = filter.status === 'all' || user.status === filter.status

            return matchSearch && matchRole && matchStatus
        })
    }, [users, filter])

    const filteredCount = useCountUp(filteredUsers.length, 1200)
    return (
        <div className={styles.page}>
            <section className={`${styles.reveal} ${styles.hero}`}>
                <div className={styles.heroGlow}></div>

                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>User management</span>
                    <h1 className={styles.title}>Quản lý tài khoản khách hàng, shipper và admin</h1>
                    <p className={styles.description}>
                        Theo dõi người dùng trong hệ thống Smart Locker, kiểm tra vai trò, trạng thái tài khoản
                        và mức độ hoạt động để admin quản lý tập trung hơn.
                    </p>
                </div>

                <div className={styles.heroAside}>
                    <div className={styles.heroBadgeCard}>
                        <span className={styles.heroBadgeIcon}>👥</span>
                        <span className={styles.heroBadgeLabel}>Filtered Users</span>
                        <strong className={styles.heroBadgeValue}>{filteredCount}</strong>
                        <p className={styles.heroBadgeText}>Số tài khoản đang hiển thị theo bộ lọc hiện tại</p>
                    </div>
                </div>
            </section>

            <section className={`${styles.reveal} ${styles.statsGrid}`}>
                {stats.map((item) => (
                    <UserStatCard key={item.id} item={item}/>
                ))}
            </section>

            <section className={styles.reveal}>
                <UserFilterBar filter={filter} onChange={setFilter}/>
            </section>

            <section className={`${styles.reveal} ${styles.resultHeader}`}>
                <div>
                    <p className={styles.resultEyebrow}>User list</p>
                    <h2 className={styles.resultTitle}>Danh sách người dùng</h2>
                </div>

                <span className={styles.resultCount}>{filteredUsers.length} user</span>
            </section>

            {filteredUsers.length > 0 ? (
                <section className={`${styles.reveal} ${styles.grid}`}>
                    {filteredUsers.map((user, index) => (
                        <div
                            key={user.id}
                            className={styles.gridItem}
                            style={{animationDelay: `${index * 80}ms`}}
                        >
                            <UserCard user={user}/>
                        </div>
                    ))}
                </section>
            ) : (
                <div className={styles.reveal}>
                    <EmptyState
                        icon="👤"
                        title="Không tìm thấy người dùng nào"
                        description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    />
                </div>
            )}

        </div>
    )
}
