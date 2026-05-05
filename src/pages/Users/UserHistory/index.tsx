import {useMemo} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {UserRoleBadge} from '../../../components/Users/UserRoleBadge'
import {UserStatusBadge} from "../../../components/Users/UserStatusBadge.tsx";
import type {TUser} from "../../../types/user.type.ts";
import styles from './UserHistory.module.css'

type TUserHistoryItem = {
    id: string
    time: string
    title: string
    description: string
    type: 'shipment' | 'otp' | 'locker' | 'admin'
}

export function UserHistoryPage() {
    const navigate = useNavigate()
    const {userId} = useParams()

    const users = useMemo<TUser[]>(() => {
        return [
            {
                id: '1',
                userCode: 'USR-001',
                fullName: 'Nguyễn Văn An',
                phone: '0901234567',
                email: 'nguyenvanan@gmail.com',
                role: 'customer',
                status: 'active',
                createdAt: '2026-04-20 08:10',
                lastActive: '2026-04-28 09:15',
                totalShipments: 8,
                note: 'Khách hàng nhận hàng thường xuyên',
            },
            {
                id: '2',
                userCode: 'USR-002',
                fullName: 'Trần Minh Long',
                phone: '0912345678',
                email: 'tranminhlong@gmail.com',
                role: 'shipper',
                status: 'active',
                createdAt: '2026-04-18 10:30',
                lastActive: '2026-04-28 08:50',
                totalShipments: 26,
                note: 'Shipper phụ trách khu A và B',
            },
            {
                id: '3',
                userCode: 'USR-003',
                fullName: 'Lê Khánh Vy',
                phone: '0988123456',
                email: 'lekhanhvy@gmail.com',
                role: 'customer',
                status: 'inactive',
                createdAt: '2026-04-15 14:20',
                lastActive: '2026-04-25 18:05',
                totalShipments: 3,
                note: 'Ít hoạt động trong tuần này',
            },
            {
                id: '4',
                userCode: 'USR-004',
                fullName: 'Phạm Gia Hưng',
                phone: '0977001122',
                email: 'phamgiahung@gmail.com',
                role: 'admin',
                status: 'active',
                createdAt: '2026-04-10 09:00',
                lastActive: '2026-04-28 09:40',
                totalShipments: 0,
                note: 'Quản trị viên hệ thống',
            },
        ]
    }, [])

    const historyItems = useMemo<TUserHistoryItem[]>(() => {
        return [
            {
                id: '1',
                time: '2026-04-28 09:15',
                title: 'Đã nhận đơn hàng SHP-2026-001',
                description: 'Người dùng xác thực OTP thành công và mở locker A02 để nhận hàng.',
                type: 'shipment',
            },
            {
                id: '2',
                time: '2026-04-28 09:13',
                title: 'OTP 482913 được sử dụng',
                description: 'Mã OTP được xác thực hợp lệ trong thời gian hiệu lực.',
                type: 'otp',
            },
            {
                id: '3',
                time: '2026-04-28 09:12',
                title: 'Locker A02 được mở',
                description: 'Cửa tủ được mở thành công sau khi hệ thống kiểm tra mã OTP.',
                type: 'locker',
            },
            {
                id: '4',
                time: '2026-04-27 18:20',
                title: 'Đơn SHP-2026-004 được gán cho user',
                description: 'Hệ thống liên kết người nhận với locker B01 và tạo OTP nhận hàng.',
                type: 'shipment',
            },
            {
                id: '5',
                time: '2026-04-26 15:10',
                title: 'Admin cập nhật trạng thái tài khoản',
                description: 'Tài khoản được kiểm tra và giữ ở trạng thái active.',
                type: 'admin',
            },
        ]
    }, [])

    const user = users.find((item) => item.id === userId)

    if (!user) {
        return (
            <div className={styles.page}>
                <div className={styles.notFoundCard}>
                    <h2 className={styles.notFoundTitle}>Không tìm thấy người dùng</h2>
                    <p className={styles.notFoundText}>
                        Không thể tải lịch sử hoạt động vì tài khoản này không tồn tại trong dữ liệu hiện tại.
                    </p>
                    <button
                        className={styles.backButton}
                        type="button"
                        onClick={() => navigate('/users')}
                    >
                        Quay về Users
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
                        onClick={() => navigate(`/users/${user.id}`)}
                    >
                        ← Quay lại User Detail
                    </button>

                    <span className={styles.eyebrow}>User activity history</span>
                    <h1 className={styles.title}>Lịch sử hoạt động của {user.fullName}</h1>
                    <p className={styles.description}>
                        Theo dõi toàn bộ hoạt động liên quan đến đơn hàng, OTP, locker và các thay đổi tài khoản
                        để admin kiểm tra nhanh hành trình của người dùng trong hệ thống.
                    </p>
                </div>

                <div className={styles.heroBadgeGroup}>
                    <UserRoleBadge role={user.role}/>
                    <UserStatusBadge status={user.status}/>
                </div>
            </section>

            <section className={styles.summaryGrid}>
                <article className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>User code</span>
                    <strong className={styles.summaryValue}>{user.userCode}</strong>
                </article>

                <article className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Phone</span>
                    <strong className={styles.summaryValue}>{user.phone}</strong>
                </article>

                <article className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Total shipments</span>
                    <strong className={styles.summaryValue}>{user.totalShipments}</strong>
                </article>

                <article className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Last active</span>
                    <strong className={styles.summaryValue}>{user.lastActive}</strong>
                </article>
            </section>

            <section className={styles.timelineSection}>
                <div className={styles.sectionHeader}>
                    <div>
                        <p className={styles.sectionEyebrow}>Activity feed</p>
                        <h2 className={styles.sectionTitle}>Dòng thời gian hoạt động</h2>
                    </div>

                    <span className={styles.sectionBadge}>{historyItems.length} events</span>
                </div>

                <div className={styles.timeline}>
                    {historyItems.map((item) => (
                        <article key={item.id} className={styles.timelineItem}>
                            <div className={`${styles.timelineDot} ${styles[`timelineDot_${item.type}`]}`}></div>

                            <div className={styles.timelineCard}>
                                <div className={styles.timelineTop}>
                                    <h3 className={styles.timelineTitle}>{item.title}</h3>
                                    <span className={styles.timelineTime}>{item.time}</span>
                                </div>

                                <p className={styles.timelineDescription}>{item.description}</p>

                                <span className={`${styles.timelineType} ${styles[`timelineType_${item.type}`]}`}>
                  {item.type}
                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    )
}
