const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

type TProps = {
  id: string
  label?: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function SearchField({ id, label, value, placeholder, onChange }: TProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-[11px] font-medium text-[--color-muted]">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted] pointer-events-none">
          <SearchIcon />
        </span>
        <input
          id={id}
          type="text"
          className={[
            "h-9 w-full pl-9 pr-3 rounded-lg text-[13px]",
            "bg-[--color-surface-2] text-[--color-text]",
            "border border-[--color-border] placeholder:text-[--color-muted]",
            "transition-all duration-150",
            "focus:outline-none focus:border-[--color-accent] focus:bg-[--color-surface-3]",
          ].join(" ")}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
