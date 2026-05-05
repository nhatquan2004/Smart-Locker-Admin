import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './LockerHardware.module.css'

export function LockerHardwarePage() {
    const navigate = useNavigate()
    const { lockerId } = useParams()

    const hardwareMock = useMemo(() => {
        return {
            lockerId,
            lockerCode: `LK-${lockerId ?? 'N/A'}`,
            controller: 'ESP32 DevKit V1',
            relayModule: '4-Channel Relay Module',
            reedSwitch: 'Connected',
            irSensor: 'Connected',
            solenoidLock: '12V Solenoid Lock',
            powerSupply: '12V / 5A',
            networkStatus: 'Online',
            ping: '28 ms',
            lastHeartbeat: '10 giây trước',
            firmwareVersion: 'v1.0.3',
            voltage: '12.1V',
            temperature: '31°C',
            note: 'Sẵn sàng để kết nối API / dữ liệu thật từ phần cứng sau này.',
        }
    }, [lockerId])
    return(
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroGlow}></div>

                <div className={styles.heroContent}>
                    <button className={styles.backLink} type="button" onClick={() => navigate(-1)}>
                        ← Quay lại Locker Detail
                    </button>

                    <span className={styles.eyebrow}>Locker hardware</span>
                    <h1 className={styles.title}>Kiểm tra phần cứng của locker {hardwareMock.lockerCode}</h1>
                    <p className={styles.description}>
                        Trang này dùng để theo dõi kết nối phần cứng của locker, bao gồm ESP32, relay, khóa
                        điện từ, cảm biến cửa, cảm biến hồng ngoại, nguồn cấp và trạng thái mạng.
                    </p>
                </div>

                <div className={styles.heroAside}>
                    <div className={styles.heroBadgeCard}>
                        <span className={styles.heroBadgeLabel}>Network status</span>
                        <strong className={styles.heroBadgeValue}>{hardwareMock.networkStatus}</strong>
                        <p className={styles.heroBadgeText}>
                            Ping: {hardwareMock.ping} • Heartbeat: {hardwareMock.lastHeartbeat}
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.grid}>
                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Bộ điều khiển chính</h2>
                    <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Controller</span>
                            <span className={styles.value}>{hardwareMock.controller}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Firmware</span>
                            <span className={styles.value}>{hardwareMock.firmwareVersion}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Network</span>
                            <span className={styles.value}>{hardwareMock.networkStatus}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Ping</span>
                            <span className={styles.value}>{hardwareMock.ping}</span>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Thiết bị chấp hành</h2>
                    <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Relay module</span>
                            <span className={styles.value}>{hardwareMock.relayModule}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Solenoid lock</span>
                            <span className={styles.value}>{hardwareMock.solenoidLock}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Power supply</span>
                            <span className={styles.value}>{hardwareMock.powerSupply}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Voltage</span>
                            <span className={styles.value}>{hardwareMock.voltage}</span>
                        </div>
                    </div>
                </article>

                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Cảm biến</h2>
                    <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Reed switch</span>
                            <span className={styles.value}>{hardwareMock.reedSwitch}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>IR sensor</span>
                            <span className={styles.value}>{hardwareMock.irSensor}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Temperature</span>
                            <span className={styles.value}>{hardwareMock.temperature}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Last heartbeat</span>
                            <span className={styles.value}>{hardwareMock.lastHeartbeat}</span>
                        </div>
                    </div>
                </article>

                <article className={`${styles.card} ${styles.fullWidth}`}>
                    <h2 className={styles.cardTitle}>Ghi chú tích hợp phần cứng</h2>
                    <p className={styles.note}>
                        {hardwareMock.note}
                    </p>

                    <div className={styles.actionRow}>
                        <button type="button" className={styles.primaryButton}>
                            Refresh hardware status
                        </button>

                        <button type="button" className={styles.secondaryButton}>
                            Test relay / lock
                        </button>
                    </div>
                </article>
            </section>
        </div>
    )
}

