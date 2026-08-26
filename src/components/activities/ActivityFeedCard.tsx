import type { TActivityItem } from '../../types/activity.type'

type TProps = {
  item: TActivityItem
}

const statusConfig = {
  success: { bar: "bg-[--color-success]",  badge: "bg-[--color-success-bg]  text-[--color-success]  border-[--color-success]/25"  },
  info:    { bar: "bg-[--color-accent]",    badge: "bg-[--color-accent-bg]   text-[--color-accent]   border-[--color-accent-border]" },
  warning: { bar: "bg-[--color-warning]",   badge: "bg-[--color-warning-bg]  text-[--color-warning]  border-[--color-warning]/25"   },
  error:   { bar: "bg-[--color-danger]",    badge: "bg-[--color-danger-bg]   text-[--color-danger]   border-[--color-danger]/25"    },
}

const roleBadge: Record<string, string> = {
  customer: "bg-[--color-success-bg] text-[--color-success] border-[--color-success]/25",
  shipper:  "bg-[--color-accent-bg]  text-[--color-accent]  border-[--color-accent-border]",
  admin:    "bg-[--color-danger-bg]  text-[--color-danger]  border-[--color-danger]/25",
  system:   "bg-[--color-surface-3] text-[--color-muted]   border-[--color-border]",
}

export function ActivityFeedCard({ item }: TProps) {
  const tone = statusConfig[item.status as keyof typeof statusConfig] ?? statusConfig.info

  return (
    <article className="relative flex flex-col gap-3 p-5 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-border-2] hover:bg-[--color-surface-2] transition-all duration-150 overflow-hidden">
      {/* Status left bar */}
      <span className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${tone.bar}`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-[--color-muted] uppercase tracking-wider mb-0.5">{item.category}</p>
          <h3 className="text-[13px] font-semibold text-[--color-heading] leading-tight">{item.title}</h3>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border uppercase tracking-wide ${roleBadge[item.actorRole] ?? roleBadge.system}`}>
            {item.actorRole}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border uppercase tracking-wide ${tone.badge}`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-[--color-secondary] leading-relaxed">{item.description}</p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[--color-muted] font-mono">
        <span><strong className="text-[--color-secondary] font-medium">{item.actorName}</strong></span>
        {item.targetLabel && (
          <span>→ <strong className="text-[--color-secondary] font-medium">{item.targetLabel}</strong></span>
        )}
        <span className="ml-auto">{item.timeLabel}</span>
      </div>
    </article>
  )
}
