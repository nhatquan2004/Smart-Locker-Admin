import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type TAppButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses = {
  primary: [
    "bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20",
    "hover:bg-sky-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-600/30 active:scale-[0.97] shimmer-btn border border-sky-600",
  ].join(" "),
  secondary: [
    "btn-sec-custom font-semibold border shadow-2xs",
    "hover:-translate-y-0.5 active:scale-[0.97]",
  ].join(" "),
  danger: [
    "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50",
    "hover:bg-red-600 hover:text-white hover:-translate-y-0.5 active:scale-[0.97]",
  ].join(" "),
  ghost: [
    "bg-transparent text-slate-600 dark:text-slate-400 font-semibold",
    "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.97]",
  ].join(" "),
}

const sizeClasses = {
  sm: "h-8 px-3 text-[12px] rounded-xl gap-1.5",
  md: "h-10 px-4 text-[13px] rounded-xl gap-2",
  lg: "h-11 px-5 text-[14px] rounded-2xl gap-2.5",
}

export function AppButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: TAppButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center",
        "transition-all duration-200 select-none cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        "focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2",
        sizeClasses[size],
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}
