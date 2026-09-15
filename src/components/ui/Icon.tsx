import React from 'react'
import * as LucideIcons from 'lucide-react'

export interface IconProps {
  name: string
  size?: number
  className?: string
  strokeWidth?: number
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  className = '',
  strokeWidth = 1.5,
}) => {
  const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  const iconName = name.charAt(0).toUpperCase() + toCamelCase(name).slice(1)
  const LucideIcon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[iconName]

  if (!LucideIcon) {
    return <span className={`inline-block w-[${size}px] h-[${size}px] bg-[#2A2A30] rounded ${className}`} />
  }

  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} />
}

Icon.displayName = 'Icon'
