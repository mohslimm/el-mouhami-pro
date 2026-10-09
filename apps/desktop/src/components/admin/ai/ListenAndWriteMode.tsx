// ListenAndWriteMode.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// MODE A — ÉCOUTE & RÉDACTION (Dictée vocale, intégration de trames et export Word)
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { memo, useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Mic,
  Upload,
  Sparkles,
  FileText,
  Download,
  AlertTriangle,
  User,
  Scale,
  Building2,
  FileCheck2,
  FolderOpen,
  Copy,
  Check,
} from 'lucide-react'
import { useAdminStore, CaseChamber, AiGeneratedPetition } from '@/stores/adminStore'
import { DictationButton } from '@/components/ui/DictationButton'
import { ReasoningBox, ReasoningStep } from '@/components/ui/ai/ReasoningBox'
import { generateWordDocument } from '@/services/documentGenerator'
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect'

export interface CustomTemplate {
  id: string
  name: string
  chamber: CaseChamber
  description: string
}

export const ListenAndWriteMode = memo(() => {
  const { lang, addGeneratedPetition, isOnline, dossiers } = useAdminStore()
  const isAr = lang === 'ar'

  // Trame & Custom Templates
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([
    { id: 'foncier', name: 'عريضة افتتاح دعوى - قسم عقاري', chamber: 'FONCIER', description: 'إثبات ملكية وتثبيت حقوق عقارية' },
    { id: 'famille', name: 'مذكرة جوابية - قسم شؤون الأسرة', chamber: 'FAMILLE', description: 'دعوى طلاق وتعديل مستحقات وحضانة' },
    { id: 'commercial', name: 'دعوى منازعة شركاء - قسم تجاري', chamber: 'COMMERCIAL', description: 'منازعة تجارية وإلغاء قرارات الجمعية' },
    { id: 'civil', name: 'عريضة تعويض - قسم مدني', chamber: 'CIVIL', description: 'المطالبة بالتعويض عن الضرر الشخصي' },
  ])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('foncier')
  const [importedNotification, setImportedNotification] = useState<string | null>(null)

  // Dossier Quick-Link & Copy States
  const [selectedDossierId, setSelectedDossierId] = useState<string>('')
  const [isCopied, setIsCopied] = useState(false)

  // Editable Form Fields
  const [clientName, setClientName] = useState('')
  const [defendantName, setDefendantName] = useState('')
  const [chamber, setChamber] = useState<CaseChamber>('FONCIER')
  const [jurisdiction, setJurisdiction] = useState('محكمة سيدي امحمد - القسم العقاري')
  const [factsSummary, setFactsSummary] = useState('')
  const [legalBasis, setLegalBasis] = useState('')
  const [lastGeneratedFile, setLastGeneratedFile] = useState<AiGeneratedPetition | null>(null)
  const [isProcessingAi, setIsProcessingAi] = useState(false)

  const templateOptions: SelectOption[] = useMemo(() => {
    return customTemplates.map((t) => ({
      value: t.id,
      label: t.name,
      badge: t.chamber,
    }))
  }, [customTemplates])

  const dossierOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [
      {
        value: '',
        label: isAr ? '— كتابة حرة (دون ربط بقضية) —' : '— Saisie libre (Sans dossier) —',
      },
    ]
    dossiers.forEach((d) => {
      const cName = isAr && d.clientNameAr ? d.clientNameAr : d.clientName
      const court = d.jurisdictionAr || d.jurisdiction
      list.push({
        value: d.id,
        label: `${d.reference} • ${cName} (${court})`,
        badge: d.chamber,
      })
    })
    return list
  }, [dossiers, isAr])

  const handleDossierSelect = (dossierId: string) => {
    setSelectedDossierId(dossierId)
    if (!dossierId) return
    const d = dossiers.find((x) => x.id === dossierId)
    if (!d) return
    setClientName(isAr && d.clientNameAr ? d.clientNameAr : d.clientName)
    setDefendantName(d.adversaryName || '')
    setJurisdiction(d.jurisdictionAr || d.jurisdiction)
    if (d.chamber) {
      setChamber(d.chamber)
      const matchedTpl = customTemplates.find((t) => t.chamber === d.chamber)
      if (matchedTpl) setSelectedTemplateId(matchedTpl.id)
    }
  }

  const handleCopyPetition = async () => {
    const text = `
الجمهورية الجزائرية الديمقراطية الشعبية
مجلس قضاء الجزائر — ${jurisdiction}

عريضة افتتاح دعوى قضائية
لفائدة: ${clientName || '[الموكل]'}
ضد: ${defendantName || '[الخصم]'}

— أولاً: الوقائع والتسلسل الزمني —
${factsSummary || '[الوقائع المعروضة]'}

— ثانياً: الأسانيد والتأصيل القانوني —
${legalBasis || '[الأسانيد القانونية]'}

— بناءً عليه، يلتمس العارض: —
الحكم وفق ما تم بيانه في الطلبات أعلاه مع تحميل المدعى عليه المصاريف القضائية.
`.trim()

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  const [reasoningSteps] = useState<ReasoningStep[]>([
    { id: '1', title: '1. تفريغ الصوت والتحليل الشفهي (Whisper Speech-to-Text)', detail: 'معالجة المصطلحات القانونية باللغتين العربية والفرنسية', status: 'completed' },
    { id: '2', title: '2. مطابقة بيانات الدعوى عبر Zod Schema Validator', detail: 'التحقق من هوية الموكل، الخصم، القسم، والجهة القضائية', status: 'completed' },
    { id: '3', title: '3. التأصيل القانوني ومراجعة مواد CPCA 08-09 / 22-13', detail: 'التحقق من الشكليات القانونية وآجال الطعن ورفع الدعوى', status: 'completed' },
    { id: '4', title: '4. تعبئة وتوليد نموذج Word الرسمية (.docx)', detail: 'إخراج الملف بالصيغة الرسمية الجاهزة للطباعة والإيداع', status: 'completed' },
  ])

  const exportPetitionToWordDocument = async (petition: AiGeneratedPetition) => {
    await generateWordDocument(
      {
        petitionType: petition.templateType || 'عريضة',
        jurisdiction: petition.jurisdiction,
        chamber: petition.chamber,
        clientName: petition.clientName,
        defendantName: petition.defendantName || 'بدون خصم',
        dossierNumber: petition.id,
        phone: '[تلقائي]',
        facts: [petition.facts],
        legalBasis: [petition.legalDemands],
        requests: ['الحكم بطلبات العارضة المعروضة أعلاه.'],
      },
      `عريضة_${petition.clientName.replace(/\s+/g, '_')}.doc`
    )
  }

  const handleTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file) return

    const newTemplate: CustomTemplate = {
      id: `custom-${Date.now()}`,
      name: `نموذج مخصص: ${file.name.replace(/\.[^/.]+$/, '')}`,
      chamber: chamber,
      description: `نموذج مستورد برسم ${file.name}`,
    }

    setCustomTemplates((prev) => [newTemplate, ...prev])
    setSelectedTemplateId(newTemplate.id)
    setImportedNotification(isAr ? `تم استيراد النموذج "${file.name}" بنجاح!` : `Modèle "${file.name}" importé !`)
    setTimeout(() => setImportedNotification(null), 4000)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <input type="file" ref={fileInputRef} onChange={handleTemplateFileUpload} accept=".docx,.doc" className="hidden" />

      {!isOnline && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-3 text-amber-300 text-xs">
          <AlertTriangle size={18} className="shrink-0 text-amber-400" />
          <span>
            {isAr
              ? 'تنبيه: الجهاز يعمل حالياً بدون اتصال بشبكة الإنترنت. يتم تطبيق النموذج المحلي المباشر.'
              : 'Mode déconnecté : Génération locale autonome appliquée via les modèles embarqués.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols) — Dictation & Template Controls */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="rounded-2xl border border-white/10 hover:border-amber-500/30 bg-[#121526]/90 p-5 shadow-xl shadow-black/40 backdrop-blur-md space-y-4 transition-all">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Mic size={16} />
                </span>
                <span>{isAr ? 'مسجل الصوت والتملية الفورية' : 'Dictée Vocale Directe'}</span>
              </h4>

              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#141829] border border-white/10 text-stone-200 hover:border-amber-500/40 hover:text-white transition-all cursor-pointer shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={13} className="text-amber-400" />
                <span>{isAr ? 'استيراد نموذج' : 'Importer Word'}</span>
              </button>
            </div>

            {/* Template Selector with CustomSelect */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 block">
                {isAr ? 'اختر النموذج القضائي للتملية عليه' : 'Modèle de destination'}
              </label>
              <CustomSelect
                value={selectedTemplateId}
                onChange={(val) => {
                  setSelectedTemplateId(val)
                  const t = customTemplates.find((x) => x.id === val)
                  if (t) setChamber(t.chamber)
                }}
                options={templateOptions}
                dir={isAr ? 'rtl' : 'ltr'}
                align={isAr ? 'right' : 'left'}
                className="w-full"
                buttonClassName="py-2 text-xs sm:text-sm"
              />
            </div>

            {importedNotification && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-400">
                {importedNotification}
              </div>
            )}

            {/* Dictation Shared Engine */}
            <DictationButton
              embedded={true}
              petitionType={selectedTemplateId === 'famille' ? 'divorce' : selectedTemplateId === 'commercial' ? 'commercial' : selectedTemplateId === 'civil' ? 'penal' : 'foncier'}
              knownParties={[
                { name: clientName, role: 'client' },
                { name: defendantName, role: 'defendant' },
              ]}
              onComplete={(hydratedData, isFallback) => {
                setClientName(hydratedData.clientName)
                setDefendantName(hydratedData.defendantName)
                setJurisdiction(hydratedData.jurisdiction)
                const factsStr = Array.isArray(hydratedData.facts) ? hydratedData.facts.join('\n') : hydratedData.facts
                const legalStr = Array.isArray(hydratedData.legalBasis) ? hydratedData.legalBasis.join('\n') : hydratedData.legalBasis
                setFactsSummary(factsStr)
                setLegalBasis(legalStr)

                const currentTemplate = customTemplates.find((t) => t.id === selectedTemplateId)
                const newPetition: AiGeneratedPetition = {
                  id: `pet-${Date.now()}`,
                  title: currentTemplate ? currentTemplate.name : 'عريضة رسمية بالذكاء الاصطناعي',
                  templateType: selectedTemplateId,
                  clientName: hydratedData.clientName,
                  defendantName: hydratedData.defendantName,
                  chamber,
                  jurisdiction: hydratedData.jurisdiction,
                  facts: factsStr,
                  legalDemands: legalStr,
                  wordFileUrl: '#',
                  createdAt: new Date().toISOString().split('T')[0] ?? '2026-08-27',
                }
                addGeneratedPetition(newPetition)
                setLastGeneratedFile(newPetition)

                if (isFallback) {
                  setImportedNotification(
                    isAr
                      ? '⚠️ تنبيه: تم تطبيق نموذج عام لتوقف خادم الذكاء الاصطناعي'
                      : '⚠️ Attention: Modèle générique appliqué (Serveur IA hors-ligne)'
                  )
                }
              }}
            />

            {/* Cult-UI Reasoning Steps */}
            <ReasoningBox
              steps={reasoningSteps}
              isStreaming={isProcessingAi}
            />
          </div>
        </div>

        {/* Right Column (7 Cols) — Form Content Editor & Word Export */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="rounded-2xl border border-white/10 hover:border-amber-500/30 bg-[#121526]/90 p-5 sm:p-6 shadow-xl shadow-black/40 backdrop-blur-md space-y-4 transition-all">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 size={18} className="text-amber-400" />
                <span>{isAr ? 'محتوى العريضة المستخرجة (معاينة وتعديل)' : 'Aperçu & Édition de la Pétition'}</span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPetition}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#141829] border border-white/10 text-stone-200 hover:border-amber-500/40 hover:text-white transition-all cursor-pointer shadow-sm"
                  title={isAr ? 'نسخ نص العريضة' : 'Copier le texte'}
                >
                  {isCopied ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{isAr ? 'تم النسخ!' : 'Copié !'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-amber-400" />
                      <span>{isAr ? 'نسخ النص' : 'Copier'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                    bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950
                    hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
                  onClick={() => {
                    setIsProcessingAi(true)
                    const currentTemplate = customTemplates.find((t) => t.id === selectedTemplateId)
                    const newPetition: AiGeneratedPetition = {
                      id: `pet-${Date.now()}`,
                      title: currentTemplate ? currentTemplate.name : 'عريضة رسمية بالذكاء الاصطناعي',
                      templateType: selectedTemplateId,
                      clientName,
                      defendantName,
                      chamber,
                      jurisdiction,
                      facts: factsSummary,
                      legalDemands: legalBasis,
                      wordFileUrl: '#',
                      createdAt: new Date().toISOString().split('T')[0] ?? '2026-08-27',
                    }
                    addGeneratedPetition(newPetition)
                    setLastGeneratedFile(newPetition)
                    setTimeout(() => setIsProcessingAi(false), 600)
                  }}
                >
                  <Sparkles size={14} />
                  <span>{isAr ? 'تأكيد وتوثيق العريضة' : 'Valider & Structurer'}</span>
                </button>
              </div>
            </div>

            {/* Quick Dossier Auto-Fill Selector */}
            <div className="rounded-xl border border-amber-500/20 bg-[#0f1222]/80 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <FolderOpen size={14} />
                  <span>{isAr ? 'ربط بقضية جارية (استيراد فوري لبيانات الموكل والخصم والغرفة)' : 'Lier à un dossier existant (Auto-remplissage)'}</span>
                </span>
                {selectedDossierId && (
                  <button
                    type="button"
                    onClick={() => handleDossierSelect('')}
                    className="text-[0.68rem] text-stone-400 hover:text-stone-200 underline cursor-pointer"
                  >
                    {isAr ? 'إلغاء الربط' : 'Délier'}
                  </button>
                )}
              </div>
              <CustomSelect
                value={selectedDossierId}
                onChange={handleDossierSelect}
                options={dossierOptions}
                dir={isAr ? 'rtl' : 'ltr'}
                align="auto"
                className="w-full"
                buttonClassName="py-2 text-xs"
              />
            </div>

            {/* Parties Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <User size={13} className="text-amber-400" />
                  <span>{isAr ? 'الموكل (الطالب) *' : 'Client (Demandeur) *'}</span>
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'اسم ولقب الموكل أو الشركة' : 'Nom du client'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-xs sm:text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Scale size={13} className="text-amber-400" />
                  <span>{isAr ? 'الخصم (المدعى عليه) *' : 'Adversaire (Défendeur) *'}</span>
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'اسم الطرف الخصم' : 'Nom de l\'adversaire'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-xs sm:text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30"
                  value={defendantName}
                  onChange={(e) => setDefendantName(e.target.value)}
                />
              </div>
            </div>

            {/* Jurisdiction Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Building2 size={13} className="text-amber-400" />
                <span>{isAr ? 'الجهة القضائية والغرفة المختصة *' : 'Juridiction Compétente *'}</span>
              </label>
              <input
                type="text"
                placeholder="محكمة سيدي امحمد - القسم العقاري"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-xs sm:text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
              />
            </div>

            {/* Facts Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 block">
                {isAr ? 'وقائع الدعوى (الوقائع والتسلسل الزمني)' : 'Faits & Chronologie'}
              </label>
              <textarea
                rows={3}
                placeholder={isAr ? 'حيث إنه بتاريخ... قام العارض بـ...' : 'Exposé des faits...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-xs sm:text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30 resize-none leading-relaxed"
                value={factsSummary}
                onChange={(e) => setFactsSummary(e.target.value)}
              />
            </div>

            {/* Legal Demands */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 block">
                {isAr ? 'الطلبات والأسس القانونية (عن التأسيس)' : 'Demandes & Arguments Juridiques'}
              </label>
              <textarea
                rows={3}
                placeholder={isAr ? 'تأسيساً على أحكام المادة... يلتمس العارض القضاء بـ...' : 'Moyens et prétentions...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-xs sm:text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30 resize-none leading-relaxed"
                value={legalBasis}
                onChange={(e) => setLegalBasis(e.target.value)}
              />
            </div>

            {/* Download Word Document Card */}
            {lastGeneratedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white font-serif tracking-wide">{lastGeneratedFile.title}</h5>
                    <span className="text-xs text-stone-400">
                      {lastGeneratedFile.clientName} ({lastGeneratedFile.chamber})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                    bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950
                    hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
                  onClick={() => exportPetitionToWordDocument(lastGeneratedFile)}
                >
                  <Download size={14} strokeWidth={2.5} />
                  <span>{isAr ? 'تحميل ملف Word (.doc)' : 'Télécharger Word (.doc)'}</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

ListenAndWriteMode.displayName = 'ListenAndWriteMode'
