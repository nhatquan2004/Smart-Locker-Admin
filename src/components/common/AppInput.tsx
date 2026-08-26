import type { InputHTMLAttributes } from 'react'

type TAppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export function AppInput({ label, id, className = '', ...props }: TAppInputProps) {
  return (
    <label className="flex flex-col gap-1.5 w-full" htmlFor={id}>
      {label && (
        <span className="text-[11px] font-medium text-[--color-muted]">
          {label}
        </span>
      )}
      <input
        id={id}
        className={[
          "h-9 w-full px-3 rounded-lg text-[13px]",
          "bg-[--color-surface-2] text-[--color-text]",
          "border border-[--color-border] placeholder:text-[--color-muted]",
          "transition-all duration-150",
          "focus:outline-none focus:border-[--color-accent] focus:bg-[--color-surface-3]",
          className,
        ].join(" ")}
        {...props}
      />
    </label>
  )
}
