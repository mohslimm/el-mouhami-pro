import React, { useState } from 'react'
import {
  Cpu,
  Zap,
  FileCheck2,
  Mic,
  AlertTriangle,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { MetricCard } from '../ui/MetricCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { AiCabinetUsage } from '../../types'
import { formatDzd } from '../../services/cryptoLicense'

interface AiUsageWatchdogViewProps {
  usages: AiCabinetUsage[]
  onAdjustCap?: (cabinetId: string, addedCap: number) => void
}

export const AiUsageWatchdogView: React.FC<AiUsageWatchdogViewProps> = ({
  usages,
  onAdjustCap,
}) => {
  const [selectedCabinet, setSelectedCabinet] = useState<AiCabinetUsage | null>(null)
  const [extraTokens, setExtraTokens] = useState('500000')

  // Aggregates
  const totalTokens = usages.reduce((acc, u) => acc + u.tokensUsedThisMonth, 0)
  const totalCostDzd = usages.reduce((acc, u) => acc + u.estimatedCostDzd, 0)
  const totalPetitions = usages.reduce((acc, u) => acc + u.petitionsDrafted, 0)
  const totalVoiceMin = usages.reduce((acc, u) => acc + u.voiceMinutes, 0)
  const exceededCount = usages.filter((u) => u.status === 'EXCEEDED').length

  const handleApplyCap = () => {
    if (!selectedCabinet || !onAdjustCap) return
    onAdjustCap(selectedCabinet.cabinetId, Number(extraTokens) || 500000)
    setSelectedCabinet(null)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tokens Consommés ce Mois"
          value={`${(totalTokens / 1000000).toFixed(2)} M`}
          subtitle="Modèles Gemini 1.5 Pro & DeepSeek V3"
          trend={{ value: '+18.2%', isPositive: true, label: 'vs mois dernier' }}
          icon={<Cpu className="w-5 h-5" />}
          accentColor="#C39B57"
        />

        <MetricCard
          title="Coût API Fournisseur"
          value={formatDzd(totalCostDzd)}
          subtitle="Taux USD/DZD: 134.50 DZD"
          trend={{ value: 'Marge SaaS: 94.8%', isPositive: true }}
          icon={<Zap className="w-5 h-5 text-amber-400" />}
          iconBgColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          accentColor="#F59E0B"
        />

        <MetricCard
          title="Actes & Requêtes Générés"
          value={totalPetitions}
          subtitle="Conclusions, mémoires, référés"
          icon={<FileCheck2 className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          accentColor="#10B981"
        />

        <MetricCard
          title="Dictée Vocale Traitée"
          value={`${totalVoiceMin} min`}
          subtitle="Notes d'audience & dépositions"
          icon={<Mic className="w-5 h-5 text-blue-400" />}
          iconBgColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
          accentColor="#3B82F6"
        />
      </div>

      {/* Sovereign AI Architecture Banner */}
      <div className="p-5 rounded-2xl bg-[#0D0F1D] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-serif-luxury flex items-center gap-2">
              Proxy Souverain d'Anonymisation PII & Algorithme Anti-Surcoût
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-code font-bold">
                Loi 18-07 Active
              </span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Toutes les requêtes des avocats passent par le serveur Alger Ben Aknoun où les noms de
              parties et numéros de cartes d'identité sont remplacés par des tokens fictifs avant
              inférence.
            </p>
          </div>
        </div>

        {exceededCount > 0 && (
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 shrink-0 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {exceededCount} cabinet en dépassement de quota
          </div>
        )}
      </div>

      {/* Law Firms Consumption Table */}
      <div className="rounded-2xl bg-[#0D0F1D] border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-[#111425]/40 flex items-center justify-between">
          <div className="font-bold text-white text-xs uppercase tracking-wider">
            Consommation & Marges par Cabinet d'Avocat
          </div>
          <span className="text-[11px] text-white/40">Mise à jour toutes les 15 minutes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#111425]/60 text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Cabinet / Barreau</th>
                <th className="py-3 px-4 font-semibold">Formule</th>
                <th className="py-3 px-4 font-semibold w-64">Jauge de Quota Mensuel</th>
                <th className="py-3 px-4 font-semibold text-center">Requêtes Rédaction</th>
                <th className="py-3 px-4 font-semibold text-center">Audio Dictée</th>
                <th className="py-3 px-4 font-semibold text-right">Coût API DZD</th>
                <th className="py-3 px-4 font-semibold text-center">Statut</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usages.map((item) => {
                const percentage = Math.min(
                  100,
                  Math.round((item.tokensUsedThisMonth / item.monthlyTokenCap) * 100)
                )
                const isExceeded = item.tokensUsedThisMonth >= item.monthlyTokenCap
                const isWarning = percentage >= 80 && !isExceeded

                return (
                  <tr key={item.cabinetId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.cabinetName}</div>
                      <div className="text-[11px] text-white/50">
                        {item.leadAttorney} • Barreau de {item.barreau}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[#C39B57]/30 text-[#E8C77A] bg-[#C39B57]/10">
                        {item.plan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono-code">
                          <span className="text-white/80">
                            {(item.tokensUsedThisMonth / 1000).toFixed(0)}k /{' '}
                            {(item.monthlyTokenCap / 1000).toFixed(0)}k
                          </span>
                          <span
                            className={
                              isExceeded
                                ? 'text-rose-400 font-bold'
                                : isWarning
                                ? 'text-amber-400 font-semibold'
                                : 'text-emerald-400'
                            }
                          >
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isExceeded
                                ? 'bg-rose-500'
                                : isWarning
                                ? 'bg-amber-400'
                                : 'bg-gradient-to-r from-emerald-500 to-[#C39B57]'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono-code font-semibold text-white/90">
                      {item.petitionsDrafted} actes
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono-code text-blue-300">
                      {item.voiceMinutes} min
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono-code font-bold text-[#E8C77A]">
                      {formatDzd(item.estimatedCostDzd)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'EXCEEDED' ? (
                        <Badge variant="rejected">Plafond Dépassé</Badge>
                      ) : item.status === 'WARNING' ? (
                        <Badge variant="expiring">&gt; 80% Consommé</Badge>
                      ) : (
                        <Badge variant="active">Normal</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<PlusCircle className="w-3.5 h-3.5 text-[#E8C77A]" />}
                        onClick={() => setSelectedCabinet(item)}
                      >
                        Recharger
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Cap Modal */}
      {selectedCabinet && (
        <Modal
          isOpen={!!selectedCabinet}
          onClose={() => setSelectedCabinet(null)}
          title={`Ajustement de Quota IA • ${selectedCabinet.cabinetName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-white">
            <p className="text-white/60">
              Augmenter le plafond mensuel de tokens pour permettre au cabinet de continuer à
              utiliser la rédaction automatique d'actes et la dictée vocale sans blocage.
            </p>

            <div className="p-3.5 rounded-xl bg-[#111425] border border-white/10 space-y-2">
              <div className="flex justify-between text-white/70">
                <span>Plafond Actuel :</span>
                <span className="font-mono-code font-bold text-white">
                  {(selectedCabinet.monthlyTokenCap / 1000).toFixed(0)} 000 tokens
                </span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Consommation Réelle :</span>
                <span className="font-mono-code font-bold text-[#E8C77A]">
                  {(selectedCabinet.tokensUsedThisMonth / 1000).toFixed(0)} 000 tokens
                </span>
              </div>
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-medium">
                Volume de Recharge à Créditer
              </label>
              <select
                value={extraTokens}
                onChange={(e) => setExtraTokens(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none font-mono-code"
              >
                <option value="250000">+ 250 000 Tokens (~30 actes de procédure)</option>
                <option value="500000">+ 500 000 Tokens (~60 actes & 150 min dictée)</option>
                <option value="1000000">+ 1 000 000 Tokens (Doublement du quota)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" size="sm" onClick={() => setSelectedCabinet(null)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={handleApplyCap}
              >
                Appliquer Recharge Immédiate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
