import React, { useState } from 'react'
import { Laptop, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { HardwareSeat, LawFirmClient } from '../../types'

interface ResetFingerprintModalProps {
  isOpen: boolean
  client: LawFirmClient | null
  seat: HardwareSeat | null
  onClose: () => void
  onConfirmReset: (client: LawFirmClient, seat: HardwareSeat, reason: string) => void
}

export const ResetFingerprintModal: React.FC<ResetFingerprintModalProps> = ({
  isOpen,
  client,
  seat,
  onClose,
  onConfirmReset,
}) => {
  const [reason, setReason] = useState('Achat d\'un nouvel ordinateur portable par l\'avocat')

  if (!client || !seat) return null

  const handleConfirm = () => {
    onConfirmReset(client, seat, reason)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Réinitialisation d'Empreinte Matérielle (TPM2)"
      subtitle={`Libération de siège machine pour : ${client.cabinetName}`}
      maxWidth="lg"
      headerIcon={<Laptop className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h5 className="font-semibold text-amber-300">
              Action Administrative Sensible
            </h5>
            <p className="text-white/70 leading-relaxed">
              La révocation de l'empreinte matérielle désactivera immédiatement la session
              sur l'ancien poste physique. Le siège sera libéré pour permettre l'activation
              sur le nouvel appareil.
            </p>
          </div>
        </div>

        {/* Device Information Card */}
        <div className="p-4 rounded-xl bg-[#0D0F1D] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Poste / Machine :</span>
            <span className="text-xs font-semibold text-white">{seat.deviceName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Système d'Exploitation :</span>
            <span className="text-xs text-white/80">{seat.os}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Hash Empreinte :</span>
            <span className="text-xs font-mono-code text-[#E8C77A] bg-[#C39B57]/10 px-2 py-0.5 rounded border border-[#C39B57]/20">
              {seat.fingerprintHash}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Dernière Synchronisation :</span>
            <span className="text-xs text-white/70">{seat.lastSyncAt}</span>
          </div>
        </div>

        {/* Reason Selector */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1">
            Motif de la réinitialisation *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-xs focus:border-[#C39B57] focus:outline-none"
          >
            <option value="Achat d'un nouvel ordinateur portable par l'avocat">
              Achat d'un nouvel ordinateur portable par l'avocat
            </option>
            <option value="Réinstallation complète de Windows / Formatage">
              Réinstallation complète de Windows / Formatage
            </option>
            <option value="Changement de matériel (Carte mère / Processeur / TPM)">
              Changement de matériel (Carte mère / Processeur / TPM)
            </option>
            <option value="Panne matérielle ou vol de l'ancien ordinateur">
              Panne matérielle ou vol de l'ancien ordinateur
            </option>
            <option value="Dépannage d'urgence par le support Stepping Stones">
              Dépannage d'urgence par le support Stepping Stones
            </option>
          </select>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Traçabilité conservée dans les logs de sécurité
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleConfirm}
            >
              Réinitialiser le Siège
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
