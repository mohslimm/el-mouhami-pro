import React, { useState, useEffect } from 'react'
import { KeyRound, ShieldCheck, Copy, Check, Sparkles } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import {
  PlanTier,
  Barreau,
  ValidityOption,
  PLAN_CONFIGS,
  License,
} from '../../types'
import {
  generateEd25519LicenseKey,
  calculateExpiryDate,
} from '../../services/cryptoLicense'

interface IssueLicenseModalProps {
  isOpen: boolean
  onClose: () => void
  onIssueLicense: (newLicense: License) => void
}

const BARREAUX: Barreau[] = [
  'Alger',
  'Oran',
  'Constantine',
  'Sétif',
  'Blida',
  'Annaba',
  'Tlemcen',
  'Béjaïa',
  'Batna',
  'Chlef',
  'Tizi Ouzou',
  'Autre',
]

export const IssueLicenseModal: React.FC<IssueLicenseModalProps> = ({
  isOpen,
  onClose,
  onIssueLicense,
}) => {
  const [cabinetName, setCabinetName] = useState('Cabinet Me ')
  const [leadAttorney, setLeadAttorney] = useState('')
  const [barreau, setBarreau] = useState<Barreau>('Alger')
  const [wilaya, setWilaya] = useState('Alger')
  const [plan, setPlan] = useState<PlanTier>('PRO')
  const [validity, setValidity] = useState<ValidityOption>('1_YEAR')
  const [maxDesktops, setMaxDesktops] = useState(3)
  const [maxMobiles, setMaxMobiles] = useState(3)
  const [notes, setNotes] = useState('')
  const [previewKey, setPreviewKey] = useState('')
  const [previewSig, setPreviewSig] = useState('')
  const [copied, setCopied] = useState(false)

  // Re-generate preview key whenever cabinet name changes
  useEffect(() => {
    const { key, signature } = generateEd25519LicenseKey(cabinetName)
    setPreviewKey(key)
    setPreviewSig(signature)
  }, [cabinetName])

  // Update seat limits according to plan defaults
  const handlePlanChange = (newPlan: PlanTier) => {
    setPlan(newPlan)
    setMaxDesktops(PLAN_CONFIGS[newPlan].maxDesktops)
    setMaxMobiles(PLAN_CONFIGS[newPlan].maxMobiles)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(previewKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const issueDate = new Date().toISOString().split('T')[0]
    const expiryDate = calculateExpiryDate(validity)

    const newLicense: License = {
      id: `lic-${Date.now()}`,
      key: previewKey,
      cabinetName: cabinetName.trim(),
      leadAttorney: leadAttorney.trim() || cabinetName.trim(),
      barreau,
      wilaya: wilaya.trim() || barreau,
      plan,
      validityType: validity,
      issueDate,
      expiryDate,
      maxDesktops,
      maxMobiles,
      activeDesktops: 0,
      activeMobiles: 0,
      status: validity === 'TRIAL_14_DAYS' ? 'TRIAL' : 'ACTIVE',
      ed25519Signature: previewSig,
      notes: notes.trim() || 'Émise via Stepping Stones Cockpit',
      lastVerifiedAt: 'En attente de 1ère activation',
    }

    onIssueLicense(newLicense)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Générateur de Licence Ed25519 — Al-Mouhami Pro"
      subtitle="Émission d'un certificat cryptographique de souveraineté pour cabinet d'avocat"
      maxWidth="2xl"
      headerIcon={<KeyRound className="w-5 h-5 text-[#E8C77A]" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Live Key Preview Banner */}
        <div className="p-4 rounded-xl bg-[#0D0F1D] border border-[#C39B57]/40 shadow-[0_0_20px_rgba(195,155,87,0.1)] relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#E8C77A] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Clé Cryptographique Ed25519
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-white/60 hover:text-[#E8C77A] flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copié
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copier
                </>
              )}
            </button>
          </div>
          <div className="font-mono-code text-sm sm:text-base font-bold text-white tracking-widest break-all">
            {previewKey}
          </div>
          <div className="mt-2 text-[10px] text-white/40 font-mono-code truncate">
            Signature Sig: {previewSig.slice(0, 48)}...
          </div>
        </div>

        {/* Firm Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Nom du Cabinet *
            </label>
            <input
              type="text"
              required
              value={cabinetName}
              onChange={(e) => setCabinetName(e.target.value)}
              placeholder="ex: Cabinet Me Slimani Noureddine"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-sm focus:border-[#C39B57] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Avocat Titulaire *
            </label>
            <input
              type="text"
              required
              value={leadAttorney}
              onChange={(e) => setLeadAttorney(e.target.value)}
              placeholder="ex: Me Noureddine Slimani"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-sm focus:border-[#C39B57] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Barreau Régional *
            </label>
            <select
              value={barreau}
              onChange={(e) => {
                setBarreau(e.target.value as Barreau)
                setWilaya(e.target.value)
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-sm focus:border-[#C39B57] focus:outline-none transition-colors"
            >
              {BARREAUX.map((b) => (
                <option key={b} value={b} className="bg-[#111425] text-white">
                  Barreau de {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Wilaya d'Exercice
            </label>
            <input
              type="text"
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              placeholder="ex: Alger, Tipaza, Oran..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-sm focus:border-[#C39B57] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Plan Selection Cards */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-2">
            Formule de Licence & Tarification
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['SOLO', 'PRO', 'GRAND'] as PlanTier[]).map((p) => {
              const cfg = PLAN_CONFIGS[p]
              const isSelected = plan === p
              return (
                <div
                  key={p}
                  onClick={() => handlePlanChange(p)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#C39B57]/15 border-[#C39B57] shadow-[0_0_15px_rgba(195,155,87,0.2)]'
                      : 'bg-[#0D0F1D] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{cfg.name}</span>
                    <span className="text-xs font-semibold text-[#E8C77A]">
                      {cfg.priceFormatted}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-tight">
                    {cfg.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Validity & Seats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Validité de la Licence
            </label>
            <select
              value={validity}
              onChange={(e) => setValidity(e.target.value as ValidityOption)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-sm focus:border-[#C39B57] focus:outline-none transition-colors"
            >
              <option value="1_YEAR" className="bg-[#111425]">1 An (Annuel standard)</option>
              <option value="2_YEARS" className="bg-[#111425]">2 Ans (Pack Fidélité)</option>
              <option value="TRIAL_14_DAYS" className="bg-[#111425]">Essai Gratuit 14 Jours</option>
              <option value="CUSTOM" className="bg-[#111425]">Validité Personnalisée</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Max Postes PC (Desktops)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={maxDesktops}
              onChange={(e) => setMaxDesktops(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-sm focus:border-[#C39B57] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Max Accès Mobiles
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={maxMobiles}
              onChange={(e) => setMaxMobiles(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-sm focus:border-[#C39B57] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1">
            Notes Internes / Conditions Particulières
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ex: Versement CCP reçu, option Epson DS-530 activée"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F1D] border border-white/10 text-white text-sm focus:border-[#C39B57] focus:outline-none transition-colors"
          />
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-white/40 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C39B57]" />
            Algorithme Ed25519 certifié conforme souveraineté algérienne
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<KeyRound className="w-4 h-4" />}
            >
              Émettre la Licence
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
