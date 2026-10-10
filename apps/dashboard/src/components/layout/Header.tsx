import { useState, useEffect } from 'react'
import {
  KeyRound,
  Clock,
  RefreshCw,
  Search,
  Download,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { NavigationTab } from '../../types'

interface HeaderProps {
  currentTab: NavigationTab
  onOpenIssueLicense: () => void
  onRefresh: () => void
  isRefreshing?: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  onExportReport: () => void
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Vue d\'Ensemble & Revenus ARR',
    subtitle: 'Cockpit financier et télémétrie des abonnements cabinets d\'avocats',
  },
  licenses: {
    title: 'Gestionnaire de Licences Cryptographiques',
    subtitle: 'Émission, prolongation, suspension et révocation de clés Ed25519',
  },
  payments: {
    title: 'File d\'Attente des Versements Hors-Ligne',
    subtitle: 'Vérification des bordereaux CCP et virements bancaires BNA / CPA / BEA',
  },
  directory: {
    title: 'Répertoire Cabinets & Empreintes Matérielles',
    subtitle: 'Gestion des postes autorisés (TPM2) et réinitialisation de laptops',
  },
  telemetry: {
    title: 'Télémétrie VPS Cloud Souverain Algérie Télécom',
    subtitle: 'Monitoring temps-réel du cluster PostgreSQL, WebSockets et sauvegardes',
  },
}

export function Header({
  currentTab,
  onOpenIssueLicense,
  onRefresh,
  isRefreshing = false,
  searchQuery,
  onSearchChange,
  onExportReport,
}: HeaderProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // Algeria time (UTC+1)
      const formatted = now.toLocaleTimeString('fr-DZ', {
        timeZone: 'Africa/Algiers',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      setTime(formatted)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const currentInfo = TAB_TITLES[currentTab]

  return (
    <header className="h-20 px-8 border-b border-white/10 bg-[#0D0F1D]/80 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
      {/* View Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide font-serif-luxury">
          {currentInfo.title}
        </h1>
        <p className="text-xs text-white/50">{currentInfo.subtitle}</p>
      </div>

      {/* Center Search */}
      <div className="hidden lg:flex items-center w-80 relative">
        <Search className="w-4 h-4 text-white/40 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher cabinet, barreau, clé..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111425] border border-white/10 text-xs text-white placeholder-white/40 focus:border-[#C39B57] focus:outline-none transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Algiers Live Time */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111425] border border-white/10 text-xs text-white/70">
          <Clock className="w-3.5 h-3.5 text-[#C39B57]" />
          <span className="font-mono-code font-medium">{time || '00:00:00'}</span>
          <span className="text-[10px] text-white/40 font-mono-code">DZ</span>
        </div>

        {/* Sync Button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-[#111425] border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
          title="Actualiser les données"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C39B57]' : ''}`}
          />
        </button>

        {/* Export Report */}
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={onExportReport}
        >
          Exporter
        </Button>

        {/* Quick Issue License Button */}
        <Button
          variant="primary"
          size="sm"
          icon={<KeyRound className="w-3.5 h-3.5" />}
          onClick={onOpenIssueLicense}
        >
          Émettre Licence
        </Button>
      </div>
    </header>
  )
}
