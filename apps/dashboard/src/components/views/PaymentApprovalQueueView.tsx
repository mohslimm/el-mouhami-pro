import React, { useState } from 'react'
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Eye,
  Phone,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { OfflinePayment, PaymentStatus } from '../../types'
import { formatDzd } from '../../services/cryptoLicense'

interface PaymentApprovalQueueViewProps {
  payments: OfflinePayment[]
  onOpenReceiptViewer: (payment: OfflinePayment) => void
  onApprovePayment: (payment: OfflinePayment) => void
  onRejectPayment: (payment: OfflinePayment, reason: string) => void
}

export const PaymentApprovalQueueView: React.FC<PaymentApprovalQueueViewProps> = ({
  payments,
  onOpenReceiptViewer,
  onApprovePayment,
  onRejectPayment,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentStatus>('PENDING')

  const pendingPayments = payments.filter((p) => p.status === 'PENDING')
  const approvedPayments = payments.filter((p) => p.status === 'APPROVED')
  const rejectedPayments = payments.filter((p) => p.status === 'REJECTED')

  const currentList =
    activeTab === 'PENDING'
      ? pendingPayments
      : activeTab === 'APPROVED'
      ? approvedPayments
      : rejectedPayments

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D0F1D] border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white font-serif-luxury flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E8C77A]" />
            File d'Attente des Règlements CCP & Virements Bancaires
          </h2>
          <p className="text-xs text-white/50">
            Contrôle des bordereaux de versement transmis par les avocats avant activation des licences
          </p>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#111425] border border-white/10">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'PENDING'
                ? 'bg-[#C39B57]/20 text-[#E8C77A] border border-[#C39B57]/40 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            En Attente ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'APPROVED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Validés ({approvedPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'REJECTED'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Rejetés ({rejectedPayments.length})
          </button>
        </div>
      </div>

      {/* Grid of Pending or Historical Payments */}
      {currentList.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400/60 mx-auto" />
          <h3 className="text-base font-semibold text-white">
            Aucun versement dans cette catégorie
          </h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Tous les bordereaux de paiement téléversés par les cabinets ont été traités.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {currentList.map((payment) => (
            <div
              key={payment.id}
              className="glass-card p-5 space-y-4 relative overflow-hidden"
            >
              {/* Top Details */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white font-serif-luxury">
                      {payment.cabinetName}
                    </span>
                    <Badge status={payment.plan}>{payment.plan}</Badge>
                  </div>
                  <div className="text-xs text-white/60 flex items-center gap-2">
                    <span className="text-[#E8C77A] font-medium">
                      Barreau de {payment.barreau}
                    </span>
                    <span>•</span>
                    <span>{payment.leadAttorney}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-[#E8C77A] font-mono-code">
                    {formatDzd(payment.amountDzd)}
                  </div>
                  <div className="text-[10px] text-white/40">
                    Mode : {payment.paymentMethod.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Transaction details card */}
              <div className="p-3 rounded-xl bg-[#0D0F1D] border border-white/10 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-white/40 block">Réf. Bordereau :</span>
                  <span className="font-mono-code text-white/90 truncate block">
                    {payment.transactionRef}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block">Date Dépôt :</span>
                  <span className="text-white/80 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#C39B57]" /> {payment.submittedAt}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block">Contact :</span>
                  <span className="text-white/80 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#C39B57]" /> {payment.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block">Email :</span>
                  <span className="text-white/80 truncate block">
                    {payment.email}
                  </span>
                </div>
              </div>

              {/* Slip thumbnail preview */}
              <div
                onClick={() => onOpenReceiptViewer(payment)}
                className="relative rounded-xl border border-white/10 bg-[#060610] h-36 overflow-hidden group cursor-pointer"
              >
                <img
                  src={payment.slipImageUrl}
                  alt="Aperçu bordereau"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-70 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080911]/90 via-transparent to-transparent flex items-end justify-between p-3">
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <FileText className="w-4 h-4 text-[#C39B57]" />
                    <span className="truncate max-w-[200px]">{payment.slipFileName}</span>
                  </div>
                  <span className="text-xs text-[#E8C77A] font-medium flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3.5 h-3.5" /> Inspecter le reçu
                  </span>
                </div>
              </div>

              {/* Rejection reason if rejected */}
              {payment.status === 'REJECTED' && payment.rejectionReason && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  <span className="font-semibold block mb-0.5">Motif du rejet :</span>
                  {payment.rejectionReason}
                </div>
              )}

              {/* Actions for Pending */}
              {payment.status === 'PENDING' && (
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={() =>
                      onRejectPayment(
                        payment,
                        'Bordereau rejeté : Montant ou tampon non conforme.'
                      )
                    }
                  >
                    Rejeter
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => onOpenReceiptViewer(payment)}
                    >
                      Aperçu Plein Écran
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => onApprovePayment(payment)}
                    >
                      Valider & Activer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
