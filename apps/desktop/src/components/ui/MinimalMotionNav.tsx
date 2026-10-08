// MinimalMotionNav.tsx
// ─────────────────────────────────────────
// IMPORTS
import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  CalendarCheck,
  Receipt,
  Brain,
  Scale,
  Scan,
  Printer,
  Sun,
  Moon,
  Globe,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAdminStore, AdminTab } from '@/stores/adminStore'
import type { MinimalMotionNavProps } from './MinimalMotionNav.types'



// CONSTANTS & ANIMATION VARIANTS
const TRANSITION_SPRING = { type: 'spring', stiffness: 350, damping: 28 }

const BURGER_LINE_TOP_VARIANTS = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: 45, y: 3 },
}

const BURGER_LINE_BOTTOM_VARIANTS = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: -45, y: -3 },
}

const DRAWER_VARIANTS = {
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05 },
  },
}

const ITEM_VARIANTS = {
  closed: { opacity: 0, y: 8 },
  open: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export const MinimalMotionNav = memo(({ className = '', showClock = true, initialVariant = 'dark-closed' }: MinimalMotionNavProps) => {
  const {
    activeTab,
    setActiveTab,
    lang,
    toggleLang,
    setEpsonScanOpen,
    setQuittanceOpen,
  } = useAdminStore()

  const [isOpen, setIsOpen] = useState(initialVariant.includes('open'))
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(initialVariant.includes('light') ? 'light' : 'dark')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')

  // Live Clock & Date Update with Cleanup
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
      setCurrentTime(timeStr)
      setCurrentDate(dateStr)
    }

    updateTime()
    const timerId = setInterval(updateTime, 1000)
    return () => clearInterval(timerId)
  }, [lang])

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const handleNavClick = useCallback(
    (tabId: AdminTab) => {
      setActiveTab(tabId)
      setIsOpen(false)
    },
    [setActiveTab]
  )

  const navLinks = useMemo(
    () => [
      { id: 'overview' as AdminTab, labelFr: "Vue d'Ensemble", labelAr: 'لوحة التحكم', icon: LayoutDashboard },
      { id: 'dossiers' as AdminTab, labelFr: 'Registre des Affaires', labelAr: 'سجل القضايا', icon: FolderKanban },
      { id: 'appointments' as AdminTab, labelFr: 'Agenda & Audiences', labelAr: 'جدول الجلسات', icon: CalendarCheck },
      { id: 'finances' as AdminTab, labelFr: 'Honoraires & Quittances', labelAr: 'الأتعاب والوصل', icon: Receipt },
      { id: 'ai_assistant' as AdminTab, labelFr: 'Assistant IA CPCA', labelAr: 'المساعد الذكي', icon: Brain },
      { id: 'cpca' as AdminTab, labelFr: 'Calculateur CPCA', labelAr: 'حساب المواعيد', icon: Scale },
    ],
    []
  )

  const isLight = themeMode === 'light'

  // Dynamic styling variables based on Light / Dark mode state
  const bgMain = isLight ? 'rgb(242, 239, 233)' : 'var(--bg-elevated)'
  const borderMain = isLight ? 'rgba(0, 0, 0, 0.12)' : 'var(--border-gold)'
  const textMain = isLight ? '#0f0f17' : 'var(--text-primary)'
  const textSub = isLight ? 'rgba(15, 15, 23, 0.55)' : 'var(--text-muted)'
  const pillBg = isLight ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.05)'

  return (
    <motion.div
      layout
      transition={TRANSITION_SPRING}
      className={`relative inline-block z-40 select-none ${className}`}
      style={{
        width: isOpen ? '340px' : 'fit-content',

        backgroundColor: bgMain,
        border: `1px solid ${borderMain}`,
        borderRadius: '24px',
        boxShadow: isLight
          ? '0 12px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)'
          : '0 16px 40px rgba(0,0,0,0.45), 0 0 20px var(--gold-glow)',
        overflow: 'hidden',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {/* ── CONTROL BAR ── */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ minHeight: '52px' }}
      >
        {/* Left: Burger / Close Button */}
        <button
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200"
          style={{
            background: isOpen ? 'var(--gold-glow)' : pillBg,
            border: `1px solid ${isOpen ? 'var(--border-gold)' : borderMain}`,
            color: textMain,
          }}
        >
          {/* Animated Burger Icon */}
          <div className="relative w-4 h-4 flex flex-col justify-center items-center">
            <motion.span
              variants={BURGER_LINE_TOP_VARIANTS}
              animate={isOpen ? 'open' : 'closed'}
              transition={{ duration: 0.25 }}
              className="absolute w-3.5 h-[2px] rounded-full"
              style={{ backgroundColor: isOpen ? 'var(--gold-400)' : textMain }}
            />
            <motion.span
              variants={BURGER_LINE_BOTTOM_VARIANTS}
              animate={isOpen ? 'open' : 'closed'}
              transition={{ duration: 0.25 }}
              className="absolute w-3.5 h-[2px] rounded-full"
              style={{ backgroundColor: isOpen ? 'var(--gold-400)' : textMain }}
            />
          </div>

          <span className="text-xs font-medium tracking-wide">
            {isOpen
              ? lang === 'ar'
                ? 'إغلاق'
                : 'Fermer'
              : lang === 'ar'
              ? 'القائمة'
              : 'Menu'}
          </span>
        </button>

        {/* Right Controls: Theme Switcher & Clock Pill */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Pill */}
          <button
            onClick={toggleTheme}
            aria-label="Changer le thème"
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{
              background: pillBg,
              border: `1px solid ${borderMain}`,
              color: textMain,
            }}
          >
            <motion.div
              key={themeMode}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {themeMode === 'dark' ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} className="text-indigo-600" />
              )}
            </motion.div>
          </button>

          {/* Clock Pill */}
          {showClock && (
            <div
              className="px-2.5 py-1 rounded-full text-[0.72rem] font-mono flex items-center gap-1.5"
              style={{
                background: pillBg,
                border: `1px solid ${borderMain}`,
                color: textSub,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentDate ? `${currentDate} • ${currentTime}` : currentTime || '00:00'}</span>
            </div>
          )}

        </div>
      </div>

      {/* ── EXPANDABLE DRAWER PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={DRAWER_VARIANTS}
            initial="closed"
            animate="open"
            exit="closed"
            className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t"
            style={{ borderColor: borderMain }}
          >
            {/* Section 1: Navigation Links */}
            <div className="flex flex-col gap-1">
              <span className="text-[0.68rem] uppercase tracking-widest font-semibold px-2 py-1" style={{ color: textSub }}>
                {lang === 'ar' ? 'التنقل المباشر' : 'Navigation'}
              </span>

              <div className="grid grid-cols-1 gap-1">
                {navLinks.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <motion.button
                      key={item.id}
                      variants={ITEM_VARIANTS}
                      onClick={() => handleNavClick(item.id)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer"
                      style={{
                        background: isActive ? 'var(--gold-glow)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--border-gold)' : 'transparent'}`,
                        color: isActive ? 'var(--gold-400)' : textMain,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-[var(--gold-400)]' : 'opacity-70'} />
                        <span>{lang === 'ar' ? item.labelAr : item.labelFr}</span>
                      </div>
                      {isActive && <Sparkles size={13} className="text-[var(--gold-400)]" />}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full" style={{ backgroundColor: borderMain }} />

            {/* Section 2: Quick Cabinet Tools */}
            <div className="flex flex-col gap-1">
              <span className="text-[0.68rem] uppercase tracking-widest font-semibold px-2 py-1" style={{ color: textSub }}>
                {lang === 'ar' ? 'أدوات ومعدات المكتب' : 'Outils du Cabinet'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEpsonScanOpen(true)
                    setIsOpen(false)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs cursor-pointer transition-all duration-150 hover:border-[var(--border-gold)]"
                  style={{
                    background: pillBg,
                    border: `1px solid ${borderMain}`,
                    color: textMain,
                  }}
                >
                  <Scan size={14} className="text-[var(--gold-400)]" />
                  <span>Epson DS-530</span>
                </button>

                <button
                  onClick={() => {
                    setQuittanceOpen(true)
                    setIsOpen(false)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs cursor-pointer transition-all duration-150 hover:border-[var(--border-gold)]"
                  style={{
                    background: pillBg,
                    border: `1px solid ${borderMain}`,
                    color: textMain,
                  }}
                >
                  <Printer size={14} className="text-[var(--gold-400)]" />
                  <span>{lang === 'ar' ? 'وصل سداد' : 'Quittance'}</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full" style={{ backgroundColor: borderMain }} />

            {/* Section 3: Footer Bar & Lang Toggle */}
            <div className="flex items-center justify-between text-[0.72rem] px-1 pt-1" style={{ color: textSub }}>
              <div className="flex items-center gap-1.5">
                <Shield size={13} className="text-[var(--gold-400)]" />
                <span>Al-Mouhami Pro v3.0</span>
              </div>

              <button
                onClick={toggleLang}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer hover:text-[var(--gold-400)] transition-colors"
                style={{
                  background: pillBg,
                  border: `1px solid ${borderMain}`,
                }}
              >
                <Globe size={12} />
                <span className="font-semibold">{lang === 'fr' ? 'العربية' : 'Français'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

MinimalMotionNav.displayName = 'MinimalMotionNav'
