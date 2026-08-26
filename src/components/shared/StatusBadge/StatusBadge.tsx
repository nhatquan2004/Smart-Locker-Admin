type TStatusTone = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'

type TProps = {
  label: string
  tone: TStatusTone
  pulse?: boolean
}

const toneStyles: Record<TStatusTone, { dot: string; badge: string }> = {
  green:  { dot: "bg-[--color-success]",  badge: "bg-[--color-success-bg] text-[--color-success]  border-[--color-success]/25"  },
  orange: { dot: "bg-[--color-warning]",  badge: "bg-[--color-warning-bg] text-[--color-warning]  border-[--color-warning]/25"  },
  red:    { dot: "bg-[--color-danger]",   badge: "bg-[--color-danger-bg]  text-[--color-danger]   border-[--color-danger]/25"   },
  blue:   { dot: "bg-[--color-accent]",   badge: "bg-[--color-accent-bg]  text-[--color-accent]   border-[--color-accent-border]" },
  purple: { dot: "bg-[--color-info]",     badge: "bg-[--color-info-bg]    text-[--color-info]     border-[--color-info]/25"     },
  gray:   { dot: "bg-[--color-muted]",    badge: "bg-[--color-surface-2]  text-[--color-muted]    border-[--color-border]"      },
}

export function StatusBadge({ label, tone, pulse = false }: TProps) {
  const { dot, badge } = toneStyles[tone]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border uppercase tracking-wide ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot} ${pulse ? "pulse-dot" : ""}`} />
      {label}
    </span>
  )
}
