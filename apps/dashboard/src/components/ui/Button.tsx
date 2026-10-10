import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }

  const variantStyles = {
    primary:
      'gold-gradient-bg text-[#080911] font-semibold hover:shadow-[0_4px_20px_rgba(195,155,87,0.35)] hover:brightness-110 border border-[#E8C77A]/40',
    secondary:
      'bg-[#161A2E] text-[#F0EDE8] hover:bg-[#1C223C] border border-white/10 hover:border-[#C39B57]/40',
    outline:
      'bg-transparent text-[#E8C77A] border border-[#C39B57]/40 hover:bg-[#C39B57]/10 hover:border-[#C39B57]',
    success:
      'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    danger:
      'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    ghost:
      'bg-transparent text-white/60 hover:text-white hover:bg-white/5 border border-transparent',
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
      {!isLoading && iconRight}
    </button>
  )
}
