// AdminFinancesModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Suivi comptable, honoraires et émission des quittances d'honoraires (Loi 13-07 Art. 23)
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt,
  Printer,
  PlusCircle,
  Coins,
  CheckCircle2,
  AlertCircle,
  Search,
  Scale,
  X,
  User,
} from 'lucide-react'
import { useAdminStore, AdminDossier } from '@/stores/adminStore'
import { FinancialAnalyticsCards } from '@/components/ui/analytics/FinancialAnalyticsCards'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect'

const VARIANTS = {
  container: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },
}

export const AdminFinancesModule = memo(() => {
  const { dossiers, openQuittanceFor, lang } = useAdminStore()
  const isAr = lang === 'ar'

  const [searchTerm, setSearchTerm] = useState('')
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all')

  // Free Quittance Modal State
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false)
  const [selectedDossierId, setSelectedDossierId] = useState<string>('free')
  const [freeClientName, setFreeClientName] = useState('')
  const [freeDossierRef, setFreeDossierRef] = useState('')
  const [freeAmount, setFreeAmount] = useState<number>(50000)
  const [freeMotif, setFreeMotif] = useState('')

  const totalHonorairesTotal = useMemo(
    () => dossiers.reduce((acc, d) => acc + d.honorairesTotal, 0),
    [dossiers]
  )
  const totalHonorairesPayes = useMemo(
    () => dossiers.reduce((acc, d) => acc + d.honorairesPayes, 0),
    [dossiers]
  )
  const totalReste = totalHonorairesTotal - totalHonorairesPayes

  // Dossier options for modal
  const dossierOptions: SelectOption[] = useMemo(() => {
    return [
      {
        value: 'free',
        label: isAr ? '— إدخال يدوي حر بدون ملف مسبق —' : '— Saisie libre sans dossier lié —',
      },
      ...dossiers.map((d) => ({
        value: d.id,
        label: `${d.reference} — ${isAr && d.clientNameAr ? d.clientNameAr : d.clientName}`,
        badge: `${d.honorairesPayes.toLocaleString('fr-DZ')} DA`,
      })),
    ]
  }, [dossiers, isAr])

  // Handle dossier selection in free modal
  const handleSelectDossier = (dId: string) => {
    setSelectedDossierId(dId)
    if (dId === 'free') {
      setFreeClientName('')
      setFreeDossierRef('')
      setFreeAmount(50000)
      setFreeMotif('')
    } else {
      const found = dossiers.find((d) => d.id === dId)
      if (found) {
        setFreeClientName(isAr && found.clientNameAr ? found.clientNameAr : found.clientName)
        setFreeDossierRef(found.reference)
        setFreeAmount(found.honorairesPayes || 50000)
        setFreeMotif(
          isAr
            ? `تسليم دفعة أتعاب مرافعة في قضية ${found.typeDroit} أمام ${found.jurisdiction}`
            : `Honoraires de plaidoirie - Dossier ${found.reference}`
        )
      }
    }
  }

  // Filtered dossiers for table
  const filteredDossiers = useMemo(() => {
    return dossiers.filter((d) => {
      const pct = (d.honorairesPayes / d.honorairesTotal) * 100

      // Payment filter
      let matchesPayment = true
      if (filterPayment === 'paid') matchesPayment = pct >= 100
      else if (filterPayment === 'partial') matchesPayment = pct > 0 && pct < 100
      else if (filterPayment === 'unpaid') matchesPayment = pct === 0

      // Search term
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !term ||
        d.reference.toLowerCase().includes(term) ||
        d.clientName.toLowerCase().includes(term) ||
        (d.clientNameAr && d.clientNameAr.toLowerCase().includes(term)) ||
        (d.adversaryName && d.adversaryName.toLowerCase().includes(term)) ||
        d.jurisdiction.toLowerCase().includes(term)

      return matchesPayment && matchesSearch
    })
  }, [dossiers, filterPayment, searchTerm])

  const handleLaunchQuittance = (e: React.FormEvent) => {
    e.preventDefault()
    if (!freeClientName.trim()) return

    openQuittanceFor({
      clientName: freeClientName.trim(),
      dossierRef: freeDossierRef.trim() || `DOS-2026/${Math.floor(100 + Math.random() * 900)}`,
      amountDzd: Number(freeAmount) || 50000,
      motif:
        freeMotif.trim() ||
        (isAr
          ? 'وصل تسليم أتعاب مرافعة واستشارة قانونية رسمية'
          : "Quittance d'honoraires de plaidoirie et consultation juridique"),
    })

    setIsFreeModalOpen(false)
  }

  return (
    <motion.div
      variants={VARIANTS.container}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full pb-10"
    >
      {/* ── HEADER BANNER (QUIET LUXURY SPEC) ─────────────────────── */}
      <motion.div
        variants={VARIANTS.item}
        className="rounded-2xl border border-white/10 hover:border-amber-500/30 bg-[#121526]/90 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-xl shadow-black/40 backdrop-blur-md"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 shadow-inner">
            <Receipt size={26} strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
              {isAr
                ? 'سجل الأتعاب والمتابعة المالية الرسمية'
                : "Suivi Comptable & Émission des Quittances d'Honoraires"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              {isAr ? (
                <>
                  مطابق لأحكام القانون رقم <span dir="ltr" className="font-mono font-bold text-amber-400">13-07</span> المادة 23 المنظم لمهنة المحاماة في الجزائر
                </>
              ) : (
                'Conforme aux dispositions de la Loi n° 13-07 (Art. 23) régissant la profession d\'avocat.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200
              bg-[#141829] border border-white/10 text-stone-200 hover:border-amber-500/40 hover:text-white cursor-pointer shadow-md"
          >
            <Printer size={16} className="text-amber-400" />
            <span>{isAr ? 'طباعة الكشف المالي' : 'Imprimer le Bilan'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFreeModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200
              bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950
              hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
          >
            <PlusCircle size={17} strokeWidth={2.5} />
            <span>{isAr ? 'إصدار وصل سداد رسمي' : 'Émettre une Quittance'}</span>
          </button>
        </div>
      </motion.div>

      {/* ── KPI EXECUTIVE CARDS ────────────────────────────────────── */}
      <motion.div variants={VARIANTS.item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Convention Globale */}
        <div className="rounded-2xl border border-white/10 hover:border-amber-500/40 bg-[#121526]/90 p-5 space-y-3 shadow-xl shadow-black/40 backdrop-blur-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
              {isAr ? 'إجمالي الأتعاب المتفق عليها' : 'Convention Globale (Honoraires)'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Coins size={18} />
            </div>
          </div>

          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-mono">
            {totalHonorairesTotal.toLocaleString('fr-DZ')} <span className="text-base text-amber-400 font-sans">{isAr ? 'د.ج' : 'DA'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-white/5">
            <span>{isAr ? `${dossiers.length} ملفات مدرجة` : `${dossiers.length} dossiers sous contrat`}</span>
            <span className="text-amber-400/90 font-medium">{isAr ? 'الوعاء المالي الإجمالي' : 'Total sous convention'}</span>
          </div>
        </div>

        {/* Card 2: Provisions Encaissées */}
        <div className="rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 bg-[#121526]/90 p-5 space-y-3 shadow-xl shadow-black/40 backdrop-blur-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90 block">
              {isAr ? 'المبالغ المحصلة (المدفوعات)' : 'Provisions Encaissées'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>

          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-wide font-mono">
            {totalHonorairesPayes.toLocaleString('fr-DZ')} <span className="text-base font-sans">{isAr ? 'د.ج' : 'DA'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-white/5">
            <span className="text-emerald-400 font-medium">
              {isAr ? 'وصولات تسليم رسمية صادرة' : 'Quittances délivrées'}
            </span>
            <span dir="ltr" className="font-mono text-emerald-400 font-bold">
              {Math.round((totalHonorairesPayes / (totalHonorairesTotal || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Card 3: Solde Restant */}
        <div className="rounded-2xl border border-rose-500/20 hover:border-rose-500/40 bg-[#121526]/90 p-5 space-y-3 shadow-xl shadow-black/40 backdrop-blur-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400/90 block">
              {isAr ? 'المبلغ المتبقي للتحصيل' : 'Solde Restant à Recouvrer'}
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertCircle size={18} />
            </div>
          </div>

          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-wide font-mono">
            {totalReste.toLocaleString('fr-DZ')} <span className="text-base font-sans">{isAr ? 'د.ج' : 'DA'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-white/5">
            <span className="text-rose-400 font-medium">
              {isAr ? 'مستحق الدفع قبل الجلسة' : 'À régler avant plaidoirie'}
            </span>
            <span className="text-stone-500">
              {isAr ? 'أرصدة مؤجلة' : 'Créances actives'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── FINANCIAL ANALYTICS SECTION ───────────────────────────── */}
      <motion.div variants={VARIANTS.item}>
        <FinancialAnalyticsCards
          lang={lang}
          totalHonorairesTotal={totalHonorairesTotal}
          totalHonorairesPayes={totalHonorairesPayes}
          totalReste={totalReste}
        />
      </motion.div>

      {/* ── FINANCIAL REGISTER TABLE (QUIET LUXURY TABLE) ──────────── */}
      <motion.div
        variants={VARIANTS.item}
        className="rounded-2xl border border-white/10 bg-[#121526]/90 p-5 sm:p-6 shadow-xl shadow-black/40 backdrop-blur-md flex flex-col gap-4"
      >
        {/* Table Top Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div>
            <h4 className="text-base font-bold text-white font-serif tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isAr ? 'سجل الأتعاب والتحصيلات المالية حسب الملفات' : 'Registre Général des Honoraires par Dossier'}</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              {isAr ? 'كشف المتابعة المحاسبية التفصيلي لكل ملف قضائي' : 'Suivi comptable individuel par affaire judiciaire.'}
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-stone-400`}
              />
              <input
                type="text"
                placeholder={isAr ? 'بحث بالموكل، الرقم، الخصم...' : 'Recherche dossier, client...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 ${
                  isAr ? 'pr-8 pl-3 text-right' : 'pl-8 pr-3 text-left'
                } text-xs rounded-xl bg-[#141829] border border-white/10 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400/70`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={`absolute ${isAr ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-stone-400 hover:text-white`}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 rounded-xl bg-[#141829] p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setFilterPayment('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterPayment === 'all'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {isAr ? 'الكل' : 'Tous'}
              </button>
              <button
                type="button"
                onClick={() => setFilterPayment('paid')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterPayment === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {isAr ? 'خالص (100%)' : 'Soldé'}
              </button>
              <button
                type="button"
                onClick={() => setFilterPayment('partial')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterPayment === 'partial'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {isAr ? 'جزئي' : 'Partiel'}
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#0f1222] border-b border-white/10 text-stone-300 text-start">
                <th className="p-3.5 font-bold tracking-wider">{isAr ? 'رقم الجدول' : 'N° Rôle Greffe'}</th>
                <th className="p-3.5 font-bold tracking-wider">{isAr ? 'الموكل والخصم' : 'Client & Adversaire'}</th>
                <th className="p-3.5 font-bold tracking-wider">{isAr ? 'القسم / الغرفة' : 'Chambre'}</th>
                <th className="p-3.5 font-bold tracking-wider">{isAr ? 'إجمالي الأتعاب' : 'Total Convention'}</th>
                <th className="p-3.5 font-bold tracking-wider">{isAr ? 'المسدد (الوصولات)' : 'Versé (Provisions)'}</th>
                <th className="p-3.5 font-bold tracking-wider">{isAr ? 'المتبقي' : 'Solde Reste'}</th>
                <th className="p-3.5 font-bold tracking-wider text-center">{isAr ? 'الإجراء الرسمي' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#121526]/50">
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    <Receipt size={28} className="text-amber-400 mx-auto mb-2 opacity-60" />
                    <p className="text-xs">{isAr ? 'لا توجد سجلات تطابق معايير البحث.' : 'Aucun dossier ne correspond aux filtres.'}</p>
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((d: AdminDossier) => {
                  const reste = d.honorairesTotal - d.honorairesPayes
                  const pct = Math.round((d.honorairesPayes / d.honorairesTotal) * 100)

                  return (
                    <tr key={d.id} className="hover:bg-white/[0.03] transition-colors">
                      {/* Reference */}
                      <td className="p-3.5 font-mono font-bold text-amber-400">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs">
                          {d.reference}
                        </span>
                      </td>

                      {/* Client & Adversary */}
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User size={13} className="text-amber-400 shrink-0" />
                          <span>{isAr && d.clientNameAr ? d.clientNameAr : d.clientName}</span>
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {isAr ? `ضد ${d.adversaryName || 'الطرف الخصم'}` : `vs ${d.adversaryName || 'Adversaire'}`}
                        </div>
                      </td>

                      {/* Chamber */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-stone-300 text-xs inline-flex items-center gap-1">
                          <Scale size={12} className="text-amber-400" />
                          <span>{d.chamber || d.typeDroit}</span>
                        </span>
                      </td>

                      {/* Total convention */}
                      <td className="p-3.5 font-mono font-semibold text-white">
                        {d.honorairesTotal.toLocaleString('fr-DZ')} <span className="text-xs text-stone-400 font-sans">{isAr ? 'د.ج' : 'DA'}</span>
                      </td>

                      {/* Encaissé & Progress */}
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-emerald-400">
                          {d.honorairesPayes.toLocaleString('fr-DZ')} <span className="text-xs font-sans">{isAr ? 'د.ج' : 'DA'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-16 bg-[#141829] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-400 h-full rounded-full"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">{pct}%</span>
                        </div>
                      </td>

                      {/* Solde restant */}
                      <td className="p-3.5 font-mono font-bold">
                        {reste === 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-sans">
                            {isAr ? 'خالص كلياً' : 'Soldé 100%'}
                          </span>
                        ) : (
                          <span className="text-rose-400">
                            {reste.toLocaleString('fr-DZ')} <span className="text-xs font-sans">{isAr ? 'د.ج' : 'DA'}</span>
                          </span>
                        )}
                      </td>

                      {/* Action Quittance */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            openQuittanceFor({
                              clientName: d.clientNameAr || d.clientName,
                              dossierRef: d.reference,
                              amountDzd: d.honorairesPayes,
                              motif: isAr
                                ? `أتعاب قضية ${d.typeDroit} أمام ${d.jurisdiction}`
                                : `Honoraires - Dossier ${d.reference}`,
                            })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 transition-all cursor-pointer mx-auto shadow-sm"
                          title={isAr ? 'إصدار وصل سداد رسمي' : "Émettre une Quittance"}
                        >
                          <Printer size={13} className="text-amber-400" />
                          <span>{isAr ? 'وصل سداد' : 'Quittance'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── MODAL: NOUVELLE QUITTANCE (SAISIE LIBRE / DOSSIER) ─────── */}
      <AnimatePresence>
        {isFreeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl bg-[#121526] border border-amber-500/30 shadow-2xl shadow-black/90 overflow-hidden"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0d0f1c]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                      {isAr ? 'إصدار وصل سداد أتعاب رسمي' : "Émission d'une Quittance d'Honoraires"}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {isAr
                        ? 'مكتب الأستاذ نور الدين سليماني — المادة 23 من القانون 13-07'
                        : 'Cabinet Me Noureddine Slimani — Loi 13-07'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFreeModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleLaunchQuittance} className="p-5 space-y-4">
                {/* Dossier Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {isAr ? 'ربط بملف قضائي موجود (اختياري)' : 'Lier à un dossier existant (optionnel)'}
                  </label>
                  <CustomSelect
                    value={selectedDossierId}
                    onChange={handleSelectDossier}
                    options={dossierOptions}
                    dir={isAr ? 'rtl' : 'ltr'}
                    className="w-full"
                    buttonClassName="py-2 text-xs"
                  />
                </div>

                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {isAr ? 'اسم الموكل أو المؤسسة المسددة *' : 'Nom du client / Dépositaire *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={freeClientName}
                    onChange={(e) => setFreeClientName(e.target.value)}
                    placeholder={isAr ? 'مثال: بن علي عبد القادر' : 'Ex: M. Abdelkader Benali'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/70"
                  />
                </div>

                {/* Dossier Reference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {isAr ? 'مرجع الملف أو القضية' : 'Référence du dossier'}
                  </label>
                  <input
                    type="text"
                    value={freeDossierRef}
                    onChange={(e) => setFreeDossierRef(e.target.value)}
                    placeholder="DOS-2026/084 أو 24/00412"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/70"
                  />
                </div>

                {/* Amount with Tafqeet CurrencyInput */}
                <div className="space-y-1.5">
                  <CurrencyInput
                    value={freeAmount}
                    onChange={setFreeAmount}
                    label={isAr ? 'مبلغ الأتعاب المسدد (د.ج) *' : 'Montant versé (DZD) *'}
                    dir={isAr ? 'rtl' : 'ltr'}
                  />
                </div>

                {/* Motif */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {isAr ? 'بيان وموضوع الأتعاب المسددة' : 'Objet du versement'}
                  </label>
                  <input
                    type="text"
                    value={freeMotif}
                    onChange={(e) => setFreeMotif(e.target.value)}
                    placeholder={
                      isAr
                        ? 'أتعاب المرافعة والاستشارة القانونية أمام المحكمة'
                        : 'Honoraires de plaidoirie et conseil juridique'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141829] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/70"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsFreeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white"
                  >
                    {isAr ? 'إلغاء' : 'Annuler'}
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200
                      bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950
                      hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 cursor-pointer shadow-md"
                  >
                    <Printer size={15} />
                    <span>{isAr ? 'معاينة وإصدار الوصل الرسمي' : 'Générer la Quittance'}</span>
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

AdminFinancesModule.displayName = 'AdminFinancesModule'
