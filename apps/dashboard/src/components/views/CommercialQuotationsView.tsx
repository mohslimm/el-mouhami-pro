import React, { useState } from 'react'
import {
  Calculator,
  Plus,
  Send,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react'
import { MetricCard } from '../ui/MetricCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { CommercialQuotation, Barreau } from '../../types'
import { formatDzd } from '../../services/cryptoLicense'

interface CommercialQuotationsViewProps {
  quotations: CommercialQuotation[]
  onAddQuotation: (quote: CommercialQuotation) => void
  onUpdateQuoteStatus: (quoteId: string, status: CommercialQuotation['status']) => void
}

export const CommercialQuotationsView: React.FC<CommercialQuotationsViewProps> = ({
  quotations,
  onAddQuotation,
  onUpdateQuoteStatus,
}) => {
  const [selectedQuote, setSelectedQuote] = useState<CommercialQuotation | null>(null)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // Simulator Form State
  const [clientName, setClientName] = useState('')
  const [leadAttorney, setLeadAttorney] = useState('')
  const [barreau, setBarreau] = useState<Barreau>('Alger')
  const [desktopsCount, setDesktopsCount] = useState<number>(3)
  const [mobilesCount, setMobilesCount] = useState<number>(3)
  const [hasScannerAddon, setHasScannerAddon] = useState<boolean>(true)
  const [hasCloudAddon, setHasCloudAddon] = useState<boolean>(true)
  const [discountPercent, setDiscountPercent] = useState<number>(0)

  // Live calculation
  // Base license: 35k for 1 PC, + 25k per extra PC
  const baseSoftwarePrice =
    desktopsCount === 1
      ? 35000
      : desktopsCount <= 3
      ? 85000
      : 85000 + (desktopsCount - 3) * 20000
  const scannerPrice = hasScannerAddon ? 65000 : 0
  const cloudPrice = hasCloudAddon ? 40000 : 0
  const subtotal = baseSoftwarePrice + scannerPrice + cloudPrice
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const totalAmount = subtotal - discountAmount

  // Aggregates
  const totalQuotes = quotations.length
  const acceptedQuotes = quotations.filter((q) => q.status === 'ACCEPTED').length
  const totalPipelineDzd = quotations.reduce((acc, q) => acc + q.totalAmountDzd, 0)
  const acceptedPipelineDzd = quotations
    .filter((q) => q.status === 'ACCEPTED')
    .reduce((acc, q) => acc + q.totalAmountDzd, 0)

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName) return

    const newQuote: CommercialQuotation = {
      id: `quote-${Date.now()}`,
      quoteNumber: `DEV-2026-00${Math.floor(20 + Math.random() * 80)}`,
      clientName,
      leadAttorney: leadAttorney || clientName,
      barreau,
      desktopsCount,
      mobilesCount,
      hasHardwareScannerAddon: hasScannerAddon,
      hasSovereignCloudAddon: hasCloudAddon,
      totalAmountDzd: totalAmount,
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'SENT',
    }

    onAddQuotation(newQuote)
    setIsNewModalOpen(false)
    setClientName('')
    setLeadAttorney('')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Devis Émis (Pipeline)"
          value={formatDzd(totalPipelineDzd)}
          subtitle={`${totalQuotes} propositions commerciales B2B`}
          icon={<Calculator className="w-5 h-5 text-[#E8C77A]" />}
          accentColor="#C39B57"
        />

        <MetricCard
          title="Devis Signés & Validés"
          value={formatDzd(acceptedPipelineDzd)}
          subtitle={`${acceptedQuotes} cabinets transformés en clients`}
          trend={{ value: `${Math.round((acceptedQuotes / (totalQuotes || 1)) * 100)}% taux de closing`, isPositive: true }}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          accentColor="#10B981"
        />

        <MetricCard
          title="En Négociation / Envoyés"
          value={quotations.filter((q) => q.status === 'SENT').length}
          subtitle="Cabinets en phase d'examen ou d'approbation"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          iconBgColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          accentColor="#F59E0B"
        />

        <MetricCard
          title="Brouillons d'Offres"
          value={quotations.filter((q) => q.status === 'DRAFT').length}
          subtitle="Simulations en cours d'ajustement"
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          iconBgColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
          accentColor="#3B82F6"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0F1D] border border-white/10">
        <div>
          <h2 className="text-sm font-bold text-white font-serif-luxury flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#E8C77A]" />
            Simulateur & Propositions Commerciales B2B
          </h2>
          <p className="text-xs text-white/50">
            Chiffrage transparent pour les grands cabinets d'affaires et regroupements d'avocats
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsNewModalOpen(true)}
        >
          Créer un Devis Sur-Mesure
        </Button>
      </div>

      {/* Quotations Table */}
      <div className="rounded-2xl bg-[#0D0F1D] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#111425]/60 text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">N° Devis</th>
                <th className="py-3 px-4 font-semibold">Cabinet / Avocat</th>
                <th className="py-3 px-4 font-semibold">Barreau</th>
                <th className="py-3 px-4 font-semibold text-center">Postes PC</th>
                <th className="py-3 px-4 font-semibold text-center">Accès Mobile</th>
                <th className="py-3 px-4 font-semibold">Options Matériel / Cloud</th>
                <th className="py-3 px-4 font-semibold text-right">Montant Total</th>
                <th className="py-3 px-4 font-semibold">Validité</th>
                <th className="py-3 px-4 font-semibold text-center">Statut</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quotations.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => setSelectedQuote(q)}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono-code font-bold text-[#E8C77A]">
                    {q.quoteNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{q.clientName}</div>
                    <div className="text-[11px] text-white/50">{q.leadAttorney}</div>
                  </td>

                  <td className="py-3.5 px-4 text-white/80">Barreau de {q.barreau}</td>

                  <td className="py-3.5 px-4 text-center font-mono-code font-bold text-white">
                    {q.desktopsCount} PC
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono-code text-blue-300">
                    {q.mobilesCount} App
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {q.hasHardwareScannerAddon && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C39B57]/20 text-[#E8C77A] font-medium">
                          Scanner Epson
                        </span>
                      )}
                      {q.hasSovereignCloudAddon && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                          Cloud Souverain
                        </span>
                      )}
                      {!q.hasHardwareScannerAddon && !q.hasSovereignCloudAddon && (
                        <span className="text-[10px] text-white/40">Logiciel Standard</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono-code font-bold text-white">
                    {formatDzd(q.totalAmountDzd)}
                  </td>

                  <td className="py-3.5 px-4 text-white/60 font-mono-code text-[11px]">
                    Jusqu'au {q.validUntil}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {q.status === 'ACCEPTED' ? (
                      <Badge variant="approved">Accepté & Signé</Badge>
                    ) : q.status === 'SENT' ? (
                      <Badge variant="cyan">Envoyé au Cabinet</Badge>
                    ) : q.status === 'DRAFT' ? (
                      <Badge variant="default">Brouillon</Badge>
                    ) : (
                      <Badge variant="expired">Expiré</Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedQuote(q)
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C39B57]/20 text-white/60 hover:text-[#E8C77A] transition-colors"
                      title="Visualiser et imprimer l'offre commerciale"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Quotation Creator Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Simulateur & Éditeur de Proposition Commerciale B2B"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs text-white">
            {/* Cabinet Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-white/60 mb-1 font-medium">
                  Raison Sociale du Cabinet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cabinet Me Cherif & Associés"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white placeholder-white/30 focus:border-[#C39B57] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">Barreau d'Appartenance</label>
                <select
                  value={barreau}
                  onChange={(e) => setBarreau(e.target.value as Barreau)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none"
                >
                  <option value="Alger">Barreau d'Alger</option>
                  <option value="Oran">Barreau d'Oran</option>
                  <option value="Constantine">Barreau de Constantine</option>
                  <option value="Sétif">Barreau de Sétif</option>
                  <option value="Blida">Barreau de Blida</option>
                  <option value="Annaba">Barreau d'Annaba</option>
                  <option value="Tlemcen">Barreau de Tlemcen</option>
                </select>
              </div>
            </div>

            {/* Steppers: Desktops and Mobiles */}
            <div className="p-4 rounded-xl bg-[#111425] border border-white/10 space-y-4">
              <div className="text-xs font-bold text-[#E8C77A] uppercase tracking-wider">
                Configuration des Postes & Licences
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desktops count */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/70">Nombre de Postes PC de Bureau</span>
                    <span className="font-mono-code font-bold text-white text-sm">
                      {desktopsCount} postes
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={desktopsCount}
                    onChange={(e) => setDesktopsCount(Number(e.target.value))}
                    className="w-full accent-[#C39B57]"
                  />
                  <div className="text-[10px] text-white/40 mt-1">
                    Souscription logicielle calculée : {formatDzd(baseSoftwarePrice)}
                  </div>
                </div>

                {/* Mobiles count */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/70">Nombre d'Accès Mobiles Palais</span>
                    <span className="font-mono-code font-bold text-blue-300 text-sm">
                      {mobilesCount} téléphones
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={mobilesCount}
                    onChange={(e) => setMobilesCount(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-[10px] text-white/40 mt-1">
                    Synchronisation synchronisée via VPS Alger
                  </div>
                </div>
              </div>
            </div>

            {/* Add-ons Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3.5 rounded-xl bg-[#111425] border border-white/10 flex items-center justify-between cursor-pointer hover:border-[#C39B57]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasScannerAddon}
                    onChange={(e) => setHasScannerAddon(e.target.checked)}
                    className="accent-[#C39B57] w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold text-white">Pack Scanner Dédié Epson</div>
                    <div className="text-[10px] text-white/50">
                      Scanner DS-530 Duplex recto-verso haute vitesse
                    </div>
                  </div>
                </div>
                <div className="font-mono-code font-bold text-[#E8C77A] text-xs">+ 65 000 DZD</div>
              </label>

              <label className="p-3.5 rounded-xl bg-[#111425] border border-white/10 flex items-center justify-between cursor-pointer hover:border-[#C39B57]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasCloudAddon}
                    onChange={(e) => setHasCloudAddon(e.target.checked)}
                    className="accent-[#C39B57] w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold text-white">Hébergement Cloud Dédié</div>
                    <div className="text-[10px] text-white/50">
                      Sauvegarde isolée Ben Aknoun + GED 100 Go
                    </div>
                  </div>
                </div>
                <div className="font-mono-code font-bold text-emerald-400 text-xs">
                  + 40 000 DZD/an
                </div>
              </label>
            </div>

            {/* Remise Commerciale */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111425] border border-white/10">
              <span className="text-white/70">Remise Commerciale Accordée</span>
              <div className="flex items-center gap-2">
                {[0, 5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono-code font-semibold transition-all ${
                      discountPercent === pct
                        ? 'bg-[#C39B57] text-[#080911]'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#C39B57]/20 to-[#C39B57]/5 border border-[#C39B57]/40 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#E8C77A] font-semibold">
                  Total Proposition Commerciale Clé en Main
                </div>
                <div className="text-[10px] text-white/50">
                  Valable 30 jours • Facture pro-forma incluse
                </div>
              </div>
              <div className="text-xl font-bold font-mono-code text-white">
                {formatDzd(totalAmount)}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsNewModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
                Générer & Transmettre l'Offre
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Quote Viewer Modal */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`Proposition Commerciale ${selectedQuote.quoteNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-white text-xs">
            {/* Sheet */}
            <div className="p-6 rounded-2xl bg-[#080911] border border-white/10 space-y-6">
              <div className="flex items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <div className="text-base font-bold uppercase tracking-wider text-[#E8C77A] font-serif-luxury">
                    Stepping Stones SARL
                  </div>
                  <div className="text-white/60 text-[11px] mt-1 space-y-0.5">
                    <div>Solutions Numériques pour Professions Libérales & Cabinets d'Avocats</div>
                    <div>Bab Ezzouar, Alger — Tél: +213 (0) 550 12 34 56</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono-code font-bold text-[#E8C77A]">
                    {selectedQuote.quoteNumber}
                  </div>
                  <div className="text-[11px] text-white/50 mt-1">
                    Offre valable jusqu'au : {selectedQuote.validUntil}
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="p-4 rounded-xl bg-[#111425] border border-white/5 flex justify-between">
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-semibold">
                    Destinataire / Cabinet Confrère
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {selectedQuote.clientName}
                  </div>
                  <div className="text-white/60 text-xs">
                    À l'attention de {selectedQuote.leadAttorney} • Barreau de{' '}
                    {selectedQuote.barreau}
                  </div>
                </div>
              </div>

              {/* Composition details */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Détail de la Solution Numérique Retenue
                </div>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111425] text-white/50 text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Composante</th>
                        <th className="py-2.5 px-3 text-center">Quantité</th>
                        <th className="py-2.5 px-3 text-right">Prestation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="py-2.5 px-3 text-white font-medium">
                          Postes PC de Travail (Al-Mouhami Pro Desktop ERP)
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono-code">
                          {selectedQuote.desktopsCount} licences
                        </td>
                        <td className="py-2.5 px-3 text-right text-white/70">Inclus</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-white font-medium">
                          Accès Mobiles Palais & Audiences (React Native / iOS / Android)
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono-code">
                          {selectedQuote.mobilesCount} terminaux
                        </td>
                        <td className="py-2.5 px-3 text-right text-white/70">Inclus</td>
                      </tr>
                      {selectedQuote.hasHardwareScannerAddon && (
                        <tr>
                          <td className="py-2.5 px-3 text-white font-medium">
                            Pack Scanner de Production Epson DS-530 Recto-Verso
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono-code">1 unité</td>
                          <td className="py-2.5 px-3 text-right font-mono-code text-[#E8C77A]">
                            + 65 000 DZD
                          </td>
                        </tr>
                      )}
                      {selectedQuote.hasSovereignCloudAddon && (
                        <tr>
                          <td className="py-2.5 px-3 text-white font-medium">
                            Option Cloud Souverain Dédié (Datacenter Ben Aknoun)
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono-code">1 an</td>
                          <td className="py-2.5 px-3 text-right font-mono-code text-emerald-400">
                            + 40 000 DZD
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end pt-2">
                <div className="text-right">
                  <div className="text-xs text-white/50">Montant Global Investissement :</div>
                  <div className="text-xl font-bold font-mono-code text-[#E8C77A]">
                    {formatDzd(selectedQuote.totalAmountDzd)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedQuote.status !== 'ACCEPTED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      onUpdateQuoteStatus(selectedQuote.id, 'ACCEPTED')
                      setSelectedQuote((prev) => (prev ? { ...prev, status: 'ACCEPTED' } : null))
                    }}
                  >
                    Valider l'Acceptation du Client
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Printer className="w-3.5 h-3.5" />}
                  onClick={handlePrint}
                >
                  Imprimer Proposition
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
