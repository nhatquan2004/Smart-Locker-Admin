import {useEffect, useMemo, useState} from 'react'
import {ShipmentCard} from '../../components/Shipments/ShipmentCard'
import {ShipmentFilterBar} from '../../components/Shipments/ShipmentFilterBar'
import {ShipmentStatCard} from '../../components/Shipments/ShipmentStatCard'
import {getShipments, getShipmentStats} from '../../service/shipment.service'
import type {TShipment, TShipmentFilter, TShipmentStatItem} from '../../types/shipment.type'
import styles from './Shipments.module.css'
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

export function ShipmentsPage() {
    const [shipments, setShipments] = useState<TShipment[]>([])
    const [stats, setStats] = useState<TShipmentStatItem[]>([])
    const [filter, setFilter] = useState<TShipmentFilter>({
        search: '',
        shipmentStatus: 'all',
        otpStatus: 'all',
        cluster: 'all',
    })

    useEffect(() => {
        getShipments().then(setShipments)
        getShipmentStats().then(setStats)
    }, [])

    const filteredShipments = useMemo(() => {
        return shipments.filter((shipment) => {
            const keyword = filter.search.trim().toLowerCase()

            const matchSearch =
                !keyword ||
                `${shipment.shipmentCode} ${shipment.recipientName} ${shipment.recipientPhone} ${shipment.lockerCode}`
                    .toLowerCase()
                    .includes(keyword)

            const matchShipmentStatus =
                filter.shipmentStatus === 'all' || shipment.shipmentStatus === filter.shipmentStatus

            const matchOtpStatus = filter.otpStatus === 'all' || shipment.otpStatus === filter.otpStatus
            const matchCluster = filter.cluster === 'all' || shipment.cluster === filter.cluster

            return matchSearch && matchShipmentStatus && matchOtpStatus && matchCluster
        })
    }, [shipments, filter])

    const filteredCount = useCountUp(filteredShipments.length, 1200)
    return (
        <div className={styles.page}>
            <section className={`${styles.reveal} ${styles.hero}`}>
                <div className={styles.heroGlow}></div>

                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>Shipment management</span>
                    <h1 className={styles.title}>Theo dõi đơn hàng, OTP và locker đang lưu trữ</h1>
                    <p className={styles.description}>
                        Quản lý xuyên suốt trạng thái đơn gửi, người nhận, locker code, OTP mở tủ và các trường
                        hợp lỗi hoặc quá hạn trong hệ thống Smart Locker.
                    </p>
                </div>

                <div className={styles.heroAside}>
                    <div className={styles.heroBadgeCard}>
                        <span className={styles.heroBadgeIcon}>📦</span>
                        <span className={styles.heroBadgeLabel}>Filtered Shipments</span>
                        <strong className={styles.heroBadgeValue}>{filteredCount}</strong>
                        <p className={styles.heroBadgeText}>Số đơn hàng đang hiển thị theo bộ lọc hiện tại</p>
                    </div>
                </div>
            </section>

            <section className={`${styles.reveal} ${styles.statsGrid}`}>
                {stats.map((item) => (
                    <ShipmentStatCard key={item.id} item={item}/>
                ))}
            </section>

            <section className={styles.reveal}>
                <ShipmentFilterBar filter={filter} onChange={setFilter}/>
            </section>

            <section className={`${styles.reveal} ${styles.resultHeader}`}>
                <div>
                    <p className={styles.resultEyebrow}>Shipment list</p>
                    <h2 className={styles.resultTitle}>Danh sách đơn hàng</h2>
                </div>

                <span className={styles.resultCount}>{filteredShipments.length} shipment</span>
            </section>

            {filteredShipments.length > 0 ? (
                <section className={`${styles.reveal} ${styles.grid}`}>
                    {filteredShipments.map((shipment, index) => (
                        <div
                            key={shipment.id}
                            className={styles.gridItem}
                            style={{animationDelay: `${index * 80}ms`}}
                        >
                            <ShipmentCard shipment={shipment}/>
                        </div>
                    ))}
                </section>
            ) : (
                <div className={styles.reveal}>
                    <EmptyState
                        icon="📭"
                        title="Không tìm thấy đơn hàng nào"
                        description="Thử thay đổi bộ lọc hoặc tìm kiếm khác"
                    />
                </div>
            )}

        </div>
    )
}
