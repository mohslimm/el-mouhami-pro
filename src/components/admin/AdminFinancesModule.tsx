// AdminFinancesModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Suivi comptable, honoraires et émission des quittances d'honoraires (Loi 13-07 Art. 23)
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Receipt, Printer, PlusCircle } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { FinancialAnalyticsCards } from '@/components/ui/analytics/FinancialAnalyticsCards'

const VARIANTS = {
  container: {
    animate: { transition: { staggerChildren: 0.08 } },
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
}

export const AdminFinancesModule = memo(() => {
  const { dossiers, openQuittanceFor, lang } = useAdminStore()

  const totalHonorairesTotal = dossiers.reduce((acc, d) => acc + d.honorairesTotal, 0)
  const totalHonorairesPayes = dossiers.reduce((acc, d) => acc + d.honorairesPayes, 0)
  const totalReste = totalHonorairesTotal - totalHonorairesPayes

  return (
    <motion.div variants={VARIANTS.container} initial="initial" animate="animate" className="flex flex-col gap-6 w-full">
      
      {/* Header Banner */}
      <motion.div
        variants={VARIANTS.item}
        className="rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-gold)] bg-[var(--bg-surface)] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 transition-all shadow-[var(--shadow-card)]"
      >
        <div className="space-y-1">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <Receipt size={24} className="text-[var(--gold-400)] shrink-0" />
            <span>{lang === 'ar' ? 'المتابعة المالية وإصدار وصل سداد الأتعاب الرسمية' : "Suivi Comptable & Émission des Quittances d'Honoraires"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            {lang === 'ar' ? 'مطابق للقانون رقم 13-07 المادة 23 المنظم لمهنة المحاماة في الجزائر' : 'Conforme à la réglementation des honoraires (Loi n° 13-07 Art. 23).'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn-outline text-xs sm:text-sm py-2.5 px-4 flex items-center gap-2" onClick={() => window.print()}>
            <Printer size={16} />
            <span>{lang === 'ar' ? 'طباعة التقرير المالي' : 'Imprimer le Bilan'}</span>
          </button>
          <button
            className="btn-primary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-2"
            onClick={() =>
              openQuittanceFor({
                clientName: 'بن علي عبد القادر',
                dossierRef: '24/00412',
                amountDzd: 50000,
                motif: 'وصل تسليم أتعاب مرافعة واستشارة قانونية',
              })
            }
          >
            <PlusCircle size={16} />
            <span>{lang === 'ar' ? 'إصدار وصل سداد (إدخال يدوي حـر)' : 'Émettre une Quittance (Saisie Libre)'}</span>
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={VARIANTS.item} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2 shadow-[var(--shadow-card)]">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            {lang === 'ar' ? 'إجمالي الأتعاب المتفق عليها' : 'Convention Globale (Honoraires Total)'}
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
            {totalHonorairesTotal.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
          </div>
          <span className="text-xs text-[var(--text-muted)] block">
            {lang === 'ar' ? `${dossiers.length} ملفات مدرجة` : `${dossiers.length} dossiers sous convention`}
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2 shadow-[var(--shadow-card)]">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            {lang === 'ar' ? 'المبالغ المحصلة (المدفوعات)' : 'Provisions Versées'}
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400 tracking-wide">
            {totalHonorairesPayes.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
          </div>
          <span className="text-xs text-emerald-400 block">
            {lang === 'ar' ? 'وصولات تسليم رسمية صادرة' : 'Quittances officielles remises'}
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2 shadow-[var(--shadow-card)]">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            {lang === 'ar' ? 'المبلغ المتبقي للتحصيل' : 'Solde Restant à Recouvrer'}
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-rose-400 tracking-wide">
            {totalReste.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
          </div>
          <span className="text-xs text-rose-400 block">
            {lang === 'ar' ? 'مستحق الدفع قبل الجلسة' : 'À régler avant plaidoirie'}
          </span>
        </div>
      </motion.div>

      {/* Analytics Section */}
      <motion.div variants={VARIANTS.item}>
        <FinancialAnalyticsCards
          lang={lang}
          totalHonorairesTotal={totalHonorairesTotal}
          totalHonorairesPayes={totalHonorairesPayes}
          totalReste={totalReste}
        />
      </motion.div>

      {/* Financial Table */}
      <motion.div variants={VARIANTS.item} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 overflow-x-auto shadow-[var(--shadow-card)]">
        <h4 className="text-base font-bold text-[var(--gold-400)] font-serif tracking-wide mb-4">
          {lang === 'ar' ? 'سجل الأتعاب والتحصيلات المالية حسب الملفات' : 'Registre Général des Honoraires par Dossier'}
        </h4>

        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-left rtl:text-right">
              <th className="p-3 font-semibold">{lang === 'ar' ? 'رقم الجدول' : 'N° Rôle Greffe'}</th>
              <th className="p-3 font-semibold">{lang === 'ar' ? 'الموكل والخصم' : 'Client & Adversaire'}</th>
              <th className="p-3 font-semibold">{lang === 'ar' ? 'إجمالي الأتعاب' : 'Total Convention'}</th>
              <th className="p-3 font-semibold">{lang === 'ar' ? 'المسدد (الوصولات)' : 'Versé (Provisions)'}</th>
              <th className="p-3 font-semibold">{lang === 'ar' ? 'المتبقي' : 'Solde Reste'}</th>
              <th className="p-3 font-semibold text-center">{lang === 'ar' ? 'إصدار الوصل' : 'Action Quittance'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {dossiers.map((d) => {
              const reste = d.honorairesTotal - d.honorairesPayes
              const pct = Math.round((d.honorairesPayes / d.honorairesTotal) * 100)

              return (
                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 font-bold font-mono text-[var(--gold-400)]">
                    {d.reference}
                  </td>
                  <td className="p-3 space-y-0.5">
                    <div className="font-semibold text-white">{lang === 'ar' && d.clientNameAr ? d.clientNameAr : d.clientName}</div>
                    <div className="text-xs text-[var(--text-muted)]">{lang === 'ar' ? `ضد ${d.adversaryName || 'الخصم'}` : `vs ${d.adversaryName || 'Adversaire'}`}</div>
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {d.honorairesTotal.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                  </td>
                  <td className="p-3 text-emerald-400 font-semibold">
                    {d.honorairesPayes.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'} ({pct}%)
                  </td>
                  <td className={`p-3 font-bold ${reste > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {reste.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 mx-auto"
                      onClick={() =>
                        openQuittanceFor({
                          clientName: d.clientNameAr || d.clientName,
                          dossierRef: d.reference,
                          amountDzd: d.honorairesPayes,
                          motif: lang === 'ar' ? `أتعاب قضية ${d.typeDroit} أمام ${d.jurisdiction}` : `Honoraires - Dossier ${d.reference}`,
                        })
                      }
                    >
                      <Printer size={14} />
                      <span>{lang === 'ar' ? 'وصل سداد' : 'وصل (Quittance)'}</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>

    </motion.div>
  )
})

AdminFinancesModule.displayName = 'AdminFinancesModule'
