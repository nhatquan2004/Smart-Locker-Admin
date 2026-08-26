import type { TSettingOption } from '../../types/settings.type'

type TProps = {
  icon?: string
  label: string
  description: string
  value: string
  unit?: string
  invalid?: boolean
  inputKind?: 'text' | 'number' | 'select'
  options?: TSettingOption[]
  onChange: (value: string) => void
}

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

export function SettingInputItem({
  label,
  description,
  value,
  unit,
  invalid = false,
  inputKind = 'text',
  options,
  onChange,
}: TProps) {
  return (
    <div className="setting-card-custom flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl transition-colors duration-150 shadow-2xs">
      <div className="flex-1 min-w-0">
        <h4 className="setting-title-custom text-[13px] font-bold">{label}</h4>
        <p className="setting-desc-custom text-[12px] mt-0.5 leading-relaxed">{description}</p>
      </div>

      <div className="shrink-0 w-full sm:w-auto sm:min-w-[180px]">
        {inputKind === 'select' ? (
          <div className="relative">
            <select
              className={[
                "setting-input-custom h-9 w-full pl-3 pr-8 rounded-lg text-[13px] font-medium appearance-none",
                "border transition-all duration-150 cursor-pointer shadow-2xs",
                "focus:outline-none focus:border-sky-500",
                invalid ? "border-red-500" : "",
              ].join(" ")}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value} className="setting-input-custom">
                  {option.label}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
              <ChevronIcon />
            </span>
          </div>
        ) : (
          <div className="relative flex items-center">
            <input
              type={inputKind}
              className={[
                "setting-input-custom h-9 w-full px-3 rounded-lg text-[13px] font-medium",
                "border transition-all duration-150 font-mono shadow-2xs",
                "focus:outline-none focus:border-sky-500",
                unit ? "pr-14" : "",
                invalid ? "border-red-500" : "",
              ].join(" ")}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            {unit && (
              <span className="absolute right-3 text-[11px] font-mono opacity-70 pointer-events-none font-bold uppercase">
                {unit}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
