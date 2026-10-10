import React from 'react'
import { LicenseStatus, PaymentStatus, PlanTier } from '../../types'

interface BadgeProps {
  children?: React.ReactNode
  variant?:
    | 'active'
    | 'expiring'
    | 'suspended'
    | 'expired'
    | 'trial'
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'gold'
    | 'cyan'
    | 'default'
  status?: LicenseStatus | PaymentStatus | PlanTier | string
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  className = '',
}) => {
  let computedVariant = variant || 'default'

  if (status) {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        computedVariant = 'active'
        break
      case 'EXPIRING_SOON':
        computedVariant = 'expiring'
        break
      case 'SUSPENDED':
      case 'REJECTED':
        computedVariant = 'suspended'
        break
      case 'EXPIRED':
        computedVariant = 'expired'
        break
      case 'TRIAL':
        computedVariant = 'trial'
        break
      case 'PENDING':
        computedVariant = 'pending'
        break
      case 'SOLO':
        computedVariant = 'cyan'
        break
      case 'PRO':
        computedVariant = 'gold'
        break
      case 'GRAND':
        computedVariant = 'gold'
        break
    }
  }

  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200'

  const variantStyles: Record<string, string> = {
    active:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    expiring:
      'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    suspended:
      'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
    expired:
      'bg-zinc-800/60 text-zinc-400 border-zinc-700/40',
    trial:
      'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
    pending:
      'bg-amber-400/10 text-amber-300 border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.15)]',
    approved:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected:
      'bg-rose-500/10 text-rose-400 border-rose-500/30',
    gold:
      'bg-[#C39B57]/15 text-[#E8C77A] border-[#C39B57]/40 shadow-[0_0_12px_rgba(195,155,87,0.2)]',
    cyan:
      'bg-sky-500/10 text-sky-400 border-sky-500/30',
    default:
      'bg-zinc-800/40 text-zinc-300 border-zinc-700/30',
  }

  const dotColors: Record<string, string> = {
    active: 'bg-emerald-400 animate-pulse',
    expiring: 'bg-amber-400 animate-ping',
    suspended: 'bg-rose-400',
    expired: 'bg-zinc-500',
    trial: 'bg-cyan-400 animate-pulse',
    pending: 'bg-amber-300 animate-pulse',
    gold: 'bg-[#E8C77A]',
    cyan: 'bg-sky-400',
    default: 'bg-zinc-400',
  }

  return (
    <span className={`${baseStyles} ${variantStyles[computedVariant] || variantStyles.default} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[computedVariant] || dotColors.default}`} />
      {children || status}
    </span>
  )
}
