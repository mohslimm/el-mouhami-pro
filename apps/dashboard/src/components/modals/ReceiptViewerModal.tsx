import React, { useState } from 'react'
import {
  FileText,
  CheckCircle2,
  XCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Building2,
  Calendar,
  CreditCard,
  Hash,
  Download,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { OfflinePayment } from '../../types'
import { formatDzd } from '../../services/cryptoLicense'

interface ReceiptViewerModalProps {
  isOpen: boolean
  payment: OfflinePayment | null
  onClose: () => void
  onApprove: (payment: OfflinePayment) => void
  onReject: (payment: OfflinePayment, reason: string) => void
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  payment,
  onClose,
  onApprove,
  onReject,
}) => {
  const [zoom, setZoom] = useState(1)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState(
    'Reçu illisible ou montant non concordant avec la formule choisie'
  )

  if (!payment) return null

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75))
  const handleResetZoom = () => setZoom(1)

  const handleApprove = () => {
    onApprove(payment)
    onClose()
  }

  const handleConfirmReject = () => {
    onReject(payment, rejectionReason)
    setIsRejecting(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bordereau de Paiement — ${payment.cabinetName}`}
      subtitle={`Preuve de transaction CCP / Virement bancaire (${payment.paymentMethod})`}
      maxWidth="4xl"
      headerIcon={<FileText className="w-5 h-5 text-[#E8C77A]" />}
    >
      <div className="space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#0D0F1D] border border-white/10">
          <div className="space-y-1">
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#C39B57]" /> Barreau
            </span>
            <p className="text-xs font-semibold text-white">Barreau de {payment.barreau}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[#C39B57]" /> Montant DZD
            </span>
            <p className="text-xs font-bold text-[#E8C77A] font-mono-code">
              {formatDzd(payment.amountDzd)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <Hash className="w-3 h-3 text-[#C39B57]" /> Réf. Transaction
            </span>
            <p className="text-xs font-medium text-white/90 font-mono-code truncate">
              {payment.transactionRef}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#C39B57]" /> Date Soumission
            </span>
            <p className="text-xs font-medium text-white/80">{payment.submittedAt}</p>
          </div>
        </div>

        {/* Slip Image Viewer Container */}
        <div className="relative rounded-xl border border-[#C39B57]/30 bg-[#060610] overflow-hidden flex flex-col items-center justify-center min-h-[380px] max-h-[480px]">
          {/* Controls Overlay */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-[#111425]/90 border border-white/10 backdrop-blur-md">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <a
              href={payment.slipImageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>

          {/* Watermark / Stamp overlay simulation */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none p-2.5 rounded-lg bg-[#111425]/80 border border-white/10 backdrop-blur-sm">
            <p className="text-[10px] text-white/60 font-mono-code">
              Document: {payment.slipFileName}
            </p>
            <p className="text-[10px] text-emerald-400 font-medium">
              Vérification sécurisée Stepping Stones Cockpit
            </p>
          </div>

          {/* Image */}
          <div className="overflow-auto w-full h-full flex items-center justify-center p-4">
            <img
              src={payment.slipImageUrl}
              alt="Bordereau de versement"
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
              className="max-h-[440px] rounded-lg shadow-2xl object-contain border border-white/10 cursor-grab active:cursor-grabbing"
            />
          </div>
        </div>

        {/* Rejection Prompt Form */}
        {isRejecting ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <h4 className="text-sm font-semibold text-rose-300">
              Motif du rejet de la preuve de paiement
            </h4>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0D0F1D] border border-rose-500/30 text-white text-xs focus:outline-none"
            >
              <option value="Reçu illisible ou scan flou">
                Reçu illisible ou scan flou (demander renvoi lisible)
              </option>
              <option value="Montant non concordant avec la formule choisie">
                Montant non concordant avec la formule choisie
              </option>
              <option value="Absence du cachet / tampon officiel de la banque ou poste">
                Absence du cachet / tampon officiel de la banque ou poste
              </option>
              <option value="Numéro de transaction ou référence introuvable">
                Numéro de transaction ou référence introuvable
              </option>
              <option value="Bordereau déjà utilisé ou suspect de doublon">
                Bordereau déjà utilisé ou suspect de doublon
              </option>
            </select>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRejecting(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
              >
                Confirmer le Rejet
              </Button>
            </div>
          </div>
        ) : (
          /* Main Action Buttons */
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <Button
              variant="danger"
              icon={<XCircle className="w-4 h-4" />}
              onClick={() => setIsRejecting(true)}
            >
              Rejeter la Preuve
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onClose}>
                Fermer
              </Button>
              <Button
                variant="success"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleApprove}
              >
                Valider & Activer la Licence
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
