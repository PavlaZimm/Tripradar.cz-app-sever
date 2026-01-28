/**
 * Button - Zakladni tlacitko s Sunlight-Ready designem
 *
 * Vysokokontrastni tlacitko optimalizovane pro pouziti venku.
 * Podporuje varianty: primary, secondary, ghost
 */

import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-lg',
  secondary:
    'bg-background text-foreground border-2 border-foreground hover:bg-foreground hover:text-background active:scale-[0.98]',
  ghost:
    'bg-transparent text-foreground hover:bg-foreground/10 active:scale-[0.98]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-6 py-3 text-base min-h-[48px]',
  lg: 'px-8 py-4 text-lg min-h-[56px] font-semibold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-xl font-medium
          transition-all duration-150 ease-out
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
            <span>Načítám...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
