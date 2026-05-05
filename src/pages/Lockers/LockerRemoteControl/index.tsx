import {useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import type {TLocker} from '../../../types/locker.type'
import styles from './LockerRemoteControl.module.css'

export function LockerRemoteControlPage() {
    const navigate = useNavigate()
    const {lockerId} = useParams()

    const [isOpening, setIsOpening] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [heartbeatSeconds, setHeartbeatSeconds] = useState(8)

    const lockers = useMemo<TLocker[]>(
        () => [
            {
                id: '1',
                code: 'A01',
                name: 'Locker A01',
                cluster: 'A',
                size: 'small',
                status: 'available',
                location: 'Tầng 1 - Khu A',
                lastUpdated: '2 phút trước',
                note: 'Sẵn sàng nhận hàng',
                currentUser: undefined,
                currentPackage: undefined,
            },
            {
                id: '2',
                code: 'A02',
                name: 'Locker A02',
                cluster: 'A',
                size: 'medium',
                status: 'occupied',
                location: 'Tầng 1 - Khu A',
                currentUser: 'Nguyễn Văn A',
                currentPackage: 'PKG-1024',
                lastUpdated: '5 phút trước',
                note: 'Đang chứa hàng chờ nhận',
            },
            {
                id: '3',
                code: 'B01',
                name: 'Locker B01',
                cluster: 'B',
                size: 'large',
                status: 'maintenance',
                location: 'Tầng 2 - Khu B',
                lastUpdated: '12 phút trước',
                note: 'Đang kiểm tra khóa điện từ',
                currentUser: undefined,
                currentPackage: undefined,
            },
            {
                id: '4',
                code: 'B02',
                name: 'Locker B02',
                cluster: 'B',
                size: 'small',
                status: 'offline',
                location: 'Tầng 2 - Khu B',
                lastUpdated: '8 phút trước',
                note: 'Mất kết nối cảm biến',
                currentUser: undefined,
                currentPackage: undefined,
            },
            {
                id: '5',
                code: 'C01',
                name: 'Locker C01',
                cluster: 'C',
                size: 'medium',
                status: 'available',
                location: 'Tầng 3 - Khu C',
                lastUpdated: '1 phút trước',
                note: 'Hoạt động ổn định',
                currentUser: undefined,
                currentPackage: undefined,
            },
            {
                id: '6',
                code: 'C02',
                name: 'Locker C02',
                cluster: 'C',
                size: 'large',
                status: 'occupied',
                location: 'Tầng 3 - Khu C',
                currentUser: 'Trần Thị B',
                currentPackage: 'PKG-2048',
                lastUpdated: '10 phút trước',
                note: 'Đang có đơn gửi',
            },
            {
                id: '7',
                code: 'D01',
                name: 'Locker D01',
                cluster: 'D',
                size: 'small',
                status: 'available',
                location: 'Sảnh chính - Khu D',
                lastUpdated: '3 phút trước',
                note: 'Có thể gán đơn mới',
                currentUser: undefined,
                currentPackage: undefined,
            },
            {
                id: '8',
                code: 'D02',
                name: 'Locker D02',
                cluster: 'D',
                size: 'medium',
                status: 'occupied',
                location: 'Sảnh chính - Khu D',
                currentUser: 'Phạm Văn C',
                currentPackage: 'PKG-3001',
                lastUpdated: '6 phút trước',
                note: 'Khách chưa đến nhận',
            },
        ],
        [],
    )

    const locker = lockers.find((item) => item.id === lockerId)

    useEffect(() => {
        const timer = window.setInterval(() => {
            setHeartbeatSeconds((prev) => prev + 1)
        }, 1000)

        return () => window.clearInterval(timer)
    }, [])

    if (!locker) {
        return (
            <div className={styles.page}>
                <div className={styles.notFoundCard}>
                    <h2 className={styles.notFoundTitle}>Không tìm thấy locker</h2>
                    <p className={styles.notFoundText}>
                        Không thể mở trang điều khiển từ xa vì locker này không tồn tại trong dữ liệu hiện tại.
                    </p>
                    <button className={styles.backButton} type="button" onClick={() => navigate('/lockers')}>
                        Quay về Lockers
                    </button>
                </div>
            </div>
        )
    }

    const handleOpenRemote = async () => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn mở khóa từ xa cho ${locker.name} (${locker.code}) không?`,
        )

        if (!confirmed) return

        setIsOpening(true)

        window.setTimeout(() => {
            setIsOpening(false)
            window.alert('Chức năng mở khóa từ xa sẽ được kết nối khi có API phần cứng.')
        }, 1400)
    }

    const handleRefreshStatus = async () => {
        setIsRefreshing(true)

        window.setTimeout(() => {
            setIsRefreshing(false)
            setHeartbeatSeconds(0)
        }, 1100)
    }
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroPattern}></div>
                <div className={styles.heroGlow}></div>

                <div className={styles.heroContent}>
                    <button
                        className={styles.backLink}
                        type="button"
                        onClick={() => navigate(`/lockers/${locker.id}`)}
                    >
                        ← Quay lại Locker Detail
                    </button>

                    <span className={styles.eyebrow}>Remote control</span>
                    <h1 className={styles.title}>Điều khiển từ xa {locker.name}</h1>
                    <p className={styles.description}>
                        Theo dõi trạng thái thiết bị, kiểm tra kết nối và thực hiện thao tác mở khóa từ xa cho
                        locker với giao diện kiểm soát rõ ràng, an toàn và sẵn sàng để nối API phần cứng sau
                        này.
                    </p>
                </div>

                <div className={styles.heroStatusBadge}>
                    <span className={styles.heroStatusDot}></span>
                    AVAILABLE
                </div>
            </section>

            <section className={styles.infoGrid}>
                <article className={styles.infoCard}>
                    <span className={styles.infoIcon}>🔒</span>
                    <span className={styles.infoLabel}>Locker Code</span>
                    <strong className={styles.infoValue}>{locker.code}</strong>
                </article>

                <article className={styles.infoCard}>
                    <span className={styles.infoIcon}>📍</span>
                    <span className={styles.infoLabel}>Cluster</span>
                    <strong className={styles.infoValue}>{locker.cluster}</strong>
                </article>

                <article className={styles.infoCard}>
                    <span className={styles.infoIcon}>📦</span>
                    <span className={styles.infoLabel}>Size</span>
                    <strong className={styles.infoValue}>{locker.size}</strong>
                </article>

                <article className={styles.infoCard}>
                    <span className={styles.infoIcon}>⏱️</span>
                    <span className={styles.infoLabel}>Last Updated</span>
                    <strong className={styles.infoValue}>{locker.lastUpdated}</strong>
                </article>
            </section>

            <section className={styles.controlGrid}>
                <article className={styles.glassCard}>
                    <div className={styles.cardHeader}>
                        <div>
                            <p className={styles.cardEyebrow}>Quick controls</p>
                            <h2 className={styles.cardTitle}>Điều khiển nhanh</h2>
                        </div>
                    </div>

                    <p className={styles.cardDescription}>
                        Các thao tác dưới đây đang là UI/UX flow chuẩn. Sau này có thể nối trực tiếp tới
                        backend điều khiển ESP32, relay và log hành động admin.
                    </p>

                    <div className={styles.actionStack}>
                        <button
                            type="button"
                            className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                            onClick={handleOpenRemote}
                            disabled={isOpening}
                        >
                            <span className={styles.actionIcon}>{isOpening ? '⏳' : '🔓'}</span>
                            {isOpening ? 'Đang mở...' : 'Mở khóa từ xa'}
                            {isOpening ? <span className={styles.spinner}></span> : null}
                        </button>

                        <button
                            type="button"
                            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                            onClick={handleRefreshStatus}
                            disabled={isRefreshing}
                        >
              <span className={`${styles.actionIcon} ${isRefreshing ? styles.iconSpin : ''}`}>
                🔄
              </span>
                            {isRefreshing ? 'Đang đồng bộ...' : 'Refresh trạng thái'}
                        </button>

                        <button
                            type="button"
                            className={`${styles.actionButton} ${styles.actionButtonGhost}`}
                            onClick={() => navigate(`/lockers/${locker.id}/hardware`)}
                        >
                            <span className={styles.actionIcon}>⚙️</span>
                            Đi tới phần cứng
                        </button>
                    </div>
                </article>

                <article className={styles.glassCard}>
                    <div className={styles.cardHeader}>
                        <div>
                            <p className={styles.cardEyebrow}>Operational status</p>
                            <h2 className={styles.cardTitle}>Trạng thái vận hành</h2>
                        </div>
                    </div>

                    <div className={styles.statusList}>
                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>🚪 Door status</span>
                            <span className={`${styles.statusBadge} ${styles.statusBadgeNeutral}`}>Closed</span>
                        </div>

                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>🔐 Lock state</span>
                            <span className={`${styles.statusBadge} ${styles.statusBadgeSuccess}`}>
                <span className={styles.pulseDot}></span>
                Ready
              </span>
                        </div>

                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>📡 Device connection</span>
                            <span className={`${styles.statusBadge} ${styles.statusBadgeSuccess}`}>
                <span className={styles.pulseDot}></span>
                Online
              </span>
                        </div>

                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>⏳ Last heartbeat</span>
                            <span className={`${styles.statusBadge} ${styles.statusBadgeInfo}`}>
                {heartbeatSeconds} giây trước
              </span>
                        </div>
                    </div>
                </article>

                <article className={`${styles.glassCard} ${styles.fullWidth}`}>
                    <div className={styles.cardHeader}>
                        <div>
                            <p className={styles.cardEyebrow}>Control note</p>
                            <h2 className={styles.cardTitle}>Lưu ý điều khiển từ xa</h2>
                        </div>
                    </div>

                    <p className={styles.note}>
                        Với đồ án hiện tại, hành động thực tế phù hợp là <strong>mở khóa để người dùng mở cửa</strong>.
                        Việc đóng cửa chủ yếu là thao tác tay của người dùng, còn hệ thống sẽ theo dõi lại
                        trạng thái qua cảm biến và ghi nhận vào log.
                    </p>

                    <div className={styles.helperBox}>
                        <ul className={styles.helperList}>
                            <li>
                                Chỉ cho phép mở khóa khi thiết bị đang Online và locker không ở trạng thái
                                maintenance
                            </li>
                            <li>Ghi log admin action mỗi lần gửi lệnh mở khóa từ xa</li>
                            <li>Dùng reed switch / IR sensor để xác nhận cửa đã được mở và đóng lại</li>
                            <li>Hiển thị command result rõ ràng sau khi nối API phần cứng</li>
                        </ul>
                    </div>
                </article>
            </section>
        </div>
    )
}

