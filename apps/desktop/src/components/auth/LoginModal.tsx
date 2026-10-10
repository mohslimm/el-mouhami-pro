// LoginModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & PRESTIGE SPEC)
// Smart Login & License Screen: Single Smart Input, Auto-Detect, 14-Day Trial
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  KeyRound,
  ShieldCheck,
  Building2,
  Users,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Phone,
  CreditCard,
  Laptop,
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { BorderBeam } from '@/components/ui/magicui/border-beam'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LoginModal = memo(({ isOpen, onClose }: LoginModalProps) => {
  const { lang, activateLicenseKey, startFreeTrial, license, setLicense } = useAdminStore()
  const isAr = lang === 'ar'

  const [mode, setMode] = useState<'smart_input' | 'trial'>('smart_input')
  const [smartValue, setSmartValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Trial form fields
  const [barreauNum, setBarreauNum] = useState(license.barreauNumber || '16-08422')
  const [lawyerPhone, setLawyerPhone] = useState(license.lawyerPhone || '0550 12 98 43')
  const [lawyerName, setLawyerName] = useState(license.lawyerName || 'الأستاذ نور الدين سليماني')
  const [barreauRegion, setBarreauRegion] = useState('منظمة المحامين لناحية الجزائر (Alger)')

  // Device & Biometric preferences
  const [biometricEnabled, setBiometricEnabled] = useState(license.isBiometricEnabled)
  const [rememberDevice, setRememberDevice] = useState(license.rememberDevice)

  // Real-time detection of input type
  const detectedType = useMemo(() => {
    const val = smartValue.trim().toUpperCase()
    if (!val) return null
    if (val.startsWith('CAB-')) {
      return {
        type: 'cabinet',
        labelFr: '🏢 Clé Licence Cabinet Détectée (Installation Maître / Titulaire)',
        labelAr: '🏢 تم التعرف على ترخيص رئيس المكتب (مكتب رئيسي معتمد)',
        color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        badge: 'Cabinet Master',
      }
    }
    if (val.startsWith('SEC-')) {
      return {
        type: 'secretaire',
        labelFr: '👩‍💼 Code Collaborateur Détecté (Poste Secrétariat / Accueil)',
        labelAr: '👩‍💼 تم التعرف على كود انضمام جهاز السكرتارية والمتابعة',
        color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        badge: 'Secrétariat Desk',
      }
    }
    if (val.startsWith('ASSO-')) {
      return {
        type: 'associe',
        labelFr: '⚖️ Code Collaborateur Détecté (Poste Confrère Associé / Stagiaire)',
        labelAr: '⚖️ تم التعرف على كود انضمام جهاز الزميل المساعد / المتربص',
        color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
        badge: 'Associé Desk',
      }
    }
    return {
      type: 'unknown',
      labelFr: 'Clé non reconnue (Format requis: CAB-... ou SEC-... ou ASSO-...)',
      labelAr: 'صيغة غير معروفة (يرجى إدخال مفتاح بصيغة CAB-... أو SEC-... أو ASSO-...)',
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      badge: 'Format Inconnu',
    }
  }, [smartValue])

  const handleSmartSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!smartValue.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال مفتاح الترخيص أو كود الدعوة' : 'Veuillez saisir votre clé ou code')
      return
    }

    const res = activateLicenseKey(smartValue.trim())
    if (res.success) {
      setSuccessMessage(isAr ? res.messageAr : res.message)
      setLicense({ isBiometricEnabled: biometricEnabled, rememberDevice })
      setTimeout(() => {
        onClose()
      }, 1200)
    } else {
      setErrorMessage(isAr ? res.messageAr : res.message)
    }
  }

  const handleTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    if (!barreauNum.trim() || !lawyerPhone.trim()) {
      setErrorMessage(
        isAr
          ? 'يرجى إدخال رقم بطاقة المحاماة ورقم الهاتف'
          : 'Veuillez renseigner le numéro de carte du barreau et le téléphone'
      )
      return
    }

    startFreeTrial(barreauNum, lawyerPhone, lawyerName)
    setLicense({ isBiometricEnabled: biometricEnabled, rememberDevice })
    setSuccessMessage(
      isAr
        ? 'تم تفعيل الفترة التجريبية (14 يوماً) بنجاح مع كامل الصلاحيات!'
        : 'Essai gratuit de 14 jours activé avec succès avec accès complet !'
    )
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl bg-[#0f1222] border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden my-auto text-[#F0EDE8]"
        >
          {/* Subtle Top Border Beam Effect */}
          <BorderBeam size={160} duration={8} colorFrom="#c5a059" colorTo="#f59e0b" />

          {/* Modal Header */}
          <div className="relative px-7 pt-7 pb-5 border-b border-white/10 bg-[#121526]/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1a1d2e] to-[#0f1222] border border-amber-500/40 flex items-center justify-center text-[#C39B57] shadow-lg shadow-black/50">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif tracking-wide">
                  {isAr ? 'تفعيل ترخيص المحامي برو' : 'Authentification & Licence Cabinet'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isAr
                    ? 'منظومة التشغيل المكتبي المغلقة والمشفرة للمحامين'
                    : 'Système d’exploitation juridique offline-first'}
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

          {/* Mode Switcher Tabs */}
          <div className="px-7 pt-5">
            <div className="grid grid-cols-2 p-1 bg-[#060610] rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('smart_input')
                  setErrorMessage(null)
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'smart_input'
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <KeyRound size={15} />
                <span>{isAr ? 'ترخيص أو كود دعوة' : 'Clé ou Code Invité'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('trial')
                  setErrorMessage(null)
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'trial'
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Sparkles size={15} />
                <span>{isAr ? 'تجربة مجانية (14 يوماً)' : 'Essai Gratuit 14 Jours'}</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          <div className="px-7 pt-4">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </div>

          {/* Mode 1: Smart Input */}
          {mode === 'smart_input' && (
            <form onSubmit={handleSmartSubmit} className="p-7 pt-3 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  {isAr ? 'حقل التحقق الذكي الموحد (Smart Single Input)' : 'Saisie Intelligente Unifiée'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={smartValue}
                    onChange={(e) => setSmartValue(e.target.value)}
                    placeholder={
                      isAr
                        ? 'الصق مفتاح الترخيص CAB-... أو كود الدعوة SEC-... / ASSO-...'
                        : 'Collez votre clé (CAB-...) ou code invité (SEC-... / ASSO-...)'
                    }
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400/80 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-stone-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  {smartValue && (
                    <button
                      type="button"
                      onClick={() => setSmartValue('')}
                      className="absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Real-time detection badge */}
                {detectedType && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2.5 p-2.5 rounded-xl border text-xs flex items-center justify-between ${detectedType.color}`}
                  >
                    <span>{isAr ? detectedType.labelAr : detectedType.labelFr}</span>
                    <span className="font-mono text-[0.65rem] px-2 py-0.5 rounded-md bg-black/40 border border-white/10 uppercase font-bold">
                      {detectedType.badge}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Sample prefilled keys for quick testing */}
              <div className="p-3 rounded-2xl bg-[#060610]/70 border border-white/5 space-y-2">
                <span className="text-[0.68rem] text-stone-400 block font-medium">
                  {isAr ? 'أمثلة سريعة للتجربة والاختبار الفوري:' : 'Exemples de clés pour test instantané :'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSmartValue('CAB-PRO-ALGER-2026')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[0.7rem] font-mono cursor-pointer transition-all"
                  >
                    CAB-PRO-ALGER-2026 (Licence Pro)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmartValue('SEC-8492')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[0.7rem] font-mono cursor-pointer transition-all"
                  >
                    SEC-8492 (Secrétaire)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmartValue('ASSO-4129')}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[0.7rem] font-mono cursor-pointer transition-all"
                  >
                    ASSO-4129 (Confrère Associé)
                  </button>
                </div>
              </div>

              {/* Security & Device Options */}
              <div className="space-y-2.5 pt-1 border-t border-white/10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 bg-[#121526]"
                  />
                  <div className="flex items-center gap-2 text-xs text-stone-300 group-hover:text-white transition-colors">
                    <Laptop size={14} className="text-amber-400" />
                    <span>
                      {isAr
                        ? 'ربط ومصادقة هذا الحاسوب (جهاز مكتب معتمد ومحمي محلياً)'
                        : 'Mémoriser ce poste de travail (Chiffrement matériel TPM 2.0)'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={(e) => setBiometricEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 bg-[#121526]"
                  />
                  <div className="flex items-center gap-2 text-xs text-stone-300 group-hover:text-white transition-colors">
                    <Fingerprint size={14} className="text-amber-400" />
                    <span>
                      {isAr
                        ? 'تفعيل الدخول البيومتري (Windows Hello / بصمة الأصبع)'
                        : 'Activer la connexion biométrique (Windows Hello / Empreinte)'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C39B57] to-[#D4B06A] text-stone-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <span>{isAr ? 'تفعيل ودخول فضاء المحامي' : 'Activer et Déverrouiller le Cabinet'}</span>
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {/* Mode 2: 14-Day Free Trial */}
          {mode === 'trial' && (
            <form onSubmit={handleTrialSubmit} className="p-7 pt-3 space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-300 block mb-1">
                  {isAr ? '✦ فترة تجريبية كاملة لمدة 14 يوماً بدون التزام' : '✦ 14 Jours d’Essai Complet Sans Engagement'}
                </span>
                {isAr
                  ? 'مخصصة للسادة المحامين المعتمدين لدى منظمة المحامين. بيانات قضاياكم تبقى مشفرة محلياً 100% داخل جهازكم.'
                  : 'Réservé aux avocats agréés. Vos données juridiques restent 100% chiffrées localement sur ce poste.'}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {isAr ? 'اسم الأستاذ / المحامي' : 'Nom du Maître / Avocat'}
                  </label>
                  <input
                    type="text"
                    value={lawyerName}
                    onChange={(e) => setLawyerName(e.target.value)}
                    required
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1.5">
                      <CreditCard size={13} className="text-amber-400" />
                      <span>{isAr ? 'رقم بطاقة المحاماة' : 'N° Carte du Barreau'}</span>
                    </label>
                    <input
                      type="text"
                      value={barreauNum}
                      onChange={(e) => setBarreauNum(e.target.value)}
                      placeholder="16-08422"
                      required
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1.5">
                      <Phone size={13} className="text-amber-400" />
                      <span>{isAr ? 'رقم هاتف المكتب / المحمول' : 'Téléphone du Cabinet'}</span>
                    </label>
                    <input
                      type="text"
                      value={lawyerPhone}
                      onChange={(e) => setLawyerPhone(e.target.value)}
                      placeholder="0550 12 98 43"
                      required
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1.5">
                    <Building2 size={13} className="text-amber-400" />
                    <span>{isAr ? 'منظمة المحامين (الناحية الجهوية)' : 'Ordre des Avocats (Barreau)'}</span>
                  </label>
                  <input
                    type="text"
                    value={barreauRegion}
                    onChange={(e) => setBarreauRegion(e.target.value)}
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-between text-[0.68rem] text-stone-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  {isAr ? 'أمان وسرية مهنية تامة' : 'Secret Professionnel Garanti'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-amber-400" />
                  {isAr ? '3 مقاعد شبكية مفعلة' : '3 Postes Réseau inclus'}
                </span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <Sparkles size={16} />
                <span>{isAr ? 'بدء الفترة التجريبية فوراً (14 يوماً)' : 'Démarrer l’Essai Gratuit de 14 Jours'}</span>
              </button>
            </form>
          )}

          {/* Footer security guarantee */}
          <div className="px-7 py-3.5 bg-[#060610] border-t border-white/10 flex items-center justify-between text-[0.68rem] text-stone-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-amber-400" />
              <span>
                {isAr
                  ? 'برمجية معتمدة وفق القانون العضوي الجزائري المنظم لمهنة المحاماة'
                  : 'Conforme à la législation algérienne régissant la profession d’avocat'}
              </span>
            </span>
            <span className="font-mono text-stone-500">v3.0.4 DZ-PRO</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
})

LoginModal.displayName = 'LoginModal'
