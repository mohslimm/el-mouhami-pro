'use client'

import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Building2,
  Printer,
  X,
  Briefcase,
  Scale,
  Hash,
  Coins,
  Calendar,
  UserCheck,
  FileText,
  Phone,
} from 'lucide-react'
import { useAdminStore, AdminDossier, CaseChamber } from '@/stores/adminStore'
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect'
import { CurrencyInput } from '@/components/ui/CurrencyInput'

const VARIANTS = {
  container: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },
}

const getJurisdictionLabel = (jurisdiction: string, lang: string, jurisdictionAr?: string) => {
  if (lang !== 'ar') return jurisdiction
  if (jurisdictionAr) return jurisdictionAr
  if (jurisdiction.includes("Sidi M'Hamed")) return 'محكمة سيدي امحمد'
  if (jurisdiction.includes("Cour d'Alger")) return 'مجلس قضاء الجزائر'
  if (jurisdiction.includes("Bab El Oued")) return 'محكمة باب الوادي'
  if (jurisdiction.includes("Bir Khadem")) return 'محكمة بئر خادم'
  if (jurisdiction.includes("Cour Suprême")) return 'المحكمة العليا'
  if (jurisdiction.includes("Conseil d'État")) return 'مجلس الدولة'
  return jurisdiction
}

export const AdminDossiersModule = memo(() => {
  const { dossiers, selectedDossier, setSelectedDossier, addDossier, openQuittanceFor, lang } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChamber, setFilterChamber] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // New Dossier Form state
  const [newRef, setNewRef] = useState(`DOS-2026-${Math.floor(120 + Math.random() * 800)}`)
  const [newClient, setNewClient] = useState('')
  const [newPhone] = useState('0661 00 00 00')
  const [newEmail] = useState('client@email.com')
  const [newType] = useState<AdminDossier['typeDroit']>('Foncier')
  const [newChamber, setNewChamber] = useState<CaseChamber>('FONCIER')
  const [newJurisdiction, setNewJurisdiction] = useState(lang === 'ar' ? 'محكمة بئر خادم - القسم العقاري' : 'Tribunal de Bir Khadem - Chambre Foncière')
  const [newDesc, setNewDesc] = useState('')
  const [newHonoraires, setNewHonoraires] = useState('150000')

  const filteredDossiers = dossiers.filter((dossier: AdminDossier) => {
    const matchesChamber = filterChamber === 'all' || (dossier.chamber || 'FONCIER') === filterChamber
    const matchesSearch =
      dossier.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dossier.clientNameAr && dossier.clientNameAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
      dossier.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesChamber && matchesSearch
  })

  const handleCreateDossier = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient) return

    addDossier({
      reference: newRef,
      clientName: newClient,
      clientNameAr: newClient,
      clientPhone: newPhone || '0661 00 00 00',
      clientEmail: newEmail || 'client@email.com',
      typeDroit: newType,
      chamber: newChamber,
      jurisdiction: newJurisdiction,
      statut: 'En cours',
      dateProchaineAudience: '2026-09-10',
      avocatCharge: lang === 'ar' ? 'الأستاذ نور الدين سليماني' : 'Me Noureddine Slimani',
      honorairesTotal: parseInt(newHonoraires, 10) || 150000,
      honorairesPayes: 50000,
      description: newDesc || (lang === 'ar' ? 'فتح الملف القضائي وتجهيز المستندات.' : 'Ouverture du dossier juridique et constitution des pièces.'),
    })

    setIsAddModalOpen(false)
    setNewClient('')
    setNewDesc('')
  }

  const getStatusBadgeStyle = (statut: AdminDossier['statut']) => {
    switch (statut) {
      case 'EN_ATTENTE_HUISSIER':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: lang === 'ar' ? 'في انتظار المحضر القضائي' : 'En attente Huissier' }
      case 'EN_DELIBERE':
      case 'En délibéré':
        return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: lang === 'ar' ? 'الملف في المداولة' : 'En délibéré' }
      case 'EXPERTISE_EN_COURS':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: lang === 'ar' ? 'خبرة قضائية جارية' : 'Expertise en cours' }
      case 'Audience fixée':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: lang === 'ar' ? 'جلسة محددة' : 'Audience fixée' }
      case 'Instruction / Renvois':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: lang === 'ar' ? 'التحقيق / التأجيلات' : 'Instruction / Renvois' }
      case 'En cours de Recours':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: lang === 'ar' ? 'في طور الطعن' : 'En cours de Recours' }
      default:
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: statut === 'En cours' && lang === 'ar' ? 'قضية جارية' : statut }
    }
  }

  const getChamberLabel = (chamber?: string) => {
    if (!chamber) return lang === 'ar' ? 'عقاري' : 'Foncier'
    switch (chamber) {
      case 'FONCIER': return lang === 'ar' ? 'الغرفة العقارية' : 'Foncier'
      case 'FAMILLE': return lang === 'ar' ? 'شؤون الأسرة' : 'Statut Personnel'
      case 'COMMERCIAL': return lang === 'ar' ? 'الغرفة التجارية' : 'Commercial'
      case 'CIVIL': return lang === 'ar' ? 'الغرفة المدنية' : 'Civil'
      case 'ADMINISTRATIF': return lang === 'ar' ? 'الغرفة الإدارية' : 'Administratif'
      case 'PENAL': return lang === 'ar' ? 'الغرفة الجزائية' : 'Pénal'
      default: return chamber
    }
  }

  const chamberFilterOptions: SelectOption[] = useMemo(() => [
    { value: 'all', label: lang === 'ar' ? 'كل الغرف القضائية' : 'Toutes les Chambres' },
    { value: 'FONCIER', label: getChamberLabel('FONCIER') },
    { value: 'FAMILLE', label: getChamberLabel('FAMILLE') },
    { value: 'COMMERCIAL', label: getChamberLabel('COMMERCIAL') },
    { value: 'CIVIL', label: getChamberLabel('CIVIL') },
    { value: 'ADMINISTRATIF', label: getChamberLabel('ADMINISTRATIF') },
    { value: 'PENAL', label: getChamberLabel('PENAL') },
  ], [lang])

  const modalChamberOptions: SelectOption[] = useMemo(() => [
    { value: 'FONCIER', label: lang === 'ar' ? 'الغرفة العقارية (FONCIER)' : 'Chambre Foncière' },
    { value: 'FAMILLE', label: lang === 'ar' ? 'شؤون الأسرة (FAMILLE)' : 'Statut Personnel' },
    { value: 'COMMERCIAL', label: lang === 'ar' ? 'الغرفة التجارية (COMMERCIAL)' : 'Chambre Commerciale' },
    { value: 'CIVIL', label: lang === 'ar' ? 'الغرفة المدنية (CIVIL)' : 'Chambre Civile' },
    { value: 'ADMINISTRATIF', label: lang === 'ar' ? 'الغرفة الإدارية (ADMINISTRATIF)' : 'Chambre Administrative' },
    { value: 'PENAL', label: lang === 'ar' ? 'الغرفة الجزائية (PENAL)' : 'Chambre Pénal' },
  ], [lang])

  return (
    <motion.div
      variants={VARIANTS.container}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-lg"
    >
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h2 className="text-h2 text-[var(--text-primary)] m-0">
            {lang === 'ar' ? 'إدارة الملفات والقضايا القضائية (CPCA)' : 'Gestion des Dossiers & Chambres CPCA'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] m-0 mt-1">
            {lang === 'ar'
              ? 'المحكمة العليا، مجلس الدولة، مجلس قضاء الجزائر، سيدي امحمد، باب الوادي وبئر خادم'
              : "Cour Suprême, Conseil d'État, Cour d'Alger, Sidi M'Hamed, Bab El Oued & Bir Khadem"}
          </p>
        </div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          {lang === 'ar' ? 'ملف قضائي جديد' : 'Nouveau Dossier'}
        </motion.button>
      </div>

      {/* Search & Filter Bar */}
      <motion.div variants={VARIANTS.item} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'ابحث عن دعوى أو موكل...' : 'Rechercher une affaire ou client...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-10 text-sm"
          />
        </div>

        <CustomSelect
          value={filterChamber}
          onChange={(val) => setFilterChamber(val)}
          options={chamberFilterOptions}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="w-full sm:w-64"
        />
      </motion.div>

      {/* Dossiers List */}
      <motion.div variants={VARIANTS.container} className="flex flex-col gap-2">
        {filteredDossiers.length > 0 ? (
          filteredDossiers.map((dossier: AdminDossier, idx: number) => {
            const statusStyle = getStatusBadgeStyle(dossier.statut)
            return (
              <motion.div
                key={dossier.id}
                variants={VARIANTS.item}
                custom={idx}
                onClick={() => setSelectedDossier(dossier)}
                className="case-row group cursor-pointer"
              >
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--gold-glow)]">
                      <Briefcase size={18} className="text-[var(--gold-400)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                          {dossier.reference}
                        </h3>
                        <span
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                          className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {lang === 'ar' && dossier.clientNameAr ? dossier.clientNameAr : dossier.clientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center justify-between gap-2 sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[var(--gold-400)]">
                        {(dossier.honorairesTotal - dossier.honorairesPayes).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {lang === 'ar' ? 'باقي الأتعاب' : 'Solde dû'}
                      </div>
                    </div>
                    <Building2 size={14} className="text-[var(--text-muted)] group-hover:text-[var(--gold-400)] transition-colors" />
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <motion.div variants={VARIANTS.item} className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 px-4">
            <Briefcase size={32} className="text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">
              {lang === 'ar' ? 'لا توجد ملفات قضائية' : 'Aucun dossier trouvé'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Detail Panel — Luxury Dossier Command Center */}
      <AnimatePresence mode="wait">
        {selectedDossier && (() => {
          const statusStyle = getStatusBadgeStyle(selectedDossier.statut)
          const total = selectedDossier.honorairesTotal || 0
          const paye = selectedDossier.honorairesPayes || 0
          const reste = Math.max(0, total - paye)
          const percentPaye = total > 0 ? Math.min(100, Math.round((paye / total) * 100)) : 100

          return (
            <motion.div
              key={selectedDossier.id}
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-[#0E1120] p-6 shadow-2xl shadow-black/80 backdrop-blur-xl"
            >
              {/* Subtle top gold accent glow */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

              {/* Detail Header */}
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 mb-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Scale size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-mono text-xl font-bold text-amber-300 m-0 tracking-wide">
                        {selectedDossier.reference}
                      </h3>
                      {/* Chamber Badge */}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-stone-200">
                        {getChamberLabel(selectedDossier.chamber)}
                      </span>
                      {/* Status Badge */}
                      <span
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusStyle.color }} />
                        {statusStyle.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-300">
                      <span className="font-semibold text-stone-100 text-sm">
                        {lang === 'ar' && selectedDossier.clientNameAr ? selectedDossier.clientNameAr : selectedDossier.clientName}
                      </span>
                      {selectedDossier.clientPhone && (
                        <span className="flex items-center gap-1 font-mono text-stone-400">
                          <Phone size={12} className="text-amber-400/80" />
                          {selectedDossier.clientPhone}
                        </span>
                      )}
                      {selectedDossier.adversaryName && (
                        <span className="text-stone-400">
                          {lang === 'ar' ? `ضد: ${selectedDossier.adversaryName}` : `vs. ${selectedDossier.adversaryName}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2.5 self-end lg:self-center">
                  <button
                    onClick={() =>
                      openQuittanceFor({
                        clientName: selectedDossier.clientNameAr || selectedDossier.clientName,
                        dossierRef: selectedDossier.reference,
                        amountDzd: selectedDossier.honorairesPayes,
                        motif: lang === 'ar' ? `أتعاب قضائية - ملف رقم ${selectedDossier.reference}` : `Honoraires - Dossier ${selectedDossier.reference}`,
                      })
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400 transition-all shadow-sm active:scale-95"
                  >
                    <Printer size={15} />
                    <span>{lang === 'ar' ? 'إصدار وصل سداد رسمي' : 'Émettre Quittance Officielle'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedDossier(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={lang === 'ar' ? 'إغلاق التفاصيل' : 'Fermer'}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Main Content Grid: 2 Columns */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left/Main Column: Litigation Details & Dates (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {/* Next Hearing Banner */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                          {lang === 'ar' ? 'تاريخ الجلسة القادمة' : 'Prochaine Audience Fixée'}
                        </div>
                        <div className="text-sm font-semibold text-stone-100 font-mono mt-0.5">
                          {selectedDossier.dateProchaineAudience || '2026-09-10'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      {lang === 'ar' ? 'محددة بالجدول' : 'Inscrite au Rôle'}
                    </span>
                  </div>

                  {/* Litigation Summary */}
                  <div>
                    <h5 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText size={14} className="text-amber-400" />
                      <span>{lang === 'ar' ? 'موضوع النزاع والدعوى' : 'Objet du Contentieux & Prétentions'}</span>
                    </h5>
                    <div className="p-4 rounded-xl bg-[#141829] border border-white/10 text-sm leading-relaxed text-[#F0EDE8]">
                      {lang === 'ar' && selectedDossier.descriptionAr ? selectedDossier.descriptionAr : selectedDossier.description}
                    </div>
                  </div>

                  {/* Metadata Row: Jurisdiction & Lawyer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                        <Building2 size={13} className="text-amber-400" />
                        <span>{lang === 'ar' ? 'الجهة القضائية المختصة' : 'Juridiction Compétente'}</span>
                      </div>
                      <div className="text-sm font-bold text-stone-100">
                        {getJurisdictionLabel(selectedDossier.jurisdiction, lang, selectedDossier.jurisdictionAr)}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                        <UserCheck size={13} className="text-amber-400" />
                        <span>{lang === 'ar' ? 'المحامي المكلف بالملف' : 'Avocat en Charge'}</span>
                      </div>
                      <div className="text-sm font-bold text-amber-300">
                        {lang === 'ar' && selectedDossier.avocatChargeAr ? selectedDossier.avocatChargeAr : (lang === 'ar' ? 'الأستاذ نور الدين سليماني' : selectedDossier.avocatCharge)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Financial Recovery Command Center (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-[#131627] border border-amber-500/20">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Coins size={16} className="text-amber-400" />
                        <h5 className="text-xs font-bold text-stone-200 uppercase tracking-wider m-0">
                          {lang === 'ar' ? 'الوضعية المالية والتحصيل' : 'Bilan Financier & Recouvrement'}
                        </h5>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                        {percentPaye}% {lang === 'ar' ? 'محصل' : 'encaissé'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3.5 mb-5">
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#C39B57] transition-all duration-500"
                          style={{ width: `${percentPaye}%` }}
                        />
                      </div>
                    </div>

                    {/* 3 Metric Cards */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-xs text-stone-300 font-medium">
                          {lang === 'ar' ? 'إجمالي الأتعاب المتفق عليها' : 'Honoraires Convenus'}
                        </span>
                        <span className="text-sm font-mono font-bold text-stone-100">
                          {total.toLocaleString('fr-DZ').replace(/,/g, ' ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs text-emerald-300 font-medium">
                          {lang === 'ar' ? 'المبلغ المحصل (الوصولات)' : 'Montant Encaissé'}
                        </span>
                        <span className="text-sm font-mono font-bold text-emerald-400">
                          {paye.toLocaleString('fr-DZ').replace(/,/g, ' ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <span className="text-xs text-amber-300 font-bold">
                          {lang === 'ar' ? 'باقي الأتعاب المستحقة' : 'Solde Dû (Reste à payer)'}
                        </span>
                        <span className="text-base font-mono font-black text-amber-300">
                          {reste.toLocaleString('fr-DZ').replace(/,/g, ' ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Footer Note */}
                  <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-stone-400 flex items-center justify-between">
                    <span>{lang === 'ar' ? 'الوصل معفى من الضريبة (مادة قانونية)' : 'Quittance certifiée conforme'}</span>
                    <span className="text-amber-400/80 font-mono">Cabinet Slimani</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Modal Nouveau Dossier — Quiet Luxury Edition */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-[#0E111F] shadow-2xl shadow-black/90 overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#121526]/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Scale size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F0EDE8] m-0">
                      {lang === 'ar' ? 'تسجيل قضية وملف قضائي جديد' : 'Enregistrer un Nouveau Dossier Juridique'}
                    </h3>
                    <p className="text-xs text-amber-300/70 font-mono mt-0.5 m-0">
                      {lang === 'ar' ? 'رقم الجدول القضائي والبيانات الرسمية' : 'Référence Dossier & Données Officielles CPCA'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateDossier} className="p-6 flex flex-col gap-5">
                {/* Section 1: Identification */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90 pb-1.5 border-b border-white/5">
                    <Hash size={14} />
                    <span>{lang === 'ar' ? '1. بيانات الملف ورقم الجدول' : '1. Identification du Dossier'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                        {lang === 'ar' ? 'رقم الجدول القضائي' : 'Réf. Dossier (رقم الجدول)'} <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newRef}
                        onChange={(e) => setNewRef(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 hover:border-amber-500/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-[#F0EDE8] font-mono text-sm outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                        {lang === 'ar' ? 'اسم الموكل أو الشركة' : 'Nom du Client / Société'} <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? 'مثال: بن محمد رضا' : 'Ex: Benmohamed Reda'}
                        value={newClient}
                        onChange={(e) => setNewClient(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 hover:border-amber-500/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-[#F0EDE8] text-sm placeholder:text-stone-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Chambre & Juridiction */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90 pb-1.5 border-b border-white/5">
                    <Building2 size={14} />
                    <span>{lang === 'ar' ? '2. الغرفة والجهة القضائية' : '2. Chambre & Juridiction'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                        {lang === 'ar' ? 'الغرفة القضائية (Chambre)' : 'Chambre CPCA'}
                      </label>
                      <CustomSelect
                        value={newChamber}
                        onChange={(val) => setNewChamber(val as CaseChamber)}
                        options={modalChamberOptions}
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                        {lang === 'ar' ? 'الجهة القضائية (المحكمة / المجلس)' : 'Juridiction Compétente'}
                      </label>
                      <input
                        type="text"
                        value={newJurisdiction}
                        onChange={(e) => setNewJurisdiction(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 hover:border-amber-500/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-[#F0EDE8] text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Honoraires & Objet */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90 pb-1.5 border-b border-white/5">
                    <Coins size={14} />
                    <span>{lang === 'ar' ? '3. الأتعاب وموضوع النزاع' : '3. Honoraires & Objet du Contentieux'}</span>
                  </div>

                  <CurrencyInput
                    value={parseInt(newHonoraires, 10) || 0}
                    onChange={(val) => setNewHonoraires(String(val))}
                    label={lang === 'ar' ? 'الأتعاب المتفق عليها' : 'Honoraires Convenus'}
                    currency="DA"
                    currencyAr="د.ج"
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    presets={[50000, 100000, 150000, 200000, 300000]}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                      {lang === 'ar' ? 'ملخص موضوع الدعوى والطلبات' : 'Résumé de l’Affaire & Prétentions'}
                    </label>
                    <textarea
                      rows={3}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 hover:border-amber-500/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-[#F0EDE8] text-sm placeholder:text-stone-500 outline-none resize-none transition-all"
                      placeholder={lang === 'ar' ? 'ملخص موجز لموضوع النزاع، صفة الخصوم، والطلبات القضائية...' : "Résumé du litige, qualité des parties et prétentions..."}
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-stone-300 hover:text-white text-sm font-medium transition-all"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B8924A] via-[#C39B57] to-[#D4B57A] text-[#120E05] font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    <span>{lang === 'ar' ? 'إنشاء وتسجيل الملف' : 'Créer & Enregistrer'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

AdminDossiersModule.displayName = 'AdminDossiersModule'
