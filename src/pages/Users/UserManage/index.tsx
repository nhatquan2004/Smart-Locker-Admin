import {useMemo, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {UserRoleBadge} from "../../../components/Users/UserRoleBadge.tsx";
import {UserStatusBadge} from '../../../components/Users/UserStatusBadge'
import type {TUser} from '../../../types/user.type'
import styles from './UserManage.module.css'

export function UserManagePage() {
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

    const [selectedRole, setSelectedRole] = useState(user?.role ?? 'customer')
    const [selectedStatus, setSelectedStatus] = useState(user?.status ?? 'active')

    if (!user) {
        return (
            <div className={styles.page}>
                <div className={styles.notFoundCard}>
                    <h2 className={styles.notFoundTitle}>Không tìm thấy tài khoản</h2>
                    <p className={styles.notFoundText}>
                        Không tồn tại người dùng tương ứng để quản lý tài khoản.
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
                    <button
                        className={styles.backLink}
                        type="button"
                        onClick={() => navigate(`/users/${user.id}`)}
                    >
                        ← Quay lại User Detail
                    </button>

                    <span className={styles.eyebrow}>User management</span>
                    <h1 className={styles.title}>Quản lý tài khoản {user.fullName}</h1>
                    <p className={styles.description}>
                        Chỉnh vai trò, trạng thái tài khoản và chuẩn bị sẵn UI để sau này nối API cập nhật dữ
                        liệu người dùng thật.
                    </p>
                </div>

                <div className={styles.heroBadgeGroup}>
                    <UserRoleBadge role={selectedRole}/>
                    <UserStatusBadge status={selectedStatus}/>
                </div>
            </section>

            <section className={styles.grid}>
                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin tài khoản</h2>
                    <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>User code</span>
                            <span className={styles.value}>{user.userCode}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Full name</span>
                            <span className={styles.value}>{user.fullName}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Phone</span>
                            <span className={styles.value}>{user.phone}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{user.email}</span>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Tùy chỉnh tài khoản</h2>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="role-select">
                            Vai trò
                        </label>
                        <select
                            id="role-select"
                            className={styles.select}
                            value={selectedRole}
                            onChange={(event) => setSelectedRole(event.target.value as typeof selectedRole)}
                        >
                            <option value="customer">customer</option>
                            <option value="shipper">shipper</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="status-select">
                            Trạng thái
                        </label>
                        <select
                            id="status-select"
                            className={styles.select}
                            value={selectedStatus}
                            onChange={(event) => setSelectedStatus(event.target.value as typeof selectedStatus)}
                        >
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                            <option value="blocked">blocked</option>
                        </select>
                    </div>

                    <div className={styles.actionRow}>
                        <button type="button" className={styles.primaryButton}>
                            Lưu thay đổi
                        </button>

                        <button type="button" className={styles.secondaryButton}>
                            Khóa tài khoản
                        </button>
                    </div>
                </article>

                <article className={`${styles.card} ${styles.fullWidth}`}>
                    <h2 className={styles.cardTitle}>Ghi chú quản trị</h2>
                    <p className={styles.note}>
                        {user.note ?? 'Chưa có ghi chú quản trị cho tài khoản này.'}
                    </p>

                    <div className={styles.helperBox}>
                        Hiện tại đây là UI quản lý tài khoản. Sau này khi có API, các nút như “Lưu thay đổi”,
                        “Khóa tài khoản” hoặc “Mở lại tài khoản” sẽ cập nhật dữ liệu thật từ backend.
                    </div>
                </article>
            </section>
        </div>
    )
}

