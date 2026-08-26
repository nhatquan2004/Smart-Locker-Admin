import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShipmentStatusBadge } from '../../../components/Shipments/ShipmentStatusBadge'
import type { TShipment } from '../../../types/shipment.type'

export function ShipmentOtpPage() {
    const navigate = useNavigate()
    const { shipmentId } = useParams()

    const shipments = useMemo<TShipment[]>(() => {
        return [
            {
                id: '1', shipmentCode: 'SHP-2026-001', recipientName: 'Nguyễn Văn A', recipientPhone: '0901234567',
                lockerCode: 'A02', cluster: 'A', lockerSize: 'medium', otpCode: '482913', otpStatus: 'active',
                shipmentStatus: 'waiting_pickup', createdAt: '2026-04-28 08:20', updatedAt: '2026-04-28 08:30',
                shipperName: 'Shipper Minh', note: 'Khách sẽ nhận trong sáng nay',
            },
            {
                id: '2', shipmentCode: 'SHP-2026-002', recipientName: 'Trần Thị B', recipientPhone: '0912345678',
                lockerCode: 'C02', cluster: 'C', lockerSize: 'large', otpCode: '731205', otpStatus: 'active',
                shipmentStatus: 'stored', createdAt: '2026-04-28 07:45', updatedAt: '2026-04-28 07:50',
                shipperName: 'Shipper Long', note: 'Đã lưu ảnh kiện hàng',
            },
            {
                id: '3', shipmentCode: 'SHP-2026-003', recipientName: 'Phạm Văn C', recipientPhone: '0987654321',
                lockerCode: 'D02', cluster: 'D', lockerSize: 'medium', otpCode: '664120', otpStatus: 'used',
                shipmentStatus: 'picked_up', createdAt: '2026-04-28 06:30', updatedAt: '2026-04-28 07:10',
                shipperName: 'Shipper Hùng', note: 'Khách đã nhận thành công',
            },
        ]
    }, [])

    const shipment = useMemo(() => {
        return shipments.find((item) => item.id === shipmentId) ?? shipments[0]
    }, [shipments, shipmentId])

    if (!shipment) {
        return (
            <div className="p-8 text-center text-[--color-muted]">
                <p>Không tìm thấy thông tin đơn hàng</p>
                <button
                    type="button"
                    onClick={() => navigate('/shipments')}
                    className="mt-4 px-4 py-2 rounded-lg bg-[--color-surface-2] text-[13px] text-[--color-text] hover:bg-[--color-surface-3]"
                >
                    ← Quay lại danh sách Shipments
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
                        ← Quay lại Shipment Detail
                    </button>

                    <p className="eyebrow mb-2">OTP verification</p>
                    <h1 className="text-[22px] font-bold text-[--color-heading] leading-tight truncate">
                        Kiểm tra OTP đơn {shipment.shipmentCode}
                    </h1>
                    <p className="mt-2 text-[13px] text-[--color-secondary] leading-relaxed max-w-lg">
                        Quản lý mã OTP nhận hàng, kiểm tra hiệu lực, thời gian hết hạn và lịch sử kích hoạt lại OTP.
                    </p>
                </div>

                <div className="relative z-10 shrink-0">
                    <ShipmentStatusBadge type="otp" otpStatus={shipment.otpStatus} />
                </div>
            </section>

            {/* Grid */}
            <section data-stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Main OTP Code Card */}
                <article className="flex flex-col gap-4 p-6 rounded-2xl border border-[--color-border] bg-[--color-surface] items-center text-center">
                    <p className="eyebrow">Active OTP Code</p>
                    <div className="flex items-center justify-center gap-2 my-2">
                        {shipment.otpCode.split('').map((char, index) => (
                            <span
                                key={index}
                                className="w-12 h-14 rounded-xl border border-[--color-accent-border] bg-[--color-accent-bg] text-[24px] font-mono font-bold text-[--color-accent] flex items-center justify-center shadow-sm"
                            >
                                {char}
                            </span>
                        ))}
                    </div>
                    <p className="text-[12px] text-[--color-muted]">
                        Mã OTP này dùng để xác thực mở tủ <strong className="text-[--color-text]">{shipment.lockerCode}</strong>.
                    </p>
                </article>

                {/* OTP Meta Card */}
                <article className="flex flex-col gap-4 p-6 rounded-2xl border border-[--color-border] bg-[--color-surface]">
                    <h2 className="text-[15px] font-bold text-[--color-heading]">Thông tin chi tiết OTP</h2>
                    <div className="flex flex-col divide-y divide-[--color-border]">
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-[12px] text-[--color-muted]">Trạng thái OTP</span>
                            <span className="text-[12px] font-mono uppercase text-[--color-accent] font-medium">{shipment.otpStatus}</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-[12px] text-[--color-muted]">Người nhận</span>
                            <span className="text-[12px] text-[--color-text]">{shipment.recipientName} ({shipment.recipientPhone})</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-[12px] text-[--color-muted]">Locker Code</span>
                            <span className="text-[12px] font-mono text-[--color-accent]">{shipment.lockerCode}</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-[12px] text-[--color-muted]">Tạo lúc</span>
                            <span className="text-[12px] font-mono text-[--color-secondary]">{shipment.createdAt}</span>
                        </div>
                    </div>
                </article>

                {/* Actions */}
                <article className="md:col-span-2 flex flex-col gap-4 p-6 rounded-2xl border border-[--color-border] bg-[--color-surface]">
                    <h2 className="text-[15px] font-bold text-[--color-heading]">Thao tác OTP</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            className="h-9 px-5 rounded-lg text-[13px] font-semibold bg-[--color-accent] text-[--color-bg] hover:bg-[--color-accent-2] transition-all shadow-sm"
                        >
                            Gửi lại OTP SMS
                        </button>
                        <button
                            type="button"
                            className="h-9 px-5 rounded-lg text-[13px] font-medium bg-[--color-surface-2] text-[--color-text] border border-[--color-border] hover:border-[--color-border-2] hover:bg-[--color-surface-3] transition-all"
                        >
                            Hủy hiệu lực OTP
                        </button>
                    </div>
                </article>
            </section>
        </div>
    )
}
