// CustomTimePicker.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Composant de sélection d'heure sur-mesure (Obsidian Glass & Gold)
// Créneaux d'avocat rapides (Cabinet / Audience / Visio), zéro popup blanc natif.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Sun, Moon } from 'lucide-react'

export interface CustomTimePickerProps {
  value: string // Format 'HH:mm', ex: '10:00'
  onChange: (time: string) => void
  label?: string
  placeholder?: string
  className?: string
  buttonClassName?: string
  dir?: 'rtl' | 'ltr'
  align?: 'left' | 'right' | 'start' | 'end' | 'auto'
  disabled?: boolean
}

// Preset slots commonly used in legal consultations & court hearings
const PRESETS_MORNING = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
const PRESETS_AFTERNOON = ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18']
const MINUTES = ['00', '15', '30', '45']

export const CustomTimePicker = ({
  value = '10:00',
  onChange,
  label,
  placeholder = '10:00',
  className = '',
  buttonClassName = '',
  dir = 'rtl',
  align = 'auto',
  disabled = false,
}: CustomTimePickerProps) => {
  const isAr = dir === 'rtl'
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Current parsed hour and minute
  const { currentHour, currentMinute } = useMemo(() => {
    if (!value || !value.includes(':')) {
      return { currentHour: '10', currentMinute: '00' }
    }
    const [h, m] = value.split(':')
    return {
      currentHour: (h || '10').padStart(2, '0'),
      currentMinute: (m || '00').padStart(2, '0'),
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

  const handleSelectTime = (h: string, m: string) => {
    onChange(`${h}:${m}`)
  }

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
          <Clock size={15} className="text-amber-400 shrink-0" />
          <span className="text-white font-mono font-bold tracking-wider" dir="ltr">
            {value || placeholder}
          </span>
        </span>
      </button>

      {/* Time Picker Popover */}
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
            {/* Header: Current Selection Display */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
              <span className="text-xs font-semibold text-stone-300">
                {isAr ? 'توقيت الموعد المحدد' : 'Heure sélectionnée'}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm" dir="ltr">
                <Clock size={14} className="text-amber-400" />
                <span>{currentHour}:{currentMinute}</span>
              </div>
            </div>

            {/* Quick Consultation Preset Chips */}
            <div className="space-y-2 mb-3.5">
              {/* Morning */}
              <div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 mb-1">
                  <Sun size={12} className="text-amber-400" />
                  <span>{isAr ? 'الفترة الصباحية' : 'Matinée'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {PRESETS_MORNING.map((preset) => {
                    const isSelected = value === preset
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          onChange(preset)
                          setIsOpen(false)
                        }}
                        className={`py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/25'
                            : 'bg-[#141829] border border-white/5 text-stone-300 hover:border-amber-500/40 hover:text-white'
                        }`}
                        dir="ltr"
                      >
                        {preset}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Afternoon */}
              <div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 mb-1">
                  <Moon size={12} className="text-indigo-400" />
                  <span>{isAr ? 'فترة ما بعد الزوال' : 'Après-midi'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {PRESETS_AFTERNOON.map((preset) => {
                    const isSelected = value === preset
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          onChange(preset)
                          setIsOpen(false)
                        }}
                        className={`py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/25'
                            : 'bg-[#141829] border border-white/5 text-stone-300 hover:border-amber-500/40 hover:text-white'
                        }`}
                        dir="ltr"
                      >
                        {preset}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Custom Hours & Minutes Fine-Tuning */}
            <div className="pt-2.5 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-semibold text-stone-400">
                {isAr ? 'ضبط الساعات والدقائق' : 'Heures & Minutes'}
              </div>

              {/* Hours Row */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {HOURS.map((h) => {
                  const isSelected = currentHour === h
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectTime(h, currentMinute)}
                      className={`px-2 py-1 rounded-md text-xs font-mono transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold shadow'
                          : 'bg-[#141829] border border-white/5 text-stone-300 hover:text-white hover:bg-white/5'
                      }`}
                      dir="ltr"
                    >
                      {h}h
                    </button>
                  )
                })}
              </div>

              {/* Minutes Row */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {MINUTES.map((m) => {
                  const isSelected = currentMinute === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectTime(currentHour, m)}
                      className={`py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold shadow'
                          : 'bg-[#141829] border border-white/5 text-stone-300 hover:text-white hover:bg-white/5'
                      }`}
                      dir="ltr"
                    >
                      :{m}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg text-xs font-medium text-stone-400 hover:text-white transition-all cursor-pointer"
              >
                {isAr ? 'تم' : 'Terminer'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
