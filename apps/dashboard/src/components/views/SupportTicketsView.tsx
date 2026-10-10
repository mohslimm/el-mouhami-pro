import React, { useState } from 'react'
import {
  LifeBuoy,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Phone,
  Monitor,
  Printer,
  Scale,
  Smartphone,
  CreditCard,
} from 'lucide-react'
import { MetricCard } from '../ui/MetricCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SupportTicket } from '../../types'

interface SupportTicketsViewProps {
  tickets: SupportTicket[]
  onReplyTicket: (ticketId: string, replyText: string) => void
  onUpdateStatus: (ticketId: string, status: SupportTicket['status']) => void
}

export const SupportTicketsView: React.FC<SupportTicketsViewProps> = ({
  tickets,
  onReplyTicket,
  onUpdateStatus,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>(
    'ALL'
  )
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyText, setReplyText] = useState('')

  // Aggregates
  const openCount = tickets.filter((t) => t.status === 'OPEN').length
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length
  const anydeskCount = tickets.filter((t) => !!t.anydeskId && t.status !== 'RESOLVED').length

  const filteredTickets = tickets.filter((t) => {
    if (activeFilter === 'ALL') return true
    return t.status === activeFilter
  })

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyText.trim()) return

    onReplyTicket(selectedTicket.id, replyText.trim())
    // update local modal view
    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              {
                sender: 'AGENCY',
                text: replyText.trim(),
                time: new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ],
            status: 'IN_PROGRESS',
          }
        : null
    )
    setReplyText('')
  }

  const getCategoryIcon = (category: SupportTicket['category']) => {
    switch (category) {
      case 'SCANNER_EPSON':
        return <Printer className="w-4 h-4 text-amber-400" />
      case 'CPCA_DELAYS':
        return <Scale className="w-4 h-4 text-[#E8C77A]" />
      case 'BILLING':
        return <CreditCard className="w-4 h-4 text-emerald-400" />
      case 'MOBILE_APP':
        return <Smartphone className="w-4 h-4 text-blue-400" />
      default:
        return <LifeBuoy className="w-4 h-4 text-purple-400" />
    }
  }

  const getCategoryLabel = (category: SupportTicket['category']) => {
    switch (category) {
      case 'SCANNER_EPSON':
        return 'Scanner & Numérisation'
      case 'CPCA_DELAYS':
        return 'Délais & Procédure CPCA'
      case 'BILLING':
        return 'Facturation & Licence'
      case 'MOBILE_APP':
        return 'Application Mobile Palais'
      default:
        return 'Général'
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tickets Non Traités"
          value={openCount}
          subtitle="En attente de prise en charge"
          trend={{ value: 'Urgent', isPositive: false }}
          icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
          iconBgColor="bg-rose-500/10 text-rose-400 border-rose-500/20"
          accentColor="#EF4444"
        />

        <MetricCard
          title="En Cours d'Assistance"
          value={inProgressCount}
          subtitle="Échanges ou télémaintenance active"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          iconBgColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          accentColor="#F59E0B"
        />

        <MetricCard
          title="Sessions AnyDesk Prêtes"
          value={anydeskCount}
          subtitle="Codes d'accès distant fournis par l'avocat"
          icon={<Monitor className="w-5 h-5 text-blue-400" />}
          iconBgColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
          accentColor="#3B82F6"
        />

        <MetricCard
          title="Incidents Résolus"
          value={resolvedCount}
          subtitle="Taux de satisfaction: 99.2%"
          trend={{ value: '100% clos', isPositive: true }}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          accentColor="#10B981"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0F1D] border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === 'ALL'
                ? 'bg-[#C39B57] text-[#080911] font-bold shadow-[0_0_12px_rgba(195,155,87,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Tous les Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveFilter('OPEN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === 'OPEN'
                ? 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Nouveaux / Ouverts ({openCount})
          </button>
          <button
            onClick={() => setActiveFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === 'IN_PROGRESS'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            En Cours ({inProgressCount})
          </button>
          <button
            onClick={() => setActiveFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === 'RESOLVED'
                ? 'bg-emerald-500 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-white/60 hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            Résolus ({resolvedCount})
          </button>
        </div>

        <div className="text-xs text-white/50 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-[#C39B57]" />
          Téléassistance prioritaire pour les barreaux d'Alger, Oran et Constantine
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket)}
            className="p-5 rounded-2xl bg-[#0D0F1D] border border-white/10 hover:border-[#C39B57]/40 transition-all cursor-pointer group space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#111425] border border-white/10">
                  {getCategoryIcon(ticket.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold text-[#E8C77A] text-xs">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-white font-semibold text-xs">{ticket.cabinetName}</span>
                    <span className="text-white/40 text-[11px]">• {ticket.attorneyName}</span>
                  </div>
                  <div className="text-[11px] text-white/50 flex items-center gap-2 mt-0.5">
                    <span>Catégorie : {getCategoryLabel(ticket.category)}</span>
                    <span>• Reçu : {ticket.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {ticket.priority === 'HIGH' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    Priorité Haute
                  </span>
                ) : ticket.priority === 'MEDIUM' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    Priorité Moyenne
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/10">
                    Basse
                  </span>
                )}

                {ticket.status === 'OPEN' ? (
                  <Badge variant="suspended">Ouvert</Badge>
                ) : ticket.status === 'IN_PROGRESS' ? (
                  <Badge variant="pending">En Cours</Badge>
                ) : (
                  <Badge variant="approved">Résolu</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-white group-hover:text-[#E8C77A] transition-colors">
                  {ticket.subject}
                </div>
                <div className="text-white/60 line-clamp-1 text-[11px]">
                  {ticket.messages[0]?.text}
                </div>
              </div>

              {/* AnyDesk Code Pill */}
              {ticket.anydeskId && (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono-code font-bold text-xs flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" />
                    AnyDesk: {ticket.anydeskId}
                  </div>
                  <a
                    href={`tel:${ticket.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-300 transition-colors"
                    title={`Appeler Maître au ${ticket.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Conversation Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber} • ${selectedTicket.cabinetName}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-white">
            {/* Header Details */}
            <div className="p-4 rounded-xl bg-[#111425] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-white">{selectedTicket.subject}</div>
                <div className="text-white/50 text-[11px] mt-0.5">
                  {selectedTicket.attorneyName} • Téléphone : {selectedTicket.phone}
                </div>
              </div>

              {selectedTicket.anydeskId && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono-code font-bold text-xs flex items-center gap-1.5">
                    <Monitor className="w-4 h-4" />
                    AnyDesk : {selectedTicket.anydeskId}
                  </span>
                </div>
              )}
            </div>

            {/* Conversation Thread */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedTicket.messages.map((msg, index) => {
                const isAgency = msg.sender === 'AGENCY'
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isAgency ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-white/40 mb-1 flex items-center gap-1 font-mono-code">
                      {isAgency ? 'Stepping Stones Support HQ' : selectedTicket.attorneyName} •{' '}
                      {msg.time}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl max-w-lg leading-relaxed ${
                        isAgency
                          ? 'bg-gradient-to-r from-[#C39B57]/20 to-[#C39B57]/10 border border-[#C39B57]/40 text-white rounded-br-none'
                          : 'bg-[#111425] border border-white/10 text-white/90 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Response Box */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-white/10">
              <label className="block text-white/60 font-medium">Répondre au Cabinet d'Avocat</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tapez votre réponse ou instruction technique..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#111425] border border-white/10 text-white placeholder-white/40 focus:border-[#C39B57] focus:outline-none"
                />
                <Button variant="primary" size="md" type="submit" icon={<Send className="w-4 h-4" />}>
                  Envoyer
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-white/40">
                  Statut actuel :{' '}
                  <span className="font-semibold text-white">{selectedTicket.status}</span>
                </div>

                <div className="flex gap-2">
                  {selectedTicket.status !== 'RESOLVED' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      onClick={() => {
                        onUpdateStatus(selectedTicket.id, 'RESOLVED')
                        setSelectedTicket((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null))
                      }}
                    >
                      Clôturer comme Résolu
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onUpdateStatus(selectedTicket.id, 'IN_PROGRESS')
                        setSelectedTicket((prev) =>
                          prev ? { ...prev, status: 'IN_PROGRESS' } : null
                        )
                      }}
                    >
                      Rouvrir le Ticket
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}
