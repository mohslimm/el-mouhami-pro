// FinancialAnalyticsCards.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Tableau de bord analytique des honoraires & recouvrement par chambre (Loi 13-07)
// ─────────────────────────────────────────────────────────────────────────────

'use client'

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
  const isAr = lang === 'ar'
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('year')

  // Chamber breakdown mock data aligned with cabinet chambers
  const chamberData: ChamberRevenue[] = [
    {
      chamberKey: 'FONCIER',
      labelAr: 'القسم العقاري',
      labelFr: 'Chambre Foncière',
      revenueDzd: totalHonorairesPayes * 0.42,
      percentage: 42,
      casesCount: 14,
      color: '#C39B57', // Warm brass
    },
    {
      chamberKey: 'COMMERCIAL',
      labelAr: 'القسم التجاري',
      labelFr: 'Chambre Commerciale',
      revenueDzd: totalHonorairesPayes * 0.28,
      percentage: 28,
      casesCount: 8,
      color: '#38BDF8', // Cyan
    },
    {
      chamberKey: 'CIVIL',
      labelAr: 'القسم المدني',
      labelFr: 'Chambre Civile',
      revenueDzd: totalHonorairesPayes * 0.18,
      percentage: 18,
      casesCount: 6,
      color: '#34D399', // Emerald
    },
    {
      chamberKey: 'FAMILLE',
      labelAr: 'شؤون الأسرة',
      labelFr: 'Chambre Famille',
      revenueDzd: totalHonorairesPayes * 0.12,
      percentage: 12,
      casesCount: 5,
      color: '#A78BFA', // Purple
    },
  ]

  const recoveryRate = Math.round((totalHonorairesPayes / (totalHonorairesTotal || 1)) * 100)

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      
      {/* ── HEADER & PERIOD SELECTOR ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-base font-bold text-white font-serif tracking-wide flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp size={16} />
            </span>
            <span>
              {isAr
                ? 'مؤشرات الأداء المالي ونسب التحصيل'
                : 'Indicateurs de Performance Financière & Recouvrement'}
            </span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            {isAr
              ? 'متابعة التدفقات النقدية ونسب الاسترداد حسب الغرف والأقسام القضائية'
              : 'Suivi des flux de trésorerie et taux de recouvrement par chambre.'}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#0f1222] p-1 text-xs self-start sm:self-auto shadow-sm">
          {(
            [
              { id: 'month', ar: 'الشهر الجاري', fr: 'Ce Mois' },
              { id: 'quarter', ar: 'الثلاثي الحالي', fr: 'Trimestre' },
              { id: 'year', ar: 'السنة المالية (2026)', fr: 'Exercice 2026' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 transition-all font-medium cursor-pointer',
                period === item.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              {isAr ? item.ar : item.fr}
            </button>
          ))}
        </div>
      </div>

      {/* ── ANALYTICS CARDS GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Widget 1: Taux de Recouvrement (Recovery Gauge) */}
        <div className="rounded-2xl border border-white/10 hover:border-amber-500/30 bg-[#121526]/90 p-5 flex flex-col justify-between shadow-xl shadow-black/40 backdrop-blur-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-stone-300 uppercase tracking-wider font-semibold">
                {isAr ? 'نسبة التحصيل الإجمالية' : 'Taux de Recouvrement'}
              </span>
              <span
                dir="ltr"
                className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full shadow-sm"
              >
                <ArrowUpRight size={13} />
                <span>+8.4%</span>
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  {recoveryRate}%
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  {isAr ? 'مستوفى من العقود' : 'Encaissé'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                {isAr ? (
                  <>
                    تم تحصيل <span className="font-mono text-emerald-400 font-bold">{totalHonorairesPayes.toLocaleString('fr-DZ')} د.ج</span>
                    <br />
                    المتبقي قيد المتابعة: <span className="font-mono text-rose-400 font-bold">{totalReste.toLocaleString('fr-DZ')} د.ج</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-emerald-400 font-bold">{totalHonorairesPayes.toLocaleString('fr-DZ')} DA</span> encaissés
                    <br />
                    Reste à recouvrer: <span className="font-mono text-rose-400 font-bold">{totalReste.toLocaleString('fr-DZ')} DA</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar Gauge */}
          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-[#141829] border border-white/10 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-md shadow-amber-500/20"
                style={{ width: `${Math.min(100, recoveryRate)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Chamber Revenue Distribution */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 hover:border-amber-500/30 bg-[#121526]/90 p-5 shadow-xl shadow-black/40 backdrop-blur-md transition-all">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <span className="text-xs text-stone-300 uppercase tracking-wider font-semibold flex items-center gap-2">
              <PieChart size={15} className="text-amber-400" />
              <span>
                {isAr ? 'توزيع الأتعاب والسيولة حسب الغرف القضائية' : 'Répartition des Honoraires par Chambre'}
              </span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
              {isAr ? (
                <>القانون رقم <span dir="ltr" className="font-mono font-bold">13-07</span></>
              ) : (
                'Loi n° 13-07'
              )}
            </span>
          </div>

          {/* Chamber Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chamberData.map((c) => (
              <div
                key={c.chamberKey}
                className="flex flex-col gap-2 rounded-xl border border-white/5 bg-[#141829]/90 hover:border-white/15 p-3.5 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{isAr ? c.labelAr : c.labelFr}</span>
                  </div>
                  <span className="font-mono font-bold px-2 py-0.5 rounded-md text-[11px] bg-white/5 border border-white/10" style={{ color: c.color }}>
                    {c.percentage}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400 pt-0.5">
                  <span className="text-[11px]">
                    {c.casesCount} {isAr ? 'ملفات قضائية' : 'dossiers'}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {Math.round(c.revenueDzd).toLocaleString('fr-DZ')} {isAr ? 'د.ج' : 'DA'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#0B0D17] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-sm"
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
