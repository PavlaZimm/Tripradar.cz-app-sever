/**
 * Toggle - Prepinaci komponenta pro preference
 *
 * Velky dotykovy prepinac optimalizovany pro ovladani jednou rukou.
 */

'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      description,
      checked = false,
      onCheckedChange,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const toggleId = id || label.toLowerCase().replace(/\s+/g, '-')

    const handleChange = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    return (
      <label
        htmlFor={toggleId}
        className={`
          flex items-center justify-between gap-4
          p-4 rounded-xl
          bg-background
          border-2 transition-colors duration-150
          cursor-pointer select-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'}
          ${checked ? 'border-primary bg-primary/5' : 'border-foreground/20'}
          ${className}
        `}
      >
        <div className="flex-1 min-w-0">
          <span className="block text-base font-semibold text-foreground">
            {label}
          </span>
          {description && (
            <span className="block mt-1 text-sm text-text-muted">
              {description}
            </span>
          )}
        </div>

        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only"
            {...props}
          />
          <div
            className={`
              w-14 h-8 rounded-full
              transition-colors duration-200
              ${checked ? 'bg-primary' : 'bg-foreground/30'}
            `}
          >
            <div
              className={`
                absolute top-1 w-6 h-6
                bg-white rounded-full
                shadow-md
                transition-transform duration-200
                ${checked ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </div>
        </div>
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'
