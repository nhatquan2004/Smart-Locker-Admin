import styles from './SettingSectionCard.module.css'

type TProps = {
    title: string
    description: string
    badge?: string
    hasUnsavedChanges?: boolean
    isSaving?: boolean
    isSaved?: boolean
    canSave?: boolean
    onSave?: () => void
    children: React.ReactNode
}

export function SettingSectionCard({
                                       title,
                                       description,
                                       badge = 'SYSTEM CONFIG',
                                       hasUnsavedChanges = false,
                                       isSaving = false,
                                       isSaved = false,
                                       canSave = false,
                                       onSave,
                                       children,
                                   }: TProps) {
    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerMain}>
                    <span className={styles.eyebrow}>{badge}</span>

                    <div className={styles.titleRow}>
                        <h3 className={styles.title}>{title}</h3>
                        {hasUnsavedChanges ? <span className={styles.unsaved}>● Chưa lưu</span> : null}
                    </div>

                    <p className={styles.description}>{description}</p>
                </div>

                <button
                    type="button"
                    className={`${styles.saveButton} ${canSave ? styles.saveButtonActive : ''}`}
                    disabled={!canSave || isSaving}
                    onClick={onSave}
                >
                    {isSaving ? '⏳ Đang lưu...' : isSaved ? '✓ Đã lưu' : '💾 Lưu thay đổi'}
                </button>
            </div>

            <div className={styles.body}>{children}</div>
        </section>
    )
}
