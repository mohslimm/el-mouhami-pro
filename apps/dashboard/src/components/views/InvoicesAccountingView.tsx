import React, { useState } from 'react'
import {
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Search,
  ShieldCheck,
  Eye,
  Plus,
} from 'lucide-react'
import { MetricCard } from '../ui/MetricCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { AgencyInvoice } from '../../types'
import { formatDzd } from '../../services/cryptoLicense'

interface InvoicesAccountingViewProps {
  invoices: AgencyInvoice[]
  onMarkAsPaid?: (invoiceId: string) => void
  onAddInvoice?: (newInvoice: AgencyInvoice) => void
}

export const InvoicesAccountingView: React.FC<InvoicesAccountingViewProps> = ({
  invoices,
  onMarkAsPaid,
  onAddInvoice,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<AgencyInvoice | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Quick form for new invoice
  const [newCabinetName, setNewCabinetName] = useState('')
  const [newAttorney, setNewAttorney] = useState('')
  const [newNif, setNewNif] = useState('')
  const [newNis, setNewNis] = useState('')
  const [newAmountTtc, setNewAmountTtc] = useState('85000')
  const [newMethod, setNewMethod] = useState('Virement BNA')

  // Financial aggregates
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.amountTtc, 0)
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, inv) => acc + inv.amountTtc, 0)
  const totalTvaCollected = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, inv) => acc + inv.tvaAmount, 0)
  const pendingInvoices = invoices.filter((inv) => inv.status === 'PENDING')
  const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + inv.amountTtc, 0)

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter =
      filterStatus === 'ALL' ? true : inv.status === filterStatus
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.cabinetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.leadAttorney.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.nif.includes(searchQuery)
    return matchesFilter && matchesSearch
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCabinetName || !onAddInvoice) return
    const ttc = Number(newAmountTtc) || 85000
    const ht = ttc / 1.19
    const tva = ttc - ht

    const created: AgencyInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `FA-2026-0${Math.floor(100 + Math.random() * 900)}`,
      cabinetName: newCabinetName,
      leadAttorney: newAttorney || newCabinetName,
      nif: newNif || '099816000000000',
      nis: newNis || '0012345678',
      rc: '16/00-123456B16',
      barreau: 'Alger',
      plan: 'PRO',
      amountHt: Math.round(ht * 100) / 100,
      tvaAmount: Math.round(tva * 100) / 100,
      amountTtc: ttc,
      status: 'PENDING',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      paymentMethod: newMethod,
    }
    onAddInvoice(created)
    setIsCreateModalOpen(false)
    setNewCabinetName('')
    setNewAttorney('')
    setNewNif('')
    setNewNis('')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Facturé TTC"
          value={formatDzd(totalBilled)}
          subtitle="Exercice Fiscal Année 2026"
          trend={{ value: '+24.5%', isPositive: true, label: 'vs Q3' }}
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="#C39B57"
        />

        <MetricCard
          title="Recettes Encaissées"
          value={formatDzd(totalPaid)}
          subtitle={`${invoices.filter((i) => i.status === 'PAID').length} factures acquittées`}
          trend={{ value: '100% bancarisé', isPositive: true }}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          accentColor="#10B981"
        />

        <MetricCard
          title="TVA 19% Collectée"
          value={formatDzd(totalTvaCollected)}
          subtitle="Déclaration G50 Direction des Impôts"
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          iconBgColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
          accentColor="#3B82F6"
        />

        <MetricCard
          title="Créances en Attente"
          value={formatDzd(pendingAmount)}
          subtitle={`${pendingInvoices.length} factures d'abonnements à régulariser`}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          iconBgColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          accentColor="#F59E0B"
        />
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0F1D] border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'ALL'
                ? 'bg-[#C39B57] text-[#080911] font-bold shadow-[0_0_12px_rgba(195,155,87,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Toutes ({invoices.length})
          </button>
          <button
            onClick={() => setFilterStatus('PAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'PAID'
                ? 'bg-emerald-500 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Acquittées ({invoices.filter((i) => i.status === 'PAID').length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'PENDING'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            En Attente ({pendingInvoices.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher N° Facture, NIF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111425] border border-white/10 text-xs text-white placeholder-white/40 focus:border-[#C39B57] focus:outline-none"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Éditer Facture
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl bg-[#0D0F1D] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#111425]/60 text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">N° Facture</th>
                <th className="py-3 px-4 font-semibold">Cabinet / Avocat</th>
                <th className="py-3 px-4 font-semibold">Identifiants Fiscaux</th>
                <th className="py-3 px-4 font-semibold text-right">Montant HT</th>
                <th className="py-3 px-4 font-semibold text-right">TVA 19%</th>
                <th className="py-3 px-4 font-semibold text-right">Total TTC</th>
                <th className="py-3 px-4 font-semibold">Règlement</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  <td className="py-3.5 px-4 font-mono-code font-bold text-[#E8C77A]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{inv.cabinetName}</div>
                    <div className="text-[11px] text-white/50">
                      {inv.leadAttorney} • Barreau de {inv.barreau}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-white/60 font-mono-code text-[11px]">
                    <div>NIF: {inv.nif}</div>
                    <div className="text-white/40">NIS: {inv.nis}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-code text-white/80">
                    {formatDzd(inv.amountHt)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-code text-blue-400/90">
                    {formatDzd(inv.tvaAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-code font-bold text-white">
                    {formatDzd(inv.amountTtc)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-white/80 font-medium">{inv.paymentMethod}</div>
                    <div className="text-[10px] text-white/40">Échéance: {inv.dueDate}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.status === 'PAID' ? (
                      <Badge variant="approved">Acquittée</Badge>
                    ) : inv.status === 'PENDING' ? (
                      <Badge variant="pending">En attente</Badge>
                    ) : (
                      <Badge variant="rejected">Annulée</Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedInvoice(inv)
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C39B57]/20 text-white/60 hover:text-[#E8C77A] transition-colors"
                      title="Visualiser la facture pro-forma fiscale"
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

      {/* Invoice Viewer & Printable Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Facture Fiscale ${selectedInvoice.invoiceNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-white text-xs">
            {/* Printable Invoice Sheet */}
            <div className="p-6 rounded-2xl bg-[#080911] border border-white/10 space-y-6">
              {/* Top Agency Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <div className="text-base font-bold uppercase tracking-wider text-[#E8C77A] font-serif-luxury">
                    Stepping Stones SARL
                  </div>
                  <div className="text-white/60 text-[11px] mt-1 space-y-0.5">
                    <div>Éditeur Logiciel & Solutions Juridiques Souveraines</div>
                    <div>Cité 1200 Logements, Bab Ezzouar, Alger — Algérie</div>
                    <div className="font-mono-code text-white/40">
                      RC: 16/00-098712B16 • NIF: 001616098712345 • NIS: 00160987123
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono-code bg-[#C39B57]/20 text-[#E8C77A] border border-[#C39B57]/30">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-white/50 mt-2">
                    Date d'émission: {selectedInvoice.issueDate}
                  </div>
                  <div className="text-[11px] text-white/50">
                    Date d'échéance: {selectedInvoice.dueDate}
                  </div>
                </div>
              </div>

              {/* Client Law Firm Info */}
              <div className="p-4 rounded-xl bg-[#111425] border border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                    Client / Cabinet Juridique
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {selectedInvoice.cabinetName}
                  </div>
                  <div className="text-white/60 mt-0.5">
                    {selectedInvoice.leadAttorney} • Barreau de {selectedInvoice.barreau}
                  </div>
                </div>
                <div className="text-right font-mono-code text-[11px] text-white/60 space-y-0.5">
                  <div>NIF Client : {selectedInvoice.nif}</div>
                  <div>NIS Client : {selectedInvoice.nis}</div>
                  <div>RC : {selectedInvoice.rc}</div>
                </div>
              </div>

              {/* Invoice Breakdown Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111425] text-white/50 border-b border-white/10 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Désignation des Prestations</th>
                      <th className="py-2.5 px-3 text-center">Qté</th>
                      <th className="py-2.5 px-3 text-right">Prix Unitaire HT</th>
                      <th className="py-2.5 px-3 text-right">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">
                          Souscription Annuelle — Logiciel Al-Mouhami Pro
                        </div>
                        <div className="text-[10px] text-white/50">
                          Formule {selectedInvoice.plan} • Postes PC & Synchronisation Mobile
                          Souveraine
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono-code">1 an</td>
                      <td className="py-3 px-3 text-right font-mono-code">
                        {formatDzd(selectedInvoice.amountHt)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-code font-bold text-white">
                        {formatDzd(selectedInvoice.amountHt)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-right">
                  <div className="flex justify-between text-white/60">
                    <span>Total Hors Taxes (HT) :</span>
                    <span className="font-mono-code">{formatDzd(selectedInvoice.amountHt)}</span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>TVA Légale (19%) :</span>
                    <span className="font-mono-code">{formatDzd(selectedInvoice.tvaAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#E8C77A] pt-2 border-t border-white/10">
                    <span>Net à Payer (TTC) :</span>
                    <span className="font-mono-code font-bold">
                      {formatDzd(selectedInvoice.amountTtc)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Algerian Mention */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Facture conforme aux dispositions du Code des Taxes sur le Chiffre d'Affaires.
                </div>
                <div>Mode de règlement : {selectedInvoice.paymentMethod}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {selectedInvoice.status === 'PENDING' && onMarkAsPaid && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      onMarkAsPaid(selectedInvoice.id)
                      setSelectedInvoice(null)
                    }}
                  >
                    Marquer Comme Acquittée
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
                  Imprimer la Facture
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={handlePrint}
                >
                  Télécharger PDF
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Édition d'une Nouvelle Facture Client"
          maxWidth="md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-white/60 mb-1 font-medium">Nom du Cabinet</label>
              <input
                type="text"
                required
                placeholder="Ex: Cabinet Me Boudiaf Mustapha"
                value={newCabinetName}
                onChange={(e) => setNewCabinetName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white placeholder-white/30 focus:border-[#C39B57] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-medium">
                Avocat Titulaire / Fondateur
              </label>
              <input
                type="text"
                placeholder="Ex: Me Mustapha Boudiaf"
                value={newAttorney}
                onChange={(e) => setNewAttorney(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white placeholder-white/30 focus:border-[#C39B57] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/60 mb-1 font-medium">NIF Fiscal (15 chiffres)</label>
                <input
                  type="text"
                  placeholder="0998..."
                  value={newNif}
                  onChange={(e) => setNewNif(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white placeholder-white/30 focus:border-[#C39B57] focus:outline-none font-mono-code"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1 font-medium">Numéro NIS</label>
                <input
                  type="text"
                  placeholder="0012..."
                  value={newNis}
                  onChange={(e) => setNewNis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white placeholder-white/30 focus:border-[#C39B57] focus:outline-none font-mono-code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/60 mb-1 font-medium">Montant TTC (DZD)</label>
                <select
                  value={newAmountTtc}
                  onChange={(e) => setNewAmountTtc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none font-mono-code"
                >
                  <option value="35000">35 000 DZD (Plan SOLO)</option>
                  <option value="85000">85 000 DZD (Plan PRO)</option>
                  <option value="180000">180 000 DZD (Plan GRAND)</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 mb-1 font-medium">Mode de Paiement Prévu</label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111425] border border-white/10 text-white focus:border-[#C39B57] focus:outline-none"
                >
                  <option value="Virement BNA">Virement Bancaire BNA</option>
                  <option value="Virement CPA">Virement Bancaire CPA</option>
                  <option value="Virement BEA">Virement Bancaire BEA</option>
                  <option value="Versement CCP">Versement Postal CCP</option>
                  <option value="Chèque Baré">Chèque Baré Cabinet</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Générer la Facture
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
