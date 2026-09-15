// AdminAiModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Module Assistant IA embarqué à 2 Modes Explicites :
// - Mode A : Écoute & Rédaction (Dictée vocale, trames & génération Word)
// - Mode B : Recherche & Action (Langage naturel, recherche globale & exécution d'actions)
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Mic, SearchCheck } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { Particles } from '@/components/ui/magicui/particles'
import { BorderBeam } from '@/components/ui/magicui/border-beam'
import { AnimatedShinyText } from '@/components/ui/magicui/animated-shiny-text'
import { ListenAndWriteMode } from '@/components/admin/ai/ListenAndWriteMode'
import { SearchAndActMode } from '@/components/admin/ai/SearchAndActMode'

export type AiModuleMode = 'listen_and_write' | 'search_and_act'

export const AdminAiModule = memo(() => {
  const { lang } = useAdminStore()
  const [activeMode, setActiveMode] = useState<AiModuleMode>('listen_and_write')

  return (
    <div className="relative flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <Particles quantity={45} color="#c5a059" className="opacity-30 pointer-events-none" />

      {/* Header Banner & Mode Switcher Toggle */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-gold)] bg-gradient-to-r from-[var(--bg-elevated)] via-[var(--bg-surface)] to-[var(--bg-elevated)] p-5 sm:p-6 shadow-[var(--shadow-card)] transition-all">
        <BorderBeam size={160} duration={8} colorFrom="var(--gold-400)" colorTo="#ffffff" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
              <Brain size={28} className="text-[var(--gold-400)] shrink-0" />
              <AnimatedShinyText>
                {lang === 'ar' ? 'المساعد الذكي للمحاماة (CPCA 08-09 / 22-13)' : 'Assistant IA LegalTech Al-Mouhami Pro'}
              </AnimatedShinyText>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              {lang === 'ar'
                ? 'اختر وضع العمل المناسب: التملية وإعداد العرائض، أو البحث التفاعلي وتنفيذ الأوامر.'
                : 'Sélectionnez votre mode de travail : Écoute & Rédaction d’actes ou Recherche & Action guidée.'}
            </p>
          </div>

          {/* Explicit Mode Switcher Toggle Bar */}
          <div className="bg-[var(--bg-elevated)] p-1.5 rounded-xl border border-[var(--border-gold)] flex items-center gap-1.5 shadow-inner">
            <button
              onClick={() => setActiveMode('listen_and_write')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeMode === 'listen_and_write'
                  ? 'bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-400)] text-[#1A1200] shadow-md'
                  : 'text-[var(--text-muted)] hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <Mic size={15} />
              <span>{lang === 'ar' ? 'Mode A : Écoute & Rédaction' : 'Mode A : Écoute & Rédaction'}</span>
            </button>

            <button
              onClick={() => setActiveMode('search_and_act')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeMode === 'search_and_act'
                  ? 'bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-400)] text-[#1A1200] shadow-md'
                  : 'text-[var(--text-muted)] hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <SearchCheck size={15} />
              <span>{lang === 'ar' ? 'Mode B : Recherche & Action' : 'Mode B : Recherche & Action'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode View Container */}
      <AnimatePresence mode="wait">
        {activeMode === 'listen_and_write' ? (
          <motion.div
            key="mode-a"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ListenAndWriteMode />
          </motion.div>
        ) : (
          <motion.div
            key="mode-b"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <SearchAndActMode />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

AdminAiModule.displayName = 'AdminAiModule'
