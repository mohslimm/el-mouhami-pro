import React, { useState } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Clock,
  Laptop,
  Ban,
  Search,
} from 'lucide-react'
import { MetricCard } from '../ui/MetricCard'
import { SecurityAuditLog } from '../../types'

interface SecurityAuditLogsViewProps {
  logs: SecurityAuditLog[]
  onUnblockIp?: (logId: string) => void
}

export const SecurityAuditLogsView: React.FC<SecurityAuditLogsViewProps> = ({
  logs,
  onUnblockIp,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Aggregates
  const totalIncidents = logs.length
  const criticalCount = logs.filter((l) => l.severity === 'CRITICAL').length
  const clockRollbackCount = logs.filter((l) => l.eventType === 'CLOCK_ROLLBACK').length
  const unauthorizedSeatCount = logs.filter((l) => l.eventType === 'UNAUTHORIZED_SEAT').length

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterSeverity === 'ALL' ? true : log.severity === filterSeverity
    const matchesSearch =
      (log.cabinetName && log.cabinetName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.ipAddress.includes(searchQuery) ||
      log.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hardwareHash.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getEventBadge = (type: SecurityAuditLog['eventType']) => {
    switch (type) {
      case 'CLOCK_ROLLBACK':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Fraude Horloge
          </span>
        )
      case 'UNAUTHORIZED_SEAT':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
            <Laptop className="w-3 h-3" /> Siège Excédentaire
          </span>
        )
      case 'INVALID_KEY':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" /> Clé Forgée
          </span>
        )
      case 'IP_BLOCKED':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold flex items-center gap-1">
            <Ban className="w-3 h-3" /> IP Bloquée
          </span>
        )
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Audit Local
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Menaces Bloquées"
          value={totalIncidents}
          subtitle="Toutes neutralisées en temps réel"
          trend={{ value: '100% protégé', isPositive: true }}
          icon={<ShieldAlert className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          accentColor="#10B981"
        />

        <MetricCard
          title="Fraudes Horloge Détectées"
          value={clockRollbackCount}
          subtitle="Tentatives de contournement d'essai gratuit"
          trend={{ value: 'Horloge verrouillée', isPositive: true }}
          icon={<Clock className="w-5 h-5 text-rose-400" />}
          iconBgColor="bg-rose-500/10 text-rose-400 border-rose-500/20"
          accentColor="#EF4444"
        />

        <MetricCard
          title="Sièges Bloqués (Sur-Postes)"
          value={unauthorizedSeatCount}
          subtitle="Tentatives de duplication de clé au cabinet"
          icon={<Laptop className="w-5 h-5 text-amber-400" />}
          iconBgColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          accentColor="#F59E0B"
        />

        <MetricCard
          title="Incidents Critiques"
          value={criticalCount}
          subtitle="Clés contrefaites ou IP étrangères Tor"
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          iconBgColor="bg-red-500/10 text-red-400 border-red-500/20"
          accentColor="#DC2626"
        />
      </div>

      {/* Security Architecture Explainer Banner */}
      <div className="p-5 rounded-2xl bg-[#0D0F1D] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#C39B57]/10 border border-[#C39B57]/20 flex items-center justify-center text-[#E8C77A] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-serif-luxury">
              Protection Hardware TPM 2.0 & Signatures Asymétriques Ed25519
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Chaque licence est liée à l'identifiant matériel unique de la carte mère et du processeur
              (TPM). Aucun partage pirate de clé n'est possible entre confrères sans autorisation du
              super-admin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono-code font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Intégrité Algérie Télécom Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0F1D] border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterSeverity === 'ALL'
                ? 'bg-[#C39B57] text-[#080911] font-bold shadow-[0_0_12px_rgba(195,155,87,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Tous ({logs.length})
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterSeverity === 'CRITICAL'
                ? 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Critiques ({criticalCount})
          </button>
          <button
            onClick={() => setFilterSeverity('WARNING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterSeverity === 'WARNING'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Avertissements ({logs.filter((l) => l.severity === 'WARNING').length})
          </button>
          <button
            onClick={() => setFilterSeverity('INFO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterSeverity === 'INFO'
                ? 'bg-blue-500 text-white font-bold shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Infos ({logs.filter((l) => l.severity === 'INFO').length})
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer IP, Wilaya, Cabinet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111425] border border-white/10 text-xs text-white placeholder-white/40 focus:border-[#C39B57] focus:outline-none"
          />
        </div>
      </div>

      {/* Security Logs Stream Table */}
      <div className="rounded-2xl bg-[#0D0F1D] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#111425]/60 text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Horodatage</th>
                <th className="py-3 px-4 font-semibold">Type d'Événement</th>
                <th className="py-3 px-4 font-semibold">Cabinet / Cible</th>
                <th className="py-3 px-4 font-semibold">IP & Localisation</th>
                <th className="py-3 px-4 font-semibold">Empreinte TPM</th>
                <th className="py-3 px-4 font-semibold">Détails de l'Incident</th>
                <th className="py-3 px-4 font-semibold text-center">Action Prise</th>
                <th className="py-3 px-4 font-semibold text-center">Débloquer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono-code text-white/60 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3.5 px-4">{getEventBadge(log.eventType)}</td>

                  <td className="py-3.5 px-4 font-semibold text-white">
                    {log.cabinetName || <span className="text-white/30 italic">Non identifié</span>}
                  </td>

                  <td className="py-3.5 px-4 font-mono-code text-[11px]">
                    <div className="text-white/80">{log.ipAddress}</div>
                    <div className="text-white/40 text-[10px]">{log.wilaya}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono-code text-[#E8C77A] text-[11px]">
                    {log.hardwareHash}
                  </td>

                  <td className="py-3.5 px-4 text-white/70 max-w-xs">{log.details}</td>

                  <td className="py-3.5 px-4 text-center">
                    {log.actionTaken === 'BLOCKED' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                        BLOQUÉ
                      </span>
                    ) : log.actionTaken === 'FLAGGED' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        SIGNALÉ
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        RÉSOLU
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {log.actionTaken === 'BLOCKED' && onUnblockIp ? (
                      <button
                        onClick={() => onUnblockIp(log.id)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#C39B57]/20 text-white/60 hover:text-[#E8C77A] border border-white/5 transition-colors cursor-pointer"
                      >
                        Débloquer
                      </button>
                    ) : (
                      <span className="text-[10px] text-white/30">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
