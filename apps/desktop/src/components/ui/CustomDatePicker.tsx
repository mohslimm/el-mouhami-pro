// CustomDatePicker.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Composant de sélection de date calendaire sur-mesure (Obsidian Glass & Gold)
// Zéro popup natif Chrome/Windows, support bilingue Arabe (Algérie) & Français.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

export interface CustomDatePickerProps {
  value: string // Format 'YYYY-MM-DD'
  onChange: (date: string) => void
  label?: string
  placeholder?: string
  className?: string
  buttonClassName?: string
  dir?: 'rtl' | 'ltr'
  align?: 'left' | 'right' | 'start' | 'end' | 'auto'
  minDate?: string
  maxDate?: string
  disabled?: boolean
}

const MONTHS_AR = [
  'جانفي',
  'فيفري',
  'مارس',
  'أفريل',
  'ماي',
  'جوان',
  'جويلية',
  'أوت',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
]

const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

// Week starting Sunday in Algerian legal administration
const DAYS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
const DAYS_FR = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']

const formatYMD = (year: number, month: number, day: number) => {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

const parseYMD = (str: string) => {
  if (!str || !str.includes('-')) {
    const today = new Date()
    return { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() }
  }
  const parts = str.split('-').map(Number)
  return {
    year: parts[0] || new Date().getFullYear(),
    month: Math.max(0, Math.min(11, (parts[1] || 1) - 1)),
    day: parts[2] || 1,
  }
}

export const CustomDatePicker = ({
  value,
  onChange,
  label,
  placeholder = 'Sélectionner une date...',
  className = '',
  buttonClassName = '',
  dir = 'rtl',
  align = 'auto',
  disabled = false,
}: CustomDatePickerProps) => {
  const isAr = dir === 'rtl'
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Current view year & month in calendar
  const initialParsed = useMemo(() => parseYMD(value), [value])
  const [viewYear, setViewYear] = useState<number>(initialParsed.year)
  const [viewMonth, setViewMonth] = useState<number>(initialParsed.month)

  // Sync view when value changes from outside
  useEffect(() => {
    if (value) {
      const p = parseYMD(value)
      setViewYear(p.year)
      setViewMonth(p.month)
    }
  }, [value])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleSelectToday = () => {
    const now = new Date()
    const todayStr = formatYMD(now.getFullYear(), now.getMonth(), now.getDate())
    onChange(todayStr)
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
    setIsOpen(false)
  }

  const handleSelectDay = (day: number) => {
    const newDateStr = formatYMD(viewYear, viewMonth, day)
    onChange(newDateStr)
    setIsOpen(false)
  }

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay() // 0 is Sunday
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = []

    // Previous month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i
      const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear
      days.push({
        day: prevDay,
        isCurrentMonth: false,
        dateStr: formatYMD(prevYear, prevMonthIdx, prevDay),
      })
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr: formatYMD(viewYear, viewMonth, d),
      })
    }

    // Next month padding to complete 42 or 35 slots (6 or 5 rows)
    const totalSlots = Math.ceil(days.length / 7) * 7
    const remainingSlots = totalSlots - days.length
    for (let d = 1; d <= remainingSlots; d++) {
      const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr: formatYMD(nextYear, nextMonthIdx, d),
      })
    }

    return days
  }, [viewYear, viewMonth])

  // Formatted trigger label
  const formattedDisplay = useMemo(() => {
    if (!value) return placeholder
    const p = parseYMD(value)
    const monthName = isAr ? MONTHS_AR[p.month] : MONTHS_FR[p.month]
    return `${p.day} ${monthName} ${p.year}`
  }, [value, isAr, placeholder])

  const todayStr = useMemo(() => {
    const t = new Date()
    return formatYMD(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])

  // Alignment classes for popover
  const alignmentClass =
    align === 'left'
      ? 'left-0 right-auto'
      : align === 'right'
      ? 'right-0 left-auto'
      : align === 'end'
      ? isAr
        ? 'left-0 right-auto'
        : 'right-0 left-auto'
      : align === 'start'
      ? isAr
        ? 'right-0 left-auto'
        : 'left-0 right-auto'
      : isAr
      ? 'right-0 left-auto'
      : 'left-0 right-auto'

  return (
    <div ref={containerRef} dir={dir} className={`relative inline-block w-full text-start ${className}`}>
      {label && <label className="block text-xs font-semibold text-stone-300 mb-1.5">{label}</label>}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 outline-none cursor-pointer
          bg-[#141829] border border-white/10 text-white
          hover:border-amber-500/40 hover:bg-[#181d33]
          focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'border-amber-400/70 ring-2 ring-amber-400/20 shadow-lg shadow-black/40' : ''}
          ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 truncate">
          <Calendar size={15} className="text-amber-400 shrink-0" />
          <span className={value ? 'text-white font-mono font-medium' : 'text-stone-400'}>
            {formattedDisplay}
          </span>
        </span>
      </button>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-1.5 w-72 sm:w-80 rounded-2xl
              bg-[#121526]/95 backdrop-blur-2xl border border-amber-500/30 p-3.5
              shadow-2xl shadow-black/90 ${alignmentClass}`}
          >
            {/* Header: Month/Year navigation */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isAr ? 'الشهر السابق' : 'Mois précédent'}
              >
                {isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>

              <div className="flex items-center gap-1.5 font-serif font-bold text-sm tracking-wide">
                <span className="text-amber-400">{isAr ? MONTHS_AR[viewMonth] : MONTHS_FR[viewMonth]}</span>
                <span className="text-white font-mono">{viewYear}</span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isAr ? 'الشهر الموالي' : 'Mois suivant'}
              >
                {isAr ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {(isAr ? DAYS_AR : DAYS_FR).map((d, idx) => (
                <div key={idx} className="text-[11px] font-semibold text-stone-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((slot, idx) => {
                const isSelected = slot.dateStr === value
                const isTodayDate = slot.dateStr === todayStr

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (slot.isCurrentMonth) {
                        handleSelectDay(slot.day)
                      } else {
                        // Clicking non-current month also works smoothly
                        onChange(slot.dateStr)
                        setIsOpen(false)
                      }
                    }}
                    className={`h-8 sm:h-9 w-full rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                        : isTodayDate
                        ? 'border border-amber-400/60 text-amber-300 font-bold hover:bg-amber-500/20'
                        : slot.isCurrentMonth
                        ? 'text-stone-200 hover:bg-white/10 hover:text-white'
                        : 'text-stone-600 opacity-40 hover:opacity-75 hover:bg-white/5'
                    }`}
                  >
                    {slot.day}
                  </button>
                )
              })}
            </div>

            {/* Footer quick action */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSelectToday}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:bg-amber-500/15 transition-all cursor-pointer"
              >
                <Sparkles size={12} className="text-amber-400" />
                <span>{isAr ? 'اليوم' : "Aujourd'hui"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-400 hover:text-white transition-all cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
