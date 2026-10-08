// AdminCpcaModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & ANTIGRAVITY SPEC)
// CPCA Procedural Deadline Calculator with Automatic Algerian Prorogation (Art. 405/406)
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState, useMemo } from 'react'
import { motion, Variants } from 'framer-motion'
import { Scale, Clock, ShieldAlert, CalendarCheck2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'

const VARIANTS: Record<string, Variants> = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  },
}

interface CpcaProcedureRule {
  id: string
  titleFr: string
  titleAr: string
  codeRef: string // Article Code CPCA
  delaiJours: number
  descFr: string
  descAr: string
}

const CPCA_RULES: CpcaProcedureRule[] = [
  {
    id: 'appel_civil',
    titleFr: "Appel d'un Jugement de Première Instance (Chambre Civile / Foncière)",
    titleAr: 'استئناف حكم ابتدائـي (الغرفة المدنية / العقارية)',
    codeRef: 'Art. 336 CPCA / المادة 336',
    delaiJours: 30,
    descFr: "Le délai d'appel est de 30 jours à compter de la signification officielle du jugement à personne ou à domicile.",
    descAr: 'مهلة الاستئناف هي 30 يوماً ابتداءً من تاريخ التبليغ الرسمي للحكم للشخص أو بموطنه الأصلي.',
  },
  {
    id: 'pourvoi_cassation',
    titleFr: 'Pourvoi en Cassation devant la Cour Suprême / Conseil d’État',
    titleAr: 'الطعن بالنقض أمام المحكمة العليا / مجلس الدولة',
    codeRef: 'Art. 354 CPCA / المادة 354',
    delaiJours: 60,
    descFr: "Le délai de pourvoi en cassation est de 2 mois (60 jours) à compter de la signification de l'arrêt d'appel.",
    descAr: 'مهلة الطعن بالنقض هي شهران (60 يوماً) ابتداءً من تاريخ التبليغ الرسمي لقرار الاستئناف.',
  },
  {
    id: 'opposition_defaut',
    titleFr: 'Opposition contre un Jugement par Défaut',
    titleAr: 'الاعتراض على حكم غيابي (معارضة)',
    codeRef: 'Art. 327 CPCA / المادة 327',
    delaiJours: 10,
    descFr: "L'opposition doit être formée dans les 10 jours à compter de la signification du jugement rendu par défaut.",
    descAr: 'يجب تقديم المعارضة خلال 10 أيام ابتداءً من تاريخ التبليغ الرسمي للحكم الغيابي.',
  },
  {
    id: 'recours_refere',
    titleFr: "Appel d'une Ordonnance de Référé",
    titleAr: 'استئناف أمر استعجالي (قسم الاستعجالي)',
    codeRef: 'Art. 304 CPCA / المادة 304',
    delaiJours: 15,
    descFr: "L'appel contre les ordonnances de référé doit être interjeté dans un délai strict de 15 jours.",
    descAr: 'يجب تقديم الاستئناف ضد الأوامر الاستعجالية في أجل أقصاه 15 يوماً.',
  },
]

export const AdminCpcaModule = memo(() => {
  const { lang, setActiveTab } = useAdminStore()
  const [selectedRuleId, setSelectedRuleId] = useState<string>('appel_civil')
  const [significationDate, setSignificationDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? '2026-08-05'
  )

  const selectedRule = useMemo(
    () => CPCA_RULES.find((r) => r.id === selectedRuleId) ?? CPCA_RULES[0]!,
    [selectedRuleId]
  )

  // ─── ALGERIAN LEGAL DEADLINE & PROROGATION CALCULATION (Art. 405 CPCA) ───
  const calculation = useMemo(() => {
    const startDate = new Date(significationDate)
    const initialExpiration = new Date(startDate)
    initialExpiration.setDate(initialExpiration.getDate() + selectedRule.delaiJours)

    const dayOfWeek = initialExpiration.getDay() // 0 = Dimanche, 5 = Vendredi, 6 = Samedi
    let prorogatedExpiration = new Date(initialExpiration)
    let wasProrogated = false
    let prorogationReason = ''

    // Algerian Legal Weekend: Friday (5) & Saturday (6)
    if (dayOfWeek === 5) {
      // Friday -> Move +2 days to Sunday
      prorogatedExpiration.setDate(prorogatedExpiration.getDate() + 2)
      wasProrogated = true
      prorogationReason =
        lang === 'ar'
          ? 'صادف اليوم الأخير يوم جمعة (عطلة أسبوعية رسمية)، امتدت المهلة تلقائياً إلى يوم الأحد (المادة 405 CPCA).'
          : 'L’échéance tombait un Vendredi (repos légal), reportée de plein droit au Dimanche suivant (Art. 405 CPCA).'
    } else if (dayOfWeek === 6) {
      // Saturday -> Move +1 day to Sunday
      prorogatedExpiration.setDate(prorogatedExpiration.getDate() + 1)
      wasProrogated = true
      prorogationReason =
        lang === 'ar'
          ? 'صادف اليوم الأخير يوم سبت (عطلة أسبوعية رسمية)، امتدت المهلة تلقائياً إلى يوم الأحد (المادة 405 CPCA).'
          : 'L’échéance tombait un Samedi (repos légal), reportée de plein droit au Dimanche suivant (Art. 405 CPCA).'
    }

    const today = new Date()
    const diffTime = prorogatedExpiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const formattedInitial = initialExpiration.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const formattedFinal = prorogatedExpiration.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    return {
      initialExpiration,
      prorogatedExpiration,
      wasProrogated,
      prorogationReason,
      formattedInitial,
      formattedFinal,
      diffDays,
    }
  }, [significationDate, selectedRule, lang])

  return (
    <motion.div
      variants={VARIANTS.container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10"
    >
      {/* Module Title Header */}
      <motion.div variants={VARIANTS.item} className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--gold-glow)] text-[var(--gold-400)] border border-[var(--border-gold)]">
            <Scale size={22} />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
              {lang === 'ar'
                ? 'حساب المواعيد والآجال القانونية (CPCA)'
                : 'Calculateur de Délais de Procédure CPCA'}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {lang === 'ar'
                ? 'قانون الإجراءات المدنية والإدارية الجزائري (المواد 304، 327، 336، 354، 405)'
                : 'Code de Procédure Civile et Administrative Algérien (Prélèvement des Jours Fériés et Repos Légal)'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Parameters vs Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ───────────────────────────────────────────────────────────────────
            LEFT COLUMN (7 COLS) — SELECTION FORM & LEGAL FOUNDATION
           ─────────────────────────────────────────────────────────────────── */}
        <motion.div
          variants={VARIANTS.item}
          className="lg:col-span-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] transition-all p-6 shadow-[var(--shadow-card)] space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <h3 className="font-serif text-lg font-bold text-[var(--gold-400)] flex items-center gap-2">
              <CalendarCheck2 size={18} />
              {lang === 'ar' ? 'إعدادات حساب المهلة القانونية' : 'Paramètres de Signification & Déchéance'}
            </h3>
            <span className="text-[0.68rem] font-mono text-[var(--text-muted)] bg-black/40 px-2.5 py-1 rounded border border-[var(--border-subtle)]">
              CPCA DZ v22-13
            </span>
          </div>

          <div className="space-y-4">
            {/* Procedure Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                {lang === 'ar' ? 'نوع إجراء الطعن / القضية القانونية' : 'Voie de Recours / Procédure CPCA'}
              </label>
              <select
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                className="input w-full cursor-pointer py-2.5 text-xs sm:text-sm font-medium"
              >
                {CPCA_RULES.map((rule) => (
                  <option key={rule.id} value={rule.id}>
                    {lang === 'ar' ? `${rule.titleAr} (${rule.codeRef})` : `${rule.titleFr} (${rule.codeRef})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Date input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                {lang === 'ar'
                  ? 'تاريخ التبليغ الرسمي للقرار القضائي'
                  : 'Date de Signification de la Décision (تاريخ التبليغ الرسمي)'}
              </label>
              <input
                type="date"
                value={significationDate}
                onChange={(e) => setSignificationDate(e.target.value)}
                className="input w-full font-mono text-sm py-2.5"
              />
            </div>

            {/* Legal Foundation Highlight Box */}
            <div className="rounded-xl bg-white/[0.025] border border-[var(--border-subtle)] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--gold-400)]">
                <span>{selectedRule.codeRef}</span>
                <span className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wider">
                  {lang === 'ar' ? 'السند القانوني' : 'Fondement Légal'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {lang === 'ar' ? selectedRule.descAr : selectedRule.descFr}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ───────────────────────────────────────────────────────────────────
            RIGHT COLUMN (5 COLS) — CALCULATED EXPIRATION & PROROGATION STATUS
           ─────────────────────────────────────────────────────────────────── */}
        <motion.div variants={VARIANTS.item} className="lg:col-span-5 flex flex-col gap-6">
          {/* Main Expiration Card */}
          <div className="rounded-2xl bg-gradient-to-b from-[var(--bg-elevated)] via-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-gold)] p-6 shadow-[var(--shadow-card)] text-center flex flex-col items-center justify-center relative overflow-hidden space-y-4">
            <div className="p-3 rounded-full bg-[var(--gold-glow)] border border-[var(--border-gold)] text-[var(--gold-400)]">
              <Clock size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {lang === 'ar' ? 'التاريخ الأقصى النهائي لمباشرة الطعن' : "Date Limite d'Exercice du Recours"}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide pt-1">
                {calculation.formattedFinal}
              </h3>
            </div>

            {/* Countdown Badge */}
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border ${
                calculation.diffDays > 10
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : calculation.diffDays > 0
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {calculation.diffDays > 0 ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>
                    {lang === 'ar'
                      ? `متبقي ${calculation.diffDays} يوماً قبل السقوط`
                      : `Il reste ${calculation.diffDays} jours d'action`}
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert size={13} />
                  <span>
                    {lang === 'ar' ? '⚠️ انقضت المهلة القانونية للطعن!' : '⚠️ Délai de recours expiré !'}
                  </span>
                </>
              )}
            </div>

            {/* Quick Actions inside result card */}
            <div className="pt-2 w-full flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('ai_assistant')}
                className="btn-primary w-full justify-center text-xs py-2.5"
              >
                <Sparkles size={14} />
                <span>{lang === 'ar' ? 'صياغة العريضة في الموعد' : 'Rédiger Mémoire de Recours'}</span>
              </button>
            </div>
          </div>

          {/* Prorogation Legal Alert Box (Art. 405 CPCA) */}
          <div className="rounded-xl bg-white/[0.025] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] transition-all p-4 space-y-2 text-xs leading-relaxed">
            <div className="flex items-center gap-2 text-[var(--gold-400)] font-semibold">
              <ShieldAlert size={15} />
              <span>{lang === 'ar' ? 'قاعدة التمديد القانوني (المادة 405 CPCA) :' : 'Prorogation Légale (Art. 405 CPCA) :'}</span>
            </div>

            {calculation.wasProrogated ? (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 space-y-1">
                <p className="font-bold text-[0.75rem]">
                  {lang === 'ar' ? '💡 تم تطبيق التمديد الآلي للمهلة :' : '💡 Prorogation Automatique Appliquée :'}
                </p>
                <p className="text-[0.72rem] leading-normal">{calculation.prorogationReason}</p>
                <p className="text-[0.68rem] opacity-80 pt-0.5">
                  {lang === 'ar'
                    ? `(التاريخ الأصلي كان: ${calculation.formattedInitial})`
                    : `(L'échéance initiale était le : ${calculation.formattedInitial})`}
                </p>
              </div>
            ) : (
              <p className="text-[0.72rem] text-[var(--text-muted)]">
                {lang === 'ar'
                  ? 'إذا صادف اليوم الأخير للمهلة يوم عطلة رسمية أو جمعة/سبت، تمتد المهلة تلقائياً إلى أول يوم عمل موالي (الأحد).'
                  : 'Si le dernier jour du délai tombe un jour férié ou de repos légal (Vendredi/Samedi), le délai est prorogé jusqu’au premier jour ouvrable suivant (Dimanche).'}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
})

AdminCpcaModule.displayName = 'AdminCpcaModule'
