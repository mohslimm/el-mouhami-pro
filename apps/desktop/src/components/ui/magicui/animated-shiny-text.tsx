import { type ComponentPropsWithoutRef, type CSSProperties, type FC } from 'react'
import { cn } from '@/lib/utils'

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<'span'> {
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          '--shiny-width': `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        'inline-flex items-center text-[var(--gold-400)] font-medium',
        'animate-pulse bg-gradient-to-r from-[var(--gold-500)] via-[var(--gold-400)] to-[var(--gold-500)] bg-clip-text text-transparent',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
