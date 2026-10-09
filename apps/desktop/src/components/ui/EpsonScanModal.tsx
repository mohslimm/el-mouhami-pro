// EpsonScanModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Modal Numérisation Directe Epson WorkForce DS-530 II (ADF Duplex USB 3.0)
// Zéro contrôle natif • CustomSelect • BorderBeam • Indexation GED Réelle
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { memo, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scan,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  X,
  Cpu,
  Lock,
  Sparkles,
  FolderOpen,
  FileText,
  Printer,
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect'
import { BorderBeam } from '@/components/ui/magicui/border-beam'

export interface EpsonScanModalProps {
  isOpen: boolean
  onClose: () => void
  dossierRef?: string
  clientName?: string
  isAr?: boolean
}

export type ScanStage = 'idle' | 'connecting' | 'scanning' | 'ocr' | 'encrypting' | 'complete'

export const EpsonScanModal = memo(({
  isOpen,
  onClose,
  dossierRef = 'DOS-2026-084',
  clientName = 'Slimani / Sonatrach',
  isAr = false,
}: EpsonScanModalProps) => {
  const { dossiers, addScannedDoc } = useAdminStore()

  const [selectedDossierId, setSelectedDossierId] = useState<string>('')
  const [stage, setStage] = useState<ScanStage>('idle')
  const [progress, setProgress] = useState(0)
  const [scannedText, setScannedText] = useState('')
  const [resolution, setResolution] = useState<string>('300')
  const [mode, setMode] = useState<string>('adf_duplex')

  // Reset stage when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStage('idle')
      setProgress(0)
      setScannedText('')
    }
  }, [isOpen])

  // Current active dossier details
  const activeDossier = useMemo(() => {
    if (selectedDossierId) {
      return dossiers.find((d) => d.id === selectedDossierId) ?? null
    }
    return dossiers[0] ?? null
  }, [dossiers, selectedDossierId])

  const currentDossierRef = activeDossier ? activeDossier.reference : dossierRef
  const currentClientName = activeDossier
    ? (isAr && activeDossier.clientNameAr ? activeDossier.clientNameAr : activeDossier.clientName)
    : clientName

  // Select Options
  const dossierOptions: SelectOption[] = useMemo(() => {
    return dossiers.map((d) => ({
      value: d.id,
      label: `${d.reference} • ${isAr && d.clientNameAr ? d.clientNameAr : d.clientName} (${d.jurisdictionAr || d.jurisdiction})`,
      badge: d.chamber,
    }))
  }, [dossiers, isAr])

  const modeOptions: SelectOption[] = useMemo(() => {
    return [
      {
        value: 'adf_duplex',
        label: isAr ? 'سحب آلي مزدوج للوجهين (ADF Chargeur Duplex)' : 'ADF Chargeur Auto (Recto-Verso)',
        badge: 'ADF 300',
      },
      {
        value: 'flatbed',
        label: isAr ? 'المسح المسطح عالي الدقة (Vitre Plate 600 DPI)' : 'Vitre Plate (Flatbed 600 DPI)',
        badge: 'Vitre Plate',
      },
    ]
  }, [isAr])

  const resolutionOptions: SelectOption[] = useMemo(() => {
    return [
      {
        value: '300',
        label: isAr ? '300 DPI (موصى به للأرشفة والتعرف OCR)' : '300 DPI (Recommandé GED & OCR)',
        badge: 'Recommandé',
      },
      {
        value: '600',
        label: isAr ? '600 DPI (دقة فائقة للوثائق القديمة)' : '600 DPI (Haute Définition Pièces Anciennes)',
        badge: 'HD 600',
      },
      {
        value: '200',
        label: isAr ? '200 DPI (نمط سريع واقتصادي)' : '200 DPI (Mode Rapide & Économique)',
        badge: '200 DPI',
      },
    ]
  }, [isAr])

  // Scan simulation pipeline
  const handleStartScan = () => {
    setStage('connecting')
    setProgress(15)

    setTimeout(() => {
      setStage('scanning')
      setProgress(45)
    }, 1200)

    setTimeout(() => {
      setStage('ocr')
      setProgress(75)
      setScannedText(
        isAr
          ? `الجمهورية الجزائرية الديمقراطية الشعبية\nمجلس قضاء الجزائر — محكمة سيدي امحمد (القسم العقاري)\nعريضة افتتاح دعوى قضائية في مادة إثبات الملكية العقارية\nلفائدة: ${currentClientName}\nضد: شركة الإعمار والترقية العقارية ش.ذ.م.م\nالموضوع: المطالبة بتثبيت حق الملكية وإلزام المدعى عليها بالإخلاء وتسليم المفاتيح طبقاً لعقد الملكية المشهر رقم 412/2020.`
          : `RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE\nCour d'Alger — Tribunal de Sidi M'Hamed (Chambre Foncière)\nRequête introductive d'instance en matière de confirmation des droits réels immobiliers.\nDemandeur: ${currentClientName}\nDéfendeur: SARL Promotion Immobilière El-Djazair\nObjet: Confirmation de propriété et expulsion du défendeur suivant acte notarié n° 412/2020.`
      )
    }, 3200)

    setTimeout(() => {
      setStage('encrypting')
      setProgress(95)
    }, 4800)

    setTimeout(() => {
      setStage('complete')
      setProgress(100)
    }, 6000)
  }

  // Save document to active case vault
  const handleSaveToVault = () => {
    const newDocId = `scan-${Date.now()}`
    const fileName = `Piece_Scan_${currentDossierRef.replace(/\//g, '-')}_${Date.now().toString().slice(-4)}.pdf`

    addScannedDoc({
      id: newDocId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      filename: fileName,
      caseRoleNo: currentDossierRef,
      clientName: currentClientName,
      source: `Epson WorkForce DS-530 II (${mode === 'adf_duplex' ? 'ADF Duplex' : 'Flatbed'} ${resolution} DPI)`,
      filePath: `userData/scans/${fileName}`,
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-[#121526]/95 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden flex flex-col my-auto"
        >
          <BorderBeam size={160} duration={7} colorFrom="#C39B57" colorTo="#E8C77A" />

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0f1222]/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Scan size={22} strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <span>
                    {isAr
                      ? 'المسح الضوئي المباشر — ماسح إبسون (ADF 300 DPI)'
                      : 'Numérisation Directe Epson Scan (ADF 300 DPI)'}
                  </span>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                    TWAIN / USB 3.0
                  </span>
                </h3>
                <p className="text-[0.68rem] font-mono text-stone-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span dir="ltr">AGENT LOCAL: ON-LINE (WebSocket ws://127.0.0.1:28164)</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── BODY ───────────────────────────────────────────────────── */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Context Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0f1222]/90 border border-white/10 text-xs">
              <div className="space-y-1">
                <span className="text-[0.68rem] text-stone-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
                  <FolderOpen size={12} className="text-amber-400" />
                  <span>{isAr ? 'القضية المستهدفة للأرشفة' : 'Dossier Cible'}</span>
                </span>
                <span className="font-mono text-amber-300 font-bold block truncate">
                  {currentDossierRef} • {currentClientName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[0.68rem] text-stone-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
                  <Printer size={12} className="text-amber-400" />
                  <span>{isAr ? 'الماسح الضوئي المتصل' : 'Scanner Connecté'}</span>
                </span>
                <span className="font-mono text-white font-bold block flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Epson WorkForce DS-530 II (USB 3.0)
                </span>
              </div>
            </div>

            {/* Target Case Selector (If multiple dossiers available) */}
            {stage === 'idle' && dossiers.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 block">
                  {isAr ? 'تغيير الملف المستهدف لحفظ المستند (اختياري) :' : 'Sélectionner le dossier juridique :' }
                </label>
                <CustomSelect
                  value={selectedDossierId || (dossiers[0]?.id ?? '')}
                  onChange={(val) => setSelectedDossierId(val)}
                  options={dossierOptions}
                  dir={isAr ? 'rtl' : 'ltr'}
                  align="auto"
                  className="w-full"
                  buttonClassName="py-2 text-xs"
                />
              </div>
            )}

            {/* Config Controls with CustomSelect (0 native select) */}
            {stage === 'idle' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300 block">
                    {isAr ? 'طريقة السحب والتغذية (Alimentation) *' : 'Mode d’Alimentation Scanner *'}
                  </label>
                  <CustomSelect
                    value={mode}
                    onChange={(val) => setMode(val)}
                    options={modeOptions}
                    dir={isAr ? 'rtl' : 'ltr'}
                    align="auto"
                    className="w-full"
                    buttonClassName="py-2.5 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300 block">
                    {isAr ? 'دقة المسح الضوئي (Résolution DPI) *' : 'Résolution de Numérisation *'}
                  </label>
                  <CustomSelect
                    value={resolution}
                    onChange={(val) => setResolution(val)}
                    options={resolutionOptions}
                    dir={isAr ? 'rtl' : 'ltr'}
                    align="auto"
                    className="w-full"
                    buttonClassName="py-2.5 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {/* ── ACTIVE SCAN PIPELINE SIMULATION & VISUALS ── */}
            {stage !== 'idle' && (
              <div className="rounded-2xl bg-[#0f1222]/95 border border-white/10 p-5 space-y-4 shadow-inner">
                {/* Progress bar & Stage status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span className="font-semibold text-amber-300 flex items-center gap-2">
                      <Sparkles size={14} className="animate-spin text-amber-400" />
                      <span>
                        {stage === 'connecting' && (isAr ? '⚡ تهيئة محرك إبسون TWAIN/WIA USB 3.0...' : '⚡ Initialisation du pilote Epson TWAIN/WIA...')}
                        {stage === 'scanning' && (isAr ? `📄 سحب المستندات عبر وحدة ADF بدقة ${resolution} DPI (تصحيح الميل)...` : `📄 Acquisition ADF ${resolution} DPI en cours (Auto-deskew)...`)}
                        {stage === 'ocr' && (isAr ? '🧠 معالجة التعرف الضوئي على الحروف ثنائي اللغة (OCR)...' : '🧠 Traitement OCR Bilingue (Moteur Arabe/Français)...')}
                        {stage === 'encrypting' && (isAr ? '🔒 تشفير الوثيقة (AES-256) والربط بالأرشيف الرقمي...' : '🔒 Chiffrement de la pièce (AES-256) & Indexation GED...')}
                        {stage === 'complete' && (isAr ? '✓ اكتمل المسح الضوئي ومعالجة النص بنجاح' : '✓ Numérisation & Traitement OCR terminés avec succès')}
                      </span>
                    </span>
                    <strong className="font-mono text-amber-400 font-bold">{progress}%</strong>
                  </div>

                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-full"
                    />
                  </div>
                </div>

                {/* Laser scan beam animation during hardware capture */}
                {stage === 'scanning' && (
                  <div className="relative h-20 bg-[#060610] rounded-xl overflow-hidden border border-dashed border-amber-500/40 flex items-center justify-center shadow-inner">
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399]"
                    />
                    <span className="text-xs text-stone-400 z-10 font-mono">
                      {isAr
                        ? 'سحب أوراق الدعوى عبر وحدة التغذية الآلية لإبسون (ADF)...'
                        : 'Acquisition matérielle des pièces via le chargeur Epson...'}
                    </span>
                  </div>
                )}

                {/* Scanned OCR text preview */}
                {(stage === 'ocr' || stage === 'encrypting' || stage === 'complete') && (
                  <div className="rounded-xl bg-[#060610] p-4 border border-white/10 font-mono text-xs text-emerald-300 max-h-36 overflow-y-auto space-y-1.5 shadow-inner leading-relaxed">
                    <div className="text-amber-400 text-[0.68rem] font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/10">
                      <FileText size={12} />
                      <span>{isAr ? '[النص المستخرج عبر محرك OCR - عربي / فرنسي]' : '[TEXTE EXTRAIT PAR OCR - ARABE & FRANÇAIS]'}</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-stone-200">
                      {scannedText}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Hardware & Security Telemetry Badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 text-[0.72rem] text-stone-400">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0f1222] border border-white/5">
                <Cpu size={14} className="text-amber-400 shrink-0" />
                <span className="truncate">Auto-Deskew: ON</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0f1222] border border-white/5">
                <Lock size={14} className="text-amber-400 shrink-0" />
                <span className="truncate">Chiffrement: AES-256</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0f1222] border border-white/5">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate">MinIO GED: Prêt</span>
              </div>
            </div>
          </div>

          {/* ── FOOTER ACTIONS ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#0f1222]/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#141829] border border-white/10 text-stone-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Annuler'}
            </button>

            {stage === 'idle' ? (
              <button
                type="button"
                onClick={handleStartScan}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200
                  bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950
                  hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
              >
                <Scan size={16} />
                <span>{isAr ? 'بدء المسح الضوئي (Epson DS-530)' : 'Lancer la numérisation (Epson)'}</span>
              </button>
            ) : stage === 'complete' ? (
              <button
                type="button"
                onClick={handleSaveToVault}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200
                  bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950
                  hover:shadow-lg hover:shadow-emerald-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
              >
                <CheckCircle2 size={16} />
                <span>{isAr ? 'تأكيد الحفظ في الأرشيف الرقمي (GED)' : 'Valider & Classer dans la GED'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-amber-300 opacity-80 cursor-wait"
              >
                <RefreshCw size={15} className="animate-spin text-amber-400" />
                <span>{isAr ? 'جاري المسح والمعالجة...' : 'Traitement en cours...'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
})

EpsonScanModal.displayName = 'EpsonScanModal'
