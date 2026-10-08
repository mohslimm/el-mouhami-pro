// AdminOverviewModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & ANTIGRAVITY SPEC)
// Master Dashboard & Bento Grid Architecture for Algerian Legal Workflow
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useMemo } from 'react'
import { motion, Variants } from 'framer-motion'
import {
  FolderOpen,
  CalendarDays,
  Receipt,
  Scan,
  Sparkles,
  Clock,
  FileText,
  ChevronRight,
  Scale,
  Printer,
  AlertCircle,
  FolderKanban,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { NumberTicker } from '@/components/ui/magicui/number-ticker'
import { BorderBeam } from '@/components/ui/magicui/border-beam'
import { ShimmerButton } from '@/components/ui/magicui/shimmer-button'
import { Particles } from '@/components/ui/magicui/particles'

// ─── FRAMER MOTION ANIMATION VARIANTS ───
const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── ALGERIAN PROCEDURAL DEADLINE CONFIGURATIONS ───
const URGENCY_DATA_AR = [
  { label: 'مذكرة الجواب مطلوبة خلال 48 ساعة', style: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { label: 'جلسة مرافعة غداً (سيدي امحمد)', style: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { label: 'في انتظار الوثائق التكميلية (المحكمة العليا)', style: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
] as const

const URGENCY_DATA_FR = [
  { label: 'Mémoire de réponse sous 48h (Cour d’Alger)', style: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { label: 'Plaidoirie demain (Sidi M’hamed)', style: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { label: 'En attente de pièces (Cour Suprême)', style: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
] as const

export const AdminOverviewModule = memo(() => {
  const {
    dossiers,
    rdvs,
    scannedVault,
    setActiveTab,
    setEpsonScanOpen,
    setQuittanceOpen,
    openQuittanceFor,
    lang,
  } = useAdminStore()

  // ─── COMPUTED METRICS (SINGLE SOURCE OF TRUTH) ───
  const totalHonoraires = useMemo(
    () => dossiers.reduce((acc, d) => acc + (d.honorairesPayes || 0), 0),
    [dossiers]
  )

  const activeDossiers = useMemo(
    () => dossiers.filter((d) => d.statut !== 'Clôturé'),
    [dossiers]
  )

  const nextHearing = useMemo(() => {
    if (rdvs.length === 0) return null
    return rdvs[0]
  }, [rdvs])

  return (
    <div className="relative w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12 px-2 sm:px-4">
      {/* Background Micro-Particles Effect */}
      <Particles quantity={25} color="#c5a059" className="opacity-15 pointer-events-none" />

      {/* ═════════════════════════════════════════════════════════════════════
          1. HERO BANNER — CRITICAL CPCA PROCEDURAL ALERTS (PRIMARY FOCAL POINT)
         ═════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-gold,#b8924a)] bg-gradient-to-r from-[#19130a] via-[var(--bg-elevated,#14142a)] to-[var(--bg-surface,#0f0f20)] p-5 sm:p-6 shadow-2xl">
          <BorderBeam size={220} duration={6} colorFrom="#e8c77a" colorTo="#ffffff" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            {/* Alert Header & Legal Deadline Content */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/15 text-[#e8c77a] shadow-inner">
                <Scale size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#e8c77a] tracking-wide">
                    {lang === 'ar' ? 'تنبيه المواعيد والآجال القانونية (CPCA)' : 'Alerte Délais Procéduraux (CPCA)'}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                    <AlertCircle size={13} />
                    {lang === 'ar' ? '2 مواعيد عاجلة' : '2 Échéances Imminentes'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted,rgba(240,237,232,0.6))] leading-relaxed max-w-3xl">
                  {lang === 'ar'
                    ? 'الملف رقم DOS-2026/084 (مجلس قضاء الجزائر) : إيداع مذكرة الجواب مطلوب قبل 20 أوت 2026 تجنباً لسقوط الحق.'
                    : 'Dossier DOS-2026/084 (Cour d’Alger) : Dépôt du mémoire de réponse impératif avant le 20 Août 2026.'}
                </p>
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
              <button
                onClick={() => setActiveTab('ai_assistant')}
                className="text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-[#14142a] text-[#e8c77a] border border-[#c5a059]/40 shadow-md hover:bg-[#c5a059] hover:text-[#1A1200] transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-[#e8c77a]" />
                <span>{lang === 'ar' ? 'صياغة مذكرة' : 'Rédiger Mémoire'}</span>
              </button>
              <ShimmerButton
                onClick={() => setActiveTab('cpca')}
                className="text-xs font-bold px-4 py-2.5 text-[#1A1200] shadow-lg border border-[#e8c77a]"
              >
                <span>{lang === 'ar' ? 'حاسبة المواعيد' : 'Calculateur CPCA'}</span>
                <ChevronRight size={15} className={lang === 'ar' ? 'rotate-180' : ''} />
              </ShimmerButton>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═════════════════════════════════════════════════════════════════════
          2. BENTO GRID STRIP — 4 CORE KPIs (SINGLE OCCURRENCE GUARANTEED)
         ═════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* KPI 1: Active Cases */}
        <KpiCard
          title={lang === 'ar' ? 'القضايا الجارية' : 'Affaires en Cours'}
          value={activeDossiers.length}
          unit={lang === 'ar' ? 'ملفات' : 'dossiers'}
          subtitle={lang === 'ar' ? 'سيدي امحمد والمحكمة العليا' : "Cour Suprême & Sidi M'hamed"}
          icon={FolderKanban}
          accentColor="#c5a059"
          onClick={() => setActiveTab('dossiers')}
        />

        {/* KPI 2: Total Revenue */}
        <KpiCard
          title={lang === 'ar' ? 'الأتعاب المحصلة' : 'Honoraires Encaissés'}
          value={totalHonoraires}
          unit="د.ج"
          subtitle={lang === 'ar' ? 'وصل سداد رسمي (wasl.png)' : 'Quittances Valides'}
          icon={Receipt}
          accentColor="#e8c77a"
          onClick={() => setActiveTab('finances')}
        />

        {/* KPI 3: Next Hearing Countdown */}
        <KpiCard
          title={lang === 'ar' ? 'الجلسة القادمة' : 'Prochaine Audience'}
          value={nextHearing ? nextHearing.heureDebut : '10:00'}
          unit={nextHearing ? (lang === 'ar' && nextHearing.clientNameAr ? nextHearing.clientNameAr : nextHearing.clientName) : (lang === 'ar' ? 'لا يوجد' : 'Aucune')}
          subtitle={nextHearing ? (nextHearing.chambre || nextHearing.creneauType) : (lang === 'ar' ? 'جدول الجلسات' : 'Calendrier')}
          icon={CalendarDays}
          accentColor="#22c55e"
          isString
          onClick={() => setActiveTab('appointments')}
        />

        {/* KPI 4: Hardware Scanner Status */}
        <KpiCard
          title={lang === 'ar' ? 'الماسح الضوئي' : 'Scanner Matériel'}
          value={scannedVault.length}
          unit={lang === 'ar' ? 'مستندات GED' : 'pièces GED'}
          subtitle="Epson WorkForce DS-530 II"
          icon={Scan}
          accentColor="#38bdf8"
          onClick={() => setEpsonScanOpen(true)}
        />
      </motion.section>

      {/* ═════════════════════════════════════════════════════════════════════
          3. MAIN WORKSPACE SPLIT (12 COLUMNS: 8 LEFT / 4 RIGHT)
         ═════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-6 items-start"
      >
        {/* ───────────────────────────────────────────────────────────────────
            LEFT WORKSPACE AREA (8 COLS / ~70%) — ACTIVE CASES REGISTRY
           ─────────────────────────────────────────────────────────────────── */}
        <motion.div variants={ITEM_VARIANTS} className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-2xl bg-[var(--bg-surface,#0f0f20)] border border-white/10 hover:border-[#c5a059]/40 transition-all p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#c5a059]/15 text-[#e8c77a] border border-[#c5a059]/30">
                  <FolderOpen size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                    {lang === 'ar' ? 'سجل القضايا والآجال الإجرائية' : 'Registre des Affaires Actives & Délais'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted,rgba(240,237,232,0.5))] mt-0.5">
                    {lang === 'ar'
                      ? `${activeDossiers.length} قضية نشطة تحت المتابعة والمرافعة`
                      : `${activeDossiers.length} dossiers actifs sous suivi de juridiction`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('dossiers')}
                className="text-xs font-semibold text-[#e8c77a] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{lang === 'ar' ? 'عرض كافة الملفات' : 'Tous les dossiers'}</span>
                <ArrowUpRight size={14} className={lang === 'ar' ? 'rotate-270' : ''} />
              </button>
            </div>

            {/* Active Cases Registry Cards */}
            <div className="space-y-3">
              {activeDossiers.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted,rgba(240,237,232,0.5))] space-y-2">
                  <FolderKanban size={32} className="mx-auto opacity-30 text-[#e8c77a]" />
                  <p>{lang === 'ar' ? 'لا توجد قضايا نشطة حالياً' : 'Aucun dossier actif'}</p>
                </div>
              ) : (
                activeDossiers.slice(0, 4).map((dossier, idx) => {
                  const urgencyObj = lang === 'ar'
                    ? URGENCY_DATA_AR[Math.min(idx, URGENCY_DATA_AR.length - 1)]
                    : URGENCY_DATA_FR[Math.min(idx, URGENCY_DATA_FR.length - 1)]

                  return (
                    <motion.div
                      key={dossier.id}
                      whileHover={{ scale: 1.002, x: lang === 'ar' ? -2 : 2 }}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/5 hover:border-[#c5a059]/40 transition-all gap-4"
                    >
                      {/* Left Info Column */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="mt-1 p-2 rounded-lg bg-[var(--bg-elevated,#14142a)] border border-white/10 text-[#e8c77a] shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold text-white group-hover:text-[#e8c77a] transition-colors truncate">
                              {lang === 'ar' && dossier.clientNameAr ? dossier.clientNameAr : dossier.clientName}
                            </h4>
                            <span className="font-mono text-[0.68rem] text-[var(--text-muted,rgba(240,237,232,0.6))] bg-black/40 px-2 py-0.5 rounded border border-white/10 shrink-0">
                              {dossier.reference}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted,rgba(240,237,232,0.5))]">
                            <span>{lang === 'ar' && dossier.jurisdictionAr ? dossier.jurisdictionAr : dossier.jurisdiction}</span>
                            <span>•</span>
                            <span>{dossier.chamber || dossier.typeDroit}</span>
                          </div>

                          <div className="pt-1">
                            <span className={`inline-flex items-center gap-1.5 text-[0.68rem] px-2.5 py-0.5 rounded-full border font-medium ${urgencyObj.style}`}>
                              <Clock size={11} />
                              {urgencyObj.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions & Honoraires Column */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right rtl:text-left hidden md:block space-y-0.5">
                          <p className="font-mono text-xs font-bold text-white">
                            {dossier.honorairesPayes.toLocaleString()} <span className="text-[#e8c77a] font-sans">د.ج</span>
                          </p>
                          <p className="text-[0.65rem] text-[var(--text-muted,rgba(240,237,232,0.5))]">
                            {lang === 'ar' ? 'الأتعاب المسددة' : 'Hon. Réglés'}
                          </p>
                        </div>

                        {/* Official Receipt (wasl.png) Trigger */}
                        <button
                          onClick={() =>
                            openQuittanceFor({
                              clientName: dossier.clientNameAr || dossier.clientName,
                              dossierRef: dossier.reference,
                              amountDzd: dossier.honorairesPayes,
                              motif: lang === 'ar' ? `أتعاب قضائية - ملف رقم ${dossier.reference}` : `Honoraires - Dossier ${dossier.reference}`,
                            })
                          }
                          title={lang === 'ar' ? 'طباعة وصل سداد رسمي' : 'Imprimer Quittance'}
                          className="px-3 py-1.5 rounded-lg border border-[#c5a059]/40 bg-[#c5a059]/10 hover:bg-[#c5a059] hover:text-[#1A1200] text-[#e8c77a] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={14} />
                          <span className="hidden sm:inline">{lang === 'ar' ? 'الوصل' : 'Quittance'}</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('dossiers')}
                          className="p-2 rounded-lg bg-white/[0.04] text-[var(--text-muted,rgba(240,237,232,0.5))] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <ChevronRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* ───────────────────────────────────────────────────────────────────
            RIGHT SECONDARY AREA (4 COLS / ~30%) — TODAY'S HEARINGS & QUICK HUB
           ─────────────────────────────────────────────────────────────────── */}
        <motion.div variants={ITEM_VARIANTS} className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Widget 1: Today's Hearings Schedule */}
          <div className="rounded-2xl bg-[var(--bg-surface,#0f0f20)] border border-white/10 hover:border-[#c5a059]/40 transition-all p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#c5a059]/15 text-[#e8c77a] border border-[#c5a059]/30">
                  <CalendarDays size={18} />
                </div>
                <h3 className="font-serif text-base font-bold text-white tracking-wide">
                  {lang === 'ar' ? 'جلسات اليوم' : 'Audiences du Jour'}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#e8c77a] bg-[#c5a059]/15 px-2 py-0.5 rounded border border-[#c5a059]/30 font-bold">
                {rdvs.length}
              </span>
            </div>

            <div className="space-y-3">
              {rdvs.length === 0 ? (
                <p className="text-xs text-[var(--text-muted,rgba(240,237,232,0.5))] text-center py-6">
                  {lang === 'ar' ? 'لا توجد جلسات مجدولة اليوم' : 'Aucune audience aujourd’hui'}
                </p>
              ) : (
                rdvs.slice(0, 3).map((rdv) => (
                  <div
                    key={rdv.id}
                    onClick={() => setActiveTab('appointments')}
                    className="group p-3.5 rounded-xl bg-white/[0.025] border border-white/5 hover:border-[#c5a059]/40 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-[#e8c77a] flex items-center gap-1">
                        <Clock size={12} /> {rdv.heureDebut} - {rdv.heureFin}
                      </span>
                      <span className="text-[0.65rem] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                        {rdv.statut}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-[#e8c77a] transition-colors">
                      {lang === 'ar' && rdv.clientNameAr ? rdv.clientNameAr : rdv.clientName}
                    </h4>

                    <p className="text-[0.72rem] text-[var(--text-muted,rgba(240,237,232,0.6))] leading-tight">
                      {lang === 'ar' && rdv.motifAr ? rdv.motifAr : rdv.motif}
                    </p>

                    <p className="text-[0.65rem] text-[var(--text-muted,rgba(240,237,232,0.5))] font-mono pt-1 flex items-center gap-1">
                      <ShieldCheck size={11} className="text-[#e8c77a]" />
                      {rdv.chambre || rdv.creneauType}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 2: Hardware & Legal AI Quick Hub */}
          <div className="rounded-2xl bg-gradient-to-b from-[var(--bg-elevated,#14142a)] to-[var(--bg-surface,#0f0f20)] border border-[#c5a059]/30 p-5 shadow-xl relative overflow-hidden space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
              <Zap size={18} className="text-[#e8c77a]" />
              <h3 className="font-serif text-base font-bold text-[#e8c77a]">
                {lang === 'ar' ? 'الوسائط والماسح الضوئي' : 'Hub Matériel & IA Legal'}
              </h3>
            </div>

            {/* Hardware Scanner Trigger */}
            <button
              onClick={() => setEpsonScanOpen(true)}
              className="w-full p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#c5a059]/40 transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Scan size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-[#e8c77a]">
                    {lang === 'ar' ? 'مسح مستندات العريضة (Epson)' : 'Scanner Pièces (Epson DS-530)'}
                  </h4>
                  <p className="text-[0.68rem] text-[var(--text-muted,rgba(240,237,232,0.5))]">ADF Auto-Feeder 300 DPI</p>
                </div>
              </div>
              <ChevronRight size={14} className={`text-[var(--text-muted,rgba(240,237,232,0.5))] ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>

            {/* AI Assistant Launcher */}
            <button
              onClick={() => setActiveTab('ai_assistant')}
              className="w-full p-3 rounded-xl bg-[#c5a059]/15 hover:bg-[#c5a059]/25 border border-[#c5a059]/40 transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#c5a059]/25 text-[#e8c77a]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#e8c77a] group-hover:text-white">
                    {lang === 'ar' ? 'المساعد القضائي والإملاء الصوتي' : 'Dictée Vocale & Requête IA'}
                  </h4>
                  <p className="text-[0.68rem] text-[var(--text-muted,rgba(240,237,232,0.5))]">Génération Word .docx</p>
                </div>
              </div>
              <ChevronRight size={14} className={`text-[#e8c77a] ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>

            {/* Quittance Modal Launcher */}
            <button
              onClick={() => setQuittanceOpen(true)}
              className="w-full p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#c5a059]/40 transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Printer size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-[#e8c77a]">
                    {lang === 'ar' ? 'إنشاء وصل سداد جديد' : 'Générer une Quittance'}
                  </h4>
                  <p className="text-[0.68rem] text-[var(--text-muted,rgba(240,237,232,0.5))]">النموذج الرسمي (wasl.png)</p>
                </div>
              </div>
              <ChevronRight size={14} className={`text-[var(--text-muted,rgba(240,237,232,0.5))] ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
})

// ─── HELPER KPI CARD COMPONENT ───
interface KpiCardProps {
  title: string
  value: number | string
  unit: string
  subtitle: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  accentColor: string
  isString?: boolean
  onClick?: () => void
}

function KpiCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  accentColor,
  isString,
  onClick,
}: KpiCardProps) {
  return (
    <motion.div
      variants={ITEM_VARIANTS}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="p-4.5 rounded-2xl bg-[var(--bg-surface,#0f0f20)] border border-white/10 hover:border-[#c5a059]/50 transition-all shadow-xl relative overflow-hidden group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.68rem] font-semibold text-[var(--text-muted,rgba(240,237,232,0.5))] tracking-wider uppercase">
          {title}
        </span>
        <div
          className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10"
          style={{ color: accentColor }}
        >
          <Icon size={16} />
        </div>
      </div>

      <div className="font-mono text-xl font-bold text-white flex items-baseline gap-1.5 truncate">
        {isString ? (
          <span className="text-base truncate">{value}</span>
        ) : typeof value === 'number' ? (
          <NumberTicker value={value} />
        ) : (
          <span>{value}</span>
        )}
        <span className="text-xs font-sans font-bold shrink-0" style={{ color: accentColor }}>
          {unit}
        </span>
      </div>

      <p className="text-[0.68rem] text-[var(--text-muted,rgba(240,237,232,0.5))] mt-1 truncate">{subtitle}</p>

      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />
    </motion.div>
  )
}

AdminOverviewModule.displayName = 'AdminOverviewModule'
