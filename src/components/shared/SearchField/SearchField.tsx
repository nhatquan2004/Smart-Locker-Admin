import styles from './SearchField.module.css'

type TProps = {
    id: string
    label: string
    value: string
    placeholder?: string
    onChange: (value: string) => void
}

export function SearchField({id, label, value, placeholder, onChange}: TProps) {
    return (
        <div className={styles.searchGroup}>
            <label className={styles.label} htmlFor={id}>
                {label}
            </label>

            <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔍</span>
                <input
                    id={id}
                    type="text"
                    className={styles.input}
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    )
}
