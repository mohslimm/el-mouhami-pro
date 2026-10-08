import React, { useRef } from 'react'
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { cn } from '@/lib/utils'

export interface DockProps {
  className?: string
  iconSize?: number
  iconMagnification?: number
  iconDistance?: number
  children: React.ReactNode
}

const DEFAULT_SIZE = 40
const DEFAULT_MAGNIFICATION = 58
const DEFAULT_DISTANCE = 140

export const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      iconDistance = DEFAULT_DISTANCE,
      ...props
    },
    ref
  ) => {
    const mouseX = useMotionValue(Infinity)

    const renderChildren = () => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement<DockIconProps>(child)) {
          return React.cloneElement(child, {
            ...child.props,
            mouseX: mouseX,
            size: iconSize,
            magnification: iconMagnification,
            distance: iconDistance,
          })
        }
        return child
      })
    }

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(
          'flex h-[56px] items-center justify-center gap-2 rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-elevated)]/90 px-3 py-2 shadow-2xl backdrop-blur-md',
          className
        )}
      >
        {renderChildren()}
      </motion.div>
    )
  }
)

Dock.displayName = 'Dock'

export interface DockIconProps {
  size?: number
  magnification?: number
  distance?: number
  mouseX?: MotionValue<number>
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  title?: string
}

export const DockIcon = ({
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  mouseX,
  className,
  children,
  onClick,
  title,
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const defaultMouseX = useMotionValue(Infinity)

  const distanceCalc = useTransform(mouseX ?? defaultMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const sizeTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [size, magnification, size]
  )

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      title={title}
      style={{ width: scaleSize, height: scaleSize }}
      className={cn(
        'flex aspect-square cursor-pointer items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[var(--gold-400)] transition-colors hover:border-[var(--border-gold)] hover:bg-[var(--gold-glow)]',
        className
      )}
    >
      <div className="flex items-center justify-center">{children}</div>
    </motion.div>
  )
}

DockIcon.displayName = 'DockIcon'
