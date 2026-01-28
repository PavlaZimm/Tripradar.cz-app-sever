/**
 * Input - Textove pole s Sunlight-Ready designem
 *
 * Vysokokontrastni input optimalizovany pro venkovni pouziti.
 */

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-semibold text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3
            bg-background
            border-2 rounded-xl
            text-foreground text-base
            placeholder:text-text-muted
            transition-colors duration-150
            focus:outline-none focus:ring-4 focus:ring-primary/30
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error focus:border-error' : 'border-foreground/30 focus:border-primary'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm font-medium text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
