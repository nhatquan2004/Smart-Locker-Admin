import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import './common.css'

type TAppButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
    variant?: 'primary' | 'secondary' | 'danger'
}

export function AppButton({
                              children,
                              className = '',
                              variant = 'primary',
                              ...props
                          }: TAppButtonProps) {
    return (
        <button className={`app-button app-button--${variant} ${className}`.trim()} {...props}>
            {children}
        </button>
    )
}
