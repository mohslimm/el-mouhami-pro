// EnaabaModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & PRESTIGE SPEC)
// 1-Click Hearing Delegation Slip Generator (ورقة الإنابة القضائية الرسمية)
// Conforme au Code de Procédure Civile et Administrative (CPCA 08-09)
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Printer,
  X,
  Scale,
  Sparkles,
  FileCheck2,
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { BorderBeam } from '@/components/ui/magicui/border-beam'

interface EnaabaModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EnaabaModal = memo(({ isOpen, onClose }: EnaabaModalProps) => {
  const { lang, enaabaData, dossiers, license } = useAdminStore()
  const isAr = lang === 'ar'
  const printSlipRef = useRef<HTMLDivElement>(null)

  // Form Fields
  const [delegateeName, setDelegateeName] = useState(
    enaabaData?.lawyerDelegatee?.nameAr || enaabaData?.lawyerDelegatee?.name || 'الأستاذة فريدة بن علي'
  )
  const [delegateeBarreau, setDelegateeBarreau] = useState(
    enaabaData?.lawyerDelegatee?.jurisdictionAr || 'منظمة المحامين لناحية الجزائر'
  )
  const [dossierRef, setDossierRef] = useState(enaabaData?.dossierRef || '24/00412')
  const [clientName, setClientName] = useState(enaabaData?.clientName || 'بن محمد رضا')
  const [adversaryName, setAdversaryName] = useState(enaabaData?.adversaryName || 'بن عيسى كمال')
  const [jurisdiction, setJurisdiction] = useState(enaabaData?.jurisdiction || "محكمة سيدي امحمد")
  const [chamber, setChamber] = useState(enaabaData?.chamber || 'القسم العقاري - الغرفة الأولى')
  const [dateAudience, setDateAudience] = useState(enaabaData?.dateAudience || '2026-08-18')
  const [instructions, setInstructions] = useState(
    enaabaData?.instructions ||
      'المطالبة بتأجيل القضية لجواب الخصم مع تقديم المذكرة الجوابية ومستندات سند الملكية المشهر.'
  )
  const [hearingType, setHearingType] = useState<'renvoi' | 'plaidoirie' | 'jugement' | 'formalites'>(
    enaabaData?.hearingType || 'renvoi'
  )
  const [slipNumber] = useState(() => `ENB-2026/${Math.floor(1000 + Math.random() * 9000)}`)

  // Sync when enaabaData updates
  useEffect(() => {
    if (enaabaData) {
      if (enaabaData.lawyerDelegatee) {
        setDelegateeName(enaabaData.lawyerDelegatee.nameAr || enaabaData.lawyerDelegatee.name)
        setDelegateeBarreau(enaabaData.lawyerDelegatee.jurisdictionAr || 'منظمة المحامين لناحية الجزائر')
      }
      if (enaabaData.dossierRef) setDossierRef(enaabaData.dossierRef)
      if (enaabaData.clientName) setClientName(enaabaData.clientName)
      if (enaabaData.adversaryName) setAdversaryName(enaabaData.adversaryName)
      if (enaabaData.jurisdiction) setJurisdiction(enaabaData.jurisdiction)
      if (enaabaData.chamber) setChamber(enaabaData.chamber)
      if (enaabaData.dateAudience) setDateAudience(enaabaData.dateAudience)
      if (enaabaData.instructions) setInstructions(enaabaData.instructions)
      if (enaabaData.hearingType) setHearingType(enaabaData.hearingType)
    }
  }, [enaabaData])

  // Select a preset from dossiers list
  const handleSelectDossier = (dosId: string) => {
    const dos = dossiers.find((d) => d.id === dosId)
    if (dos) {
      setDossierRef(dos.reference)
      setClientName(dos.clientNameAr || dos.clientName)
      setAdversaryName(dos.adversaryName || 'الخصم')
      setJurisdiction(dos.jurisdictionAr || dos.jurisdiction)
      setChamber(dos.section || 'الغرفة المدنية')
      setDateAudience(dos.dateProchaineAudience || '2026-08-18')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl overflow-y-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-[#0f1222] border border-amber-500/40 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden my-auto text-[#F0EDE8]"
        >
          {/* Top Gold Border Beam */}
          <BorderBeam size={160} duration={8} colorFrom="#c5a059" colorTo="#f59e0b" />

          {/* Modal Header */}
          <div className="relative px-6 sm:px-8 py-5 border-b border-white/10 bg-[#121526]/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                <Scale size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-serif tracking-wide">
                  {isAr ? 'مولد ورقة الإنابة القضائية (ورقة الجلسة الرسمية)' : 'Générateur de Bordereau d’Énaaba Judiciaire'}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isAr
                    ? 'إنابة زميل محام لحضور الجلسة وفقاً لقانون الإجراءات المدنية والإدارية 08-09'
                    : 'Subrogation et délégation d’audience selon les règles et us du Barreau'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Split Pane Body: Editor Controls (Left/Right) + Live A4 Slip Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 max-h-[78vh] overflow-y-auto">

            {/* ─── PANE 1: EDIT CONTROLS & DOSSIER PICKER (5 Cols) ─── */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-[#060610] border border-white/10 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles size={14} /> {isAr ? 'ربط سريع بقضية من السجل' : 'Lier à un Dossier du Cabinet'}
                </span>
                <select
                  onChange={(e) => handleSelectDossier(e.target.value)}
                  className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">{isAr ? '-- اختر قضية لتحميل بياناتها تلقائياً --' : '-- Choisir un dossier --'}</option>
                  {dossiers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.reference} - {d.clientNameAr || d.clientName} ({d.jurisdictionAr || d.jurisdiction})
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    {isAr ? 'الزميل المحامي المـُناب (المستلم للإنابة):' : 'Confrère Avocat Délégataire :'}
                  </label>
                  <input
                    type="text"
                    value={delegateeName}
                    onChange={(e) => setDelegateeName(e.target.value)}
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-serif font-bold text-amber-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    {isAr ? 'منظمة المحامين التابع لها الزميل:' : 'Barreau de Rattachement :'}
                  </label>
                  <input
                    type="text"
                    value={delegateeBarreau}
                    onChange={(e) => setDelegateeBarreau(e.target.value)}
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      {isAr ? 'رقم القضية / الجدول:' : 'N° Rôle / Affaire :'}
                    </label>
                    <input
                      type="text"
                      value={dossierRef}
                      onChange={(e) => setDossierRef(e.target.value)}
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      {isAr ? 'تاريخ الجلسة:' : 'Date de l’Audience :'}
                    </label>
                    <input
                      type="date"
                      value={dateAudience}
                      onChange={(e) => setDateAudience(e.target.value)}
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      {isAr ? 'الموكل (الطالب / المدعي):' : 'Client Mandant :'}
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      {isAr ? 'الخصم (المدعى عليه):' : 'Partie Adverse :'}
                    </label>
                    <input
                      type="text"
                      value={adversaryName}
                      onChange={(e) => setAdversaryName(e.target.value)}
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      {isAr ? 'الهيئة القضائية:' : 'Juridiction :'}
                    </label>
                    <input
                      type="text"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      {isAr ? 'القسم / الغرفة:' : 'Section / Chambre :'}
                    </label>
                    <input
                      type="text"
                      value={chamber}
                      onChange={(e) => setChamber(e.target.value)}
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Scope Presets */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    {isAr ? 'نوع الطلب في الجلسة:' : 'Mission / Objet d’Audience :'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'renvoi', labelAr: 'طلب التأجيل لجواب الخصم', labelFr: 'Renvoi pour réplique' },
                      { id: 'plaidoirie', labelAr: 'المرافعة الموضوعية', labelFr: 'Plaidoirie au fond' },
                      { id: 'jugement', labelAr: 'إيداع الملف للحكم', labelFr: 'Mise en délibéré' },
                      { id: 'formalites', labelAr: 'تسجيل وتبليغ عريضة', labelFr: 'Formalités & recours' },
                    ].map((scope) => (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => {
                          setHearingType(scope.id as any)
                          if (scope.id === 'renvoi') {
                            setInstructions('المطالبة بتأجيل القضية لجواب الخصم وتقديم المذكرة الجوابية.')
                          } else if (scope.id === 'plaidoirie') {
                            setInstructions('المرافعة بحسب العريضة الافتتاحية والمطالبة بتثبيت الملكية.')
                          } else if (scope.id === 'jugement') {
                            setInstructions('إيداع الملف والوثائق الأصلية مع طلب حجز القضية للبت والنطق بالحكم.')
                          }
                        }}
                        className={`p-2 rounded-xl border text-[0.7rem] font-semibold text-center cursor-pointer transition-all ${
                          hearingType === scope.id
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                            : 'bg-[#121526] border-white/10 text-stone-400 hover:text-white'
                        }`}
                      >
                        {isAr ? scope.labelAr : scope.labelFr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instructions Text */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    {isAr ? 'تعليمات الجلسة الدقيقة للزميل المـُناب:' : 'Instructions pour l’audience :'}
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl p-3 text-xs text-white leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ─── PANE 2: LIVE OFFICIAL PRINTABLE SLIP (7 Cols) ─── */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 px-1 text-xs text-stone-400">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <FileCheck2 size={15} />
                  {isAr ? 'معاينة ورقة الإنابة القضائية الرسمية (A4)' : 'Aperçu Document Officiel (Bordereau A4)'}
                </span>
                <span className="font-mono text-stone-500">{slipNumber}</span>
              </div>

              {/* Printable White Paper Slip Container */}
              <div
                ref={printSlipRef}
                className="enaaba-print-document w-full bg-white text-stone-900 rounded-2xl p-7 border-2 border-amber-600/40 shadow-2xl shadow-black/80 font-serif relative"
                dir="rtl"
                style={{ minHeight: '520px' }}
              >
                {/* Algerian Republic Header */}
                <div className="text-center border-b-2 border-stone-800 pb-3 mb-4">
                  <h4 className="text-sm font-bold text-stone-800 tracking-wide mb-0.5">
                    الجمهورية الجزائرية الديمقراطية الشعبية
                  </h4>
                  <p className="text-[0.72rem] text-stone-600 font-sans">
                    منظمة المحامين لناحية الجزائر &bull; النقابة الوطنية للمحامين
                  </p>
                  <div className="mt-2 text-xs font-bold text-stone-950 font-serif">
                    مكتب الأستاذ: <span className="text-base text-amber-900 font-bold">{license.lawyerNameAr || 'نور الدين سليماني'}</span>
                  </div>
                  <p className="text-[0.68rem] text-stone-600">
                    محام معتمد لدى المحكمة العليا ومجلس الدولة &bull; بطاقة مهنية رقم: {license.barreauNumber || '16-08422'}
                  </p>
                </div>

                {/* Main Slip Title */}
                <div className="text-center my-4 py-2 border-y-2 border-amber-700 bg-amber-50/60">
                  <h3 className="text-lg font-extrabold text-stone-950 font-serif tracking-wider">
                    ورقــة إنابــة قضائيــة فــي الجلســة
                  </h3>
                  <span className="text-[0.68rem] font-sans text-stone-700">
                    طبقاً للمادة 09 من القانون العضوي للمحاماة وقانون الإجراءات المدنية والإدارية 08-09
                  </span>
                </div>

                {/* Document Body */}
                <div className="text-xs space-y-3 leading-relaxed text-stone-900">
                  <p>
                    أنا الموقع أسفله، <strong>الأستاذ {license.lawyerNameAr || 'نور الدين سليماني'}</strong>، محام لدى المحكمة العليا ومجلس الدولة،
                  </p>
                  <div className="p-3 bg-stone-50 border border-stone-300 rounded-lg">
                    <p className="text-stone-950">
                      <strong>أنيب عني الزميل(ة) الأستاذ(ة):</strong>{' '}
                      <span className="text-sm font-bold text-amber-950 underline underline-offset-4">
                        {delegateeName || '...................................................'}
                      </span>
                    </p>
                    <p className="text-[0.72rem] text-stone-700 mt-1">
                      المعتمد(ة) لدى {delegateeBarreau || 'منظمة المحامين'}.
                    </p>
                  </div>

                  {/* Case coordinates table */}
                  <table className="w-full text-xs border border-stone-400 mt-2">
                    <tbody>
                      <tr className="border-b border-stone-300">
                        <td className="p-2 bg-stone-100 font-bold w-1/3">الهيئة القضائية:</td>
                        <td className="p-2 font-bold">{jurisdiction}</td>
                      </tr>
                      <tr className="border-b border-stone-300">
                        <td className="p-2 bg-stone-100 font-bold">القسم / الغرفة:</td>
                        <td className="p-2">{chamber}</td>
                      </tr>
                      <tr className="border-b border-stone-300">
                        <td className="p-2 bg-stone-100 font-bold">رقم القضية / الجدول:</td>
                        <td className="p-2 font-mono font-bold text-amber-900">{dossierRef}</td>
                      </tr>
                      <tr className="border-b border-stone-300">
                        <td className="p-2 bg-stone-100 font-bold">تاريخ وساعة الجلسة:</td>
                        <td className="p-2 font-bold">{dateAudience} (الساعة 09:00 صباحاً)</td>
                      </tr>
                      <tr className="border-b border-stone-300">
                        <td className="p-2 bg-stone-100 font-bold">أطراف الخصومة:</td>
                        <td className="p-2">
                          <strong>{clientName}</strong> ضد <strong>{adversaryName}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Instructions Box */}
                  <div className="p-3 bg-amber-50/40 border border-amber-600/30 rounded-lg mt-3">
                    <strong className="block text-amber-950 mb-1">التعليمات الخاصة بالجلسة:</strong>
                    <p className="text-stone-900 text-[0.75rem] font-sans leading-relaxed">
                      {instructions}
                    </p>
                  </div>
                </div>

                {/* Footer with Seal & Signature Area */}
                <div className="mt-6 pt-4 border-t border-stone-300 flex items-center justify-between text-xs">
                  <div>
                    <span>تحريراً بالجزائر في: {new Date().toLocaleDateString('ar-DZ')}</span>
                    <p className="text-[0.65rem] text-stone-500 mt-0.5">مع خالص التحيات الأخوية وواجب الزملاء</p>
                  </div>

                  <div className="text-center pl-6">
                    <strong className="block mb-6">ختم وإمضاء الأستاذ المـُنيب</strong>
                    <div className="w-24 h-12 border-2 border-dashed border-stone-400 rounded-lg flex items-center justify-center text-[0.65rem] text-stone-400 font-sans">
                      [ختم المكتب]
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center justify-between gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold cursor-pointer transition-all border border-white/10"
                >
                  {isAr ? 'إلغاء' : 'Fermer'}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/40 transition-all active:scale-[0.99]"
                  >
                    <Printer size={16} />
                    <span>{isAr ? 'طباعة ورقة الإنابة فوراً (Print)' : 'Imprimer le Bordereau'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
})

EnaabaModal.displayName = 'EnaabaModal'
