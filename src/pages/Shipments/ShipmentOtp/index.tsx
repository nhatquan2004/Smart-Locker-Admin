import {useMemo} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {ShipmentStatusBadge} from '../../../components/Shipments/ShipmentStatusBadge'
import type {TShipment} from '../../../types/shipment.type'
import styles from './ShipmentOtp.module.css'

export function ShipmentOtpPage() {
    const navigate = useNavigate()
    const {shipmentId} = useParams()

    const shipments = useMemo<TShipment[]>(() => {
        return [
            {
                id: '1',
                shipmentCode: 'SHP-2026-001',
                recipientName: 'Nguyễn Văn A',
                recipientPhone: '0901234567',
                lockerCode: 'A02',
                cluster: 'A',
                lockerSize: 'medium',
                otpCode: '482913',
                otpStatus: 'active',
                shipmentStatus: 'waiting_pickup',
                createdAt: '2026-04-28 08:20',
                updatedAt: '2026-04-28 08:30',
                shipperName: 'Shipper Minh',
                note: 'Khách sẽ nhận trong sáng nay',
            },
            {
                id: '2',
                shipmentCode: 'SHP-2026-002',
                recipientName: 'Trần Thị B',
                recipientPhone: '0912345678',
                lockerCode: 'C02',
                cluster: 'C',
                lockerSize: 'large',
                otpCode: '731205',
                otpStatus: 'active',
                shipmentStatus: 'stored',
                createdAt: '2026-04-28 07:45',
                updatedAt: '2026-04-28 07:50',
                shipperName: 'Shipper Long',
                note: 'Đã lưu ảnh kiện hàng',
            },
            {
                id: '3',
                shipmentCode: 'SHP-2026-003',
                recipientName: 'Phạm Văn C',
                recipientPhone: '0987654321',
                lockerCode: 'D02',
                cluster: 'D',
                lockerSize: 'medium',
                otpCode: '664120',
                otpStatus: 'used',
                shipmentStatus: 'picked_up',
                createdAt: '2026-04-28 06:30',
                updatedAt: '2026-04-28 07:10',
                shipperName: 'Shipper Hùng',
                note: 'Khách đã nhận thành công',
            },
            {
                id: '4',
                shipmentCode: 'SHP-2026-004',
                recipientName: 'Lê Thị D',
                recipientPhone: '0971112233',
                lockerCode: 'B01',
                cluster: 'B',
                lockerSize: 'large',
                otpCode: '900112',
                otpStatus: 'expired',
                shipmentStatus: 'expired',
                createdAt: '2026-04-27 18:10',
                updatedAt: '2026-04-28 09:00',
                shipperName: 'Shipper Phúc',
                note: 'OTP đã hết hạn, cần xử lý lại',
            },
        ]
    }, [])

    const shipment = shipments.find((item) => item.id === shipmentId)

    if (!shipment) {
        return (
            <div className={styles.page}>
                <div className={styles.notFoundCard}>
                    <h2 className={styles.notFoundTitle}>Không tìm thấy OTP của shipment</h2>
                    <p className={styles.notFoundText}>
                        Không tìm thấy dữ liệu OTP tương ứng với shipment này.
                    </p>
                    <button className={styles.backButton} type="button" onClick={() => navigate('/shipments')}>
                        Quay về Shipments
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
                        onClick={() => navigate(`/shipments/${shipment.id}`)}
                    >
                        ← Quay lại Shipment Detail
                    </button>

                    <span className={styles.eyebrow}>Shipment OTP</span>
                    <h1 className={styles.title}>Kiểm tra OTP cho {shipment.shipmentCode}</h1>
                    <p className={styles.description}>
                        Theo dõi mã OTP, trạng thái OTP, người nhận, locker code và trạng thái đơn để admin
                        biết đơn hàng còn hiệu lực nhận hay không.
                    </p>
                </div>

                <div className={styles.heroBadgeGroup}>
                    <ShipmentStatusBadge type="otp" otpStatus={shipment.otpStatus}/>
                    <ShipmentStatusBadge type="shipment" shipmentStatus={shipment.shipmentStatus}/>
                </div>
            </section>

            <section className={styles.grid}>
                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin OTP</h2>
                    <div className={styles.otpBox}>
                        <span className={styles.otpLabel}>OTP code</span>
                        <strong className={styles.otpValue}>{shipment.otpCode}</strong>
                    </div>

                    <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>OTP status</span>
                            <span className={styles.value}>{shipment.otpStatus}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Shipment status</span>
                            <span className={styles.value}>{shipment.shipmentStatus}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Updated at</span>
                            <span className={styles.value}>{shipment.updatedAt}</span>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin người nhận</h2>
                    <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Recipient</span>
                            <span className={styles.value}>{shipment.recipientName}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Phone</span>
                            <span className={styles.value}>{shipment.recipientPhone}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Shipper</span>
                            <span className={styles.value}>{shipment.shipperName}</span>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin locker</h2>
                    <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Locker code</span>
                            <span className={styles.value}>{shipment.lockerCode}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Cluster</span>
                            <span className={styles.value}>{shipment.cluster}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Locker size</span>
                            <span className={styles.value}>{shipment.lockerSize}</span>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thao tác nhanh</h2>
                    <p className={styles.note}>
                        {shipment.note ?? 'Không có ghi chú cho OTP này.'}
                    </p>

                    <div className={styles.actionRow}>
                        <button type="button" className={styles.primaryButton}>
                            Làm mới OTP
                        </button>

                        <button type="button" className={styles.secondaryButton}>
                            Vô hiệu hóa OTP
                        </button>
                    </div>
                </article>
            </section>
        </div>
    )
}

