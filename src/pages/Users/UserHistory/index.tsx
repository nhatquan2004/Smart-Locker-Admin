import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserRoleBadge } from '../../../components/Users/UserRoleBadge'
import { UserStatusBadge } from "../../../components/Users/UserStatusBadge.tsx";
import type { TUser } from "../../../types/user.type.ts";

type TUserHistoryItem = {
    id: string
    time: string
    title: string
    description: string
    type: 'shipment' | 'otp' | 'locker' | 'admin'
}

export function UserHistoryPage() {
    const navigate = useNavigate()
    const { userId } = useParams()

    const users = useMemo<TUser[]>(() => {
        return [
            {
                id: '1', userCode: 'USR-001', fullName: 'Nguyễn Văn An', phone: '0901234567',
                email: 'nguyenvanan@gmail.com', role: 'user', status: 'active',
                createdAt: '2026-04-20 08:10', lastActive: '2026-04-28 09:15', totalShipments: 8,
                note: 'Khách hàng nhận hàng thường xuyên',
            },
            {
                id: '2', userCode: 'USR-002', fullName: 'Trần Minh Long', phone: '0912345678',
                email: 'tranminhlong@gmail.com', role: 'shipper', status: 'active',
                createdAt: '2026-04-18 10:30', lastActive: '2026-04-28 08:50', totalShipments: 26,
                note: 'Shipper phụ trách khu A và B',
            },
        ]
    }, [])

    const user = useMemo(() => {
        return users.find((item) => item.id === userId) ?? users[0]
    }, [users, userId])

    const historyItems = useMemo<TUserHistoryItem[]>(() => {
        return [
            { id: '1', time: '2026-04-28 09:15', title: 'Xác thực OTP thành công', description: 'Đã nhập đúng mã OTP 482913 để mở tủ A02.', type: 'otp' },
            { id: '2', time: '2026-04-28 08:30', title: 'Đơn hàng mới được tạo', description: 'Tạo đơn hàng SHP-2026-001 lưu trữ tại locker A02.', type: 'shipment' },
            { id: '3', time: '2026-04-27 16:45', title: 'Nhận hàng từ locker B01', description: 'Đã hoàn tất nhận kiện hàng PKG-8821 thành công.', type: 'locker' },
            { id: '4', time: '2026-04-25 10:00', title: 'Admin gửi mã OTP mới', description: 'Admin phát lại OTP qua SMS theo yêu cầu người dùng.', type: 'admin' },
        ]
    }, [])

    if (!user) {
        return (
            <div className="p-8 text-center text-[--color-muted]">
                <p>Không tìm thấy thông tin người dùng</p>
                <button
                    type="button"
                    onClick={() => navigate('/users')}
                    className="mt-4 px-4 py-2 rounded-lg bg-[--color-surface-2] text-[13px] text-[--color-text] hover:bg-[--color-surface-3]"
                >
                    ← Quay lại danh sách Users
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 max-w-[1200px]">

            {/* Hero */}
            <section data-reveal className="relative overflow-hidden rounded-2xl border border-[--color-border] bg-[--color-surface] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="absolute inset-0 mesh-bg opacity-30 rounded-2xl" />
                <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at 65% 50%, transparent 30%, var(--color-surface) 80%)" }} />

                <div className="relative z-10 flex-1 min-w-0">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-[12px] font-medium text-[--color-accent] hover:text-[--color-accent-2] mb-4 transition-colors"
                    >
                        ← Quay lại User Detail
                    </button>

                    <p className="eyebrow mb-2">User history</p>
                    <h1 className="text-[22px] font-bold text-[--color-heading] leading-tight truncate">
                        Lịch sử của {user.fullName} ({user.userCode})
                    </h1>
                    <p className="mt-2 text-[13px] text-[--color-secondary] leading-relaxed max-w-lg">
                        Xem dòng thời gian thao tác đơn hàng, OTP, mở tủ và nhật ký quản trị liên quan.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col items-end gap-2 shrink-0">
                    <UserRoleBadge role={user.role} />
                    <UserStatusBadge status={user.status} />
                </div>
            </section>

            {/* History Feed */}
            <section data-stagger className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="eyebrow mb-1">Activity Log</p>
                        <h2 className="text-[16px] font-bold text-[--color-heading]">Dòng thời gian hoạt động</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[12px] font-mono bg-[--color-surface-2] border border-[--color-border] text-[--color-secondary]">
                        {historyItems.length} sự kiện
                    </span>
                </div>

                <div className="flex flex-col gap-3">
                    {historyItems.map((item) => (
                        <article
                            key={item.id}
                            className="relative flex flex-col gap-2 p-5 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-border-2] transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <span className="text-[10px] font-mono text-[--color-accent] uppercase tracking-wider">{item.type}</span>
                                    <h3 className="text-[14px] font-semibold text-[--color-heading] mt-0.5">{item.title}</h3>
                                </div>
                                <time className="text-[11px] font-mono text-[--color-muted] shrink-0">{item.time}</time>
                            </div>
                            <p className="text-[12px] text-[--color-secondary] leading-relaxed">{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    )
}
