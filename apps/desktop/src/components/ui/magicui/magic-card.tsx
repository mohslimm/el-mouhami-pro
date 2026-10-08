import React, { useCallback, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagicCardProps {
  children?: React.ReactNode
  className?: string
  gradientSize?: number
  gradientColor?: string
  gradientFrom?: string
  gradientTo?: string
  gradientOpacity?: number
}

export function MagicCard({
  children,
  className,
  gradientSize = 250,
  gradientColor = 'rgba(197, 160, 89, 0.15)',
  gradientFrom: _gradientFrom = '#c5a059',
  gradientTo: _gradientTo = '#e8c77a',

  gradientOpacity = 0.8,
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)
  const [isHovered, setIsHovered] = useState(false)

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY]
  )

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false)
    mouseX.set(-gradientSize)
    mouseY.set(-gradientSize)
  }, [mouseX, mouseY, gradientSize])

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  return (
    <motion.div
      className={cn(
        'group relative isolate overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xl transition-all duration-300 hover:border-[var(--border-gold)] hover:shadow-[0_0_20px_rgba(197,160,89,0.12)]',
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
    >
      {/* Background Radial Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? gradientOpacity : 0,
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
              ${gradientColor},
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative z-20 h-full w-full">{children}</div>
    </motion.div>
  )
}
