import {useMemo, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {ShipmentStatusBadge} from '../../../components/Shipments/ShipmentStatusBadge'
import type {TShipment} from "../../../types/shipment.type.ts";
import styles from './ShipmentDetail.module.css'

export function ShipmentDetailPage() {
    const navigate = useNavigate()
    const {shipmentId} = useParams()
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>('')

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
                    <h2 className={styles.notFoundTitle}>Không tìm thấy shipment</h2>
                    <p className={styles.notFoundText}>
                        Đơn hàng bạn đang tìm không tồn tại hoặc dữ liệu đã thay đổi.
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
                    <button className={styles.backLink} type="button" onClick={() => navigate('/shipments')}>
                        ← Quay lại danh sách Shipments
                    </button>

                    <span className={styles.eyebrow}>Shipment detail</span>
                    <h1 className={styles.title}>{shipment.shipmentCode}</h1>
                    <p className={styles.description}>
                        Xem chi tiết người nhận, số điện thoại, locker code, cluster, OTP, trạng thái đơn hàng
                        và lịch sử cập nhật gần nhất.
                    </p>
                </div>

                <div className={styles.heroBadgeGroup}>
                    <ShipmentStatusBadge type="shipment" shipmentStatus={shipment.shipmentStatus}/>
                    <ShipmentStatusBadge type="otp" otpStatus={shipment.otpStatus}/>
                </div>
            </section>

            <section className={styles.grid}>
                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin người nhận</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Recipient</span>
                            <strong className={styles.value}>{shipment.recipientName}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Phone</span>
                            <strong className={styles.value}>{shipment.recipientPhone}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Shipper</span>
                            <strong className={styles.value}>{shipment.shipperName}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Cluster</span>
                            <strong className={styles.value}>{shipment.cluster}</strong>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin locker & OTP</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Locker code</span>
                            <strong className={styles.value}>{shipment.lockerCode}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Locker size</span>
                            <strong className={styles.value}>{shipment.lockerSize}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>OTP code</span>
                            <strong className={styles.value}>{shipment.otpCode}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>OTP status</span>
                            <strong className={styles.value}>{shipment.otpStatus}</strong>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Mốc thời gian</h2>
                    <div className={styles.metaList}>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Created at</span>
                            <span className={styles.metaValue}>{shipment.createdAt}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Updated at</span>
                            <span className={styles.metaValue}>{shipment.updatedAt}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Shipment status</span>
                            <span className={styles.metaValue}>{shipment.shipmentStatus}</span>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thao tác nhanh</h2>
                    <p className={styles.note}>{shipment.note ?? 'Không có ghi chú cho shipment này.'}</p>

                    <div className={styles.actionRow}>
                        <button type="button" className={styles.primaryButton}
                                onClick={() => navigate(`/shipments/${shipment.id}/otp`)}>
                            Kiểm tra OTP
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                setSelectedStatus(shipment.shipmentStatus)
                                setIsStatusModalOpen(true)
                            }}
                        >
                            Cập nhật trạng thái
                        </button>


                    </div>
                </article>
            </section>

            {isStatusModalOpen ? (
                <div className={styles.modalOverlay} onClick={() => setIsStatusModalOpen(false)}>
                    <div
                        className={styles.modal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <p className={styles.modalEyebrow}>Shipment status</p>
                                <h3 className={styles.modalTitle}>Cập nhật trạng thái đơn hàng</h3>
                            </div>

                            <button
                                type="button"
                                className={styles.modalCloseButton}
                                onClick={() => setIsStatusModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <p className={styles.modalDescription}>
                            Chọn trạng thái phù hợp cho đơn <strong>{shipment.shipmentCode}</strong>. Hiện tại
                            modal này mới là giao diện, chưa lưu dữ liệu thật cho đến khi có API.
                        </p>

                        <div className={styles.statusOptionGrid}>
                            {['pending', 'stored', 'waiting_pickup', 'picked_up', 'expired', 'failed'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    className={`${styles.statusOption} ${
                                        selectedStatus === status ? styles.statusOptionActive : ''
                                    }`}
                                    onClick={() => setSelectedStatus(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>


                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.modalSecondaryButton}
                                onClick={() => setIsStatusModalOpen(false)}
                            >
                                Đóng
                            </button>

                            <button
                                type="button"
                                className={styles.modalPrimaryButton}
                                onClick={() => setIsStatusModalOpen(false)}
                            >
                                Lưu thay đổi
                            </button>

                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

