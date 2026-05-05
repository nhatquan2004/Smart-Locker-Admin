import {useMemo} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {LockerStatusBadge} from '../../../components/Lockers/LockerStatusBadge.tsx'
import styles from './LockerDetail.module.css'
import type {TLocker} from '../../../types/locker.type.ts'

export function LockerDetailPage() {
    const navigate = useNavigate()
    const {lockerId} = useParams()

    const lockers = useMemo<TLocker[]>(() => {
        return [
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
        ]
    }, [])

    const locker = lockers.find((item) => item.id === lockerId)

    if (!locker) {
        return (
            <div className={styles.page}>
                <div className={styles.notFoundCard}>
                    <h2 className={styles.notFoundTitle}>Không tìm thấy locker</h2>
                    <p className={styles.notFoundText}>
                        Locker bạn đang tìm không tồn tại hoặc đã bị thay đổi dữ liệu.
                    </p>
                    <button
                        className={styles.backButton}
                        type="button"
                        onClick={() => navigate('/lockers')}
                    >
                        Quay về Lockers
                    </button>
                </div>
            </div>
        )
    }
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroGlow}></div>

                <div className={styles.heroContent}>
                    <button
                        className={styles.backLink}
                        type="button"
                        onClick={() => navigate('/lockers')}
                    >
                        ← Quay lại danh sách Lockers
                    </button>

                    <span className={styles.eyebrow}>Locker detail</span>
                    <h1 className={styles.title}>{locker.name}</h1>
                    <p className={styles.description}>
                        Theo dõi trạng thái chi tiết của locker, người dùng hiện tại, kiện hàng hiện tại,
                        vị trí lắp đặt và phần điều khiển nhanh để quản trị hệ thống Smart Locker hiệu quả hơn.
                    </p>
                </div>

                <div className={styles.heroBadge}>
                    <LockerStatusBadge status={locker.status}/>
                </div>
            </section>

            <section className={styles.grid}>
                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin cơ bản</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Locker code</span>
                            <strong className={styles.value}>{locker.code}</strong>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Cluster</span>
                            <strong className={styles.value}>{locker.cluster}</strong>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Size</span>
                            <strong className={styles.value}>{locker.size}</strong>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Location</span>
                            <strong className={styles.value}>{locker.location}</strong>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Trạng thái sử dụng</h2>
                    <div className={styles.metaList}>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Current user</span>
                            <span className={styles.metaValue}>{locker.currentUser ?? 'Chưa có'}</span>
                        </div>

                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Package code</span>
                            <span className={styles.metaValue}>{locker.currentPackage ?? 'Chưa có'}</span>
                        </div>

                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Last updated</span>
                            <span className={styles.metaValue}>{locker.lastUpdated}</span>
                        </div>
                    </div>
                </article>

                <article className={`${styles.card} ${styles.fullWidth}`}>
                    <h2 className={styles.cardTitle}>Điều khiển & giám sát nhanh</h2>
                    <p className={styles.note}>
                        {locker.note ?? 'Không có ghi chú cho locker này.'}
                    </p>

                    <div className={styles.actionRow}>
                        <button type="button" className={styles.primaryButton}
                                onClick={() => navigate(`/lockers/${locker.id}/remote-control`)}>
                            Mở tủ từ xa
                        </button>

                        <button type="button" className={styles.secondaryButton}>
                            Refresh trạng thái
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => navigate(`/lockers/${locker.id}/hardware`)}
                        >
                            Kiểm tra phần cứng
                        </button>
                    </div>
                </article>
            </section>
        </div>
    )
}

