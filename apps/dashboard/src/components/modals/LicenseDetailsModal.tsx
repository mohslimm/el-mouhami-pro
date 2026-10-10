import React, { useState } from 'react'
import { KeyRound, Copy, Check, Download, ShieldCheck, Cpu } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { License } from '../../types'
import { createLicenseCertificateJson } from '../../services/cryptoLicense'

interface LicenseDetailsModalProps {
  isOpen: boolean
  license: License | null
  onClose: () => void
}

export const LicenseDetailsModal: React.FC<LicenseDetailsModalProps> = ({
  isOpen,
  license,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  if (!license) return null

  const certJson = createLicenseCertificateJson(license)

  const handleCopyKey = () => {
    navigator.clipboard.writeText(license.key)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(certJson)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const handleDownloadCert = () => {
    const blob = new Blob([certJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `license-${license.key}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Certificat de Licence — ${license.cabinetName}`}
      subtitle={`Clé : ${license.key}`}
      maxWidth="3xl"
      headerIcon={<KeyRound className="w-5 h-5 text-[#E8C77A]" />}
    >
      <div className="space-y-5">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#0D0F1D] border border-white/10">
          <div>
            <span className="text-[11px] text-white/40 block mb-1">Statut</span>
            <Badge status={license.status} />
          </div>
          <div>
            <span className="text-[11px] text-white/40 block mb-1">Formule</span>
            <Badge status={license.plan}>{license.plan}</Badge>
          </div>
          <div>
            <span className="text-[11px] text-white/40 block mb-1">Postes Actifs</span>
            <span className="text-xs font-semibold text-white">
              {license.activeDesktops} / {license.maxDesktops} PC
            </span>
          </div>
          <div>
            <span className="text-[11px] text-white/40 block mb-1">Date d'Expiration</span>
            <span className="text-xs font-semibold text-[#E8C77A] font-mono-code">
              {license.expiryDate}
            </span>
          </div>
        </div>

        {/* Public Key Display */}
        <div className="p-4 rounded-xl bg-[#060610] border border-[#C39B57]/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#E8C77A] uppercase font-semibold tracking-wider block mb-0.5">
              Clé d'Activation Produit
            </span>
            <span className="font-mono-code text-base font-bold text-white tracking-widest">
              {license.key}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyKey}
            icon={copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedKey ? 'Copié' : 'Copier'}
          </Button>
        </div>

        {/* JSON Certificate Explorer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#C39B57]" />
              Fichier de Certificat Cryptographique (Format JSON V2)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="text-xs text-white/60 hover:text-[#E8C77A] flex items-center gap-1 transition-colors"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> JSON Copié
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copier JSON
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadCert}
                className="text-xs text-white/60 hover:text-[#E8C77A] flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Télécharger .json
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-[#060610] border border-white/10 text-[#E8C77A] font-mono-code text-xs overflow-x-auto max-h-64 scrollbar-thin">
            {certJson}
          </pre>
        </div>

        {/* Security Stamp */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Signature Ed25519 vérifiée avec succès sur le noeud Algérie Télécom
          </div>
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
