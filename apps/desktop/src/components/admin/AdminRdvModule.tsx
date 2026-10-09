// AdminRdvModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Module de gestion de l'Agenda & Rendez-vous (Cabinet, Audiences & Visioconférences)
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Video,
  Building2,
  Search,
  Phone,
  Mail,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Scale,
  Copy,
  Check,
  X,
  Sparkles,
  CalendarDays,
  Gavel,
} from 'lucide-react'
import { useAdminStore, AdminRdv } from '@/stores/adminStore'
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect'
import { CustomDatePicker } from '@/components/ui/CustomDatePicker'
import { CustomTimePicker } from '@/components/ui/CustomTimePicker'

const VARIANTS = {
  container: {
    animate: { transition: { staggerChildren: 0.04 } },
  },
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  },
}

const MONTHS_AR: Record<string, string> = {
  '01': 'جانفي',
  '02': 'فيفري',
  '03': 'مارس',
  '04': 'أفريل',
  '05': 'ماي',
  '06': 'جوان',
  '07': 'جويلية',
  '08': 'أوت',
  '09': 'سبتمبر',
  '10': 'أكتوبر',
  '11': 'نوفمبر',
  '12': 'ديسمبر',
}

const MONTHS_FR: Record<string, string> = {
  '01': 'Janvier',
  '02': 'Février',
  '03': 'Mars',
  '04': 'Avril',
  '05': 'Mai',
  '06': 'Juin',
  '07': 'Juillet',
  '08': 'Août',
  '09': 'Septembre',
  '10': 'Octobre',
  '11': 'Novembre',
  '12': 'Décembre',
}

function parseRdvDate(dateStr: string, lang: 'ar' | 'fr') {
  if (!dateStr || !dateStr.includes('-')) {
    return { day: '01', month: lang === 'ar' ? 'جانفي' : 'Janvier', year: '2026', weekday: '' }
  }
  const parts = dateStr.split('-')
  const year = parts[0] ?? '2026'
  const monthKey = parts[1] ?? '01'
  const day = parts[2] ?? '01'
  const month = lang === 'ar' ? (MONTHS_AR[monthKey] || monthKey) : (MONTHS_FR[monthKey] || monthKey)

  let weekday = ''
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      weekday = d.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'long' })
    }
  } catch {
    weekday = ''
  }

  return { day, month, year, weekday }
}

export const AdminRdvModule = memo(() => {
  const { rdvs, updateRdvStatut, addRdv, openQuittanceFor, lang } = useAdminStore()
  const isAr = lang === 'ar'

  const [filterStatut, setFilterStatut] = useState<string>('all')
  const [filterType, setFilterType] = useState<'all' | 'cabinet' | 'audience' | 'visio'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null)

  // Modal State for New RDV
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [clientName, setClientName] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState('2026-08-25')
  const [heureDebut, setHeureDebut] = useState('10:00')
  const [heureFin, setHeureFin] = useState('10:45')
  const [creneauType, setCreneauType] = useState<'Cabinet (Bir Khadem)' | 'Visioconférence'>('Cabinet (Bir Khadem)')
  const [isAudience, setIsAudience] = useState(false)
  const [chambre, setChambre] = useState('')
  const [motif, setMotif] = useState('')
  const [motifRenvoi, setMotifRenvoi] = useState('')
  const [initialStatut, setInitialStatut] = useState<AdminRdv['statut']>('Confirmé')

  // Stats calculation
  const stats = useMemo(() => {
    const total = rdvs.length
    const confirme = rdvs.filter((r) => r.statut === 'Confirmé').length
    const enAttente = rdvs.filter((r) => r.statut === 'En attente').length
    const cabinet = rdvs.filter((r) => r.creneauType.includes('Cabinet')).length
    const audiences = rdvs.filter(
      (r) =>
        r.motif.toLowerCase().includes('audience') ||
        (r.motifAr && r.motifAr.includes('جلسة')) ||
        Boolean(r.chambre)
    ).length
    const visio = rdvs.filter((r) => r.creneauType.includes('Visioconférence')).length

    return { total, confirme, enAttente, cabinet, audiences, visio }
  }, [rdvs])

  // Options for Status Filter
  const statusFilterOptions: SelectOption[] = useMemo(
    () => [
      {
        value: 'all',
        label: isAr ? 'جميع الحالات' : 'Tous les statuts',
        badge: String(stats.total),
      },
      {
        value: 'Confirmé',
        label: isAr ? 'مؤكد' : 'Confirmé',
        icon: <CheckCircle2 size={14} className="text-emerald-400" />,
        badge: String(stats.confirme),
      },
      {
        value: 'En attente',
        label: isAr ? 'قيد الانتظار' : 'En attente',
        icon: <Clock size={14} className="text-amber-400" />,
        badge: String(stats.enAttente),
      },
      {
        value: 'Terminé',
        label: isAr ? 'مكتمل' : 'Terminé',
        icon: <CheckCircle2 size={14} className="text-[#C39B57]" />,
      },
      {
        value: 'Annulé',
        label: isAr ? 'ملغى' : 'Annulé',
        icon: <XCircle size={14} className="text-rose-400" />,
      },
    ],
    [isAr, stats]
  )

  // Status Change Options for individual cards
  const cardStatusOptions: SelectOption[] = useMemo(
    () => [
      {
        value: 'Confirmé',
        label: isAr ? '✓ مؤكد' : '✓ Confirmé',
        icon: <CheckCircle2 size={14} className="text-emerald-400" />,
      },
      {
        value: 'En attente',
        label: isAr ? '⏳ قيد الانتظار' : '⏳ En attente',
        icon: <Clock size={14} className="text-amber-400" />,
      },
      {
        value: 'Terminé',
        label: isAr ? '✔ مكتمل' : '✔ Terminé',
        icon: <CheckCircle2 size={14} className="text-[#C39B57]" />,
      },
      {
        value: 'Annulé',
        label: isAr ? '✕ ملغى' : '✕ Annulé',
        icon: <XCircle size={14} className="text-rose-400" />,
      },
    ],
    [isAr]
  )

  // Filtered RDVs
  const filteredRdvs = useMemo(() => {
    return rdvs.filter((rdv) => {
      // Status filter
      const matchesStatut = filterStatut === 'all' || rdv.statut === filterStatut

      // Type filter
      let matchesType = true
      if (filterType === 'cabinet') {
        matchesType = rdv.creneauType.includes('Cabinet') && !rdv.chambre
      } else if (filterType === 'audience') {
        matchesType =
          Boolean(rdv.chambre) ||
          rdv.motif.toLowerCase().includes('audience') ||
          (rdv.motifAr ? rdv.motifAr.includes('جلسة') : false)
      } else if (filterType === 'visio') {
        matchesType = rdv.creneauType.includes('Visioconférence')
      }

      // Search term
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !term ||
        rdv.clientName.toLowerCase().includes(term) ||
        (rdv.clientNameAr && rdv.clientNameAr.toLowerCase().includes(term)) ||
        rdv.motif.toLowerCase().includes(term) ||
        (rdv.motifAr && rdv.motifAr.toLowerCase().includes(term)) ||
        rdv.telephone.includes(term) ||
        (rdv.chambre && rdv.chambre.toLowerCase().includes(term))

      return matchesStatut && matchesType && matchesSearch
    })
  }, [rdvs, filterStatut, filterType, searchTerm])

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone)
    setCopiedPhoneId(id)
    setTimeout(() => setCopiedPhoneId(null), 2000)
  }

  const handleCreateRdv = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) return

    addRdv({
      clientName: clientName.trim(),
      clientNameAr: isAr ? clientName.trim() : undefined,
      telephone: telephone.trim() || '0661 00 00 00',
      email: email.trim() || 'contact@client.dz',
      date,
      heureDebut,
      heureFin,
      motif: motif.trim() || (isAr ? 'استشارة قانونية وتوجيه قضائي' : 'Consultation juridique'),
      motifAr: isAr ? (motif.trim() || 'استشارة قانونية وتوجيه قضائي') : undefined,
      chambre: isAudience && chambre ? chambre.trim() : undefined,
      motifRenvoi: isAudience && motifRenvoi ? motifRenvoi.trim() : undefined,
      statut: initialStatut,
      creneauType,
    })

    // Reset & close
    setClientName('')
    setTelephone('')
    setEmail('')
    setMotif('')
    setChambre('')
    setMotifRenvoi('')
    setIsAudience(false)
    setIsAddModalOpen(false)
  }

  return (
    <motion.div
      variants={VARIANTS.container}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full pb-10"
    >
      {/* ── TOP HEADER & LUXURY CONTROLS ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CalendarDays size={22} />
            </span>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                {isAr ? 'إدارة الأجندة والمواعيد والجلسات' : "Gestion de l'Agenda & Audiences"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                {isAr
                  ? 'مواعيد الاستشارات بمقر المكتب ببئر خادم، الجلسات القضائية والاجتماعات المرئية الآمنة'
                  : 'Consultations en cabinet à Bir Khadem, audiences judiciaires et visioconférences sécurisées'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
              bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950
              hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>{isAr ? 'موعد / جلسة جديدة' : 'Nouveau Rendez-vous'}</span>
          </button>
        </div>
      </div>

      {/* ── EXECUTIVE METRICS PULSE STRIP ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#121526]/80 border border-white/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-stone-400">{isAr ? 'إجمالي المواعيد' : 'Total RDVs'}</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 text-stone-300">
            <Calendar size={18} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121526]/80 border border-emerald-500/20 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-emerald-400/90">{isAr ? 'مواعيد مؤكدة' : 'Confirmés'}</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{stats.confirme}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121526]/80 border border-amber-500/20 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-amber-400/90">{isAr ? 'قيد الانتظار' : 'En attente'}</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{stats.enAttente}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock size={18} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121526]/80 border border-cyan-500/20 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-cyan-400/90">{isAr ? 'جلسات المحاكم' : 'Audiences'}</div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{stats.audiences}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Scale size={18} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121526]/80 border border-indigo-500/20 backdrop-blur-md flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="text-[11px] font-medium text-indigo-400/90">{isAr ? 'مقر المكتب (بئر خادم)' : 'Cabinet'}</div>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">{stats.cabinet}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Building2 size={18} />
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR (OBSIDIAN & WARM BRASS) ───────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0f1222] border border-white/10 shadow-lg">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {isAr ? 'الكل' : 'Tous'} ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('cabinet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'cabinet'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Building2 size={13} />
            <span>{isAr ? 'مقر المكتب' : 'Cabinet Bir Khadem'}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('audience')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'audience'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Scale size={13} />
            <span>{isAr ? 'جلسات المحاكم' : 'Audiences'}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('visio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'visio'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Video size={13} />
            <span>{isAr ? 'اجتماع مرئي' : 'Visioconférence'}</span>
          </button>
        </div>

        {/* Search & Custom Select Status Filter */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-stone-400`}
            />
            <input
              type="text"
              placeholder={isAr ? 'بحث بالاسم، الهاتف، الجلسة...' : 'Recherche par nom, tél, audience...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-2 ${
                isAr ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
              } text-xs sm:text-sm rounded-xl bg-[#141829] border border-white/10 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30 transition-all`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className={`absolute ${isAr ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-0.5`}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Luxury CustomSelect for Status */}
          <div className="w-48 shrink-0">
            <CustomSelect
              value={filterStatut}
              onChange={setFilterStatut}
              options={statusFilterOptions}
              dir={isAr ? 'rtl' : 'ltr'}
              align="left"
              className="w-full"
              buttonClassName="py-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* ── APPOINTMENT CARDS LIST ─────────────────────────────────── */}
      <div className="flex flex-col gap-3.5">
        {filteredRdvs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#121526]/60 p-12 text-center text-stone-400 backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3.5 text-amber-400">
              <Calendar size={32} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {isAr ? 'لا توجد مواعيد تطابق المعايير' : 'Aucun rendez-vous trouvé'}
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              {isAr
                ? 'لم يتم العثور على أي موعد يوافق معايير البحث أو التصفية الحالية. يمكنك تعديل البحث أو إضافة موعد جديد.'
                : 'Aucun enregistrement ne correspond aux filtres actuels. Modifiez la recherche ou ajoutez un nouveau rendez-vous.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterStatut('all')
                setFilterType('all')
                setSearchTerm('')
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>{isAr ? 'إعادة تعيين الفلاتر' : 'Réinitialiser les filtres'}</span>
            </button>
          </div>
        ) : (
          filteredRdvs.map((rdv) => {
            const dateObj = parseRdvDate(rdv.date, lang)
            const isAudienceItem =
              Boolean(rdv.chambre) ||
              rdv.motif.toLowerCase().includes('audience') ||
              (rdv.motifAr ? rdv.motifAr.includes('جلسة') : false)

            return (
              <motion.div
                key={rdv.id}
                variants={VARIANTS.item}
                className="group relative rounded-2xl border border-white/10 hover:border-amber-500/40 bg-[#121526]/90 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all duration-200 shadow-xl shadow-black/40 hover:shadow-amber-500/5 backdrop-blur-md"
              >
                {/* Right Side in RTL: Timepiece Pass + Client Info */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                  {/* Luxury Calendar Ticket / Timepiece Pass */}
                  <div className="bg-[#0B0D17] border border-amber-500/30 group-hover:border-amber-400/60 rounded-xl p-3 text-center min-w-[110px] sm:min-w-[125px] shrink-0 shadow-lg relative overflow-hidden transition-all duration-200">
                    {/* Top Gold Accent Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold capitalize mt-0.5">
                      {dateObj.weekday || dateObj.year}
                    </div>
                    <div className="text-2xl font-black font-mono tracking-tight text-amber-400 my-0.5">
                      {dateObj.day}
                    </div>
                    <div className="text-xs font-bold text-stone-200 truncate">
                      {dateObj.month} {dateObj.year}
                    </div>

                    {/* Hours Chip */}
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-center gap-1 text-[11px] font-mono font-bold text-amber-300/90">
                      <Clock size={11} className="text-amber-400" />
                      <span dir="ltr">{rdv.heureDebut} - {rdv.heureFin}</span>
                    </div>
                  </div>

                  {/* Client & Dossier Information */}
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Title + Badges Row */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-white font-serif tracking-wide truncate">
                        {isAr && rdv.clientNameAr ? rdv.clientNameAr : rdv.clientName}
                      </h4>

                      {/* Location / Medium Badge */}
                      {isAudienceItem ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold inline-flex items-center gap-1.5 shadow-sm">
                          <Scale size={13} />
                          <span>{isAr ? 'جلسة قضائية بالمحكمة' : 'Audience Tribunal'}</span>
                        </span>
                      ) : rdv.creneauType.includes('Visioconférence') ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold inline-flex items-center gap-1.5 shadow-sm">
                          <Video size={13} />
                          <span>{isAr ? 'اجتماع مرئي آمن' : 'Visioconférence'}</span>
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold inline-flex items-center gap-1.5 shadow-sm">
                          <Building2 size={13} />
                          <span>{isAr ? 'بمقر المكتب (بئر خادم)' : 'Cabinet (Bir Khadem)'}</span>
                        </span>
                      )}
                    </div>

                    {/* Motif / Objet */}
                    <p className="text-xs sm:text-sm text-stone-200 font-medium leading-relaxed">
                      {isAr && rdv.motifAr ? rdv.motifAr : rdv.motif}
                    </p>

                    {/* Judicial Hearing Details (If Court Hearing) */}
                    {(rdv.chambre || rdv.motifRenvoi) && (
                      <div className="flex items-center gap-2.5 flex-wrap pt-1 text-xs">
                        {rdv.chambre && (
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-stone-300 font-medium inline-flex items-center gap-1.5">
                            <Gavel size={12} className="text-amber-400 shrink-0" />
                            <span>{rdv.chambre}</span>
                          </span>
                        )}
                        {rdv.motifRenvoi && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium inline-flex items-center gap-1.5">
                            <AlertCircle size={12} className="text-amber-400 shrink-0" />
                            <span>
                              {isAr ? `سبب التأجيل / التكليف: ${rdv.motifRenvoi}` : `Renvoi: ${rdv.motifRenvoi}`}
                            </span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Contact Badges (Phone + Email) */}
                    <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap pt-1">
                      {/* Phone with click-to-copy */}
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(rdv.id, rdv.telephone)}
                        title={isAr ? 'انقر للنسخ' : 'Cliquer pour copier'}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141829] border border-white/10 text-stone-300 hover:border-amber-500/40 hover:text-white transition-all cursor-pointer group/tel"
                      >
                        {copiedPhoneId === rdv.id ? (
                          <Check size={13} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Phone size={13} className="text-amber-400 shrink-0 group-hover/tel:scale-110 transition-transform" />
                        )}
                        <span dir="ltr" className="font-mono">{rdv.telephone}</span>
                        <span className="text-[10px] text-stone-500 group-hover/tel:text-amber-400">
                          {copiedPhoneId === rdv.id ? (isAr ? 'تم النسخ!' : 'Copié!') : <Copy size={11} />}
                        </span>
                      </button>

                      {/* Email */}
                      {rdv.email && (
                        <a
                          href={`mailto:${rdv.email}`}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141829] border border-white/10 text-stone-300 hover:border-amber-500/40 hover:text-white transition-all"
                        >
                          <Mail size={13} className="text-amber-400 shrink-0" />
                          <span className="font-mono truncate max-w-[200px]">{rdv.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Left Side in RTL: Status Dropdown & Legal Actions */}
                <div className="flex items-center gap-3 shrink-0 justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                  {/* Quittance d'honoraires Action Button */}
                  <button
                    type="button"
                    onClick={() =>
                      openQuittanceFor({
                        clientName: rdv.clientName,
                        dossierRef: rdv.chambre || 'RDV-CONSULT',
                        amountDzd: 15000,
                        motif: rdv.motif,
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 transition-all cursor-pointer shadow-sm"
                    title={isAr ? 'إصدار وصل مخالصة أتعاب رسمي' : "Émettre un reçu d'honoraires"}
                  >
                    <Printer size={14} className="text-amber-400" />
                    <span>{isAr ? 'إصدار مخالصة' : 'Quittance'}</span>
                  </button>

                  {/* Luxury CustomSelect for Card Status */}
                  <div className="w-36">
                    <CustomSelect
                      value={rdv.statut}
                      onChange={(newStatut) => updateRdvStatut(rdv.id, newStatut as AdminRdv['statut'])}
                      options={cardStatusOptions}
                      dir={isAr ? 'rtl' : 'ltr'}
                      align="left"
                      className="w-full"
                      buttonClassName={`py-2 text-xs font-semibold rounded-xl ${
                        rdv.statut === 'Confirmé'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400'
                          : rdv.statut === 'En attente'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-amber-400'
                          : rdv.statut === 'Terminé'
                          ? 'border-[#C39B57]/40 bg-[#C39B57]/10 text-[#D4B06A] hover:border-[#C39B57]'
                          : 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:border-rose-400'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* ── MODAL: NOUVEAU RENDEZ-VOUS / AUDIENCE ──────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl rounded-2xl bg-[#121526] border border-amber-500/30 shadow-2xl shadow-black/80 overflow-hidden"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0d0f1c]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                      {isAr ? 'تسجيل موعد استشارة أو جلسة جديدة' : 'Planifier un Rendez-vous / Audience'}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {isAr ? 'مكتب الأستاذ نور الدين سليماني - بئر خادم' : 'Cabinet Me Noureddine Slimani - Bir Khadem'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateRdv} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* 1. Client Identity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {isAr ? 'اسم الموكل أو المؤسسة *' : 'Nom du client ou Société *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={isAr ? 'مثال: السيد بن محمد رضا أو شركة النور' : 'Ex: M. Reda Benmohamed'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>

                {/* 2. Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      {isAr ? 'رقم الهاتف *' : 'Téléphone *'}
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="0661 00 00 00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      {isAr ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@domaine.dz"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30"
                    />
                  </div>
                </div>

                {/* 3. Appointment Type & Nature */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      {isAr ? 'مكان الموعد / الوسيط' : 'Type de consultation'}
                    </label>
                    <div className="flex rounded-xl bg-[#141829] p-1 border border-white/10 gap-1">
                      <button
                        type="button"
                        onClick={() => setCreneauType('Cabinet (Bir Khadem)')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          creneauType.includes('Cabinet')
                            ? 'bg-amber-500 text-stone-950 font-bold shadow'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        <Building2 size={13} />
                        <span>{isAr ? 'بمقر المكتب' : 'Cabinet'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreneauType('Visioconférence')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          creneauType.includes('Visioconférence')
                            ? 'bg-indigo-500 text-white font-bold shadow'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        <Video size={13} />
                        <span>{isAr ? 'اجتماع مرئي' : 'Visio'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      {isAr ? 'حالة الموعد الأولية' : 'Statut initial'}
                    </label>
                    <div className="flex rounded-xl bg-[#141829] p-1 border border-white/10 gap-1">
                      <button
                        type="button"
                        onClick={() => setInitialStatut('Confirmé')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          initialStatut === 'Confirmé'
                            ? 'bg-emerald-500 text-stone-950 font-bold shadow'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {isAr ? '✓ مؤكد' : 'Confirmé'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setInitialStatut('En attente')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          initialStatut === 'En attente'
                            ? 'bg-amber-500 text-stone-950 font-bold shadow'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {isAr ? '⏳ بالانتظار' : 'En attente'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Date & Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      {isAr ? 'التاريخ *' : 'Date *'}
                    </label>
                    <CustomDatePicker
                      value={date}
                      onChange={setDate}
                      dir={isAr ? 'rtl' : 'ltr'}
                      align={isAr ? 'right' : 'left'}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      {isAr ? 'ساعة البدء *' : 'Heure de début *'}
                    </label>
                    <CustomTimePicker
                      value={heureDebut}
                      onChange={(newStart) => {
                        setHeureDebut(newStart)
                        try {
                          const [h, m] = newStart.split(':').map(Number)
                          const totalMin = (h || 0) * 60 + (m || 0) + 45
                          const endH = String(Math.floor(totalMin / 60) % 24).padStart(2, '0')
                          const endM = String(totalMin % 60).padStart(2, '0')
                          setHeureFin(`${endH}:${endM}`)
                        } catch {}
                      }}
                      dir={isAr ? 'rtl' : 'ltr'}
                      align="auto"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      {isAr ? 'ساعة الانتهاء *' : 'Heure de fin *'}
                    </label>
                    <CustomTimePicker
                      value={heureFin}
                      onChange={setHeureFin}
                      dir={isAr ? 'rtl' : 'ltr'}
                      align="left"
                    />
                  </div>
                </div>

                {/* 5. Audience Toggle (Court Hearing) */}
                <div className="pt-1">
                  <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAudience}
                      onChange={(e) => setIsAudience(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-[#141829] border-white/20 focus:ring-amber-400/30"
                    />
                    <span className="font-semibold text-amber-300">
                      {isAr ? 'هذا الموعد مرتبط بجلسة محكمة / مجلس قضاء' : 'Lié à une audience devant une juridiction'}
                    </span>
                  </label>
                </div>

                {/* If Audience: Chamber & Renvoi */}
                {isAudience && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-amber-300">
                        {isAr ? 'الجهة القضائية / الغرفة' : 'Juridiction / Chambre'}
                      </label>
                      <input
                        type="text"
                        value={chambre}
                        onChange={(e) => setChambre(e.target.value)}
                        placeholder={isAr ? 'محكمة سيدي امحمد - الغرفة التجارية' : "Tribunal de Sidi M'Hamed - Com 2"}
                        className="w-full px-3 py-2 rounded-lg bg-[#141829] border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-amber-300">
                        {isAr ? 'سبب التأجيل أو التكليف القضائي' : 'Motif de renvoi'}
                      </label>
                      <input
                        type="text"
                        value={motifRenvoi}
                        onChange={(e) => setMotifRenvoi(e.target.value)}
                        placeholder={isAr ? 'تقديم تقرير الخبرة / جواب الخصم' : "Rapport d'expertise / Réponse"}
                        className="w-full px-3 py-2 rounded-lg bg-[#141829] border border-white/10 text-white text-xs"
                      />
                    </div>
                  </motion.div>
                )}

                {/* 6. Motif / Objet */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {isAr ? 'موضوع الاستشارة أو تفاصيل الموعد *' : 'Objet du rendez-vous *'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder={
                      isAr
                        ? 'استشارة قانونية وتدقيق العقود العقارية والتجارية...'
                        : 'Consultation juridique relative au litige foncier...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30 resize-none"
                  />
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Annuler'}
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                      bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950
                      hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isAr ? 'حفظ وتأكيد الموعد' : 'Enregistrer le rendez-vous'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

AdminRdvModule.displayName = 'AdminRdvModule'
