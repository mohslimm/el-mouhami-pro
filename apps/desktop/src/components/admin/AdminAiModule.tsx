// AdminAiModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Module Assistant IA embarqué à 2 Modes Explicites :
// - Mode A : Écoute & Rédaction (Dictée vocale, trames & génération Word)
// - Mode B : Recherche & Action (Langage naturel, recherche globale & exécution d'actions)
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Mic, SearchCheck } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { BorderBeam } from '@/components/ui/magicui/border-beam'
import { ListenAndWriteMode } from '@/components/admin/ai/ListenAndWriteMode'
import { SearchAndActMode } from '@/components/admin/ai/SearchAndActMode'

export type AiModuleMode = 'listen_and_write' | 'search_and_act'

export const AdminAiModule = memo(() => {
  const { lang } = useAdminStore()
  const isAr = lang === 'ar'
  const [activeMode, setActiveMode] = useState<AiModuleMode>('listen_and_write')

  return (
    <div className="relative flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* ── HEADER BANNER & MODE SWITCHER TOGGLE ─────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-[#121526]/90 p-5 sm:p-6 shadow-2xl shadow-black/50 backdrop-blur-md transition-all">
        <BorderBeam size={180} duration={8} colorFrom="#C39B57" colorTo="#E8C77A" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
              <span className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Brain size={26} strokeWidth={2} />
              </span>
              <span>
                {isAr ? (
                  <>
                    المساعد الذكي للمحاماة وتحرير العرائض{' '}
                    <span dir="ltr" className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      CPCA 08-09 / 22-13
                    </span>
                  </>
                ) : (
                  'Assistant IA Juridique Al-Mouhami Pro'
                )}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              {isAr
                ? 'اختر وضع العمل المطلوب: التملية وإعداد العرائض الرسمية، أو البحث التفاعلي في القوانين وتنفيذ الأوامر.'
                : 'Sélectionnez votre mode de travail : Dictée & Rédaction d’actes ou Recherche & Action assistée.'}
            </p>
          </div>

          {/* Mode Switcher Toggle Bar */}
          <div className="bg-[#0f1222] p-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-inner self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveMode('listen_and_write')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'listen_and_write'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mic size={15} />
              <span>{isAr ? 'الوضع أ: الإملاء والصياغة' : 'Mode A : Dictée & Rédaction'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('search_and_act')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'search_and_act'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <SearchCheck size={15} />
              <span>{isAr ? 'الوضع ب: البحث التفاعلي والأوامر' : 'Mode B : Recherche & Action'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN MODE VIEW CONTAINER ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeMode === 'listen_and_write' ? (
          <motion.div
            key="mode-a"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ListenAndWriteMode />
          </motion.div>
        ) : (
          <motion.div
            key="mode-b"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <SearchAndActMode />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

AdminAiModule.displayName = 'AdminAiModule'
