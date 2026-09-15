'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Building2,
  Printer,
  X,
  Briefcase,
} from 'lucide-react'
import { useAdminStore, AdminDossier, CaseChamber } from '@/stores/adminStore'

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

        <select
          value={filterChamber}
          onChange={(e) => setFilterChamber(e.target.value)}
          className="input text-sm w-full sm:w-auto"
        >
          <option value="all">{lang === 'ar' ? 'كل الغرف' : 'Toutes les Chambres'}</option>
          <option value="FONCIER">{getChamberLabel('FONCIER')}</option>
          <option value="FAMILLE">{getChamberLabel('FAMILLE')}</option>
          <option value="COMMERCIAL">{getChamberLabel('COMMERCIAL')}</option>
          <option value="CIVIL">{getChamberLabel('CIVIL')}</option>
          <option value="ADMINISTRATIF">{getChamberLabel('ADMINISTRATIF')}</option>
          <option value="PENAL">{getChamberLabel('PENAL')}</option>
        </select>
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

      {/* Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedDossier && (
          <motion.div
            key={selectedDossier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-lg shadow-lg"
          >
            {/* Detail Header */}
            <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-h3 text-[var(--gold-400)] m-0">
                  {selectedDossier.reference}
                </h4>
                <p className="text-sm text-[var(--text-muted)] m-0 mt-1">
                  {lang === 'ar' && selectedDossier.clientNameAr ? selectedDossier.clientNameAr : selectedDossier.clientName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-between sm:justify-end">
                <button
                  onClick={() =>
                    openQuittanceFor({
                      clientName: selectedDossier.clientNameAr || selectedDossier.clientName,
                      dossierRef: selectedDossier.reference,
                      amountDzd: selectedDossier.honorairesPayes,
                      motif: lang === 'ar' ? `أتعاب قضائية - ملف رقم ${selectedDossier.reference}` : `Honoraires - Dossier ${selectedDossier.reference}`,
                    })
                  }
                  className="btn-outline text-xs flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  {lang === 'ar' ? 'وصل سداد رسمية' : 'Quittance Arabe/Français'}
                </button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDossier(null)}
                  className="btn-ghost p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Detail Content */}
            <div className="grid grid-cols-1 gap-lg lg:grid-cols-[2fr_1fr]">
              <div>
                <h5 className="text-label uppercase text-[var(--gold-400)] mb-2">
                  {lang === 'ar' ? 'موضوع النزاع والدعوى' : 'Objet du Contentieux'}
                </h5>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed bg-[rgba(0,0,0,0.2)] p-3 rounded-lg border border-[var(--border-subtle)]">
                  {lang === 'ar' && selectedDossier.descriptionAr ? selectedDossier.descriptionAr : selectedDossier.description}
                </p>

                <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
                  <div>
                    <span className="text-label">
                      {lang === 'ar' ? 'الجهة القضائية المختصة :' : 'Juridiction compétente:'}
                    </span>
                    <div className="text-sm font-semibold text-[var(--text-primary)] mt-1">
                      {getJurisdictionLabel(selectedDossier.jurisdiction, lang, selectedDossier.jurisdictionAr)}
                    </div>
                  </div>
                  <div>
                    <span className="text-label">
                      {lang === 'ar' ? 'المحامي الموكل :' : 'Avocat en charge:'}
                    </span>
                    <div className="text-sm font-semibold text-[var(--gold-400)] mt-1">
                      {lang === 'ar' && selectedDossier.avocatChargeAr ? selectedDossier.avocatChargeAr : (lang === 'ar' ? 'الأستاذ نور الدين سليماني' : selectedDossier.avocatCharge)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Honoraires Panel */}
              <div className="bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <h5 className="text-label text-[var(--text-muted)] uppercase mb-3">
                  {lang === 'ar' ? 'حالة الأتعاب والتحصيل' : 'Statut Honoraires'}
                </h5>
                <div className="space-y-3">
                  <div>
                    <div className="text-label">
                      {lang === 'ar' ? 'إجمالي الأتعاب المتفق عليها' : 'Honoraires Totaux Convenus'}
                    </div>
                    <div className="text-xl font-bold text-[var(--text-primary)] mt-1">
                      {selectedDossier.honorairesTotal.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                    </div>
                  </div>
                  <div className="border-t border-[var(--border-subtle)] pt-3">
                    <div className="text-label">
                      {lang === 'ar' ? 'المبلغ المحصل (الوصولات)' : 'Montant Encaissé (Quittances)'}
                    </div>
                    <div className="text-xl font-bold text-[#22c55e] mt-1">
                      {selectedDossier.honorairesPayes.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} {lang === 'ar' ? 'د.ج' : 'DA'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nouveau Dossier */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,6,16,0.85)] backdrop-blur-sm p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-xl border border-[var(--border-gold)] bg-[var(--bg-surface)] p-lg shadow-xl"
            >
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-h3 text-[var(--text-primary)] m-0">
                  {lang === 'ar' ? 'تسجيل ملف قضائي جديد (رقم الجدول)' : 'Enregistrer un Nouveau Dossier Juridique (رقم الجدول)'}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-ghost p-2"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleCreateDossier} className="flex flex-col gap-3">
                <div>
                  <label className="text-label block mb-1">
                    {lang === 'ar' ? 'رقم الجدول (Référence Dossier)' : 'Référence Dossier (رقم الجدول)'}
                  </label>
                  <input
                    type="text"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    className="input w-full text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-label block mb-1">
                    {lang === 'ar' ? 'اسم الموكل / الشركة' : 'Nom du Client / Société'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'مثال: بن محمد رضا' : 'Ex: Benmohamed Reda'}
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="input w-full text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-label block mb-1">
                      {lang === 'ar' ? 'الغرفة القضائية (Chambre)' : 'Chambre CPCA (الغرفة)'}
                    </label>
                    <select
                      value={newChamber}
                      onChange={(e) => setNewChamber(e.target.value as CaseChamber)}
                      className="input w-full text-sm"
                    >
                      <option value="FONCIER">{lang === 'ar' ? 'الغرفة العقارية (FONCIER)' : 'Chambre Foncière'}</option>
                      <option value="FAMILLE">{lang === 'ar' ? 'شؤون الأسرة (FAMILLE)' : 'Statut Personnel'}</option>
                      <option value="COMMERCIAL">{lang === 'ar' ? 'الغرفة التجارية (COMMERCIAL)' : 'Chambre Commerciale'}</option>
                      <option value="CIVIL">{lang === 'ar' ? 'الغرفة المدنية (CIVIL)' : 'Chambre Civile'}</option>
                      <option value="ADMINISTRATIF">{lang === 'ar' ? 'الغرفة الإدارية (ADMINISTRATIF)' : 'Chambre Administrative'}</option>
                      <option value="PENAL">{lang === 'ar' ? 'الغرفة الجزائية (PENAL)' : 'Chambre Pénal'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-label block mb-1">
                      {lang === 'ar' ? 'الأتعاب المتفق عليها (د.ج)' : 'Honoraires Convenus (DA)'}
                    </label>
                    <input
                      type="number"
                      value={newHonoraires}
                      onChange={(e) => setNewHonoraires(e.target.value)}
                      className="input w-full text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-label block mb-1">
                    {lang === 'ar' ? 'الجهة القضائية (Jurisdiction)' : 'Jurisdiction (الجهة القضائية)'}
                  </label>
                  <input
                    type="text"
                    value={newJurisdiction}
                    onChange={(e) => setNewJurisdiction(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="text-label block mb-1">
                    {lang === 'ar' ? 'ملخص موضوع النزاع والقضية' : 'Description du Contentieux'}
                  </label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="input w-full text-sm resize-none"
                    placeholder={lang === 'ar' ? 'ملخص الدعوى والطلبات...' : "Résumé de l'affaire..."}
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2 mt-2">
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddModalOpen(false)}
                    className="btn-outline text-sm"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary text-sm"
                  >
                    {lang === 'ar' ? 'إنشاء الملف' : 'Créer le Dossier'}
                  </motion.button>
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
