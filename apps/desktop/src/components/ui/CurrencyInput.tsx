import { useState, useEffect, useId, ChangeEvent } from 'react'
import { Coins, Sparkles } from 'lucide-react'

interface CurrencyInputProps {
  value: number | string
  onChange: (value: number) => void
  label?: string
  placeholder?: string
  currency?: string
  currencyAr?: string
  dir?: 'rtl' | 'ltr'
  presets?: number[]
  className?: string
  disabled?: boolean
}

/**
 * Algerian Arabic Tafqeet (تحويل الأرقام إلى كتابة باللغة العربية للدنانير)
 */
function toArabicWords(n: number): string {
  if (!n || isNaN(n) || n <= 0) return ''

  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة']
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر']
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة']

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

  return `${groups.join(' و')} دينار جزائري`
}

export const CurrencyInput = ({
  value,
  onChange,
  label,
  placeholder = '0',
  currency = 'DA',
  currencyAr = 'د.ج',
  dir = 'rtl',
  presets = [50000, 100000, 150000, 200000, 300000],
  className = '',
  disabled = false,
}: CurrencyInputProps) => {
  const inputId = useId()
  const numValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '') || '0', 10) : (value || 0)

  // Format with space thousands separator (Algerian standard)
  const formatDisplay = (val: number): string => {
    if (!val || isNaN(val)) return ''
    return val.toLocaleString('fr-DZ').replace(/,/g, ' ')
  }

  const [displayValue, setDisplayValue] = useState<string>(() => formatDisplay(numValue))

  useEffect(() => {
    setDisplayValue(formatDisplay(numValue))
  }, [numValue])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      setDisplayValue('')
      onChange(0)
      return
    }
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed)) {
      setDisplayValue(formatDisplay(parsed))
      onChange(parsed)
    }
  }

  const arabicWords = numValue > 0 ? toArabicWords(numValue) : ''

  return (
    <div className={`flex flex-col gap-2 ${className}`} dir={dir}>
      {label && (
        <label htmlFor={inputId} className="flex items-center justify-between text-xs font-semibold text-stone-200">
          <span className="flex items-center gap-1.5">
            <Coins size={14} className="text-amber-400" />
            <span>{label}</span>
          </span>
          {currencyAr && (
            <span className="text-[11px] font-mono text-amber-300/70">
              {currencyAr} / {currency}
            </span>
          )}
        </label>
      )}

      {/* Main Currency Input Box */}
      <div
        className={`relative flex items-center rounded-xl bg-[#141829] border border-white/10
          hover:border-amber-500/30 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20
          transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="new-password"
          data-form-type="other"
          data-lpignore="true"
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-2.5 text-base sm:text-lg font-bold font-mono text-amber-300 placeholder:text-stone-600 outline-none
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        {/* Currency Pill Badge */}
        <div className="flex-shrink-0 pe-3 ps-2 pointer-events-none">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-sm">
            {dir === 'rtl' ? currencyAr : currency}
          </span>
        </div>
      </div>

      {/* Legal Verbal Amount (Tafqeet) */}
      {arabicWords && (
        <div className="flex items-center gap-1.5 px-1 text-xs text-amber-200/90 font-medium">
          <Sparkles size={12} className="text-amber-400 flex-shrink-0" />
          <span className="truncate italic">
            {arabicWords}
          </span>
        </div>
      )}

      {/* Quick Preset Amount Chips */}
      {presets && presets.length > 0 && !disabled && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-stone-400 font-medium me-1">
            {dir === 'rtl' ? 'اختصارات سريعة:' : 'Raccourcis :'}
          </span>
          {presets.map((preset) => {
            const isSelected = numValue === preset
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onChange(preset)
                  setDisplayValue(formatDisplay(preset))
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150
                  ${
                    isSelected
                      ? 'bg-amber-500/25 border border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-200'
                  }`}
              >
                {formatDisplay(preset)} {dir === 'rtl' ? currencyAr : currency}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
