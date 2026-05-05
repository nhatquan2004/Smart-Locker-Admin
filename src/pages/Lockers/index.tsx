import {useEffect, useMemo, useState} from 'react'
import {LockerFilterBar} from '../../components/Lockers/LockerFilterBar'
import {LockerGridCard} from '../../components/Lockers/LockerGridCard'
import {LockerStatCard} from '../../components/Lockers/LockerStatCard'
import {EmptyState} from '../../components/shared/EmptyState/EmptyState'
import {getLockers, getLockerStats} from '../../service/locker.service'
import type {TLocker, TLockerFilter, TLockerStatItem} from '../../types/locker.type'
import styles from './Lockers.module.css'

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

export function LockersPage() {
    const [lockers, setLockers] = useState<TLocker[]>([])
    const [stats, setStats] = useState<TLockerStatItem[]>([])
    const [filter, setFilter] = useState<TLockerFilter>({
        search: '',
        status: 'all',
        size: 'all',
        cluster: 'all',
    })

    useEffect(() => {
        getLockers().then(setLockers)
        getLockerStats().then(setStats)
    }, [])

    const filteredLockers = useMemo(() => {
        return lockers.filter((locker) => {
            const keyword = filter.search.trim().toLowerCase()

            const matchSearch =
                !keyword ||
                `${locker.code} ${locker.name} ${locker.location} ${locker.cluster}`
                    .toLowerCase()
                    .includes(keyword)

            const matchStatus = filter.status === 'all' || locker.status === filter.status
            const matchSize = filter.size === 'all' || locker.size === filter.size
            const matchCluster = filter.cluster === 'all' || locker.cluster === filter.cluster

            return matchSearch && matchStatus && matchSize && matchCluster
        })
    }, [lockers, filter])

    const liveCount = useCountUp(filteredLockers.length, 1200)
    return (
        <div className={styles.page}>
            <section className={`${styles.reveal} ${styles.hero}`}>
                <div className={styles.heroGlow}></div>

                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>Locker management</span>
                    <h1 className={styles.title}>Quản lý toàn bộ hệ thống locker thông minh</h1>
                    <p className={styles.description}>
                        Theo dõi trạng thái từng ngăn tủ, kiểm tra cụm hoạt động, tìm nhanh locker theo mã,
                        kích thước hoặc trạng thái để admin xử lý vận hành hiệu quả hơn.
                    </p>
                </div>

                <div className={styles.heroAside}>
                    <div className={styles.heroBadgeCard}>
                        <span className={styles.heroBadgeIcon}>🔒</span>
                        <span className={styles.heroBadgeLabel}>Live lockers</span>
                        <strong className={styles.heroBadgeValue}>{liveCount}</strong>
                        <p className={styles.heroBadgeText}>Locker đang hiển thị theo bộ lọc hiện tại</p>
                    </div>
                </div>
            </section>

            <section className={`${styles.reveal} ${styles.statsGrid}`}>
                {stats.map((item) => (
                    <LockerStatCard key={item.id} item={item}/>
                ))}
            </section>

            <section className={styles.reveal}>
                <LockerFilterBar filter={filter} onChange={setFilter}/>
            </section>

            <section className={`${styles.reveal} ${styles.resultHeader}`}>
                <div>
                    <p className={styles.resultEyebrow}>Locker list</p>
                    <h2 className={styles.resultTitle}>Danh sách locker</h2>
                </div>

                <span className={styles.resultCount}>{filteredLockers.length} locker</span>
            </section>

            {filteredLockers.length > 0 ? (
                <section className={`${styles.reveal} ${styles.grid}`}>
                    {filteredLockers.map((locker, index) => (
                        <div
                            key={locker.id}
                            className={styles.gridItem}
                            style={{animationDelay: `${index * 80}ms`}}
                        >
                            <LockerGridCard locker={locker}/>
                        </div>
                    ))}
                </section>
            ) : (
                <div className={styles.reveal}>
                    <EmptyState
                        icon="🗄️"
                        title="Không tìm thấy locker phù hợp"
                        description="Hãy thử đổi bộ lọc, xóa từ khóa tìm kiếm hoặc chọn trạng thái khác để hiển thị kết quả."
                    />
                </div>
            )}

        </div>
    )
}
