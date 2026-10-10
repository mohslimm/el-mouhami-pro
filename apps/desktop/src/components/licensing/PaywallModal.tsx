// PaywallModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & PRESTIGE SPEC)
// 14-Day Paywall & Renewal Modal: 3 Plans, Edahabia/CIB, CCP/Pro-Forma, Key Entry
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Check,
  Zap,
  CreditCard,
  Building,
  Key,
  Download,
  Copy,
  Lock,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useAdminStore, LicensePlan } from '@/stores/adminStore'
import { BorderBeam } from '@/components/ui/magicui/border-beam'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PaywallModal = memo(({ isOpen, onClose }: PaywallModalProps) => {
  const { lang, license, activateLicenseKey } = useAdminStore()
  const isAr = lang === 'ar'

  const [selectedPlan, setSelectedPlan] = useState<LicensePlan>('pro')
  const [activePaymentTab, setActivePaymentTab] = useState<'edahabia' | 'ccp' | 'key'>('edahabia')

  // Edahabia / CIB simulated payment state
  const [edahabiaCard, setEdahabiaCard] = useState('')
  const [edahabiaExpiry, setEdahabiaExpiry] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentSuccessKey, setPaymentSuccessKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  // Direct Key Entry
  const [licenseKeyInput, setLicenseKeyInput] = useState('')
  const [keyError, setKeyError] = useState<string | null>(null)

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleSimulatedCardPay = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessingPayment(true)
    setTimeout(() => {
      setIsProcessingPayment(false)
      const generatedKey = `CAB-${selectedPlan.toUpperCase()}-DZ-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
      activateLicenseKey(generatedKey)
      setPaymentSuccessKey(generatedKey)
    }, 1800)
  }

  const handleDirectKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyError(null)
    if (!licenseKeyInput.trim()) {
      setKeyError(isAr ? 'يرجى إدخال مفتاح الترخيص' : 'Veuillez saisir votre clé de licence')
      return
    }
    const res = activateLicenseKey(licenseKeyInput.trim())
    if (res.success) {
      onClose()
    } else {
      setKeyError(isAr ? res.messageAr : res.message)
    }
  }

  const handleDownloadProforma = () => {
    // Generate printable proforma window
    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) return

    const priceDzd = selectedPlan === 'solo' ? '35 000,00' : selectedPlan === 'pro' ? '85 000,00' : '180 000,00'
    const planLabel = selectedPlan === 'solo' ? 'Cabinet Solo (1 Poste)' : selectedPlan === 'pro' ? 'Cabinet Pro (3 Postes Réseau)' : 'Grand Cabinet & Prestige'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr" dir="ltr">
      <head>
        <meta charset="utf-8">
        <title>Facture Pro-Forma - Al-Mouhami Pro</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #C39B57; padding-bottom: 20px; }
          .company { font-size: 20px; font-weight: bold; color: #0B0D17; }
          .gold { color: #C39B57; }
          .proforma-title { text-align: center; margin: 30px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; }
          .box { border: 1px solid #ddd; padding: 15px; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f8f8f8; color: #333; }
          .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 20px; }
          .bank-details { background: #fcf9f2; border: 1px solid #e8c77a; padding: 15px; border-radius: 6px; font-size: 13px; margin-top: 30px; }
          .stamp { text-align: right; margin-top: 40px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company">AL-MOUHAMI PRO <span class="gold">TECH DZ</span></div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
              SARL au capital de 2 000 000 DZD<br>
              Cité Val d'Hydra, Immeuble El-Djazair, Alger<br>
              NIF: 002116098234125 &bull; NIS: 09211601004523<br>
              RC: 16/00-0984523B21 &bull; Art. Imp: 16120894501
            </div>
          </div>
          <div style="text-align: right; font-size: 13px;">
            <strong>Facture Pro-Forma N°:</strong> PF-2026/${Math.floor(1000 + Math.random() * 9000)}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}<br>
            <strong>Validité:</strong> 30 Jours
          </div>
        </div>

        <div class="proforma-title">FACTURE PRO-FORMA</div>

        <div class="grid">
          <div class="box">
            <strong>ÉMETTEUR:</strong><br>
            SARL AL-MOUHAMI PRO TECHNOLOGIES<br>
            Département Solutions Juridiques & Cabinets d'Avocats<br>
            Tel: +213 (0) 21 68 40 12 / 0550 12 98 43<br>
            Email: facturation@al-mouhami.dz
          </div>
          <div class="box">
            <strong>DESTINATAIRE (CLIENT):</strong><br>
            ${license.cabinetName || 'Cabinet Maître Slimani Noureddine'}<br>
            Avocat Titulaire Agréé près la Cour Suprême<br>
            N° Carte Barreau: ${license.barreauNumber || '16-08422'}<br>
            Alger, Algérie
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Désignation de la Licence Logicielle</th>
              <th>Période</th>
              <th>Postes</th>
              <th>Total HT (DZD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Licence Annuelle AL-MOUHAMI PRO — ${planLabel}</strong><br>
                <span style="font-size: 11px; color: #666;">
                  Inclut: Base de données chiffrée locale, Registre des affaires, Module Epson DS-530, Quittances d'honoraires et Mises à jour légales CPCA.
                </span>
              </td>
              <td>12 Mois</td>
              <td>${selectedPlan === 'solo' ? '1 Poste' : selectedPlan === 'pro' ? '3 Postes' : 'Illimité'}</td>
              <td style="font-weight: bold; font-family: monospace;">${priceDzd} DZD</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          MONTANT TOTAL À PAYER: <span class="gold" style="font-size: 20px;">${priceDzd} DZD</span>
        </div>

        <div class="bank-details">
          <strong>COORDONNÉES DE RÈGLEMENT OFFICIELLES (ALGÉRIE):</strong><br><br>
          &bull; <strong>Compte CCP:</strong> 0021345678 Clé 42 (Al-Mouhami Pro Algérie)<br>
          &bull; <strong>RIB BNA (Agence 612 Alger-Centre):</strong> 00100 0023456789012 34<br>
          &bull; <strong>Bénéficiaire:</strong> SARL AL-MOUHAMI PRO TECH<br>
          <em>* Mentionnez votre numéro de carte du Barreau en libellé de virement.</em>
        </div>

        <div class="stamp">
          <strong>SARL AL-MOUHAMI PRO TECH</strong><br>
          <em>Service Commercial & Facturation</em><br>
          <div style="font-size: 11px; color: #888; margin-top: 10px;">[Cachet & Signature Électronique Conformes]</div>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 400)
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
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl bg-[#0f1222] border border-amber-500/35 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden my-auto text-[#F0EDE8]"
        >
          {/* Gold Glow Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Modal Header */}
          <div className="relative px-6 sm:px-8 pt-6 pb-4 border-b border-white/10 bg-[#121526]/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1a1d2e] to-[#0f1222] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-serif tracking-wide">
                  {isAr ? 'ترقية وتجديد ترخيص مكتب المحاماة' : 'Souscription & Renouvellement de Licence'}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isAr
                    ? 'اختر الخطة المناسبة لحجم مكتبكم مع حماية تامة لبياناتكم المحلية'
                    : 'Sélectionnez la formule adaptée à votre cabinet en toute sérénité'}
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

          {/* Data Safety Reassurance Banner (CRITICAL LUXURY LAWYER REASSURANCE) */}
          <div className="mx-6 sm:mx-8 mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#121526] to-emerald-950/40 border border-emerald-500/30 flex items-center gap-3.5 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="text-xs leading-relaxed">
              <strong className="text-emerald-300 font-semibold block text-sm">
                {isAr
                  ? '🛡️ بيانات قضاياكم وموكلكم في أمان مطلق 100% (حصانة وسرية مهنية)'
                  : '🛡️ Vos dossiers et données restent 100% sécurisés & stockés localement'}
              </strong>
              <span className="text-stone-300">
                {isAr
                  ? 'برنامج المحامي برو لا يقفل قاعدة بياناتك ولا يحذف ملفاتك أبداً حتى بعد انتهاء الفترة التجريبية. يمكنك دائماً تصدير ومطالعة أرشيفك بالكامل.'
                  : 'Aucun blocage destructif : vos dossiers restent consultables et exportables localement en toute circonstance.'}
              </span>
            </div>
          </div>

          {/* 3 Pricing Plans Bento Row */}
          <div className="p-6 sm:p-8 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Plan 1: Solo */}
              <div
                onClick={() => setSelectedPlan('solo')}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'solo'
                    ? 'bg-[#161a2e] border-amber-500/70 shadow-lg shadow-amber-950/30'
                    : 'bg-[#121526]/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-stone-400">
                      {isAr ? 'أستاذ منفرد' : 'Solo'}
                    </span>
                    <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-stone-300">
                      1 Poste
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold font-serif text-white">35 000</span>
                    <span className="text-xs text-amber-400 ml-1 mr-1 font-bold">د.ج / an</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-300">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? '1 مقعد محام رئيسي' : '1 Poste Avocat Titulaire'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? 'قضايا ومواعيد غير محدودة' : 'Dossiers & Audiences illimités'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? 'حساب مواعيد CPCA القانونية' : 'Calculateur CPCA officiel'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? 'نسخ احتياطي محلي مشفر' : 'Sauvegarde locale chiffrée'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Plan 2: Pro (HIGHLIGHTED) */}
              <div
                onClick={() => setSelectedPlan('pro')}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  selectedPlan === 'pro'
                    ? 'bg-[#1a1d33] border-amber-400 shadow-xl shadow-amber-950/50 scale-[1.02]'
                    : 'bg-[#121526]/80 border-amber-500/40 hover:border-amber-400'
                }`}
              >
                {/* Border Beam for Pro */}
                <BorderBeam size={130} duration={6} colorFrom="#c5a059" colorTo="#f59e0b" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1">
                      <Zap size={13} /> {isAr ? 'المكتب الاحترافي' : 'Cabinet Pro'}
                    </span>
                    <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase">
                      {isAr ? 'الأكثر طلباً' : 'Recommandé'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold font-serif text-white">85 000</span>
                    <span className="text-xs text-amber-400 ml-1 mr-1 font-bold">د.ج / an</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-200">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <strong>{isAr ? '3 مقاعد شبكية (محام + 2 سكرتارية)' : '3 Postes Réseau (1 Maître + 2 Desks)'}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>{isAr ? 'ماسح إبسون DS-530 II فائق السرعة' : 'Hub Scanner Epson DS-530 II'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>{isAr ? 'مساعد الذكاء القانوني الجزائري DZ' : 'Assistant IA Juridique DZ'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>{isAr ? 'وصولات سداد ومحاسبة رسمية' : 'Quittances & Suivi Comptable'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-amber-400 shrink-0" />
                      <span>{isAr ? 'توليد أوراق الإنابة القضائية' : 'Générateur d’Énaaba Judiciaire'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Plan 3: Grand Cabinet */}
              <div
                onClick={() => setSelectedPlan('prestige')}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'prestige'
                    ? 'bg-[#161a2e] border-amber-500/70 shadow-lg shadow-amber-950/30'
                    : 'bg-[#121526]/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-stone-400">
                      {isAr ? 'مكاتب كبرى ومشاركات' : 'Grand Cabinet'}
                    </span>
                    <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-stone-300">
                      Multi-Avocats
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold font-serif text-white">180 000</span>
                    <span className="text-xs text-amber-400 ml-1 mr-1 font-bold">د.ج / an</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-300">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? 'مقاعد وأجهزة غير محدودة' : 'Postes & Licences illimités'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? 'مزامنة سحابية خاصة ومشفرة' : 'Sync Cloud Chiffrée Dédiée'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? 'تثبيت وتدريب ميداني بالمكتب' : 'Visite sur site & Formation'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{isAr ? 'خط دعم هاتفي مخصص 24/7' : 'Assistance Prioritaire 24/7'}</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="p-5 rounded-2xl bg-[#060610] border border-white/10">

              {/* Payment Tabs Switcher */}
              <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-4">
                <button
                  type="button"
                  onClick={() => setActivePaymentTab('edahabia')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    activePaymentTab === 'edahabia'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-stone-400 hover:text-white border border-transparent'
                  }`}
                >
                  <CreditCard size={15} />
                  <span>{isAr ? 'البطاقة الذهبية / CIB (دفع فوري)' : 'Edahabia & CIB (Instantané)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePaymentTab('ccp')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    activePaymentTab === 'ccp'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-stone-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Building size={15} />
                  <span>{isAr ? 'حساب CCP / تحويل بنكي BNA + فاتورة' : 'Virement CCP / BNA + Pro-Forma'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePaymentTab('key')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    activePaymentTab === 'key'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-stone-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Key size={15} />
                  <span>{isAr ? 'لدي ترخيص مسبق (إدخال المفتاح)' : 'J’ai déjà payé (Entrer ma Clé)'}</span>
                </button>
              </div>

              {/* Tab 1: Edahabia / CIB Instant Simulator */}
              {activePaymentTab === 'edahabia' && (
                <div>
                  {paymentSuccessKey ? (
                    <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                        <CheckCircle2 size={26} />
                      </div>
                      <h4 className="text-base font-bold text-white">
                        {isAr ? 'تم تأكيد الدفع وتفعيل الترخيص بنجاح!' : 'Paiement Validé & Licence Activée !'}
                      </h4>
                      <p className="text-xs text-stone-300">
                        {isAr
                          ? 'مفتاح ترخيصكم الرسمي تم ربطه بهذا الجهاز تلقائياً:'
                          : 'Votre clé de licence a été automatiquement enregistrée :'}
                      </p>
                      <div className="p-3 bg-[#060610] rounded-xl border border-emerald-500/40 flex items-center justify-between font-mono text-sm text-emerald-300 max-w-md mx-auto">
                        <span>{paymentSuccessKey}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(paymentSuccessKey)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"
                          title="Copier"
                        >
                          {copiedKey ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="py-2.5 px-6 rounded-xl bg-emerald-500 text-stone-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                      >
                        {isAr ? 'دخول فضاء المحامي برو' : 'Accéder au Cabinet Pro'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSimulatedCardPay} className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span>{isAr ? 'بوابة الدفع الإلكتروني المعتمدة (SATIM / بريد الجزائر)' : 'Passerelle Certifiée SATIM / Baridimob'}</span>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold text-[0.65rem] border border-amber-500/30">EDAHABIA</span>
                          <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 font-bold text-[0.65rem] border border-sky-500/30">CIB</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs text-stone-300 mb-1">
                            {isAr ? 'رقم البطاقة الذهبية أو البنكية (16 رقماً)' : 'Numéro de Carte (16 chiffres)'}
                          </label>
                          <input
                            type="text"
                            value={edahabiaCard}
                            onChange={(e) => setEdahabiaCard(e.target.value)}
                            placeholder="6280 0400 0000 0000"
                            required
                            className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-300 mb-1">
                            {isAr ? 'تاريخ الانتهاء' : 'Date d’expiration'}
                          </label>
                          <input
                            type="text"
                            value={edahabiaExpiry}
                            onChange={(e) => setEdahabiaExpiry(e.target.value)}
                            placeholder="MM / AA"
                            required
                            className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-stone-400">
                          {isAr ? 'المبلغ المستحق:' : 'Montant à débiter :'}
                          <strong className="text-amber-400 font-mono ml-2 text-sm font-bold">
                            {selectedPlan === 'solo' ? '35 000 DZD' : selectedPlan === 'pro' ? '85 000 DZD' : '180 000 DZD'}
                          </strong>
                        </span>

                        <button
                          type="submit"
                          disabled={isProcessingPayment}
                          className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                        >
                          {isProcessingPayment ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                              <span>{isAr ? 'جاري الاتصال بـ SATIM...' : 'Validation SATIM en cours...'}</span>
                            </>
                          ) : (
                            <>
                              <Lock size={13} />
                              <span>{isAr ? 'تأكيد ودفع فوري' : 'Valider le Paiement Sécurisé'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Tab 2: CCP / Bank Wire + Pro-Forma Download */}
              {activePaymentTab === 'ccp' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#121526] border border-white/10 space-y-1">
                      <span className="text-amber-400 font-bold block flex items-center gap-1.5">
                        <Building size={14} /> بريد الجزائر (Algérie Poste CCP)
                      </span>
                      <p className="text-stone-300 font-mono text-[0.8rem]">
                        <strong>Compte CCP:</strong> 0021345678 Clé 42
                      </p>
                      <p className="text-stone-400 text-[0.7rem]">
                        Nom: SARL Al-Mouhami Pro Algérie
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#121526] border border-white/10 space-y-1">
                      <span className="text-amber-400 font-bold block flex items-center gap-1.5">
                        <Building size={14} /> البنك الوطني الجزائري (BNA)
                      </span>
                      <p className="text-stone-300 font-mono text-[0.8rem]">
                        <strong>RIB:</strong> 00100 0023456789012 34
                      </p>
                      <p className="text-stone-400 text-[0.7rem]">
                        Agence 612 Alger-Centre
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-amber-300 block">
                        {isAr ? 'تحميل الفاتورة الشكلية الرسمية (Facture Pro-Forma PDF)' : 'Facture Pro-Forma Fiscale Conforme'}
                      </span>
                      <span className="text-stone-300 text-[0.7rem]">
                        {isAr
                          ? 'وثيقة رسمية معتمدة تتضمن المعرف الجبائي NIF والمصادقة لتقديمها للمحاسب المعتمد'
                          : 'Document complet avec NIF, NIS, RC pour votre déclaration comptable'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadProforma}
                      className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                    >
                      <Download size={14} />
                      <span>{isAr ? 'طباعة / تحميل الفاتورة الشكلية' : 'Télécharger Pro-Forma (PDF)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Direct Key Entry */}
              {activePaymentTab === 'key' && (
                <form onSubmit={handleDirectKeySubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5">
                      {isAr ? 'أدخل مفتاح الترخيص المستلم (CAB-XXXX-XXXX):' : 'Saisissez votre clé de licence reçue :'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={licenseKeyInput}
                        onChange={(e) => setLicenseKeyInput(e.target.value)}
                        placeholder="CAB-PRO-DZ-XXXX-XXXX"
                        className="flex-1 bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase"
                      />
                      <button
                        type="submit"
                        className="py-2.5 px-5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 cursor-pointer transition-all"
                      >
                        {isAr ? 'تفعيل الآن' : 'Valider'}
                      </button>
                    </div>
                  </div>
                  {keyError && (
                    <p className="text-xs text-rose-400">{keyError}</p>
                  )}
                </form>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
})

PaywallModal.displayName = 'PaywallModal'
