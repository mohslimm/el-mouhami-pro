import React from 'react'

export type StatusType = 'success' | 'warning' | 'critical' | 'neutral' | 'active'

export interface StatusBadgeProps {
  status: StatusType
  text: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className = '' }) => {
  const colors: Record<StatusType, string> = {
    success: 'text-[#6B9C7D]',
    warning: 'text-[#C2915A]',
    critical: 'text-[#B85C5C]',
    neutral: 'text-[#A3A3AC]',
    active: 'text-[#C7A662]',
  }
  const bgColors: Record<StatusType, string> = {
    success: 'bg-[#6B9C7D]',
    warning: 'bg-[#C2915A]',
    critical: 'bg-[#B85C5C]',
    neutral: 'bg-[#A3A3AC]',
    active: 'bg-[#C7A662]',
  }

  return (
    <div className={`flex items-center gap-2 text-[13px] font-medium ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${bgColors[status] || bgColors.neutral}`} />
      <span className={colors[status] || colors.neutral}>{text}</span>
    </div>
  )
}

StatusBadge.displayName = 'StatusBadge'
