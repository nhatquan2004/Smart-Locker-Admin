import {useNavigate} from 'react-router-dom'
import {ShipmentStatusBadge} from './ShipmentStatusBadge'
import type {TShipment} from '../../types/shipment.type'
import styles from './ShipmentCard.module.css'

type TProps = {
    shipment: TShipment
}

function formatRelative(dateText: string) {
    const timePart = dateText.split(' ')[1] ?? dateText
    return `hôm qua lúc ${timePart}`
}

export function ShipmentCard({shipment}: TProps) {
    const navigate = useNavigate()

    return (
        <article className={`${styles.card} ${styles[`status_${shipment.shipmentStatus}`]}`}>
            <div className={styles.header}>
                <div>
                    <p className={styles.code}>{shipment.shipmentCode}</p>
                    <h3 className={styles.name}>{shipment.recipientName}</h3>
                    <p className={styles.phone}>{shipment.recipientPhone}</p>
                </div>

                <div className={styles.badges}>
                    <ShipmentStatusBadge type="shipment" shipmentStatus={shipment.shipmentStatus}/>
                    <ShipmentStatusBadge type="otp" otpStatus={shipment.otpStatus}/>
                </div>
            </div>

            <div className={styles.infoLine}>
                <span>🔒 {shipment.lockerCode}</span>
                <span>📍 Cluster {shipment.cluster}</span>
                <span>📐 {shipment.lockerSize}</span>
                <span>🔑 OTP: {shipment.otpCode}</span>
            </div>

            <div className={styles.metaBlock}>
                <p className={styles.metaLine}>👤 {shipment.shipperName}</p>
                <p className={styles.metaLine}>🕐 {formatRelative(shipment.createdAt)}</p>
                <p className={styles.metaLine}>🔄 {formatRelative(shipment.updatedAt)}</p>
            </div>

            {shipment.note ? <p className={styles.note}>{shipment.note}</p> : null}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => navigate(`/shipments/${shipment.id}`)}
                >
                    Xem chi tiết
                </button>

                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => navigate(`/shipments/${shipment.id}/otp`)}
                >
                    Kiểm tra OTP
                </button>
            </div>
        </article>
    )
}
