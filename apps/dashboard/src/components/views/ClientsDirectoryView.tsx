import React, { useState } from 'react'
import {
  Building2,
  Laptop,
  Smartphone,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  HardDrive,
  Cpu,
  Wifi,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { LawFirmClient, HardwareSeat } from '../../types'

interface ClientsDirectoryViewProps {
  clients: LawFirmClient[]
  onOpenResetFingerprint: (client: LawFirmClient, seat: HardwareSeat) => void
}

export const ClientsDirectoryView: React.FC<ClientsDirectoryViewProps> = ({
  clients,
  onOpenResetFingerprint,
}) => {
  const [search, setSearch] = useState('')
  const [expandedClientId, setExpandedClientId] = useState<string | null>(
    clients[0]?.id || null
  )

  const toggleExpand = (id: string) => {
    setExpandedClientId((prev) => (prev === id ? null : id))
  }

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.cabinetName.toLowerCase().includes(q) ||
      c.leadAttorney.toLowerCase().includes(q) ||
      c.barreau.toLowerCase().includes(q) ||
      c.seats.some((s) => s.fingerprintHash.toLowerCase().includes(q) || s.deviceName.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D0F1D] border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white font-serif-luxury flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#E8C77A]" />
            Répertoire des Cabinets & Sièges Matériels TPM2
          </h2>
          <p className="text-xs text-white/50">
            Contrôle des empreintes matérielles SHA-256 et libération des licences lors du renouvellement de matériel
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/60 bg-[#111425] px-3.5 py-2 rounded-xl border border-white/10">
          <Cpu className="w-4 h-4 text-[#C39B57]" />
          <span>Verrouillage Matériel TPM 2.0 Activé</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par cabinet, avocat, nom de PC ou hash d'empreinte (ex: HW-D4F8)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-xs text-white placeholder-white/40 focus:border-[#C39B57] focus:outline-none"
        />
      </div>

      {/* Cabinets Cards / Directory */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <div className="glass-card p-12 text-center text-white/40 text-xs">
            Aucun cabinet ou empreinte trouvée avec ce critère de recherche.
          </div>
        ) : (
          filteredClients.map((client) => {
            const isExpanded = expandedClientId === client.id
            return (
              <div
                key={client.id}
                className="glass-card overflow-hidden transition-all duration-200"
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(client.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#C39B57]/15 border border-[#C39B57]/30 flex items-center justify-center text-[#E8C77A] font-bold text-sm shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-white text-base font-serif-luxury">
                          {client.cabinetName}
                        </h3>
                        <Badge status={client.plan}>{client.plan}</Badge>
                      </div>
                      <div className="text-xs text-white/50 flex flex-wrap items-center gap-3 mt-0.5">
                        <span className="text-white/80 font-medium">
                          {client.leadAttorney}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C39B57]" /> Barreau de {client.barreau}
                        </span>
                        <span>•</span>
                        <span className="font-mono-code text-[#E8C77A]">
                          Clé: {client.licenseKey}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Quotas & Expand Button */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* Desktop Seats */}
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-white/40 block">Postes PC Déployés</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Laptop className="w-3.5 h-3.5 text-[#C39B57]" />
                        <span className="font-bold text-white">
                          {client.desktopsUsed} / {client.maxDesktops}
                        </span>
                        <span className="text-white/40">sièges</span>
                      </div>
                    </div>

                    {/* Mobile Seats */}
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-white/40 block">Accès Mobiles</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white">
                          {client.mobilesUsed} / {client.maxMobiles}
                        </span>
                        <span className="text-white/40">sièges</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Device Seats Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/10 bg-[#0D0F1D]/50 space-y-4">
                    <div className="flex items-center justify-between pt-2">
                      <h4 className="text-xs font-semibold text-[#E8C77A] uppercase tracking-wider flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Empreintes Matérielles Reliées ({client.seats.length} Appareils)
                      </h4>
                      <span className="text-[11px] text-white/40">
                        Chaque machine est liée cryptographiquement par son chipset TPM 2.0
                      </span>
                    </div>

                    {/* Device List Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {client.seats.map((seat) => (
                        <div
                          key={seat.id}
                          className="p-4 rounded-xl bg-[#111425] border border-white/10 space-y-3 relative group hover:border-[#C39B57]/40 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {seat.type === 'DESKTOP' ? (
                                <Laptop className="w-4 h-4 text-[#C39B57]" />
                              ) : (
                                <Smartphone className="w-4 h-4 text-cyan-400" />
                              )}
                              <div>
                                <h5 className="font-semibold text-xs text-white truncate max-w-[160px]">
                                  {seat.deviceName}
                                </h5>
                                <span className="text-[10px] text-white/40">{seat.os}</span>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Actif
                            </span>
                          </div>

                          {/* Hardware Hash */}
                          <div className="p-2 rounded-lg bg-[#060610] border border-white/5 space-y-1">
                            <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                              Empreinte Hash Machine (TPM2 / UUID) :
                            </span>
                            <div className="font-mono-code text-[11px] text-[#E8C77A] truncate font-medium">
                              {seat.fingerprintHash}
                            </div>
                          </div>

                          {/* Telemetry info */}
                          <div className="space-y-1 text-[11px] text-white/50">
                            <div className="flex items-center justify-between">
                              <span>Dernière synchro :</span>
                              <span className="text-white/80 font-medium">{seat.lastSyncAt}</span>
                            </div>
                            <div className="flex items-center justify-between truncate">
                              <span className="flex items-center gap-1">
                                <Wifi className="w-3 h-3 text-emerald-400" /> IP :
                              </span>
                              <span className="text-white/70 font-mono-code text-[10px] truncate max-w-[140px]">
                                {seat.ipAddress}
                              </span>
                            </div>
                          </div>

                          {/* Reset Button */}
                          <div className="pt-2 border-t border-white/5 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<RefreshCw className="w-3.5 h-3.5" />}
                              onClick={() => onOpenResetFingerprint(client, seat)}
                              title="Réinitialiser l'empreinte pour autoriser un nouveau laptop"
                            >
                              Réinitialiser Empreinte
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
