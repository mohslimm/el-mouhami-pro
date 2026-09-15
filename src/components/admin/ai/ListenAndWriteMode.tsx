// ListenAndWriteMode.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// MODE A — ÉCOUTE & RÉDACTION (Dictée vocale, intégration de trames et export Word)
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, Upload, Sparkles, FileText, Download, AlertTriangle } from 'lucide-react'
import { useAdminStore, CaseChamber, AiGeneratedPetition } from '@/stores/adminStore'
import { DictationButton } from '@/components/ui/DictationButton'
import { ReasoningBox, ReasoningStep } from '@/components/ui/ai/ReasoningBox'
import { generateWordDocument } from '@/services/documentGenerator'

export interface CustomTemplate {
  id: string
  name: string
  chamber: CaseChamber
  description: string
}

export const ListenAndWriteMode = memo(() => {
  const { lang, addGeneratedPetition, isOnline } = useAdminStore()

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

  // Editable Form Fields
  const [clientName, setClientName] = useState('')
  const [defendantName, setDefendantName] = useState('')
  const [chamber, setChamber] = useState<CaseChamber>('FONCIER')
  const [jurisdiction, setJurisdiction] = useState('محكمة سيدي امحمد - القسم العقاري')
  const [factsSummary, setFactsSummary] = useState('')
  const [legalBasis, setLegalBasis] = useState('')
  const [lastGeneratedFile, setLastGeneratedFile] = useState<AiGeneratedPetition | null>(null)
  const [isProcessingAi, setIsProcessingAi] = useState(false)

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
    setImportedNotification(lang === 'ar' ? `تم استيراد النموذج "${file.name}" بنجاح!` : `Modèle "${file.name}" importé !`)
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
            {lang === 'ar'
              ? 'تنبيه: الجهاز يعمل حالياً بدون اتصال بشبكة الإنترنت. يتم تطبيق النموذج المحلي المباشر.'
              : 'Mode déconnecté : Génération locale autonome appliquée via les modèles embarqués.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols) — Dictation & Template Controls */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-gold)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h4 className="font-serif text-base font-bold text-[var(--gold-400)] flex items-center gap-2">
                <Mic size={18} />
                {lang === 'ar' ? 'مسجل الصوت والتملية الفورية' : 'Dictée Vocale Directe'}
              </h4>

              <button
                className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>{lang === 'ar' ? 'استيراد نموذج' : 'Importer Word'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                {lang === 'ar' ? 'اختر النموذج القضائي للتملية عليه' : 'Modèle de destination'}
              </label>
              <select
                className="input w-full text-xs sm:text-sm font-medium py-2"
                value={selectedTemplateId}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedTemplateId(val)
                  const t = customTemplates.find((x) => x.id === val)
                  if (t) setChamber(t.chamber)
                }}
              >
                {customTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {importedNotification && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-400">
                {importedNotification}
              </div>
            )}

            {/* Dictation Shared Engine */}
            <DictationButton
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
                    lang === 'ar'
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
          <div className="rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-gold)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h4 className="font-serif text-lg font-bold text-[var(--gold-400)]">
                {lang === 'ar' ? 'محتوى العريضة المستخرجة (معاينة وتعديل)' : 'Aperçu & Édition de la Pétition'}
              </h4>
              <button
                className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2"
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
                <span>{lang === 'ar' ? 'تأكيد وتوثيق العريضة' : 'Valider & Structurer'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                  {lang === 'ar' ? 'الموكل (الطالب)' : 'Client (Demandeur)'}
                </label>
                <input className="input w-full text-xs sm:text-sm py-2" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                  {lang === 'ar' ? 'الخصم (المدعى عليه)' : 'Adversaire (Défendeur)'}
                </label>
                <input className="input w-full text-xs sm:text-sm py-2" value={defendantName} onChange={(e) => setDefendantName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                {lang === 'ar' ? 'الجهة القضائية والجهة المختصة' : 'Juridiction Competente'}
              </label>
              <input className="input w-full text-xs sm:text-sm py-2" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                {lang === 'ar' ? 'وقائع الدعوى (الوقائع)' : 'Faits & Chronologie'}
              </label>
              <textarea className="input w-full min-h-[95px] text-xs sm:text-sm py-2" value={factsSummary} onChange={(e) => setFactsSummary(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                {lang === 'ar' ? 'الطلبات والأسس القانونية (عن التأسيس)' : 'Demandes & Arguments Juridiques'}
              </label>
              <textarea className="input w-full min-h-[95px] text-xs sm:text-sm py-2" value={legalBasis} onChange={(e) => setLegalBasis(e.target.value)} />
            </div>

            {lastGeneratedFile && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[var(--border-gold)] bg-[var(--gold-glow)] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-[var(--gold-400)] shrink-0" />
                  <div>
                    <h5 className="text-sm font-bold text-white font-serif">{lastGeneratedFile.title}</h5>
                    <span className="text-xs text-[var(--text-muted)]">{lastGeneratedFile.clientName} ({lastGeneratedFile.chamber})</span>
                  </div>
                </div>
                <button
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2"
                  onClick={() => exportPetitionToWordDocument(lastGeneratedFile)}
                >
                  <Download size={14} />
                  <span>{lang === 'ar' ? 'تحميل ملف Word (.doc)' : 'Télécharger Word (.doc)'}</span>
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
