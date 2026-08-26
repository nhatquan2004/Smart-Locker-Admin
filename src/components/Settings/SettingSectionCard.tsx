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
    <section className="flex flex-col rounded-2xl glass-card overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="eyebrow">{badge}</span>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-[16px] font-bold text-slate-900">{title}</h3>
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                Chưa lưu
              </span>
            )}
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed max-w-xl">{description}</p>
        </div>

        <button
          type="button"
          disabled={!canSave || isSaving}
          onClick={onSave}
          className={[
            "h-10 px-5 rounded-xl text-[12px] font-bold transition-all duration-150 shrink-0 self-start sm:self-center font-mono cursor-pointer shadow-xs",
            canSave
              ? "bg-sky-600 text-white hover:bg-sky-700 hover:-translate-y-0.5 shadow-sky-600/20 shimmer-btn active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed",
          ].join(" ")}
        >
          {isSaving ? 'Đang lưu...' : isSaved ? '✓ Đã lưu' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col divide-y divide-slate-100 p-2 bg-white">
        {children}
      </div>
    </section>
  )
}
