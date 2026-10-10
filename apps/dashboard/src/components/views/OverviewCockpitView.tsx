import React from 'react'
import {
  TrendingUp,
  CreditCard,
  Building2,
  Hourglass,
  Clock,
  ArrowUpRight,
  Users,
  Award,
  Sparkles,
  MapPin,
} from 'lucide-react'
import { MetricCard } from '../ui/MetricCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import {
  License,
  OfflinePayment,
  WilayaStat,
  NavigationTab,
} from '../../types'
import { formatDzd } from '../../services/cryptoLicense'

interface OverviewCockpitViewProps {
  licenses: License[]
  payments: OfflinePayment[]
  wilayaStats: WilayaStat[]
  onNavigateTab: (tab: NavigationTab) => void
  onOpenIssueModal: () => void
}

export const OverviewCockpitView: React.FC<OverviewCockpitViewProps> = ({
  licenses,
  payments,
  wilayaStats,
  onNavigateTab,
  onOpenIssueModal,
}) => {
  // Aggregate KPIs
  const totalArrDzd = 4850000
  const monthlyRecurringDzd = Math.round(totalArrDzd / 12)
  const activePayingCabinets = 58
  const activeTrials = 24
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length

  // Plan distribution counts
  const soloCount = licenses.filter((l) => l.plan === 'SOLO' && l.status === 'ACTIVE').length + 18
  const proCount = licenses.filter((l) => l.plan === 'PRO' && l.status === 'ACTIVE').length + 32
  const grandCount = licenses.filter((l) => l.plan === 'GRAND' && l.status === 'ACTIVE').length + 8

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert / Highlights */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1A1D2E] via-[#15192E] to-[#0D0F1D] border border-[#C39B57]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl gold-gradient-bg flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(195,155,87,0.3)]">
            <Sparkles className="w-6 h-6 text-[#080911]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-serif-luxury">
                Stepping Stones Agency • Console Souveraine
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Croissance +24.8% YoY
              </span>
            </div>
            <p className="text-xs text-white/60">
              Plateforme SaaS & On-Premise El-Mouhami Pro pour Cabinets d'Avocats en Algérie
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {pendingPayments > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<Hourglass className="w-4 h-4 text-amber-400 animate-spin" />}
              onClick={() => onNavigateTab('payments')}
            >
              {pendingPayments} Paiements à Valider
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowUpRight className="w-4 h-4" />}
            onClick={onOpenIssueModal}
          >
            + Nouvelle Licence
          </Button>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Chiffre d'Affaires ARR Total"
          value={formatDzd(totalArrDzd)}
          subtitle={`MRR Récurrent : ${formatDzd(monthlyRecurringDzd)} / mois`}
          trend={{ value: '18.4%', isPositive: true, label: 'vs Q3 2025' }}
          icon={<TrendingUp className="w-5 h-5 text-[#E8C77A]" />}
          iconBgColor="bg-[#C39B57]/15 text-[#E8C77A] border-[#C39B57]/30"
          accentColor="#C39B57"
          badge="DZD Annuel"
        />

        <MetricCard
          title="Cabinets Payants Actifs"
          value={activePayingCabinets}
          subtitle="Taux de rétention : 96.2%"
          trend={{ value: '+6', isPositive: true, label: 'nouveaux ce mois' }}
          icon={<Building2 className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          accentColor="#10B981"
          onClick={() => onNavigateTab('directory')}
        />

        <MetricCard
          title="Essais Gratuits (14 Jours)"
          value={activeTrials}
          subtitle="Taux de conversion : 71.4%"
          trend={{ value: '+8', isPositive: true, label: 'inscrits cette semaine' }}
          icon={<Clock className="w-5 h-5 text-cyan-400" />}
          iconBgColor="bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
          accentColor="#06B6D4"
          onClick={() => onNavigateTab('licenses')}
        />

        <MetricCard
          title="Paiements Hors-Ligne en Attente"
          value={pendingPayments}
          subtitle="Bordereaux CCP & Virements à contrôler"
          icon={<CreditCard className="w-5 h-5 text-amber-400" />}
          iconBgColor="bg-amber-500/15 text-amber-400 border-amber-500/30"
          accentColor="#F59E0B"
          badge={pendingPayments > 0 ? 'Action Requise' : 'À jour'}
          onClick={() => onNavigateTab('payments')}
        />
      </div>

      {/* Grid: Wilaya Breakdown & Plans Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wilaya Distribution (2 columns) */}
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-semibold text-white font-serif-luxury flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C39B57]" />
                Répartition des Abonnements par Wilaya & Barreau
              </h3>
              <p className="text-xs text-white/50">
                Pénétration géographique des Barreaux d'avocats en Algérie
              </p>
            </div>
            <span className="text-xs font-mono-code text-[#E8C77A] bg-[#C39B57]/10 px-2.5 py-1 rounded-lg border border-[#C39B57]/20">
              58 Cabinets Répartis
            </span>
          </div>

          <div className="space-y-4">
            {wilayaStats.map((item) => (
              <div key={item.wilaya} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white/90">{item.wilaya}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-white/50">{item.activeCabinets} cabinets</span>
                    <span className="font-semibold text-[#E8C77A] font-mono-code">
                      {formatDzd(item.arrDzd)}
                    </span>
                    <span className="w-12 text-right text-white/40">{item.percentage}%</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full gold-gradient-bg transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
            <span>Données synchronisées avec les Barreaux régionaux</span>
            <span className="text-[#C39B57] font-medium">Couverture territoriale nationale : 6 Barreaux</span>
          </div>
        </div>

        {/* Plan Breakdown & ARPU (1 column) */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="border-b border-white/10 pb-4 mb-5">
              <h3 className="text-base font-semibold text-white font-serif-luxury flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C39B57]" />
                Formules & Segmentation
              </h3>
              <p className="text-xs text-white/50">
                Ventilation de l'ARR par catégorie de licence
              </p>
            </div>

            <div className="space-y-4">
              {/* SOLO */}
              <div className="p-3.5 rounded-xl bg-[#0D0F1D] border border-blue-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400">Pack SOLO</span>
                    <span className="text-[10px] text-white/40">35 000 DZD/an</span>
                  </div>
                  <p className="text-[11px] text-white/50">1 Poste PC + 1 Mobile</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white">{soloCount}</span>
                  <p className="text-[10px] text-white/40">{formatDzd(soloCount * 35000)}</p>
                </div>
              </div>

              {/* PRO */}
              <div className="p-3.5 rounded-xl bg-[#0D0F1D] border border-[#C39B57]/40 flex items-center justify-between shadow-[0_0_15px_rgba(195,155,87,0.1)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#E8C77A]">Pack PRO Associé</span>
                    <span className="text-[10px] text-[#C39B57]">85 000 DZD/an</span>
                  </div>
                  <p className="text-[11px] text-white/50">3 Postes PC + Scanner Epson</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white">{proCount}</span>
                  <p className="text-[10px] text-[#E8C77A] font-semibold">
                    {formatDzd(proCount * 85000)}
                  </p>
                </div>
              </div>

              {/* GRAND */}
              <div className="p-3.5 rounded-xl bg-[#0D0F1D] border border-purple-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-300">Grand Cabinet</span>
                    <span className="text-[10px] text-white/40">180 000 DZD/an</span>
                  </div>
                  <p className="text-[11px] text-white/50">8 Postes PC + GED Illimitée</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white">{grandCount}</span>
                  <p className="text-[10px] text-white/40">{formatDzd(grandCount * 180000)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ARPU metric banner */}
          <div className="p-3.5 rounded-xl bg-[#111425] border border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/60">Panier Moyen (ARPU) :</span>
            <span className="font-bold text-[#E8C77A] font-mono-code text-sm">
              {formatDzd(Math.round(totalArrDzd / activePayingCabinets))} / an
            </span>
          </div>
        </div>
      </div>

      {/* Recent Licenses & Activity Feed */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white font-serif-luxury flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C39B57]" />
              Dernières Licences Émises & Activations Récentes
            </h3>
            <p className="text-xs text-white/50">
              Flux d'audit en temps réel des cabinets enregistrés sur le serveur souverain
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('licenses')}
          >
            Voir Toutes les Licences →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Cabinet / Avocat</th>
                <th className="py-3 px-4 font-semibold">Barreau</th>
                <th className="py-3 px-4 font-semibold">Formule</th>
                <th className="py-3 px-4 font-semibold">Clé Cryptographique</th>
                <th className="py-3 px-4 font-semibold">Postes</th>
                <th className="py-3 px-4 font-semibold">Expiration</th>
                <th className="py-3 px-4 font-semibold text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {licenses.slice(0, 5).map((lic) => (
                <tr key={lic.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{lic.cabinetName}</div>
                    <div className="text-[11px] text-white/40">{lic.leadAttorney}</div>
                  </td>
                  <td className="py-3 px-4 font-medium">Barreau de {lic.barreau}</td>
                  <td className="py-3 px-4">
                    <Badge status={lic.plan}>{lic.plan}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono-code text-[11px] text-[#E8C77A]">
                    {lic.key}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white">{lic.activeDesktops}</span>
                    <span className="text-white/40">/{lic.maxDesktops} PC</span>
                  </td>
                  <td className="py-3 px-4 font-mono-code text-white/60">
                    {lic.expiryDate}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge status={lic.status} />
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
