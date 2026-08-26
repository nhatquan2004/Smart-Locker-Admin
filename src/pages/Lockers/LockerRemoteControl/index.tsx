import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LockerStatusBadge } from '../../../components/Lockers/LockerStatusBadge.tsx'
import type { TLocker } from '../../../types/locker.type'

export function LockerRemoteControlPage() {
    const navigate = useNavigate()
    const { lockerId } = useParams()

    const [isOpening, setIsOpening] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [heartbeatSeconds, setHeartbeatSeconds] = useState(8)

    const lockers = useMemo<TLocker[]>(
        () => [
            {
                id: '1', code: 'A01', name: 'Locker A01', cluster: 'A', size: 'small',
                status: 'available', location: 'Tầng 1 - Khu A', lastUpdated: '2 phút trước',
                note: 'Sẵn sàng nhận hàng', currentUser: undefined, currentPackage: undefined,
            },
            {
                id: '2', code: 'A02', name: 'Locker A02', cluster: 'A', size: 'medium',
                status: 'occupied', location: 'Tầng 1 - Khu A', currentUser: 'Nguyễn Văn A',
                currentPackage: 'PKG-1024', lastUpdated: '5 phút trước', note: 'Đang chứa hàng chờ nhận',
            },
            {
                id: '3', code: 'B01', name: 'Locker B01', cluster: 'B', size: 'large',
                status: 'maintenance', location: 'Tầng 2 - Khu B', lastUpdated: '12 phút trước',
                note: 'Đang kiểm tra khóa điện từ', currentUser: undefined, currentPackage: undefined,
            },
            {
                id: '4', code: 'B02', name: 'Locker B02', cluster: 'B', size: 'small',
                status: 'offline', location: 'Tầng 2 - Khu B', lastUpdated: '8 phút trước',
                note: 'Tủ mất kết nối mạng', currentUser: undefined, currentPackage: undefined,
            },
        ],
        []
    )

    const locker = useMemo(() => {
        return lockers.find((item) => item.id === lockerId) ?? lockers[0]
    }, [lockers, lockerId])

    useEffect(() => {
        const timer = window.setInterval(() => {
            setHeartbeatSeconds((prev) => (prev >= 15 ? 3 : prev + 1))
        }, 1000)
        return () => window.clearInterval(timer)
    }, [])

    function handleOpenLock() {
        if (isOpening) return
        setIsOpening(true)
        window.setTimeout(() => {
            setIsOpening(false)
        }, 1800)
    }

    function handleRefreshStatus() {
        if (isRefreshing) return
        setIsRefreshing(true)
        window.setTimeout(() => {
            setIsRefreshing(false)
            setHeartbeatSeconds(2)
        }, 1200)
    }

    if (!locker) {
        return (
            <div className="p-8 text-center text-[--color-muted]">
                <p>Không tìm thấy thông tin locker</p>
                <button
                    type="button"
                    onClick={() => navigate('/lockers')}
                    className="mt-4 px-4 py-2 rounded-lg bg-[--color-surface-2] text-[13px] text-[--color-text] hover:bg-[--color-surface-3]"
                >
                    ← Quay lại danh sách Lockers
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
                        ← Quay lại Locker Detail
                    </button>

                    <p className="eyebrow mb-2">Remote control</p>
                    <h1 className="text-[22px] font-bold text-[--color-heading] leading-tight truncate">
                        Điều khiển từ xa {locker.name} ({locker.code})
                    </h1>
                    <p className="mt-2 text-[13px] text-[--color-secondary] leading-relaxed max-w-lg">
                        Gửi lệnh mở khóa tủ từ xa cho admin, theo dõi trạng thái phản hồi từ thiết bị và đồng bộ trực tiếp.
                    </p>
                </div>

                <div className="relative z-10 shrink-0">
                    <LockerStatusBadge status={locker.status} />
                </div>
            </section>

            {/* Grid */}
            <section data-stagger className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Control Panel */}
                <article className="flex flex-col gap-5 p-6 rounded-2xl border border-[--color-border] bg-[--color-surface]">
                    <div>
                        <p className="eyebrow mb-1">Direct Command</p>
                        <h2 className="text-[16px] font-bold text-[--color-heading]">Lệnh điều khiển nhanh</h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={handleOpenLock}
                            disabled={isOpening || locker.status === 'offline'}
                            className={[
                                "h-11 px-6 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all duration-150 shadow-sm",
                                isOpening || locker.status === 'offline'
                                    ? "bg-[--color-surface-2] text-[--color-muted] border border-[--color-border] cursor-not-allowed opacity-60"
                                    : "bg-[--color-accent] text-[--color-bg] hover:bg-[--color-accent-2] active:scale-[0.98]",
                            ].join(" ")}
                        >
                            {isOpening ? 'Đang mở khóa...' : 'Mở khóa từ xa'}
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleRefreshStatus}
                                disabled={isRefreshing}
                                className="flex-1 h-9 px-4 rounded-lg text-[12px] font-medium bg-[--color-surface-2] text-[--color-text] border border-[--color-border] hover:border-[--color-border-2] transition-colors"
                            >
                                {isRefreshing ? 'Đang đồng bộ...' : 'Refresh trạng thái'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(`/lockers/${locker.id}/hardware`)}
                                className="flex-1 h-9 px-4 rounded-lg text-[12px] font-medium bg-[--color-surface-2] text-[--color-secondary] border border-[--color-border] hover:border-[--color-border-2] hover:text-[--color-text] transition-colors"
                            >
                                Hardware Detail
                            </button>
                        </div>
                    </div>
                </article>

                {/* Status Monitor */}
                <article className="flex flex-col gap-5 p-6 rounded-2xl border border-[--color-border] bg-[--color-surface]">
                    <div>
                        <p className="eyebrow mb-1">Operational Status</p>
                        <h2 className="text-[16px] font-bold text-[--color-heading]">Trạng thái vận hành</h2>
                    </div>

                    <div className="flex flex-col divide-y divide-[--color-border]">
                        <div className="flex items-center justify-between py-3">
                            <span className="text-[13px] text-[--color-muted]">Door status</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[--color-surface-2] text-[--color-secondary] border border-[--color-border]">
                                Closed
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <span className="text-[13px] text-[--color-muted]">Lock state</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[--color-success-bg] text-[--color-success] border border-[--color-success]/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-[--color-success] pulse-dot" />
                                Ready
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <span className="text-[13px] text-[--color-muted]">Device connection</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[--color-success-bg] text-[--color-success] border border-[--color-success]/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-[--color-success] pulse-dot" />
                                Online
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <span className="text-[13px] text-[--color-muted]">Last heartbeat</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[--color-accent-bg] text-[--color-accent] border border-[--color-accent-border]">
                                {heartbeatSeconds}s trước
                            </span>
                        </div>
                    </div>
                </article>

                {/* Control Notes */}
                <article className="lg:col-span-2 flex flex-col gap-4 p-6 rounded-2xl border border-[--color-border] bg-[--color-surface]">
                    <div>
                        <p className="eyebrow mb-1">Control note</p>
                        <h2 className="text-[16px] font-bold text-[--color-heading]">Lưu ý điều khiển từ xa</h2>
                    </div>

                    <p className="text-[13px] text-[--color-secondary] leading-relaxed">
                        Hành động thực tế phù hợp là <strong>mở khóa để người dùng mở cửa</strong>. Việc đóng cửa là thao tác cơ học của người dùng, hệ thống sẽ tự động cập nhật lại trạng thái qua cảm biến cửa (Reed switch / IR sensor).
                    </p>

                    <ul className="flex flex-col gap-2 p-4 rounded-xl bg-[--color-surface-2] border border-[--color-border] text-[12px] text-[--color-muted]">
                        <li className="flex items-start gap-2">
                            <span className="text-[--color-accent] font-bold">•</span>
                            Chỉ mở khóa khi thiết bị đang Online và không ở trạng thái bảo trì.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[--color-accent] font-bold">•</span>
                            Ghi log Admin Action mỗi lần gửi lệnh mở khóa từ xa.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[--color-accent] font-bold">•</span>
                            Cảm biến cửa ghi nhận kết quả và phát sự kiện realtime.
                        </li>
                    </ul>
                </article>
            </section>
        </div>
    )
}
