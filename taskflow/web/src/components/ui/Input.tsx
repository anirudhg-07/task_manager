import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`input-group ${className}`}>
        <label className="input-label">{label}</label>
        <input ref={ref} className="input-field" {...props} />
        {error && <span className="error-text">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'
