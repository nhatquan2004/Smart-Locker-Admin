import type { InputHTMLAttributes } from 'react'
import './common.css'

type TAppInputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string
}

export function AppInput({ label, id, ...props }: TAppInputProps) {
    return (
        <label className="app-field" htmlFor={id}>
            {label ? <span className="app-field__label">{label}</span> : null}
            <input id={id} className="app-input" {...props} />
        </label>
    )
}
