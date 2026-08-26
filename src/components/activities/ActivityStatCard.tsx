import { useEffect, useState } from 'react'
import type { TActivityStatItem } from '../../types/activity.type'

type TProps = {
  item: TActivityStatItem
}

const toneConfig: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  blue:   { dot: "bg-[--color-accent]",   bg: "bg-[--color-accent-bg]",   border: "border-[--color-accent-border]", text: "text-[--color-accent]"   },
  green:  { dot: "bg-[--color-success]",  bg: "bg-[--color-success-bg]",  border: "border-[--color-success]/25",   text: "text-[--color-success]"  },
  orange: { dot: "bg-[--color-warning]",  bg: "bg-[--color-warning-bg]",  border: "border-[--color-warning]/25",   text: "text-[--color-warning]"  },
  red:    { dot: "bg-[--color-danger]",   bg: "bg-[--color-danger-bg]",   border: "border-[--color-danger]/25",    text: "text-[--color-danger]"   },
}

export function ActivityStatCard({ item }: TProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const target = Number(item.value)
    let progress = 0
    const timer = window.setInterval(() => {
      progress += 0.05
      if (progress >= 1) { progress = 1; window.clearInterval(timer) }
      setDisplay(Math.round(target * progress))
    }, 16)
    return () => window.clearInterval(timer)
  }, [item.value])

  const tone = toneConfig[item.tone] ?? toneConfig.blue

  return (
    <article className={`flex flex-col gap-3 p-5 rounded-2xl border ${tone.bg} ${tone.border} transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-semibold ${tone.text}`}>{item.label}</span>
        <span className={`w-2 h-2 rounded-full ${tone.dot} pulse-dot`} />
      </div>
      <p className={`text-[30px] font-bold leading-none ${tone.text}`} style={{ fontFamily: "var(--font-display)" }}>
        {display}
      </p>
      <p className="text-[12px] text-[--color-secondary] leading-relaxed">{item.helper}</p>
    </article>
  )
}
