// SearchAndActMode.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// MODE B — RECHERCHE & ACTION (Recherche intelligente & Exécution contrôlée d'actions)
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Printer,
  ShieldAlert,
  Send,
} from 'lucide-react'
import { useAdminStore, AdminRdv } from '@/stores/adminStore'
import {
  resolveIntent,
  IntentResolutionResult,
  AI_ACTIONS_CATALOG,
  logAiAction,
} from '@/lib/aiActions'

export const SearchAndActMode = memo(() => {
  const { dossiers, rdvs, scannedVault, setActiveTab, openQuittanceFor, addRdv, lang, isOnline } = useAdminStore()

  const [prompt, setPrompt] = useState('')
  const [activeIntent, setActiveIntent] = useState<IntentResolutionResult | null>(null)
  const [editableParams, setEditableParams] = useState<Record<string, any>>({})
  const [executionReceipt, setExecutionReceipt] = useState<string | null>(null)

  // Submits the natural language prompt for classification
  const handleProcessCommand = (queryText?: string) => {
    const textToProcess = queryText || prompt
    if (!textToProcess.trim()) return

    const result = resolveIntent(textToProcess, lang)
    setActiveIntent(result)
    setEditableParams(result.params || {})
    setExecutionReceipt(null)
  }

  // Search Results filtering when intent is 'search'
  const searchResults = useMemo(() => {
    if (!activeIntent || activeIntent.type !== 'search' || !activeIntent.search_query) {
      return { dossiers: [], rdvs: [], docs: [] }
    }

    const q = activeIntent.search_query.toLowerCase()

    const matchedDossiers = dossiers.filter((d) =>
      d.reference.toLowerCase().includes(q) ||
      d.clientName.toLowerCase().includes(q) ||
      (d.clientNameAr && d.clientNameAr.includes(q)) ||
      d.jurisdiction.toLowerCase().includes(q)
    )

    const matchedRdvs = rdvs.filter((r) =>
      r.clientName.toLowerCase().includes(q) ||
      (r.clientNameAr && r.clientNameAr.includes(q)) ||
      r.motif.toLowerCase().includes(q) ||
      r.telephone.includes(q)
    )

    const matchedDocs = scannedVault.filter((doc) =>
      doc.filename.toLowerCase().includes(q) ||
      doc.clientName.toLowerCase().includes(q) ||
      doc.caseRoleNo.toLowerCase().includes(q)
    )

    return { dossiers: matchedDossiers, rdvs: matchedRdvs, docs: matchedDocs }
  }, [activeIntent, dossiers, rdvs, scannedVault])

  // Confirmation Execution handler for Medium/High risk actions
  const handleConfirmAction = () => {
    if (!activeIntent || !activeIntent.action_id) return

    const actionDef = AI_ACTIONS_CATALOG[activeIntent.action_id]
    if (!actionDef) return

    if (activeIntent.action_id === 'generate_quittance') {
      const client = editableParams.client || 'بن علي عبد القادر'
      const amount = Number(editableParams.montant) || 50000
      const motif = editableParams.motif || (lang === 'ar' ? 'وصل تسليم أتعاب مرافعة' : "Quittance d'honoraires")

      openQuittanceFor({
        clientName: client,
        dossierRef: '24/00412',
        amountDzd: amount,
        motif,
      })

      logAiAction({ action_id: 'generate_quittance', riskLevel: 'high', params: editableParams, status: 'executed' })
      setExecutionReceipt(
        lang === 'ar'
          ? `✓ تم فتح نموذج وصل السداد بقيمة ${amount} د.ج للموكل (${client}) بنجاح.`
          : `✓ Quittance d'honoraires de ${amount} DA ouverte pour ${client}.`
      )
    } else if (activeIntent.action_id === 'create_rdv') {
      const client = editableParams.client || 'بن محمد رضا'
      const date = editableParams.date || new Date().toISOString().split('T')[0]
      const heure = editableParams.heure || '10:00'
      const motif = editableParams.motif || 'استشارة قانونية وتأصيل عريضة'

      const newRdv: AdminRdv = {
        id: `rdv-${Date.now()}`,
        clientName: client,
        clientNameAr: client,
        telephone: '0662 26 53 00',
        email: 'client@slimani-avocat.dz',
        date,
        heureDebut: heure,
        heureFin: '11:00',
        creneauType: 'Cabinet (Bir Khadem)',
        statut: 'Confirmé',
        motif,
        motifAr: motif,
      }

      addRdv(newRdv)
      logAiAction({ action_id: 'create_rdv', riskLevel: 'medium', params: editableParams, status: 'executed' })
      setExecutionReceipt(
        lang === 'ar'
          ? `✓ تم ثبت وتأكيد الموعد للموكل (${client}) بتاريخ ${date} على الساعة ${heure}.`
          : `✓ Rendez-vous confirmé pour ${client} le ${date} à ${heure}.`
      )
    }

    setActiveIntent(null)
  }

  // Low risk actions execution (direct)
  const handleExecuteLowRiskAction = () => {
    if (!activeIntent || !activeIntent.action_id) return

    if (activeIntent.action_id === 'navigate_to') {
      const target = editableParams.target || 'overview'
      setActiveTab(target)
      logAiAction({ action_id: 'navigate_to', riskLevel: 'low', params: editableParams, status: 'executed' })
    } else if (activeIntent.action_id === 'launch_scan') {
      setActiveTab('epson_scan')
      logAiAction({ action_id: 'launch_scan', riskLevel: 'low', params: editableParams, status: 'executed' })
    } else if (activeIntent.action_id === 'calculate_cpca_deadline') {
      setActiveTab('cpca')
      logAiAction({ action_id: 'calculate_cpca_deadline', riskLevel: 'low', params: editableParams, status: 'executed' })
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {!isOnline && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-3 text-amber-300 text-xs">
          <AlertTriangle size={18} className="shrink-0 text-amber-400" />
          <span>
            {lang === 'ar'
              ? 'تنبيه: تعمل في وضع آفلاين بدون إنترنت. تقتصر الأوامر على البحث المحلي وإلغاء العمليات الحساسة.'
              : 'Mode hors-ligne : Les commandes IA sont limitées aux recherches locales et actions sécurisées.'}
          </span>
        </div>
      )}

      {/* Main Command Input Box */}
      <div className="rounded-2xl border border-[var(--border-gold)] bg-gradient-to-b from-[var(--bg-elevated)] via-[var(--bg-surface)] to-[var(--bg-surface)] p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2.5">
            <Sparkles size={20} className="text-[var(--gold-400)]" />
            <span>{lang === 'ar' ? 'مساعد البحث والأوامر التفاعلية' : 'Recherche & Exécution de Commandes'}</span>
          </h3>
          <span className="text-xs text-[var(--gold-400)] bg-[var(--gold-glow)] px-3 py-1 rounded-full border border-[var(--border-gold)] font-mono">
            {lang === 'ar' ? 'تحكم آمن 100%' : 'Mode Sécurisé'}
          </span>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setPrompt(lang === 'ar' ? 'بحث عن ملف بن علي' : 'Chercher dossier Benali')
              handleProcessCommand(lang === 'ar' ? 'بحث عن ملف بن علي' : 'Chercher dossier Benali')
            }}
            className="text-xs px-3 py-1 rounded-full bg-white/[0.03] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] text-[var(--text-muted)] hover:text-white transition-all"
          >
            {lang === 'ar' ? '🔍 بحث عن ملف بن علي' : '🔍 Dossier Benali'}
          </button>

          <button
            onClick={() => {
              setPrompt(lang === 'ar' ? 'إصدار وصل 50000 د.ج للموكل بن علي' : 'Émettre quittance 50000 DA pour Benali')
              handleProcessCommand(lang === 'ar' ? 'إصدار وصل 50000 د.ج للموكل بن علي' : 'Émettre quittance 50000 DA pour Benali')
            }}
            className="text-xs px-3 py-1 rounded-full bg-white/[0.03] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] text-[var(--text-muted)] hover:text-white transition-all"
          >
            {lang === 'ar' ? '💳 إصدار وصل أتعاب' : '💳 Quittance d’honoraires'}
          </button>

          <button
            onClick={() => {
              setPrompt(lang === 'ar' ? 'برمجة موعد استشارة للموكل بن محمد رضا' : 'Créer rdv pour Benmohamed Reda')
              handleProcessCommand(lang === 'ar' ? 'برمجة موعد استشارة للموكل بن محمد رضا' : 'Créer rdv pour Benmohamed Reda')
            }}
            className="text-xs px-3 py-1 rounded-full bg-white/[0.03] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] text-[var(--text-muted)] hover:text-white transition-all"
          >
            {lang === 'ar' ? '📅 برمجة موعد' : '📅 Fixer un RDV'}
          </button>

          <button
            onClick={() => {
              setPrompt(lang === 'ar' ? 'حساب مهلة استئناف CPCA' : 'Calculer délai CPCA')
              handleProcessCommand(lang === 'ar' ? 'حساب مهلة استئناف CPCA' : 'Calculer délai CPCA')
            }}
            className="text-xs px-3 py-1 rounded-full bg-white/[0.03] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] text-[var(--text-muted)] hover:text-white transition-all"
          >
            {lang === 'ar' ? '⚖️ حساب مهلة CPCA' : '⚖️ Calcul CPCA'}
          </button>
        </div>

        {/* Prompt Input Form */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={
                lang === 'ar'
                  ? 'اكتب أمرك هنا (مثال: بحث عن ملف، إصدار وصل أتعاب، برمجة موعد، حساب CPCA...)'
                  : 'Tapez une commande (ex: Chercher dossier, Émettre quittance, Fixer rdv, Calculer CPCA...)'
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcessCommand()}
              className="input w-full pl-10 pr-4 py-3 text-xs sm:text-sm font-medium"
            />
          </div>

          <button onClick={() => handleProcessCommand()} className="btn-primary py-3 px-5 text-xs sm:text-sm gap-2 shrink-0">
            <Send size={16} />
            <span>{lang === 'ar' ? 'تنفيذ الأمر' : 'Exécuter'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Receipt Toast */}
      {executionReceipt && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 flex items-center justify-between text-emerald-300 text-sm font-semibold">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <span>{executionReceipt}</span>
          </div>
          <button className="btn-outline text-xs py-1 px-3" onClick={() => setExecutionReceipt(null)}>
            {lang === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>
        </motion.div>
      )}

      {/* Intent Output Container */}
      <AnimatePresence mode="wait">
        {activeIntent && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            
            {/* 1. SEARCH INTENT RESULTS PANEL */}
            {activeIntent.type === 'search' && (
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 space-y-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <h4 className="font-serif text-base font-bold text-[var(--gold-400)] flex items-center gap-2">
                    <Search size={18} />
                    <span>{lang === 'ar' ? activeIntent.explanationAr : activeIntent.explanationFr}</span>
                  </h4>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {searchResults.dossiers.length + searchResults.rdvs.length + searchResults.docs.length} {lang === 'ar' ? 'نتائج' : 'résultat(s)'}
                  </span>
                </div>

                {/* Empty Search Result */}
                {searchResults.dossiers.length === 0 && searchResults.rdvs.length === 0 && searchResults.docs.length === 0 ? (
                  <div className="p-8 text-center text-[var(--text-muted)] text-sm space-y-2">
                    <Search size={32} className="mx-auto opacity-50 text-[var(--gold-400)]" />
                    <p>{lang === 'ar' ? 'لم يتم العثور على أي نتائج تطابق استعلام البحث.' : 'Aucun résultat trouvé dans la base du cabinet.'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Dossiers Results */}
                    {searchResults.dossiers.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                          <FileText size={14} className="text-[var(--gold-400)]" />
                          <span>{lang === 'ar' ? 'الملفات والقضايا المطابقة' : 'Dossiers Juridiques'}</span>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {searchResults.dossiers.map((d) => (
                            <div
                              key={d.id}
                              onClick={() => setActiveTab('dossiers')}
                              className="rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-gold)] bg-[var(--bg-elevated)] p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-white/[0.02]"
                            >
                              <div className="space-y-1">
                                <div className="text-xs font-bold font-mono text-[var(--gold-400)]">{d.reference}</div>
                                <div className="text-sm font-semibold text-white">{lang === 'ar' && d.clientNameAr ? d.clientNameAr : d.clientName}</div>
                                <div className="text-xs text-[var(--text-muted)]">{d.jurisdiction} ({d.typeDroit})</div>
                              </div>
                              <ArrowRight size={16} className="text-[var(--gold-400)] shrink-0 rtl:rotate-180" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RDVs / Audiences Results */}
                    {searchResults.rdvs.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                          <Calendar size={14} className="text-[var(--gold-400)]" />
                          <span>{lang === 'ar' ? 'الجلسات والمواعيد' : 'Audiences & Rendez-vous'}</span>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {searchResults.rdvs.map((r) => (
                            <div
                              key={r.id}
                              onClick={() => setActiveTab('appointments')}
                              className="rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-gold)] bg-[var(--bg-elevated)] p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-white/[0.02]"
                            >
                              <div className="space-y-1">
                                <div className="text-xs font-mono text-[var(--gold-400)]">{r.date} — {r.heureDebut}</div>
                                <div className="text-sm font-semibold text-white">{lang === 'ar' && r.clientNameAr ? r.clientNameAr : r.clientName}</div>
                                <div className="text-xs text-[var(--text-muted)]">{r.motif}</div>
                              </div>
                              <ArrowRight size={16} className="text-[var(--gold-400)] shrink-0 rtl:rotate-180" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scanned Docs Results */}
                    {searchResults.docs.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                          <Printer size={14} className="text-[var(--gold-400)]" />
                          <span>{lang === 'ar' ? 'الوثائق المنسوخة بالماسح الضوئي' : 'Documents Scannés GED'}</span>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {searchResults.docs.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => setActiveTab('epson_scan')}
                              className="rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-gold)] bg-[var(--bg-elevated)] p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-white/[0.02]"
                            >
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-white truncate">{doc.filename}</div>
                                <div className="text-xs text-[var(--text-muted)]">{doc.clientName} ({doc.caseRoleNo})</div>
                              </div>
                              <ArrowRight size={16} className="text-[var(--gold-400)] shrink-0 rtl:rotate-180" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. ACTION INTENT CONFIRMATION CARD (MEDIUM & HIGH RISK) */}
            {activeIntent.type === 'action' && activeIntent.action_id && (
              <div className="rounded-2xl border border-[var(--border-gold)] bg-gradient-to-b from-[var(--bg-elevated)] via-[var(--bg-surface)] to-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[var(--gold-glow)] text-[var(--gold-400)] border border-[var(--border-gold)]">
                      <ShieldAlert size={22} />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white">
                        {lang === 'ar' ? 'بطاقة تأكيد العملية القضائية' : "Confirmation d'Action Requise"}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        {lang === 'ar' ? activeIntent.explanationAr : activeIntent.explanationFr}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    AI_ACTIONS_CATALOG[activeIntent.action_id]?.riskLevel === 'high'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {lang === 'ar' ? 'مراجعة مطلوبة' : 'Validation Requise'}
                  </span>
                </div>

                {/* Editable Parameters Form */}
                <div className="space-y-4 bg-white/[0.02] border border-[var(--border-subtle)] rounded-xl p-4">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--gold-400)]">
                    {lang === 'ar' ? 'معلمات العملية (قابلة للتعديل قبل التأكيد) :' : 'Paramètres Éditables de l’Action :'}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(editableParams).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => setEditableParams((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="input w-full text-xs sm:text-sm py-2 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirmation Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    className="btn-outline text-xs sm:text-sm py-2.5 px-4 flex items-center gap-2"
                    onClick={() => setActiveIntent(null)}
                  >
                    <XCircle size={16} />
                    <span>{lang === 'ar' ? 'إلغاء العملية' : 'Annuler'}</span>
                  </button>

                  {AI_ACTIONS_CATALOG[activeIntent.action_id]?.requiresConfirmation ? (
                    <button
                      className="btn-primary text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2"
                      onClick={handleConfirmAction}
                    >
                      <CheckCircle2 size={16} />
                      <span>{lang === 'ar' ? 'تأكيد وتنفيذ العملية' : 'Confirmer & Exécuter'}</span>
                    </button>
                  ) : (
                    <button
                      className="btn-primary text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2"
                      onClick={handleExecuteLowRiskAction}
                    >
                      <ArrowRight size={16} />
                      <span>{lang === 'ar' ? 'الانتقال المباشر' : 'Exécuter directement'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. UNKNOWN / LOW CONFIDENCE INTENT */}
            {activeIntent.type === 'unknown' && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center space-y-3">
                <AlertTriangle size={32} className="mx-auto text-amber-400" />
                <h4 className="font-serif text-base font-bold text-amber-300">
                  {lang === 'ar' ? 'لم يتم التعرف بثقة على قصد الأمر' : 'Commande Non Reconnue'}
                </h4>
                <p className="text-xs text-amber-200/80 max-w-lg mx-auto">
                  {lang === 'ar'
                    ? 'يرجى إعادة صياغة الطلب بشكل أكثر وضوحاً، مثل "بحث عن ملف..."، "إصدار وصل..."، "برمجة موعد..." أو "حساب CPCA...".'
                    : 'Veuillez reformuler votre demande clairement (ex: "Chercher dossier...", "Émettre quittance...", "Fixer rdv..." ou "Calculer CPCA...").'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

SearchAndActMode.displayName = 'SearchAndActMode'
