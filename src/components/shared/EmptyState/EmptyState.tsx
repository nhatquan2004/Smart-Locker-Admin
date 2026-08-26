type TProps = {
  title: string
  description: string
  action?: React.ReactNode
}

const EmptyIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-[--color-border-2]">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="8" y1="8" x2="16" y2="8"/>
    <line x1="8" y1="16" x2="12" y2="16"/>
  </svg>
)

export function EmptyState({ title, description, action }: TProps) {
  return (
    <section className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl border border-[--color-border] bg-[--color-surface-2] flex items-center justify-center">
        <EmptyIcon />
      </div>
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-[15px] font-semibold text-[--color-heading]">{title}</h3>
        <p className="text-[13px] text-[--color-muted] leading-relaxed">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </section>
  )
}
