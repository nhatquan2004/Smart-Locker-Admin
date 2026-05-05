import styles from './FilterSelect.module.css'

type TOption = {
    label: string
    value: string
}

type TProps = {
    id: string
    label: string
    value: string
    options: TOption[]
    onChange: (value: string) => void
}

export function FilterSelect({id, label, value, options, onChange}: TProps) {
    return (
        <div className={styles.selectGroup}>
            <label className={styles.label} htmlFor={id}>
                {label}
            </label>

            <div className={styles.selectWrap}>
                <select
                    id={id}
                    className={styles.select}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <span className={styles.selectArrow}>⌄</span>
            </div>
        </div>
    )
}
