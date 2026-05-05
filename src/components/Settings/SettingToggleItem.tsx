import styles from './SettingToggleItem.module.css'

type TProps = {
    icon: string
    label: string
    description: string
    enabled: boolean
    onChange: (value: boolean) => void
}

export function SettingToggleItem({icon, label, description, enabled, onChange}: TProps) {
    return (
        <div className={styles.row}>
            <div className={styles.left}>
                <span className={styles.icon}>{icon}</span>

                <div className={styles.content}>
                    <h4 className={styles.label}>{label}</h4>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>

            <div className={styles.right}>
        <span className={`${styles.stateLabel} ${enabled ? styles.stateOn : styles.stateOff}`}>
          {enabled ? 'BẬT' : 'TẮT'}
        </span>

                <button
                    type="button"
                    className={`${styles.toggle} ${enabled ? styles.toggleActive : ''}`}
                    onClick={() => onChange(!enabled)}
                    aria-pressed={enabled}
                >
                    <span className={`${styles.knob} ${enabled ? styles.knobActive : ''}`}></span>
                </button>
            </div>
        </div>
    )
}
