import { HTMLAttributes, forwardRef } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'neutral', children, ...props }, ref) => {
    return (
      <span ref={ref} className={`badge badge-${variant} ${className}`} {...props}>
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'
