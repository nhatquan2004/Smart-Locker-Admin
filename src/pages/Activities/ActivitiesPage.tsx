import {useEffect, useMemo, useState} from 'react'
import {ActivityFeedCard} from '../../components/activities/ActivityFeedCard'
import {ActivityFilterBar} from '../../components/activities/ActivityFilterBar'
import {ActivityStatCard} from '../../components/activities/ActivityStatCard'
import {getActivities, getActivityStats} from '../../service/activity.service'
import type {TActivityFilter, TActivityItem, TActivityStatItem} from '../../types/activity.type'
import styles from './Activities.module.css'
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

export function ActivitiesPage() {
    const [activities, setActivities] = useState<TActivityItem[]>([])
    const [stats, setStats] = useState<TActivityStatItem[]>([])
    const [filter, setFilter] = useState<TActivityFilter>({
        search: '',
        role: 'all',
        category: 'all',
        status: 'all',
    })

    useEffect(() => {
        getActivities().then(setActivities)
        getActivityStats().then(setStats)
    }, [])

    const filteredActivities = useMemo(() => {
        return activities.filter((activity) => {
            const keyword = filter.search.trim().toLowerCase()

            const matchSearch =
                !keyword ||
                [
                    activity.title,
                    activity.description,
                    activity.actorName,
                    activity.targetLabel ?? '',
                    activity.category,
                    activity.status,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(keyword)

            const matchRole = filter.role === 'all' || activity.actorRole === filter.role
            const matchCategory = filter.category === 'all' || activity.category === filter.category
            const matchStatus = filter.status === 'all' || activity.status === filter.status

            return matchSearch && matchRole && matchCategory && matchStatus
        })
    }, [activities, filter])

    const filteredCount = useCountUp(filteredActivities.length, 1200)
    return (
        <div className={styles.page}>
            <section className={`${styles.reveal} ${styles.hero}`}>
                <div className={styles.heroGlow}></div>

                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>Activity center</span>
                    <h1 className={styles.title}>Theo dõi toàn bộ hoạt động của hệ thống Smart Locker</h1>
                    <p className={styles.description}>
                        Xem lịch sử thao tác của customer, shipper, admin và hệ thống trong một nơi duy nhất
                        để kiểm tra shipment, OTP, locker, cảnh báo phần cứng và thay đổi cấu hình.
                    </p>
                </div>

                <div className={styles.heroAside}>
                    <div className={styles.heroBadgeCard}>
                        <span className={styles.heroBadgeIcon}>📜</span>
                        <span className={styles.heroBadgeLabel}>Filtered Activities</span>
                        <strong className={styles.heroBadgeValue}>{filteredCount}</strong>
                        <p className={styles.heroBadgeText}>Số hoạt động đang hiển thị theo bộ lọc hiện tại</p>
                    </div>
                </div>
            </section>

            <section className={`${styles.reveal} ${styles.statsGrid}`}>
                {stats.map((item) => (
                    <ActivityStatCard key={item.id} item={item}/>
                ))}
            </section>

            <section className={styles.reveal}>
                <ActivityFilterBar filter={filter} onChange={setFilter}/>
            </section>

            <section className={`${styles.reveal} ${styles.resultHeader}`}>
                <div>
                    <p className={styles.resultEyebrow}>Activity feed</p>
                    <h2 className={styles.resultTitle}>Nhật ký hoạt động</h2>
                </div>

                <span className={styles.resultCount}>{filteredActivities.length} activity</span>
            </section>

            {filteredActivities.length > 0 ? (
                <section className={`${styles.reveal} ${styles.feedList}`}>
                    {filteredActivities.map((item, index) => (
                        <div
                            key={item.id}
                            className={styles.feedItem}
                            style={{animationDelay: `${index * 80}ms`}}
                        >
                            <ActivityFeedCard item={item}/>
                        </div>
                    ))}
                </section>
            ) : (
                <div className={styles.reveal}>
                    <EmptyState
                        icon="📭"
                        title="Không tìm thấy hoạt động nào"
                        description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    />
                </div>
            )}

        </div>
    )
}
