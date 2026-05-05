import {useMemo} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {UserRoleBadge} from "../../../components/Users/UserRoleBadge.tsx";
import {UserStatusBadge} from "../../../components/Users/UserStatusBadge.tsx";
import type {TUser} from "../../../types/user.type.ts";
import styles from './UserDetail.module.css'

export function UserDetailPage() {
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

    const user = users.find((item) => item.id === userId)

    if (!user) {
        return (
            <div className={styles.page}>
                <div className={styles.notFoundCard}>
                    <h2 className={styles.notFoundTitle}>Không tìm thấy người dùng</h2>
                    <p className={styles.notFoundText}>
                        Tài khoản bạn đang tìm không tồn tại hoặc dữ liệu đã thay đổi.
                    </p>
                    <button className={styles.backButton} type="button" onClick={() => navigate('/users')}>
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
                    <button className={styles.backLink} type="button" onClick={() => navigate('/users')}>
                        ← Quay lại danh sách Users
                    </button>

                    <span className={styles.eyebrow}>User detail</span>
                    <h1 className={styles.title}>{user.fullName}</h1>
                    <p className={styles.description}>
                        Xem chi tiết tài khoản, vai trò, trạng thái hoạt động, liên hệ và mức độ sử dụng hệ
                        thống Smart Locker.
                    </p>
                </div>

                <div className={styles.heroBadgeGroup}>
                    <UserRoleBadge role={user.role}/>
                    <UserStatusBadge status={user.status}/>
                </div>
            </section>

            <section className={styles.grid}>
                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin cá nhân</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>User code</span>
                            <strong className={styles.value}>{user.userCode}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Phone</span>
                            <strong className={styles.value}>{user.phone}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Email</span>
                            <strong className={styles.value}>{user.email}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Role</span>
                            <strong className={styles.value}>{user.role}</strong>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Hoạt động tài khoản</h2>
                    <div className={styles.metaList}>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Status</span>
                            <span className={styles.metaValue}>{user.status}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Created at</span>
                            <span className={styles.metaValue}>{user.createdAt}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Last active</span>
                            <span className={styles.metaValue}>{user.lastActive}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Total shipments</span>
                            <span className={styles.metaValue}>{user.totalShipments}</span>
                        </div>
                    </div>
                </article>

                <article className={`${styles.card} ${styles.fullWidth}`}>
                    <h2 className={styles.cardTitle}>Ghi chú & thao tác</h2>
                    <p className={styles.note}>{user.note ?? 'Không có ghi chú cho tài khoản này.'}</p>

                    <div className={styles.actionRow}>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => navigate(`/users/${user.id}/manage`)}
                        >
                            Quản lý tài khoản
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => navigate(`/users/${user.id}/history`)}
                        >
                            Xem lịch sử hoạt động
                        </button>


                    </div>
                </article>
            </section>
        </div>
    )
}

