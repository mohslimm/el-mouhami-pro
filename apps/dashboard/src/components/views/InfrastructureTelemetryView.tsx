import React from 'react'
import {
  Server,
  Cpu,
  HardDrive,
  Database,
  Radio,
  ShieldCheck,
  Lock,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Zap,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { VpsTelemetry } from '../../types'

interface InfrastructureTelemetryViewProps {
  telemetry: VpsTelemetry
  onTriggerBackup?: () => void
}

export const InfrastructureTelemetryView: React.FC<InfrastructureTelemetryViewProps> = ({
  telemetry,
  onTriggerBackup,
}) => {
  const ramPercentage = Math.round((telemetry.ramUsedGb / telemetry.ramTotalGb) * 100)
  const diskPercentage = Math.round((telemetry.diskUsedGb / telemetry.diskTotalGb) * 100)

  return (
    <div className="space-y-6 pb-12">
      {/* Top Datacenter Sovereign Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#15192E] via-[#111425] to-[#080911] border border-[#C39B57]/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Server className="w-48 h-48 text-[#C39B57]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-semibold">
                Noeud Cloud Souverain National
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                Opérationnel 99.98%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-luxury">
              {telemetry.datacenter}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
              <span className="font-mono-code text-[#E8C77A]">{telemetry.serverNode}</span>
              <span>•</span>
              <span className="font-mono-code">{telemetry.ipAddress}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-white/80">
                <Clock className="w-3.5 h-3.5 text-[#C39B57]" /> Uptime : {telemetry.uptime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-[#060610] border border-white/10 text-right">
              <span className="text-[10px] text-white/40 block">Latence Réseau Moyenne</span>
              <span className="text-base font-bold text-emerald-400 font-mono-code">
                {telemetry.dbLatencyMs} ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Gauges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#C39B57]" /> Charge CPU
            </span>
            <span className="font-mono-code text-xs text-[#E8C77A] font-bold">
              {telemetry.cpuUsage}%
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-serif-luxury">
            {telemetry.cpuCores} Cores AMD EPYC
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gold-gradient-bg transition-all duration-500"
              style={{ width: `${telemetry.cpuUsage}%` }}
            />
          </div>
          <span className="text-[11px] text-white/40 block truncate">
            {telemetry.cpuModel}
          </span>
        </div>

        {/* RAM */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" /> Mémoire RAM ECC
            </span>
            <span className="font-mono-code text-xs text-cyan-300 font-bold">
              {ramPercentage}%
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-serif-luxury">
            {telemetry.ramUsedGb} Go <span className="text-sm font-normal text-white/40">/ {telemetry.ramTotalGb} Go</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${ramPercentage}%` }}
            />
          </div>
          <span className="text-[11px] text-white/40 block">
            DDR4 ECC Registrée • Aucun swap actif
          </span>
        </div>

        {/* Storage NVMe */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-purple-400" /> Disque NVMe RAID10
            </span>
            <span className="font-mono-code text-xs text-purple-300 font-bold">
              {diskPercentage}%
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-serif-luxury">
            {telemetry.diskUsedGb} Go <span className="text-sm font-normal text-white/40">/ {telemetry.diskTotalGb} Go</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${diskPercentage}%` }}
            />
          </div>
          <span className="text-[11px] text-white/40 block">
            357.6 Go d'espace libre pour GED et bases
          </span>
        </div>

        {/* Sync WebSockets */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400" /> Sync En Direct
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-white font-serif-luxury">
            {telemetry.activeWebSocketConnections} Cabinets
          </div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-cyan-400" /> {telemetry.bandwidthInMbps} Mbps
            </span>
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> {telemetry.bandwidthOutMbps} Mbps
            </span>
          </div>
          <span className="text-[11px] text-white/40 block">
            Canaux TLS 1.3 bidirectionnels chiffrés
          </span>
        </div>
      </div>

      {/* Database & Sovereign Backup Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Cluster */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#C39B57]" />
              <div>
                <h3 className="text-base font-semibold text-white font-serif-luxury">
                  Cluster Base de Données Sécurisée
                </h3>
                <p className="text-xs text-white/50">Moteur relationnel & vectoriel</p>
              </div>
            </div>
            <span className="text-xs font-mono-code text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Prêt (88 connexions)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0D0F1D] border border-white/10 flex items-center justify-between">
              <span className="text-white/60">Version Moteur :</span>
              <span className="text-white font-mono-code">{telemetry.postgresVersion}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0F1D] border border-white/10 flex items-center justify-between">
              <span className="text-white/60">Réplication & Résilience :</span>
              <span className="text-emerald-400 font-semibold">
                Multi-Node Active-Passive Synchrone
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0F1D] border border-white/10 flex items-center justify-between">
              <span className="text-white/60">Recherche Vectorielle Jurisprudence :</span>
              <span className="text-[#E8C77A] font-semibold">
                pgvector (Index HNSW 1536 dim)
              </span>
            </div>
          </div>
        </div>

        {/* Sovereign Backups */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#C39B57]" />
              <div>
                <h3 className="text-base font-semibold text-white font-serif-luxury">
                  Snapshots & Sauvegardes Souveraines
                </h3>
                <p className="text-xs text-white/50">
                  Chiffrement AES-256 stocké sur baie locale algérienne
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Succès
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0D0F1D] border border-white/10 space-y-1">
              <span className="text-[10px] text-white/40 block">Dernier Snapshot :</span>
              <span className="text-white font-medium block">
                {telemetry.lastSovereignBackup}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0F1D] border border-white/10 flex items-center justify-between">
              <span className="text-white/60">Politique de Rétention :</span>
              <span className="text-white font-mono-code">30 Jours Glissants + 12 Mensuels</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0F1D] border border-white/10 flex items-center justify-between">
              <span className="text-white/60">Intégrité SHA-512 :</span>
              <span className="text-emerald-400 font-mono-code font-semibold">
                VALIDÉ (Aucune altération)
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
              onClick={onTriggerBackup}
            >
              Déclencher un Snapshot Manuel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
