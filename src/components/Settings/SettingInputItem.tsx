import type {TSettingOption} from '../../types/settings.type'
import styles from './SettingInputItem.module.css'

type TProps = {
    icon: string
    label: string
    description: string
    value: string
    unit?: string
    invalid?: boolean
    inputKind?: 'text' | 'number' | 'select'
    options?: TSettingOption[]
    onChange: (value: string) => void
}

export function SettingInputItem({
                                     icon,
                                     label,
                                     description,
                                     value,
                                     unit,
                                     invalid = false,
                                     inputKind = 'text',
                                     options,
                                     onChange,
                                 }: TProps) {
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
                {inputKind === 'select' ? (
                    <div className={`${styles.selectWrap} ${invalid ? styles.invalid : ''}`}>
                        <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
                            {options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <span className={styles.selectArrow}>⌄</span>
                    </div>
                ) : (
                    <div className={`${styles.inputWrap} ${invalid ? styles.invalid : ''}`}>
                        <input
                            type={inputKind}
                            className={styles.input}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        {unit ? (
                            <span className={styles.unitTag}>
                <span className={styles.unitDivider}></span>
                                {unit}
              </span>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    )
}
