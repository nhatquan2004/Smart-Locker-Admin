import { useTranslation } from '../../context/LanguageContext'

type TProps = {
  icon?: string
  label: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
}

export function SettingToggleItem({ label, description, enabled, onChange }: TProps) {
  const { t } = useTranslation()

  return (
    <div className="setting-card-custom flex items-center justify-between gap-4 p-4 border rounded-xl transition-colors duration-150 shadow-2xs">
      <div className="flex-1 min-w-0">
        <h4 className="setting-title-custom text-[13px] font-bold">{label}</h4>
        <p className="setting-desc-custom text-[12px] mt-0.5 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
          enabled
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
        }`}>
          {enabled ? t('settings.toggleOn') : t('settings.toggleOff')}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onChange(!enabled)}
          className={[
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-inner",
            enabled ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-700",
          ].join(" ")}
        >
          <span
            className={[
              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-slate-100 shadow-md ring-0 transition duration-200 ease-in-out",
              enabled ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  )
}
