import React from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  icon: React.ReactNode
  iconBgColor?: string
  accentColor?: string
  onClick?: () => void
  badge?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBgColor = 'bg-[#C39B57]/10 text-[#E8C77A] border-[#C39B57]/20',
  accentColor,
  onClick,
  badge,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 relative overflow-hidden group ${
        onClick ? 'cursor-pointer hover:border-[#C39B57]/60' : ''
      }`}
    >
      {/* Background radial gradient accent */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundColor: accentColor || '#C39B57',
        }}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-white/50 font-medium">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C39B57]/20 text-[#E8C77A] border border-[#C39B57]/30">
                {badge}
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif-luxury text-white tracking-wide">
            {value}
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconBgColor}`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          {subtitle && <span className="text-white/40">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                trend.isPositive !== false ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span>{trend.isPositive !== false ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
              {trend.label && <span className="text-white/40 font-normal">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
