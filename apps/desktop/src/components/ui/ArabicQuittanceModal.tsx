'use client'

// ArabicQuittanceModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & PRESTIGE SPEC)
// Modernized Arabic Quittance Modal: Obsidian Glass #121526, BorderBeam,
// High-Fidelity Print Engine, Algerian Tafqeet & Fee Presets
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Printer,
  X,
  Edit3,
  Receipt,
  Sparkles,
} from 'lucide-react'
import { BorderBeam } from '@/components/ui/magicui/border-beam'

interface ArabicQuittanceModalProps {
  isOpen: boolean
  onClose: () => void
  clientName?: string
  dossierRef?: string
  amountDzd?: number
  motif?: string
}

/**
 * Algerian Arabic Tafqeet (تحويل الأرقام إلى كتابة باللغة العربية للدنانير)
 */
function toArabicWords(n: number): string {
  if (!n || isNaN(n) || n <= 0) return ''

  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة']
  const teens = [
    'عشرة',
    'أحد عشر',
    'اثنا عشر',
    'ثلاثة عشر',
    'أربعة عشر',
    'خمسة عشر',
    'ستة عشر',
    'سبعة عشر',
    'ثمانية عشر',
    'تسعة عشر',
  ]
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
  const hundreds = [
    '',
    'مائة',
    'مئتان',
    'ثلاثمائة',
    'أربعمائة',
    'خمسمائة',
    'ستمائة',
    'سبعمائة',
    'ثمانمائة',
    'تسعمائة',
  ]

  function convertGroup(val: number): string {
    const h = Math.floor(val / 100)
    const rem = val % 100
    const parts: string[] = []

    if (h > 0) parts.push(hundreds[h])

    if (rem > 0) {
      if (rem < 10) {
        parts.push(ones[rem])
      } else if (rem < 20) {
        parts.push(teens[rem - 10])
      } else {
        const t = Math.floor(rem / 10)
        const o = rem % 10
        if (o > 0) {
          parts.push(`${ones[o]} و${tens[t]}`)
        } else {
          parts.push(tens[t])
        }
      }
    }

    return parts.join(' و')
  }

  const millions = Math.floor(n / 1000000)
  const thousands = Math.floor((n % 1000000) / 1000)
  const remainder = n % 1000

  const groups: string[] = []

  if (millions > 0) {
    if (millions === 1) groups.push('مليون')
    else if (millions === 2) groups.push('مليونان')
    else if (millions >= 3 && millions <= 10) groups.push(`${convertGroup(millions)} ملايين`)
    else groups.push(`${convertGroup(millions)} مليون`)
  }

  if (thousands > 0) {
    if (thousands === 1) groups.push('ألف')
    else if (thousands === 2) groups.push('ألفان')
    else if (thousands >= 3 && thousands <= 10) groups.push(`${convertGroup(thousands)} آلاف`)
    else groups.push(`${convertGroup(thousands)} ألف`)
  }

  if (remainder > 0) {
    groups.push(convertGroup(remainder))
  }

  return `${groups.join(' و')} دينار جزائري لا غير`
}

export const ArabicQuittanceModal = memo(
  ({
    isOpen,
    onClose,
    clientName = 'بن علي عبد القادر',
    dossierRef = 'DOS-2026/084',
    amountDzd = 45000,
    motif = 'أتعاب المرافعة والاستشارة القانونية في القضية العقارية أمام محكمة بئر خادم',
  }: ArabicQuittanceModalProps) => {
    const receiptRef = useRef<HTMLDivElement>(null)

    const [editableClient, setEditableClient] = useState(clientName)
    const [editableRef, setEditableRef] = useState(dossierRef)
    const [editableAmount, setEditableAmount] = useState<number>(amountDzd)
    const [editableMotif, setEditableMotif] = useState(motif)
    const [isEditing, setIsEditing] = useState(false)
    const [receiptNo] = useState(() => `2026/Q-${Math.floor(1000 + Math.random() * 9000)}`)

    useEffect(() => {
      setEditableClient(clientName)
      setEditableRef(dossierRef)
      setEditableAmount(amountDzd)
      setEditableMotif(motif)
    }, [clientName, dossierRef, amountDzd, motif])

    if (!isOpen) return null

    const handlePrint = () => {
      window.print()
    }

    const writtenAmount = toArabicWords(editableAmount)

    return (
      <AnimatePresence>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl overflow-y-auto"
          dir="rtl"
        >
          {/* Print isolation styles injected into document */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .quittance-print-voucher, .quittance-print-voucher * {
                visibility: visible !important;
              }
              .quittance-print-voucher {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                right: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 30px !important;
                background: white !important;
                box-shadow: none !important;
                border: 2px solid #b8924a !important;
                z-index: 999999 !important;
              }
            }
          `}</style>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl bg-[#0f1222] border border-amber-500/40 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden my-auto text-[#F0EDE8]"
          >
            {/* Border Beam Effect */}
            <BorderBeam size={160} duration={8} colorFrom="#c5a059" colorTo="#f59e0b" />

            {/* Modal Header */}
            <div className="relative px-6 sm:px-8 py-5 border-b border-white/10 bg-[#121526]/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                  <Receipt size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif tracking-wide">
                    تحرير ومعاينة وصل سداد الأتعاب الرسمي
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    النموذج الرسمي المعتمد للمحامي &bull; طابع جبائي وسرية مهنية
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>{isEditing ? 'إخفاء التعديل' : 'تعديل البيانات'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">

              {/* Editing Controls Card (Collapsible) */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-[#060610] border border-amber-500/40 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles size={14} /> تعبئة وتعديل بيانات الوصل:
                    </span>
                    <span className="text-[0.68rem] text-stone-400">تحديث فوري للمعاينة</span>
                  </div>

                  {/* Fee Presets */}
                  <div className="space-y-1">
                    <span className="text-[0.68rem] text-stone-400 block font-medium">أتعاب سريعة شائعة:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'استشارة قانونية (15,000 د.ج)', amount: 15000, motif: 'استشارة قانونية ودراسة وثائق' },
                        { label: 'عريضة افتتاحية (35,000 د.ج)', amount: 35000, motif: 'تحرير عريضة افتتاح دعوى وتأسيس وكالة' },
                        { label: 'تمثيل ومرافعة (50,000 د.ج)', amount: 50000, motif: 'أتعاب المرافعة والتمثيل القضائي أمام المحكمة' },
                        { label: 'طعن بالنقض (80,000 د.ج)', amount: 80000, motif: 'إعداد عريضة الطعن بالنقض أمام المحكمة العليا' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setEditableAmount(preset.amount)
                            setEditableMotif(preset.motif)
                          }}
                          className="py-1 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[0.68rem] cursor-pointer transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">اسم الموكل / الشركة:</label>
                      <input
                        type="text"
                        value={editableClient}
                        onChange={(e) => setEditableClient(e.target.value)}
                        className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">رقم القضية / الجدول:</label>
                      <input
                        type="text"
                        value={editableRef}
                        onChange={(e) => setEditableRef(e.target.value)}
                        className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">المبلغ المالي (د.ج):</label>
                      <input
                        type="number"
                        value={editableAmount}
                        onChange={(e) => setEditableAmount(Number(e.target.value) || 0)}
                        className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-stone-300 font-semibold mb-1">مقابل الخدمة القانونية:</label>
                      <input
                        type="text"
                        value={editableMotif}
                        onChange={(e) => setEditableMotif(e.target.value)}
                        className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Printable Official Receipt Card (A5 Landscape / High-End Legal Style) */}
              <div
                ref={receiptRef}
                className="quittance-print-voucher w-full max-w-2xl mx-auto bg-[#faf8f5] text-stone-900 rounded-2xl p-6 sm:p-8 border-2 border-amber-600/50 shadow-2xl shadow-black/60 font-serif relative overflow-hidden"
              >
                {/* Decorative Gold Header Border */}
                <div className="border-b-2 border-amber-800/40 pb-3 mb-4 flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-stone-950 font-serif">
                      مكتب الأستاذ نور الدين سليماني
                    </h4>
                    <p className="text-[0.72rem] text-stone-600 font-sans mt-0.5">
                      محام معتمد لدى المحكمة العليا ومجلس الدولة
                    </p>
                    <p className="text-[0.68rem] text-stone-500 font-sans">
                      منظمة المحامين لناحية الجزائر &bull; بطاقة مهنية: 16-08422
                    </p>
                  </div>

                  <div className="text-left font-sans">
                    <span className="text-xs font-bold font-mono text-amber-900 block">{receiptNo}</span>
                    <span className="text-[0.72rem] text-stone-600 block mt-0.5">
                      الجزائر في: {new Date().toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                </div>

                {/* Voucher Title */}
                <div className="text-center my-3 py-1.5 bg-amber-100/60 border-y border-amber-300">
                  <h3 className="text-lg font-black text-stone-950 font-serif tracking-wider">
                    وصـــل ســـداد أتعـــاب قضائيـــة
                  </h3>
                  <span className="text-[0.68rem] text-stone-700 font-sans">
                    QUITTANCE OFFICIELLE D’HONORAIRES
                  </span>
                </div>

                {/* Receipt Data Details */}
                <div className="text-xs space-y-3.5 my-4 leading-relaxed">
                  <div className="flex items-baseline gap-2 border-b border-dotted border-stone-400 pb-1">
                    <span className="text-stone-700 font-bold w-36 shrink-0">استلمت من السيد(ة) / الشركة:</span>
                    <span className="text-sm font-extrabold text-stone-950 font-sans">{editableClient || '—'}</span>
                  </div>

                  <div className="flex items-baseline gap-2 border-b border-dotted border-stone-400 pb-1">
                    <span className="text-stone-700 font-bold w-36 shrink-0">رقم القضية / الجدول:</span>
                    <span className="font-mono font-bold text-amber-900 text-[0.85rem]">{editableRef || '—'}</span>
                  </div>

                  <div className="flex items-baseline gap-2 border-b border-dotted border-stone-400 pb-1">
                    <span className="text-stone-700 font-bold w-36 shrink-0">المبلغ المالي المستلم:</span>
                    <span className="font-mono font-extrabold text-emerald-800 text-sm">
                      {editableAmount ? `${editableAmount.toLocaleString('fr-DZ')} د.ج` : '—'}
                    </span>
                  </div>

                  {/* Tafqeet in Arabic Words */}
                  {writtenAmount && (
                    <div className="p-2 rounded bg-amber-50/70 border border-amber-200 text-[0.78rem] text-amber-950 font-bold">
                      <span>المبلغ كتابة بالحروف: </span>
                      <span className="underline underline-offset-4">{writtenAmount}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 border-b border-dotted border-stone-400 pb-1">
                    <span className="text-stone-700 font-bold w-36 shrink-0 mt-0.5">مقابل الخدمة القانونية:</span>
                    <span className="text-stone-900 font-medium leading-relaxed">{editableMotif || '—'}</span>
                  </div>
                </div>

                {/* Footer with Seal */}
                <div className="mt-6 pt-3 border-t border-stone-300 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[0.68rem] text-stone-500 block font-sans">
                      * هذا الوصل يعتبر إبراءً لذمة الموكل عن المبلغ المبين أعلاه.
                    </span>
                  </div>

                  <div className="text-center pl-6">
                    <strong className="block mb-6 font-serif">ختم وإمضاء المحامي</strong>
                    <div className="w-24 h-12 border-2 border-dashed border-stone-400 rounded-lg flex items-center justify-center text-[0.65rem] text-stone-400 font-sans">
                      [ختم المكتب]
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 sm:px-8 py-4 bg-[#121526] border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold border border-white/10 cursor-pointer"
              >
                إغلاق
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/40 transition-all active:scale-[0.99]"
                >
                  <Printer size={16} />
                  <span>طباعة الوصل فوراً</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }
)

ArabicQuittanceModal.displayName = 'ArabicQuittanceModal'