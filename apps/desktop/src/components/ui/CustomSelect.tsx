import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  badge?: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  buttonClassName?: string
  menuClassName?: string
  dir?: 'rtl' | 'ltr'
  align?: 'left' | 'right' | 'start' | 'end' | 'auto'
  disabled?: boolean
}

export const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  dir,
  align,
  disabled = false,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
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

  return (
    <div
      ref={containerRef}
      dir={dir}
      className={`relative inline-block text-start ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none
          bg-[#141829] border border-white/10 text-[#F0EDE8]
          hover:border-amber-500/40 hover:bg-[#181d33]
          focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'border-amber-400/70 ring-2 ring-amber-400/20 shadow-lg shadow-black/40' : ''}
          ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-amber-400">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? 'text-[#F0EDE8]' : 'text-stone-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-amber-400/80 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-1.5 min-w-full max-h-60 overflow-y-auto rounded-xl
              bg-[#121526]/95 backdrop-blur-xl border border-amber-500/30 p-1.5
              shadow-2xl shadow-black/80 scrollbar-thin scrollbar-thumb-white/10
              ${
                align === 'left'
                  ? 'left-0 right-auto'
                  : align === 'right'
                  ? 'right-0 left-auto'
                  : align === 'end'
                  ? dir === 'rtl'
                    ? 'left-0 right-auto'
                    : 'right-0 left-auto'
                  : align === 'start'
                  ? dir === 'rtl'
                    ? 'right-0 left-auto'
                    : 'left-0 right-auto'
                  : dir === 'rtl'
                  ? 'right-0 left-auto'
                  : 'left-0 right-auto'
              }
              ${menuClassName}`}
          >
            <div className="flex flex-col gap-0.5">
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm text-start transition-all duration-150
                      ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-[#E0DDD8] hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {option.icon && (
                        <span className={`flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`}>
                          {option.icon}
                        </span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </span>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {option.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/5 text-stone-300 border border-white/10">
                          {option.badge}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-amber-400" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
