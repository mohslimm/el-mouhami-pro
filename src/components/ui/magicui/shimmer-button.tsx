import React, { type ComponentPropsWithoutRef, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<'button'> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#e8c77a',
      shimmerSize = '0.05em',
      shimmerDuration = '3s',
      borderRadius = '10px',
      background = 'linear-gradient(135deg, #b8924a 0%, #c5a059 50%, #d4b57a 100%)',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background,
          } as CSSProperties
        }
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden [border-radius:var(--radius)] [background:var(--bg)] border border-[var(--border-gold)] px-5 py-2.5 font-bold text-[#1A1200] shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div className={cn('-z-30 blur-[2px]', 'absolute inset-0 overflow-visible')}>
          <div className="animate-shimmer-slide absolute inset-0 aspect-[1] h-full rounded-none">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>
        <span className="relative z-10 flex items-center gap-2">{children}</span>

        {/* Highlight */}
        <div
          className={cn(
            'absolute inset-0 size-full rounded-[var(--radius)] shadow-[inset_0_-8px_10px_rgba(255,255,255,0.25)] transition-all duration-300 group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.4)]'
          )}
        />
      </button>
    )
  }
)

ShimmerButton.displayName = 'ShimmerButton'
