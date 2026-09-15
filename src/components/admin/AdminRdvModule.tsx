// AdminRdvModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Module de gestion de l'Agenda & Rendez-vous (Cabinet & Visioconférence)
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Video, Building2, Search, Phone, Mail } from 'lucide-react'
import { useAdminStore, AdminRdv } from '@/stores/adminStore'

const VARIANTS = {
  container: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },
}

export const AdminRdvModule = memo(() => {
  const { rdvs, updateRdvStatut, lang } = useAdminStore()
  const [filterStatut, setFilterStatut] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRdvs = rdvs.filter((rdv) => {
    const matchesFilter = filterStatut === 'all' || rdv.statut === filterStatut
    const matchesSearch =
      rdv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.telephone.includes(searchTerm)
    return matchesFilter && matchesSearch
  })

  return (
    <motion.div variants={VARIANTS.container} initial="initial" animate="animate" className="flex flex-col gap-6 w-full">
      
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
            {lang === 'ar' ? 'إدارة الأجندة والمواعيد والجلسات' : "Gestion de l'Agenda & Rendez-vous"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            {lang === 'ar' ? 'استشارات بمقر المكتب ببئر خادم واجتماعات مرئية آمنة' : 'Consultations en cabinet à Bir Khadem et Visioconférences sécurisées'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'بحث بالاسم، الهاتف...' : 'Rechercher par nom, tél...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 text-xs sm:text-sm w-48 sm:w-60"
            />
          </div>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="input text-xs sm:text-sm"
          >
            <option value="all">{lang === 'ar' ? 'جميع الحالات' : 'Tous les statuts'}</option>
            <option value="Confirmé">{lang === 'ar' ? 'مؤكد' : 'Confirmé'}</option>
            <option value="En attente">{lang === 'ar' ? 'قيد الانتظار' : 'En attente'}</option>
            <option value="Terminé">{lang === 'ar' ? 'مكتمل' : 'Terminé'}</option>
            <option value="Annulé">{lang === 'ar' ? 'ملغى' : 'Annulé'}</option>
          </select>
        </div>
      </div>

      {/* RDV Cards List */}
      <div className="flex flex-col gap-3.5">
        {filteredRdvs.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center text-[var(--text-muted)]">
            <Calendar size={40} className="text-[var(--gold-400)] opacity-60 mx-auto mb-3" />
            <p className="text-sm font-medium">
              {lang === 'ar' ? 'لا توجد مواعيد تطابق معايير البحث.' : 'Aucun rendez-vous ne correspond à vos critères de recherche.'}
            </p>
          </div>
        ) : (
          filteredRdvs.map((rdv) => (
            <motion.div
              key={rdv.id}
              variants={VARIANTS.item}
              className="rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-gold)] bg-[var(--bg-surface)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-[var(--shadow-card)]"
            >
              {/* Client & Time info */}
              <div className="flex items-center gap-4">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-gold)] rounded-xl p-3 text-center min-w-[110px] shrink-0 shadow-md">
                  <div className="text-[0.68rem] text-[var(--text-muted)] uppercase tracking-wider font-semibold">{rdv.date}</div>
                  <div className="text-lg font-bold text-[var(--gold-400)] font-mono tracking-wider">
                    {rdv.heureDebut}
                  </div>
                  <div className="text-[0.68rem] text-[var(--text-muted)]">{lang === 'ar' ? `إلى ${rdv.heureFin}` : `à ${rdv.heureFin}`}</div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-white font-serif tracking-wide truncate">
                      {lang === 'ar' && rdv.clientNameAr ? rdv.clientNameAr : rdv.clientName}
                    </h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--gold-glow)] border border-[var(--border-gold)] text-[var(--gold-400)] font-medium inline-flex items-center gap-1.5">
                      {rdv.creneauType.includes('Visioconférence') ? <Video size={13} /> : <Building2 size={13} />}
                      {lang === 'ar'
                        ? (rdv.creneauType.includes('Cabinet') ? 'بمقر المكتب (بئر خادم)' : 'اجتماع مرئي آمن')
                        : rdv.creneauType}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--text-primary)] leading-snug">
                    {lang === 'ar' && rdv.motifAr ? rdv.motifAr : rdv.motif}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] flex-wrap pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-[var(--gold-400)] shrink-0" />
                      {rdv.telephone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-[var(--gold-400)] shrink-0" />
                      {rdv.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-3 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-subtle)]">
                <select
                  value={rdv.statut}
                  onChange={(e) => updateRdvStatut(rdv.id, e.target.value as AdminRdv['statut'])}
                  className={`input text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    rdv.statut === 'Confirmé'
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      : rdv.statut === 'En attente'
                      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      : rdv.statut === 'Terminé'
                      ? 'text-[var(--gold-400)] border-[var(--border-gold)] bg-[var(--gold-glow)]'
                      : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                  }`}
                >
                  <option value="Confirmé">{lang === 'ar' ? '✓ مؤكد' : '✓ Confirmé'}</option>
                  <option value="En attente">{lang === 'ar' ? '⏳ قيد الانتظار' : '⏳ En attente'}</option>
                  <option value="Terminé">{lang === 'ar' ? '✔ مكتمل' : '✔ Terminé'}</option>
                  <option value="Annulé">{lang === 'ar' ? '✕ ملغى' : '✕ Annulé'}</option>
                </select>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </motion.div>
  )
})

AdminRdvModule.displayName = 'AdminRdvModule'
