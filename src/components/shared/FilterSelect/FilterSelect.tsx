const ChevronIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

type TOption = {
  label: string
  value: string
}

type TProps = {
  id: string
  label?: string
  value: string
  options: TOption[]
  onChange: (value: string) => void
}

export function FilterSelect({ id, label, value, options, onChange }: TProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[11px] font-medium text-[--color-muted]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={[
            "h-9 w-full pl-3 pr-8 rounded-lg text-[13px] appearance-none font-medium",
            "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white",
            "border border-slate-300 dark:border-slate-700",
            "transition-all duration-150 cursor-pointer shadow-sm",
            "focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500",
          ].join(" ")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-2">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--color-accent] pointer-events-none">
          <ChevronIcon />
        </span>
      </div>
    </div>
  )
}
