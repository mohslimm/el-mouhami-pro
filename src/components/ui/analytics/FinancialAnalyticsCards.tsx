import { memo, useState } from 'react'
import { ArrowUpRight, TrendingUp, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChamberRevenue {
  chamberKey: string
  labelAr: string
  labelFr: string
  revenueDzd: number
  percentage: number
  casesCount: number
  color: string
}

export interface FinancialAnalyticsProps {
  lang: 'ar' | 'fr'
  totalHonorairesTotal: number
  totalHonorairesPayes: number
  totalReste: number
  className?: string
}

export const FinancialAnalyticsCards = memo(({
  lang,
  totalHonorairesTotal,
  totalHonorairesPayes,
  totalReste,
  className,
}: FinancialAnalyticsProps) => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('year')

  // Chamber breakdown mock data aligned with cabinet chambers
  const chamberData: ChamberRevenue[] = [
    { chamberKey: 'FONCIER', labelAr: 'القسم العقاري', labelFr: 'Chambre Foncière', revenueDzd: totalHonorairesPayes * 0.42, percentage: 42, casesCount: 14, color: '#c5a059' },
    { chamberKey: 'COMMERCIAL', labelAr: 'القسم التجاري', labelFr: 'Chambre Commerciale', revenueDzd: totalHonorairesPayes * 0.28, percentage: 28, casesCount: 8, color: '#3b82f6' },
    { chamberKey: 'CIVIL', labelAr: 'القسم المدني', labelFr: 'Chambre Civile', revenueDzd: totalHonorairesPayes * 0.18, percentage: 18, casesCount: 6, color: '#10b981' },
    { chamberKey: 'FAMILLE', labelAr: 'شؤون الأسرة', labelFr: 'Chambre Famille', revenueDzd: totalHonorairesPayes * 0.12, percentage: 12, casesCount: 5, color: '#a855f7' },
  ]

  const recoveryRate = Math.round((totalHonorairesPayes / (totalHonorairesTotal || 1)) * 100)

  return (
    <div className={cn('flex flex-col gap-4', className)} style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <h3 className="text-base font-bold text-[var(--gold-400)] flex items-center gap-2">
            <TrendingUp size={18} />
            {lang === 'ar' ? 'تحليلات الأداء المالي لمكتب المحاماة (Slash-Admin)' : 'Analytique Financière du Cabinet (Slash-Admin)'}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {lang === 'ar' ? 'مؤشرات التحصيل والتدفقات المالية حسب الغرف القضائية' : 'Indicateurs de recouvrement et flux par chambre.'}
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1 text-xs">
          {(
            [
              { id: 'month', ar: 'الشهر الحالي', fr: 'Ce Mois' },
              { id: 'quarter', ar: 'الثلاثي', fr: 'Trimestre' },
              { id: 'year', ar: 'السنة المالية', fr: 'Année 2026' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={cn(
                'rounded-md px-2.5 py-1 transition-colors font-medium',
                period === item.id
                  ? 'bg-[var(--gold-glow)] text-[var(--gold-400)] border border-[var(--border-gold)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-white'
              )}
            >
              {lang === 'ar' ? item.ar : item.fr}
            </button>
          ))}
        </div>
      </div>

      {/* Grid 1: Analytics Bar + Recovery Rate Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Recovery Rate Widget */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex flex-col justify-between" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">
              {lang === 'ar' ? 'نسبة التحصيل (Taux de Recouvrement)' : 'Taux de Recouvrement'}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={14} /> +8.4%
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-bold font-mono text-[var(--text-primary)]">
              {recoveryRate}%
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 whitespace-nowrap">
              {lang === 'ar'
                ? `تم تحصيل ${totalHonorairesPayes.toLocaleString('ar-DZ')} د.ج (المتبقي: ${totalReste.toLocaleString('ar-DZ')} د.ج)`
                : `${totalHonorairesPayes.toLocaleString('fr-DZ')} DA encaissés (Reste: ${totalReste.toLocaleString('fr-DZ')} DA)`}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, recoveryRate)}%` }}
            />
          </div>
        </div>

        {/* Chamber Revenue Distribution (Pie breakdown) */}
        <div className="md:col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--text-muted)] uppercase font-semibold flex items-center gap-1.5">
              <PieChart size={15} className="text-[var(--gold-400)]" />
              {lang === 'ar' ? 'توزيع الأتعاب حسب الغرف القضائية' : 'Répartition des Honoraires par Chambre'}
            </span>
            <span className="text-[0.7rem] font-mono text-[var(--gold-400)]">
              {lang === 'ar' ? 'القانون 13-07' : 'Loi 13-07'}
            </span>
          </div>

          {/* Chamber Breakdown Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chamberData.map((c) => (
              <div
                key={c.chamberKey}
                className="flex flex-col gap-1.5 rounded-lg border border-white/5 bg-[var(--bg-elevated)] p-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {lang === 'ar' ? c.labelAr : c.labelFr}
                  </div>
                  <span className="font-mono text-[var(--text-muted)]">{c.percentage}%</span>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{c.casesCount} {lang === 'ar' ? 'ملفات' : 'dossiers'}</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {Math.round(c.revenueDzd).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                  </span>
                </div>

                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
})

FinancialAnalyticsCards.displayName = 'FinancialAnalyticsCards'
