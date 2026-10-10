import React, { useState } from 'react'
import {
  KeyRound,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Calendar,
  PauseCircle,
  PlayCircle,
  Trash2,
  FileCode,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { License } from '../../types'

interface LicenseManagerViewProps {
  licenses: License[]
  onOpenIssueModal: () => void
  onExtendLicense: (licenseId: string, daysToAdd: number) => void
  onToggleSuspendLicense: (licenseId: string) => void
  onRevokeLicense: (licenseId: string) => void
  onInspectLicense: (license: License) => void
}

export const LicenseManagerView: React.FC<LicenseManagerViewProps> = ({
  licenses,
  onOpenIssueModal,
  onExtendLicense,
  onToggleSuspendLicense,
  onRevokeLicense,
  onInspectLicense,
}) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [planFilter, setPlanFilter] = useState<string>('ALL')
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

  // Filtered list
  const filteredLicenses = licenses.filter((lic) => {
    const matchesSearch =
      lic.cabinetName.toLowerCase().includes(search.toLowerCase()) ||
      lic.leadAttorney.toLowerCase().includes(search.toLowerCase()) ||
      lic.key.toLowerCase().includes(search.toLowerCase()) ||
      lic.barreau.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'ALL' ? true : lic.status === statusFilter

    const matchesPlan =
      planFilter === 'ALL' ? true : lic.plan === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  const handleCopyKey = (license: License) => {
    navigator.clipboard.writeText(license.key)
    setCopiedKeyId(license.id)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D0F1D] border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white font-serif-luxury flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#E8C77A]" />
            Registre des Licences Cryptographiques Ed25519
          </h2>
          <p className="text-xs text-white/50">
            {licenses.length} licences enregistrées • Gestion du cycle de vie et signatures souveraines
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={onOpenIssueModal}
        >
          Générer Nouvelle Licence
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#111425] border border-white/10">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par cabinet, avocat, clé ou barreau..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0D0F1D] border border-white/10 text-xs text-white placeholder-white/40 focus:border-[#C39B57] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Filter className="w-3.5 h-3.5 text-[#C39B57]" />
            <span>Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0D0F1D] border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actives</option>
              <option value="EXPIRING_SOON">Expire bientôt</option>
              <option value="TRIAL">Essai 14j</option>
              <option value="SUSPENDED">Suspendues</option>
              <option value="EXPIRED">Expirées</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <span>Formule :</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0D0F1D] border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="ALL">Tous les packs</option>
              <option value="SOLO">Pack SOLO (35k)</option>
              <option value="PRO">Pack PRO (85k)</option>
              <option value="GRAND">GRAND Cabinet (180k)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0D0F1D]/60 text-white/40 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Cabinet / Avocat</th>
                <th className="py-3.5 px-4 font-semibold">Barreau</th>
                <th className="py-3.5 px-4 font-semibold">Pack</th>
                <th className="py-3.5 px-4 font-semibold">Clé Cryptographique Ed25519</th>
                <th className="py-3.5 px-4 font-semibold">Sièges PC / Mob</th>
                <th className="py-3.5 px-4 font-semibold">Validité / Échéance</th>
                <th className="py-3.5 px-4 font-semibold">Statut</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions 1-Clic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/40">
                    Aucune licence ne correspond à vos filtres de recherche.
                  </td>
                </tr>
              ) : (
                filteredLicenses.map((lic) => {
                  const isSuspended = lic.status === 'SUSPENDED'
                  return (
                    <tr
                      key={lic.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Cabinet Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-[#E8C77A] transition-colors">
                          {lic.cabinetName}
                        </div>
                        <div className="text-[11px] text-white/40">{lic.leadAttorney}</div>
                      </td>

                      {/* Barreau */}
                      <td className="py-3.5 px-4 font-medium">
                        Barreau de {lic.barreau}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <Badge status={lic.plan}>{lic.plan}</Badge>
                      </td>

                      {/* Key */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-code text-[11px] text-[#E8C77A] bg-[#C39B57]/10 px-2 py-0.5 rounded border border-[#C39B57]/20">
                            {lic.key}
                          </span>
                          <button
                            onClick={() => handleCopyKey(lic)}
                            className="p-1 rounded text-white/40 hover:text-[#E8C77A] transition-colors"
                            title="Copier la clé"
                          >
                            {copiedKeyId === lic.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Seats */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="text-white">
                            <span className="font-semibold">{lic.activeDesktops}</span>
                            <span className="text-white/40">/{lic.maxDesktops} PC</span>
                          </div>
                          <div className="text-[10px] text-white/40">
                            <span>{lic.activeMobiles}</span>/{lic.maxMobiles} Mobiles
                          </div>
                        </div>
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4 font-mono-code">
                        <div className="text-white/90">{lic.expiryDate}</div>
                        <div className="text-[10px] text-white/40">
                          Émise le {lic.issueDate}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={lic.status} />
                      </td>

                      {/* 1-Click Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Certificate */}
                          <button
                            onClick={() => onInspectLicense(lic)}
                            className="p-1.5 rounded-lg text-white/60 hover:text-[#E8C77A] hover:bg-white/5 transition-all"
                            title="Voir le certificat JSON V2"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>

                          {/* Extend (+1 year) */}
                          <button
                            onClick={() => onExtendLicense(lic.id, 365)}
                            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-[#C39B57]/15 text-[#E8C77A] hover:bg-[#C39B57]/25 border border-[#C39B57]/30 transition-all flex items-center gap-1"
                            title="Prolonger la licence d'une année supplémentaire"
                          >
                            <Calendar className="w-3 h-3" />
                            +1 An
                          </button>

                          {/* Suspend / Resume */}
                          <button
                            onClick={() => onToggleSuspendLicense(lic.id)}
                            className={`p-1.5 rounded-lg transition-all ${
                              isSuspended
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-amber-400 hover:bg-amber-500/10'
                            }`}
                            title={isSuspended ? 'Réactiver la licence' : 'Suspendre temporairement'}
                          >
                            {isSuspended ? (
                              <PlayCircle className="w-4 h-4" />
                            ) : (
                              <PauseCircle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Revoke */}
                          <button
                            onClick={() => onRevokeLicense(lic.id)}
                            className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Révoquer définitivement cette clé"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
