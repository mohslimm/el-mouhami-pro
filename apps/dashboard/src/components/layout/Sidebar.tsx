import React from 'react'
import {
  LayoutDashboard,
  KeyRound,
  CreditCard,
  Building2,
  Server,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { NavigationTab } from '../../types'

interface SidebarProps {
  currentTab: NavigationTab
  onSelectTab: (tab: NavigationTab) => void
  pendingPaymentsCount: number
  expiringLicensesCount: number
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingPaymentsCount,
  expiringLicensesCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Revenus ARR & Cockpit',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'licenses' as NavigationTab,
      label: 'Gestionnaire de Licences',
      icon: <KeyRound className="w-4 h-4" />,
      badge: expiringLicensesCount > 0 ? `${expiringLicensesCount} urgent` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'payments' as NavigationTab,
      label: 'Validations CCP & Banques',
      icon: <CreditCard className="w-4 h-4" />,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} en attente` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
    },
    {
      id: 'directory' as NavigationTab,
      label: 'Cabinets & Empreintes TPM',
      icon: <Building2 className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'telemetry' as NavigationTab,
      label: 'Télémétrie VPS Souverain',
      icon: <Server className="w-4 h-4" />,
      badge: '99.98%',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ]

  return (
    <aside className="w-72 h-screen flex flex-col bg-[#0D0F1D] border-r border-white/10 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center shadow-[0_0_20px_rgba(195,155,87,0.35)] shrink-0">
            <Sparkles className="w-5 h-5 text-[#080911]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-wider uppercase font-serif-luxury">
                Stepping Stones
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C39B57]/20 text-[#E8C77A] font-semibold">
                HQ
              </span>
            </div>
            <p className="text-[11px] text-[#C39B57] font-medium tracking-wide">
              Al-Mouhami Pro • Master Cockpit
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
          Console Propriétaire
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#C39B57]/20 to-[#C39B57]/5 text-[#E8C77A] border border-[#C39B57]/40 shadow-[0_2px_12px_rgba(195,155,87,0.15)] font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#E8C77A]' : 'text-white/50'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                    item.badgeColor || 'bg-white/10 text-white/70 border-white/10'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Sovereign VPS Health Pill */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-[#111425] border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white/50 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            VPS Algérie Télécom
          </span>
          <span className="text-emerald-400 font-mono-code font-semibold">28% CPU</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-[#C39B57] h-full rounded-full w-[28%]" />
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/40">
          <span>Datacenter Alger (Ben Aknoun)</span>
          <span className="text-[#E8C77A]">64 Syncs</span>
        </div>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-white/10 bg-[#080911]/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C39B57]/20 border border-[#C39B57]/40 flex items-center justify-center text-[#E8C77A] font-bold text-xs">
            AH
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1">
              Abdelhadi H.
              <ShieldCheck className="w-3 h-3 text-[#C39B57]" />
            </div>
            <p className="text-[10px] text-white/40">Agency Super-Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
