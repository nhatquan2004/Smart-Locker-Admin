import {useEffect, useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {AppButton, AppInput} from '../../components/common'
import {ActivityItem} from "../../components/Dashboard/ActivityItem.tsx";
import {StatCard} from "../../components/Dashboard/StatCard.tsx";
import {SystemStatusCard} from "../../components/Dashboard/SystemStatusCard.tsx";
import {getRecentActivities} from "../../service/activity.service.ts";
import {getDashboardOverview} from "../../service/dashboard.service.ts";
import type {TActivityItem} from "../../types/activity.type.ts"
import type {TDashboardOverview} from "../../types/dashboard.type.ts";
import styles from './Dashboard.module.css'

export function DashboardPage() {
    const navigate = useNavigate()
    const [overview, setOverview] = useState<TDashboardOverview | null>(null)
    const [activities, setActivities] = useState<TActivityItem[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        getDashboardOverview().then(setOverview)
        getRecentActivities(6).then(setActivities)
    }, [])

    const activityRelativeTimes = useMemo(() => {
        return activities.map((item) => item.timeLabel)
    }, [activities])

    const filteredActivities = useMemo(() => {
        const keyword = search.trim().toLowerCase()

        const mappedActivities = activities.map((item, index) => ({
            ...item,
            timeLabel: activityRelativeTimes[index] ?? item.timeLabel,
        }))

        if (!keyword) {
            return mappedActivities
        }

        return mappedActivities.filter((item) => {
            const content =
                `${item.title} ${item.description} ${item.actorName} ${item.targetLabel ?? ''}`.toLowerCase()

            return content.includes(keyword)
        })
    }, [activities, search, activityRelativeTimes])

    if (!overview) {
        return <div className={styles.loading}>Đang tải dashboard...</div>
    }
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroGlow}/>

                <div className={styles.heroContent}>
                    <span className={styles.heroEyebrow}>Smart locker admin panel</span>
                    <h1 className={styles.heroTitle}>Dashboard tổng quan cho hệ thống tủ đồ thông minh</h1>
                    <p className={styles.heroDescription}>
                        Theo dõi trạng thái locker, đơn giao nhận, cảm biến và hoạt động gần đây trong một giao
                        diện mượt, rõ và dùng tốt trên cả desktop lẫn điện thoại.
                    </p>

                    <div className={styles.heroActions}>
                        <AppButton type="button" onClick={() => navigate('/lockers')}>
                            Xem locker ngay
                        </AppButton>

                        <AppButton
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/shipments')}
                        >
                            Kiểm tra đơn giao hôm nay
                        </AppButton>
                    </div>
                </div>

                <div className={styles.heroPanel}>
                    <div className={styles.orb}/>

                    <div className={styles.heroMiniCard}>
                        <span className={styles.miniCardLabel}>Live monitoring</span>
                        <strong className={styles.miniCardValue}>46 / 48 online</strong>
                        <p className={styles.miniCardText}>Thiết bị và cảm biến đang gửi trạng thái realtime.</p>
                    </div>

                    <div className={styles.heroMiniCardSecondary}>
                        <span className={styles.miniCardLabel}>Today pulse</span>
                        <strong className={styles.miniCardValue}>128 hoạt động</strong>
                        <p className={styles.miniCardText}>Mở tủ, xác thực OTP, cập nhật trạng thái đơn.</p>
                    </div>
                </div>
            </section>

            <section className={styles.statsGrid}>
                {overview.stats.map((stat) => (
                    <StatCard key={stat.id} stat={stat}/>
                ))}
            </section>

            <section className={styles.contentGrid}>
                <div className={styles.leftColumn}>
                    <div className={styles.panel}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.sectionEyebrow}>System pulse</p>
                                <h2 className={styles.sectionTitle}>Trạng thái hệ thống</h2>
                            </div>

                            <span className={styles.sectionBadge}>Realtime</span>
                        </div>

                        <div className={styles.statusList}>
                            {overview.statuses.map((status) => (
                                <SystemStatusCard key={status.id} status={status}/>
                            ))}
                        </div>
                    </div>

                    <div className={styles.panel}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.sectionEyebrow}>Quick actions</p>
                                <h2 className={styles.sectionTitle}>Lối đi nhanh cho admin</h2>
                            </div>
                        </div>

                        <div className={styles.quickActionGrid}>
                            {overview.quickActions.map((action, index) => {
                                const targetMap: Record<string, string> = {
                                    'quick-lockers': '/lockers',
                                    'quick-shipments': '/shipments',
                                    'quick-users': '/users',
                                    lockers: '/lockers',
                                    shipments: '/shipments',
                                    users: '/users',
                                }

                                const fallbackTargets = ['/lockers', '/shipments', '/users']
                                const target = targetMap[action.id] ?? fallbackTargets[index] ?? '/dashboard'

                                return (
                                    <button
                                        key={action.id}
                                        className={styles.quickActionCard}
                                        type="button"
                                        onClick={() => navigate(target)}
                                    >
                                        <span className={styles.quickActionIndex}>0{index + 1}</span>
                                        <strong className={styles.quickActionLabel}>{action.label}</strong>
                                        <p className={styles.quickActionHelper}>{action.helper}</p>
                                    </button>
                                )
                            })}
                        </div>

                    </div>
                </div>
                <div className={styles.rightColumn}>
                    <div className={styles.panel}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.sectionEyebrow}>Recent feed</p>
                                <h2 className={styles.sectionTitle}>Hoạt động gần đây</h2>
                            </div>

                            <button
                                type="button"
                                className={styles.viewAllButton}
                                onClick={() => navigate('/activities')}
                            >
                                Xem tất cả →
                            </button>
                        </div>

                        <div className={styles.searchBox}>
                            <AppInput
                                id="activity-search"
                                label="Tìm trong hoạt động"
                                placeholder="Ví dụ: OTP, locker A01, shipper..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>

                        <div className={styles.activityList}>
                            {filteredActivities.map((item) => (
                                <ActivityItem key={item.id} item={item}/>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

