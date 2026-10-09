// AdminCpcaModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & ANTIGRAVITY SPEC)
// CPCA Procedural Deadline Calculator with Automatic Algerian Prorogation (Art. 404/405/406)
// 100% Bespoke Obsidian & Warm Brass • Zero Native Controls • Algerian Legal Calendar
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState, useMemo, useCallback } from 'react'
import { motion, Variants } from 'framer-motion'
import {
  Scale,
  Clock,
  ShieldAlert,
  CalendarCheck2,
  Sparkles,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  FolderOpen,
  BookmarkPlus,
  MapPin,
} from 'lucide-react'
import { useAdminStore, AdminRdv } from '@/stores/adminStore'
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect'
import { CustomDatePicker } from '@/components/ui/CustomDatePicker'
import { BorderBeam } from '@/components/ui/magicui/border-beam'

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

export interface CpcaProcedureRule {
  id: string
  titleFr: string
  titleAr: string
  codeRef: string // Article Code CPCA
  delaiJours: number
  descFr: string
  descAr: string
  badgeAr: string
  badgeFr: string
}

export const CPCA_RULES: CpcaProcedureRule[] = [
  {
    id: 'appel_civil',
    titleFr: "Appel d'un Jugement de Première Instance (Chambre Civile / Foncière / Commerciale)",
    titleAr: 'استئناف حكم ابتدائـي (الغرفة المدنية / العقارية / التجارية)',
    codeRef: 'Art. 336 CPCA / المادة 336',
    delaiJours: 30,
    descFr: "Le délai d'appel est de 30 jours à compter de la signification officielle du jugement à personne ou à domicile réel ou élu.",
    descAr: 'مهلة الاستئناف هي 30 يوماً ابتداءً من تاريخ التبليغ الرسمي للحكم للشخص أو بموطنه الأصلي أو المختار (المادة 336 ق.إ.م.إ).',
    badgeAr: 'استئناف 30 يوماً',
    badgeFr: 'Appel 30j',
  },
  {
    id: 'pourvoi_cassation',
    titleFr: 'Pourvoi en Cassation devant la Cour Suprême / Conseil d’État',
    titleAr: 'الطعن بالنقض أمام المحكمة العليا / مجلس الدولة',
    codeRef: 'Art. 354 CPCA / المادة 354',
    delaiJours: 60,
    descFr: "Le délai de pourvoi en cassation est de deux (02) mois (60 jours) à compter de la signification de l'arrêt d'appel.",
    descAr: 'مهلة الطعن بالنقض هي شهران (60 يوماً) ابتداءً من تاريخ التبليغ الرسمي لقرار المجلس القضائي (المادة 354 ق.إ.م.إ).',
    badgeAr: 'نقض 60 يوماً',
    badgeFr: 'Cassation 60j',
  },
  {
    id: 'opposition_defaut',
    titleFr: 'Opposition contre un Jugement par Défaut (معارضة)',
    titleAr: 'الاعتراض على حكم غيابي (معارضة)',
    codeRef: 'Art. 327 CPCA / المادة 327',
    delaiJours: 10,
    descFr: "L'opposition doit être formée dans les 10 jours à compter de la signification du jugement rendu par défaut.",
    descAr: 'يجب تقديم المعارضة في أجل عشرة (10) أيام ابتداءً من تاريخ التبليغ الرسمي للحكم الغيابي (المادة 327 ق.إ.م.إ).',
    badgeAr: 'معارضة 10 أيام',
    badgeFr: 'Opposition 10j',
  },
  {
    id: 'recours_refere',
    titleFr: "Appel d'une Ordonnance de Référé (القضاء المستعجل)",
    titleAr: 'استئناف أمر استعجالي (قسم الاستعجالي)',
    codeRef: 'Art. 304 CPCA / المادة 304',
    delaiJours: 15,
    descFr: "L'appel contre les ordonnances de référé doit être interjeté dans un délai strict de 15 jours à compter de la signification.",
    descAr: 'يجب تقديم الاستئناف ضد الأوامر الاستعجالية في أجل أقصاه 15 يوماً من تاريخ التبليغ الرسمي (المادة 304 ق.إ.م.إ).',
    badgeAr: 'مستعجل 15 يوماً',
    badgeFr: 'Référé 15j',
  },
  {
    id: 'appel_ordonnance_sur_requete',
    titleFr: "Appel d'une Ordonnance sur Requête (الأوامر على العرائض)",
    titleAr: 'استئناف أمر على عريضة برفض الطلب',
    codeRef: 'Art. 312 CPCA / المادة 312',
    delaiJours: 15,
    descFr: "En cas de rejet de la requête, appel peut être interjeté dans les 15 jours du prononcé de l'ordonnance.",
    descAr: 'في حالة رفض الطلب، يجوز استئناف الأمر على عريضة خلال 15 يوماً من تاريخ النطق بالأمر (المادة 312 ق.إ.م.إ).',
    badgeAr: 'أمر عريضة 15 يوماً',
    badgeFr: 'Sur requête 15j',
  },
  {
    id: 'tierce_opposition',
    titleFr: 'Tierce Opposition (اعتراض الغير الخارج عن الخصومة)',
    titleAr: 'اعتراض الغير الخارج عن الخصومة',
    codeRef: 'Art. 384 CPCA / المادة 384',
    delaiJours: 30,
    descFr: "La tierce opposition est recevable dans les 30 jours à compter de la signification du jugement ou de la connaissance avérée.",
    descAr: 'يقبل اعتراض الغير الخارج عن الخصومة في أجل 30 يوماً من تاريخ التبليغ أو العلم اليقيني بالحكم (المادة 384 ق.إ.م.إ).',
    badgeAr: 'اعتراض غير 30 يوماً',
    badgeFr: 'Tierce opp. 30j',
  },
  {
    id: 'recours_retractation',
    titleFr: 'Recours en Rétractation (التماس إعادة النظر)',
    titleAr: 'التماس إعادة النظر في الأحكام والقرارات الانتهائية',
    codeRef: 'Art. 392 CPCA / المادة 392',
    delaiJours: 60,
    descFr: "Le délai d'exercice du recours en rétractation est de deux (02) mois (60 jours) à compter de la signification.",
    descAr: 'مهلة التماس إعادة النظر هي شهران (60 يوماً) ابتداءً من تاريخ التبليغ الرسمي للحكم الحائز لقوة الشيء المقضي به (المادة 392 ق.إ.م.إ).',
    badgeAr: 'إعادة نظر 60 يوماً',
    badgeFr: 'Rétractation 60j',
  },
]

const MONTHS_DZ = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]
const DAYS_AR_FULL = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const DAYS_FR_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

// Algerian National Holidays (MM-DD)
const FIXED_HOLIDAYS_DZ: Record<string, { nameAr: string; nameFr: string }> = {
  '01-01': { nameAr: 'رأس السنة الميلادية', nameFr: "Jour de l'An" },
  '01-12': { nameAr: 'رأس السنة الأمازيغية (يناير)', nameFr: 'Yennayer' },
  '05-01': { nameAr: 'عيد العمال العالمي', nameFr: 'Fête du Travail' },
  '07-05': { nameAr: 'عيد الاستقلال والشباب', nameFr: "Fête de l'Indépendance" },
  '11-01': { nameAr: 'ذكرى اندلاع الثورة التحريرية', nameFr: 'Fête de la Révolution' },
}

export const AdminCpcaModule = memo(() => {
  const { lang, dossiers, addRdv, setActiveTab } = useAdminStore()
  const isAr = lang === 'ar'

  const [selectedRuleId, setSelectedRuleId] = useState<string>('appel_civil')
  const [significationDate, setSignificationDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? '2026-10-09'
  )
  const [distanceMode, setDistanceMode] = useState<'none' | 'south' | 'abroad'>('none')
  const [selectedDossierId, setSelectedDossierId] = useState<string>('')
  const [isCopied, setIsCopied] = useState(false)
  const [agendaNotice, setAgendaNotice] = useState<string | null>(null)

  const selectedRule = useMemo(
    () => CPCA_RULES.find((r) => r.id === selectedRuleId) ?? CPCA_RULES[0]!,
    [selectedRuleId]
  )

  const selectedDossier = useMemo(
    () => dossiers.find((d) => d.id === selectedDossierId) ?? null,
    [dossiers, selectedDossierId]
  )

  // Options for custom selects
  const procedureOptions: SelectOption[] = useMemo(() => {
    return CPCA_RULES.map((rule) => ({
      value: rule.id,
      label: isAr ? rule.titleAr : rule.titleFr,
      badge: isAr ? rule.badgeAr : rule.badgeFr,
    }))
  }, [isAr])

  const dossierOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [
      {
        value: '',
        label: isAr ? '— حساب حر (دون ربط بقضية) —' : '— Calcul libre (Sans dossier lié) —',
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

    // Auto-match rule if chamber or type indicates it
    if (d.jurisdiction.toLowerCase().includes('suprême') || d.jurisdiction.toLowerCase().includes('conseil')) {
      setSelectedRuleId('pourvoi_cassation')
    } else {
      setSelectedRuleId('appel_civil')
    }
  }

  // ─── ALGERIAN LEGAL DEADLINE & PROROGATION CALCULATION (Art. 404/405 CPCA) ───
  const calculation = useMemo(() => {
    // 1. Base date parsing
    const parts = significationDate.split('-').map(Number)
    const startYear = parts[0] || 2026
    const startMonth = (parts[1] || 1) - 1
    const startDay = parts[2] || 1
    const startDate = new Date(startYear, startMonth, startDay)

    // 2. Extra Distance Days (Art. 404 CPCA)
    let extraDistance = 0
    if (distanceMode === 'abroad') {
      extraDistance = 30 // شهر واحد للمقيمين بالخارج طبقاً للمادة 404 ق.إ.م.إ
    } else if (distanceMode === 'south') {
      extraDistance = 15 // مهلة المسافة للمناطق النائية
    }

    const totalDays = selectedRule.delaiJours + extraDistance

    // 3. Initial Theoretical Expiration Date
    const initialExpiration = new Date(startDate)
    initialExpiration.setDate(initialExpiration.getDate() + totalDays)

    // 4. Prorogation Check Loop (Art. 405 CPCA)
    // If the last day is a weekend (Friday/Saturday) or Algerian public holiday,
    // the deadline is extended to the very first following business day (Sunday).
    let prorogatedExpiration = new Date(initialExpiration)
    let wasProrogated = false
    let prorogationReasons: string[] = []

    let isBusinessDay = false
    let loopCount = 0

    while (!isBusinessDay && loopCount < 10) {
      loopCount++
      const dayOfWeek = prorogatedExpiration.getDay() // 0 = Dimanche, 5 = Vendredi, 6 = Samedi
      const monthStr = String(prorogatedExpiration.getMonth() + 1).padStart(2, '0')
      const dayStr = String(prorogatedExpiration.getDate()).padStart(2, '0')
      const mmdd = `${monthStr}-${dayStr}`
      const holiday = FIXED_HOLIDAYS_DZ[mmdd]

      if (dayOfWeek === 5) {
        // Friday
        wasProrogated = true
        prorogationReasons.push(
          isAr
            ? 'صادف اليوم الأخير يوم جمعة (عطلة أسبوعية رسمية)'
            : 'L’échéance tombait un Vendredi (repos légal)'
        )
        prorogatedExpiration.setDate(prorogatedExpiration.getDate() + 1)
      } else if (dayOfWeek === 6) {
        // Saturday
        wasProrogated = true
        prorogationReasons.push(
          isAr
            ? 'صادف اليوم الأخير يوم سبت (عطلة أسبوعية رسمية)'
            : 'L’échéance tombait un Samedi (repos légal)'
        )
        prorogatedExpiration.setDate(prorogatedExpiration.getDate() + 1)
      } else if (holiday) {
        // Official Algerian Public Holiday
        wasProrogated = true
        prorogationReasons.push(
          isAr
            ? `صادف اليوم عطلة رسمية مدفوعة الأجر (${holiday.nameAr})`
            : `Jour férié chômé et payé (${holiday.nameFr})`
        )
        prorogatedExpiration.setDate(prorogatedExpiration.getDate() + 1)
      } else {
        isBusinessDay = true
      }
    }

    // 5. Difference in days relative to current moment
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(prorogatedExpiration)
    compareDate.setHours(0, 0, 0, 0)
    const diffTime = compareDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Formatter helpers
    const formatAlgerianDate = (d: Date) => {
      const dName = isAr ? DAYS_AR_FULL[d.getDay()] : DAYS_FR_FULL[d.getDay()]
      const dayNum = d.getDate()
      const mName = isAr ? MONTHS_DZ[d.getMonth()] : MONTHS_FR[d.getMonth()]
      const yNum = d.getFullYear()
      return isAr ? `${dName}، ${dayNum} ${mName} ${yNum}` : `${dName} ${dayNum} ${mName} ${yNum}`
    }

    const formattedInitial = formatAlgerianDate(initialExpiration)
    const formattedFinal = formatAlgerianDate(prorogatedExpiration)
    const formattedStart = formatAlgerianDate(startDate)

    const prorogationText = wasProrogated
      ? isAr
        ? `${prorogationReasons.join(' ثم ')}، ومُدد الأجل تلقائياً إلى أول يوم عمل موالٍ (المادة 405 ق.إ.م.إ).`
        : `${prorogationReasons.join(', puis ')} : délai prorogé de plein droit au premier jour ouvrable suivant (Art. 405 CPCA).`
      : isAr
      ? 'اليوم الأخير يوم عمل عادي، ينتهي الأجل في تمام نهايته دون تمديد.'
      : 'Le dernier jour est un jour ouvrable standard sans prorogation nécessaire.'

    return {
      startDate,
      initialExpiration,
      prorogatedExpiration,
      totalDays,
      extraDistance,
      wasProrogated,
      prorogationText,
      formattedStart,
      formattedInitial,
      formattedFinal,
      diffDays,
    }
  }, [significationDate, selectedRule, distanceMode, isAr])

  // Copy structured CPCA calculation to clipboard
  const handleCopySummary = useCallback(async () => {
    const text = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
مكتب الأستاذ نور الدين سليماني — الجزائر العاصمة
شهادة حساب الآجال والمواعيد القضائية (CPCA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• الإجراء القانوني: ${isAr ? selectedRule.titleAr : selectedRule.titleFr}
• السند القانوني: ${selectedRule.codeRef}
${selectedDossier ? `• القضية المربوطة: ${selectedDossier.reference} (${isAr && selectedDossier.clientNameAr ? selectedDossier.clientNameAr : selectedDossier.clientName})` : ''}
• تاريخ التبليغ الرسمي: ${calculation.formattedStart}
• مهلة الطعن الأساسية: ${selectedRule.delaiJours} يوماً
${calculation.extraDistance > 0 ? `• تمديد المسافة (المادة 404): +${calculation.extraDistance} يوماً\n` : ''}• التاريخ الأقصى النظري: ${calculation.formattedInitial}
• التمديد الإجرائي (المادة 405): ${calculation.wasProrogated ? 'نعم (انظر التفصيل أدناه)' : 'لا يوجد (يوم عمل عادي)'}
${calculation.wasProrogated ? `• سبب التمديد: ${calculation.prorogationText}\n` : ''}
★ التاريخ النهائي المسقط للحق في الطعن:
>>> ${calculation.formattedFinal} <<<
• الحالة الحالية: ${calculation.diffDays > 0 ? `متبقي ${calculation.diffDays} يوماً` : 'انقضت المهلة'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تنبيه مهني: يوصى بإيداع العريضة وقيدها قبل انقضاء الأجل بـ 48 ساعة على الأقل.
`.trim()

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch {
      // Fallback
    }
  }, [selectedRule, selectedDossier, calculation, isAr])

  // Register an automated alert in the firm's Agenda (AdminRdvs)
  const handleAddToAgenda = useCallback(() => {
    const finalDateStr = calculation.prorogatedExpiration.toISOString().split('T')[0] ?? significationDate
    const client = selectedDossier
      ? isAr && selectedDossier.clientNameAr ? selectedDossier.clientNameAr : selectedDossier.clientName
      : isAr ? 'ملف استشاري / طعن' : 'Dossier Procédural'

    const newRdv: AdminRdv = {
      id: `alert-cpca-${Date.now()}`,
      clientName: client,
      clientNameAr: client,
      telephone: selectedDossier ? selectedDossier.clientPhone : '0662 26 53 00',
      email: selectedDossier ? selectedDossier.clientEmail : 'cabinet@slimani-avocat.dz',
      date: finalDateStr,
      heureDebut: '09:00',
      heureFin: '11:30',
      motif: `[أجل مسقط CPCA] ${selectedRule.titleFr} (${selectedRule.codeRef})`,
      motifAr: `[أجل مسقط CPCA] ${selectedRule.titleAr} (${selectedRule.codeRef})`,
      chambre: selectedDossier ? selectedDossier.chamber : 'CIVIL',
      statut: 'Confirmé',
      creneauType: 'Cabinet (Bir Khadem)',
    }

    addRdv(newRdv)
    const successMsg = isAr
      ? `✓ تم تثبيت أجل السقوط بنجاح في جدول المواعيد بتاريخ ${calculation.formattedFinal}.`
      : `✓ Échéance CPCA enregistrée dans l'agenda au ${calculation.formattedFinal}.`

    setAgendaNotice(successMsg)
    setTimeout(() => setAgendaNotice(null), 4000)
  }, [calculation, selectedDossier, selectedRule, addRdv, significationDate, isAr])

  // Direct print action
  const handlePrintNotice = useCallback(() => {
    window.print()
  }, [])

  return (
    <motion.div
      variants={VARIANTS.container}
      initial="hidden"
      animate="show"
      className="relative flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10"
    >
      {/* ── HEADER BANNER (QUIET LUXURY BORDER BEAM) ──────────────────── */}
      <motion.div
        variants={VARIANTS.item}
        className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-[#121526]/90 p-5 sm:p-6 shadow-2xl shadow-black/50 backdrop-blur-md transition-all"
      >
        <BorderBeam size={180} duration={8} colorFrom="#C39B57" colorTo="#E8C77A" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <h2 className="flex items-center gap-3 font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
              <span className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Scale size={26} strokeWidth={2} />
              </span>
              <span>
                {isAr ? (
                  <>
                    حساب المواعيد والآجال القانونية والتمديد الإجرائي{' '}
                    <span dir="ltr" className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                      CPCA 08-09 / 22-13
                    </span>
                  </>
                ) : (
                  'Calculateur de Délais de Procédure CPCA & Prorogation Légale'
                )}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              {isAr ? (
                <>
                  قانون الإجراءات المدنية والإدارية الجزائري — تطبيق آلي لقواعد السقوط وتمديد المسافة والعطل الرسمية{' '}
                  <span dir="ltr" className="font-mono text-xs text-amber-300">
                    (Art. 304, 327, 336, 354, 404, 405)
                  </span>
                </>
              ) : (
                'Code de Procédure Civile et Administrative — Calcul automatisé des déchéances, délais de distance et repos légaux.'
              )}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handlePrintNotice}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141829] border border-white/10 text-stone-200 hover:border-amber-500/40 hover:text-white transition-all cursor-pointer shadow-sm"
              title={isAr ? 'طباعة شهادة الآجال' : 'Imprimer le relevé'}
            >
              <Printer size={14} className="text-amber-400" />
              <span>{isAr ? 'طباعة الشهادة' : 'Imprimer'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141829] border border-white/10 text-stone-200 hover:border-amber-500/40 hover:text-white transition-all cursor-pointer shadow-sm"
              title={isAr ? 'نسخ ملخص الآجال' : 'Copier'}
            >
              {isCopied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{isAr ? 'تم النسخ!' : 'Copié !'}</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-amber-400" />
                  <span>{isAr ? 'نسخ الحساب' : 'Copier'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Agenda Alert Confirmation Toast */}
      {agendaNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 flex items-center justify-between text-emerald-300 text-sm font-semibold shadow-lg"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <span>{agendaNotice}</span>
          </div>
          <button
            type="button"
            className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
            onClick={() => setAgendaNotice(null)}
          >
            {isAr ? 'إغلاق' : 'Fermer'}
          </button>
        </motion.div>
      )}

      {/* ── MAIN GRID: PARAMETERS FORM vs RESULT DISPLAY ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ───────────────────────────────────────────────────────────────────
            LEFT COLUMN (7 COLS) — SELECTION FORM & LEGAL FOUNDATION
           ─────────────────────────────────────────────────────────────────── */}
        <motion.div
          variants={VARIANTS.item}
          className="lg:col-span-7 rounded-2xl bg-[#121526]/90 border border-white/10 hover:border-amber-500/30 transition-all p-5 sm:p-6 shadow-xl shadow-black/40 backdrop-blur-md space-y-5"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <h3 className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <CalendarCheck2 size={18} />
              </span>
              <span>{isAr ? 'إعدادات حساب المهلة القانونية' : 'Paramètres de Signification & Déchéance'}</span>
            </h3>
            <span className="text-[0.68rem] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-bold">
              CPCA DZ v22-13
            </span>
          </div>

          <div className="space-y-4">
            {/* Dossier Quick-Link Selector */}
            <div className="rounded-xl border border-amber-500/20 bg-[#0f1222]/80 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <FolderOpen size={14} />
                  <span>{isAr ? 'ربط بقضية جارية من سجل المكتب (اختياري)' : 'Lier à un dossier du cabinet (Optionnel)'}</span>
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

            {/* Procedure Selector with CustomSelect (0 native select) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 block">
                {isAr ? 'نوع إجراء الطعن / القضية القانونية *' : 'Voie de Recours / Procédure CPCA *'}
              </label>
              <CustomSelect
                value={selectedRuleId}
                onChange={(val) => setSelectedRuleId(val)}
                options={procedureOptions}
                dir={isAr ? 'rtl' : 'ltr'}
                align={isAr ? 'right' : 'left'}
                className="w-full"
                buttonClassName="py-2.5 text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Signification Date with CustomDatePicker (0 native date input) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 block">
                {isAr
                  ? 'تاريخ التبليغ الرسمي للحكم أو القرار القضائي *'
                  : 'Date de Signification de la Décision Judiciaire *'}
              </label>
              <CustomDatePicker
                value={significationDate}
                onChange={(newDate) => setSignificationDate(newDate)}
                dir={isAr ? 'rtl' : 'ltr'}
                align="auto"
                className="w-full"
                buttonClassName="py-2.5 text-xs sm:text-sm"
              />
            </div>

            {/* Distance Extension Options (Art. 404 CPCA) */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-amber-400" />
                  <span>{isAr ? 'تمديد المسافة الجغرافية (المادة 404 ق.إ.م.إ) :' : 'Délai de Distance (Art. 404 CPCA) :'}</span>
                </span>
                <span className="text-[0.68rem] text-stone-400 font-mono">
                  {distanceMode === 'abroad'
                    ? (isAr ? '+30 يوماً للمقيمين بالخارج' : '+30 jours (Étranger)')
                    : distanceMode === 'south'
                    ? (isAr ? '+15 يوماً للأقاليم الجنوبية' : '+15 jours (Grand Sud)')
                    : (isAr ? 'بدون تمديد مسافة' : 'Sans distance')}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDistanceMode('none')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    distanceMode === 'none'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm font-bold'
                      : 'bg-[#141829] text-stone-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {isAr ? 'عادي (0 يوم)' : 'Normal (0 jour)'}
                </button>

                <button
                  type="button"
                  onClick={() => setDistanceMode('south')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    distanceMode === 'south'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm font-bold'
                      : 'bg-[#141829] text-stone-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {isAr ? 'أقاليم الجنوب (+15 يوماً)' : 'Grand Sud (+15 jours)'}
                </button>

                <button
                  type="button"
                  onClick={() => setDistanceMode('abroad')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    distanceMode === 'abroad'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm font-bold'
                      : 'bg-[#141829] text-stone-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {isAr ? 'مقيم بالخارج (+30 يوماً)' : 'Résidant à l’Étranger (+30j)'}
                </button>
              </div>
            </div>

            {/* Legal Foundation Highlight Box */}
            <div className="rounded-xl bg-[#0f1222]/90 border border-white/10 p-4 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Scale size={14} />
                  <span>{selectedRule.codeRef}</span>
                </span>
                <span className="text-[0.68rem] text-stone-400 font-mono uppercase tracking-wider">
                  {isAr ? 'السند القانوني الصريح' : 'Fondement Légal'}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {isAr ? selectedRule.descAr : selectedRule.descFr}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ───────────────────────────────────────────────────────────────────
            RIGHT COLUMN (5 COLS) — CALCULATED EXPIRATION & PROROGATION STATUS
           ─────────────────────────────────────────────────────────────────── */}
        <motion.div variants={VARIANTS.item} className="lg:col-span-5 flex flex-col gap-5">
          {/* Main Expiration Card */}
          <div className="rounded-2xl bg-gradient-to-b from-[#161a30] via-[#121526] to-[#0f1222] border border-amber-500/30 p-6 shadow-2xl shadow-black/50 text-center flex flex-col items-center justify-center relative overflow-hidden space-y-4">
            {/* Glowing Clock Emblem */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-amber-500/20 blur-md" />
              <div className="relative p-3.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
                <Clock size={34} strokeWidth={2.2} />
              </div>
            </div>

            {/* Linked Case Reference Pill */}
            {selectedDossier && (
              <div className="text-[0.72rem] bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20 font-medium">
                {isAr ? 'القضية رقم :' : 'Dossier :'} {selectedDossier.reference} •{' '}
                {isAr && selectedDossier.clientNameAr ? selectedDossier.clientNameAr : selectedDossier.clientName}
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-stone-400 block">
                {isAr ? 'التاريخ الأقصى النهائي لمباشرة الطعن (تاريخ السقوط)' : "Date Limite d'Exercice du Recours (Déchéance)"}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide pt-1 leading-snug">
                {calculation.formattedFinal}
              </h3>
            </div>

            {/* Countdown Badge */}
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full border ${
                calculation.diffDays > 10
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : calculation.diffDays > 0
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {calculation.diffDays > 0 ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>
                    {isAr
                      ? `متبقي ${calculation.diffDays} يوماً قبل السقوط الإجرائي`
                      : `Il reste ${calculation.diffDays} jours d'action`}
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert size={14} />
                  <span>
                    {isAr ? '⚠️ انقضت المهلة القانونية المقررة للطعن!' : '⚠️ Délai de recours expiré !'}
                  </span>
                </>
              )}
            </div>

            {/* Procedural Breakdown Mini-Table */}
            <div className="w-full bg-[#0a0d1a]/80 rounded-xl border border-white/5 p-3.5 text-xs space-y-1.5 text-start dir-rtl">
              <div className="flex justify-between text-stone-400">
                <span>{isAr ? 'تاريخ التبليغ الرسمي :' : 'Date de signification :'}</span>
                <span className="font-mono text-white">{calculation.formattedStart}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>{isAr ? 'المهلة الأساسية المحتسبة :' : 'Délai légal de base :'}</span>
                <span className="font-mono text-amber-400 font-bold">{selectedRule.delaiJours} {isAr ? 'يوماً' : 'jours'}</span>
              </div>
              {calculation.extraDistance > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>{isAr ? 'تمديد المسافة (المادة 404) :' : 'Délai de distance :'}</span>
                  <span className="font-mono font-bold">+{calculation.extraDistance} {isAr ? 'يوماً' : 'jours'}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-400">
                <span>{isAr ? 'الأجل النظري الأولي :' : 'Échéance initiale :'}</span>
                <span className="font-mono text-stone-300">{calculation.formattedInitial}</span>
              </div>
              <div className="flex justify-between text-stone-400 pt-1 border-t border-white/5">
                <span>{isAr ? 'تمديد العطل والجمعة/السبت :' : 'Prorogation repos/fériés :'}</span>
                <span className={`font-mono font-bold ${calculation.wasProrogated ? 'text-amber-400' : 'text-stone-400'}`}>
                  {calculation.wasProrogated ? (isAr ? 'مُمدد للموالي ✓' : 'Prorogé ✓') : (isAr ? 'لا يوجد' : 'Aucune')}
                </span>
              </div>
            </div>

            {/* Quick Actions inside result card */}
            <div className="pt-2 w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('ai_assistant')}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200
                  bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950
                  hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
              >
                <Sparkles size={14} />
                <span>{isAr ? 'صياغة عريضة الطعن بالذكاء الاصطناعي' : 'Rédiger Mémoire de Recours IA'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToAgenda}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold
                  bg-[#141829] border border-white/10 hover:border-amber-500/40 text-stone-200 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <BookmarkPlus size={14} className="text-amber-400" />
                <span>{isAr ? 'تثبيت تنبيه في جدول المواعيد (Agenda)' : 'Enregistrer dans l’Agenda du Cabinet'}</span>
              </button>
            </div>
          </div>

          {/* Prorogation Legal Alert Box (Art. 405 CPCA) */}
          <div className="rounded-xl bg-[#121526]/90 border border-white/10 hover:border-amber-500/30 transition-all p-4 space-y-2 text-xs leading-relaxed">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldAlert size={16} />
              <span>{isAr ? 'قاعدة التمديد القانوني (المادة 405 ق.إ.م.إ) :' : 'Prorogation Légale (Art. 405 CPCA) :'}</span>
            </div>

            {calculation.wasProrogated ? (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 space-y-1.5">
                <p className="font-bold text-[0.75rem] flex items-center gap-1.5">
                  <span>💡</span>
                  <span>{isAr ? 'تم تطبيق التمديد التلقائي للمهلة بنص القانون :' : 'Prorogation Automatique Appliquée :'}</span>
                </p>
                <p className="text-[0.72rem] leading-normal">{calculation.prorogationText}</p>
                <p className="text-[0.68rem] text-stone-400 pt-0.5">
                  {isAr
                    ? `(التاريخ النظري قبل التمديد كان: ${calculation.formattedInitial})`
                    : `(L'échéance théorique avant prorogation était le : ${calculation.formattedInitial})`}
                </p>
              </div>
            ) : (
              <p className="text-[0.72rem] text-stone-400 leading-relaxed">
                {isAr
                  ? 'طبقاً للمادة 405 من قانون الإجراءات المدنية والإدارية: إذا صادف اليوم الأخير للمهلة يوم عطلة رسمية أو يوم جمعة أو سبت، تمتد المهلة تلقائياً إلى أول يوم عمل موالٍ (يوم الأحد).'
                  : 'Conformément à l’Art. 405 du CPCA : Si le dernier jour du délai coïncide avec un jour férié ou un jour de repos légal (Vendredi ou Samedi), le délai est prorogé de plein droit jusqu’au premier jour ouvrable suivant (Dimanche).'}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
})

AdminCpcaModule.displayName = 'AdminCpcaModule'
