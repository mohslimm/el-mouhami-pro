// CommandPalette.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY SPEC)
// Palette de Commandes Universelle (Ctrl+K / Cmd+K)
// Navigation Clavier Complète • Recherche Globale Dossiers, RDVs, GED & Actions
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sparkles,
  Printer,
  Scale,
  Folder,
  Calendar,
  DollarSign,
  FileText,
  ArrowRight,
  CornerDownLeft,
  X,
  Compass,
} from 'lucide-react'
import { useAdminStore, AdminTab } from '@/stores/adminStore'
import { BorderBeam } from '@/components/ui/magicui/border-beam'

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface PaletteActionItem {
  id: string
  type: 'action'
  tab: AdminTab
  titleAr: string
  titleFr: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  shortcut?: string
}

const GLOBAL_ACTIONS: PaletteActionItem[] = [
  {
    id: 'act-ai',
    type: 'action',
    tab: 'ai_assistant',
    titleAr: 'المساعد الذكي للمحاماة وتحرير العرائض (CPCA)',
    titleFr: 'Assistant IA Juridique & Dictée Vocale',
    icon: Sparkles,
  },
  {
    id: 'act-scan',
    type: 'action',
    tab: 'epson_scan',
    titleAr: 'مسح المستندات بالماسح الضوئي (Epson DS-530)',
    titleFr: 'Numérisation de pièces (Epson DS-530 II)',
    icon: Printer,
  },
  {
    id: 'act-cpca',
    type: 'action',
    tab: 'cpca',
    titleAr: 'حساب المواعيد والآجال القانونية والتمديد (CPCA)',
    titleFr: 'Calculateur de Délais de Procédure CPCA',
    icon: Scale,
  },
  {
    id: 'act-dossiers',
    type: 'action',
    tab: 'dossiers',
    titleAr: 'سجل القضايا والملفات القضائية النشطة',
    titleFr: 'Registre Général des Dossiers Juridiques',
    icon: Folder,
  },
  {
    id: 'act-rdv',
    type: 'action',
    tab: 'appointments',
    titleAr: 'جدول الجلسات القضائية ومواعيد الموكلين',
    titleFr: 'Agenda des Audiences & Rendez-vous',
    icon: Calendar,
  },
  {
    id: 'act-finances',
    type: 'action',
    tab: 'finances',
    titleAr: 'المحاسبة وسجل وصولات الأتعاب الرسمية',
    titleFr: 'Finances, Provisions & Quittances Officielles',
    icon: DollarSign,
  },
]

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { dossiers, rdvs, scannedVault, lang, setActiveTab } = useAdminStore()
  const isAr = lang === 'ar'

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Filter actions
  const filteredActions = useMemo(() => {
    if (!searchTerm.trim()) return GLOBAL_ACTIONS
    const q = searchTerm.toLowerCase()
    return GLOBAL_ACTIONS.filter(
      (a) =>
        a.titleAr.toLowerCase().includes(q) ||
        a.titleFr.toLowerCase().includes(q) ||
        a.tab.toLowerCase().includes(q)
    )
  }, [searchTerm])

  // Filter dossiers
  const filteredDossiers = useMemo(() => {
    if (!searchTerm.trim()) return dossiers.slice(0, 5)
    const q = searchTerm.toLowerCase()
    return dossiers.filter(
      (d) =>
        d.reference.toLowerCase().includes(q) ||
        d.clientName.toLowerCase().includes(q) ||
        (d.clientNameAr && d.clientNameAr.toLowerCase().includes(q)) ||
        (d.adversaryName && d.adversaryName.toLowerCase().includes(q)) ||
        d.jurisdiction.toLowerCase().includes(q) ||
        (d.jurisdictionAr && d.jurisdictionAr.toLowerCase().includes(q)) ||
        d.description.toLowerCase().includes(q)
    )
  }, [dossiers, searchTerm])

  // Filter RDVs / Audiences
  const filteredRdvs = useMemo(() => {
    if (!searchTerm.trim()) return []
    const q = searchTerm.toLowerCase()
    return rdvs.filter(
      (r) =>
        r.clientName.toLowerCase().includes(q) ||
        (r.clientNameAr && r.clientNameAr.toLowerCase().includes(q)) ||
        r.motif.toLowerCase().includes(q) ||
        (r.motifAr && r.motifAr.toLowerCase().includes(q)) ||
        r.date.includes(q)
    ).slice(0, 3)
  }, [rdvs, searchTerm])

  // Filter Scanned Documents
  const filteredDocs = useMemo(() => {
    if (!searchTerm.trim()) return []
    const q = searchTerm.toLowerCase()
    return scannedVault.filter(
      (doc) =>
        doc.filename.toLowerCase().includes(q) ||
        doc.caseRoleNo.toLowerCase().includes(q) ||
        doc.clientName.toLowerCase().includes(q)
    ).slice(0, 3)
  }, [scannedVault, searchTerm])

  // Flat indexed items list for keyboard navigation
  const flatItems = useMemo(() => {
    const items: Array<{
      type: 'action' | 'dossier' | 'rdv' | 'doc'
      item: any
    }> = []

    filteredActions.forEach((a) => items.push({ type: 'action', item: a }))
    filteredDossiers.forEach((d) => items.push({ type: 'dossier', item: d }))
    filteredRdvs.forEach((r) => items.push({ type: 'rdv', item: r }))
    filteredDocs.forEach((doc) => items.push({ type: 'doc', item: doc }))

    return items
  }, [filteredActions, filteredDossiers, filteredRdvs, filteredDocs])

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= flatItems.length) {
      setSelectedIndex(Math.max(0, flatItems.length - 1))
    }
  }, [flatItems.length, selectedIndex])

  // Execute selected item
  const handleExecuteItem = useCallback((flatIndex: number) => {
    const entry = flatItems[flatIndex]
    if (!entry) return

    if (entry.type === 'action') {
      setActiveTab(entry.item.tab)
    } else if (entry.type === 'dossier') {
      setActiveTab('dossiers')
    } else if (entry.type === 'rdv') {
      setActiveTab('appointments')
    } else if (entry.type === 'doc') {
      setActiveTab('epson_scan')
    }

    onClose()
  }, [flatItems, setActiveTab, onClose])

  // Keyboard navigation listener (ArrowUp, ArrowDown, Enter, Esc, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        return
      }

      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatItems.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleExecuteItem(selectedIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, flatItems.length, selectedIndex, handleExecuteItem])

  if (!isOpen) return null

  let currentItemCounter = 0

  return (
    <AnimatePresence>
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[14vh] bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-[#121526]/98 shadow-2xl shadow-black/90 backdrop-blur-2xl overflow-hidden flex flex-col z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <BorderBeam size={160} duration={8} colorFrom="#C39B57" colorTo="#E8C77A" />

          {/* ── SEARCH INPUT HEADER BAR ───────────────────────────────── */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#0f1222]/90">
            <Search size={20} className="text-amber-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder={
                isAr
                  ? 'ابحث عن ملف، موكل، قضية، أو إجراء قضائي...'
                  : 'Rechercher un dossier, client, audience...'
              }
              className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-stone-500 font-sans"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
            <span className="text-[0.68rem] text-stone-400 font-mono bg-[#141829] px-2 py-0.5 rounded-lg border border-white/10 shrink-0">
              ESC
            </span>
          </div>

          {/* ── SCROLLABLE SEARCH RESULTS ─────────────────────────────── */}
          <div ref={listRef} className="p-3 max-h-[440px] overflow-y-auto space-y-3 scrollbar-hide">
            {/* GROUP 1: ACTIONS RAPIDES */}
            {filteredActions.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[0.68rem] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={13} />
                  <span>{isAr ? 'العمليات السريعة والتنقل' : 'Actions Rapides & Navigation'}</span>
                </div>
                {filteredActions.map((action) => {
                  const itemIndex = currentItemCounter++
                  const isSelected = selectedIndex === itemIndex
                  const Icon = action.icon

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleExecuteItem(itemIndex)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer text-start ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500/30 text-white shadow-sm'
                          : 'text-stone-300 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-[#141829] text-stone-400'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <span className="font-medium truncate">
                          {isAr ? action.titleAr : action.titleFr}
                        </span>
                      </div>
                      <ArrowRight size={14} className={`shrink-0 rtl:rotate-180 transition-transform ${
                        isSelected ? 'text-amber-400 translate-x-0.5' : 'text-stone-500'
                      }`} />
                    </button>
                  )
                })}
              </div>
            )}

            {/* GROUP 2: DOSSIERS JURIDIQUES */}
            {filteredDossiers.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="px-3 py-1 text-[0.68rem] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder size={13} />
                  <span>{isAr ? 'القضايا والملفات القضائية' : 'Dossiers Juridiques'}</span>
                </div>
                {filteredDossiers.map((dossier) => {
                  const itemIndex = currentItemCounter++
                  const isSelected = selectedIndex === itemIndex

                  return (
                    <button
                      key={dossier.id}
                      type="button"
                      onClick={() => handleExecuteItem(itemIndex)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer text-start ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500/30 text-white shadow-sm'
                          : 'text-stone-300 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-[#141829] text-stone-400'
                        }`}>
                          <Folder size={16} />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-white truncate">
                            {isAr && dossier.clientNameAr ? dossier.clientNameAr : dossier.clientName}
                            {dossier.adversaryName && (
                              <span className="text-stone-400 font-normal ms-1 text-xs">
                                ({isAr ? 'ضد :' : 'c/'} {dossier.adversaryName})
                              </span>
                            )}
                          </span>
                          <span className="text-[0.68rem] text-stone-400 truncate">
                            {dossier.jurisdictionAr || dossier.jurisdiction} • {dossier.typeDroit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span dir="ltr" className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {dossier.reference}
                        </span>
                        <ArrowRight size={14} className={`shrink-0 rtl:rotate-180 ${
                          isSelected ? 'text-amber-400' : 'text-stone-500'
                        }`} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* GROUP 3: AUDIENCES & RDVS */}
            {filteredRdvs.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="px-3 py-1 text-[0.68rem] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{isAr ? 'الجلسات والمواعيد المطابقة' : 'Audiences & RDVs'}</span>
                </div>
                {filteredRdvs.map((rdv) => {
                  const itemIndex = currentItemCounter++
                  const isSelected = selectedIndex === itemIndex

                  return (
                    <button
                      key={rdv.id}
                      type="button"
                      onClick={() => handleExecuteItem(itemIndex)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer text-start ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500/30 text-white shadow-sm'
                          : 'text-stone-300 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-[#141829] text-stone-400'
                        }`}>
                          <Calendar size={16} />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-white truncate">
                            {isAr && rdv.clientNameAr ? rdv.clientNameAr : rdv.clientName}
                          </span>
                          <span className="text-[0.68rem] text-stone-400 truncate">
                            {isAr && rdv.motifAr ? rdv.motifAr : rdv.motif}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span dir="ltr" className="font-mono text-xs text-stone-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {rdv.date} ({rdv.heureDebut})
                        </span>
                        <ArrowRight size={14} className={`shrink-0 rtl:rotate-180 ${
                          isSelected ? 'text-amber-400' : 'text-stone-500'
                        }`} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* GROUP 4: GED / SCANNED VAULT */}
            {filteredDocs.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="px-3 py-1 text-[0.68rem] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>{isAr ? 'الأرشيف الإلكتروني والوثائق الممسوحة' : 'Documents GED Scannés'}</span>
                </div>
                {filteredDocs.map((doc) => {
                  const itemIndex = currentItemCounter++
                  const isSelected = selectedIndex === itemIndex

                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleExecuteItem(itemIndex)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer text-start ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500/30 text-white shadow-sm'
                          : 'text-stone-300 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-[#141829] text-stone-400'
                        }`}>
                          <FileText size={16} />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-white truncate">
                            {doc.filename}
                          </span>
                          <span className="text-[0.68rem] text-stone-400 truncate">
                            {doc.clientName} • {doc.caseRoleNo}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[0.65rem] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                          GED PDF
                        </span>
                        <ArrowRight size={14} className={`shrink-0 rtl:rotate-180 ${
                          isSelected ? 'text-amber-400' : 'text-stone-500'
                        }`} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* EMPTY STATE */}
            {flatItems.length === 0 && (
              <div className="p-8 text-center text-stone-400 text-xs sm:text-sm space-y-2">
                <Search size={32} className="mx-auto text-amber-400 opacity-40" />
                <p className="font-medium text-stone-300">
                  {isAr ? 'لم يتم العثور على أي نتائج مطابقة لبحثك.' : 'Aucun résultat correspondant.'}
                </p>
                <p className="text-xs text-stone-500">
                  {isAr
                    ? 'جرب البحث برقم القضية، أو اسم الموكل، أو اسم الإجراء المطلوب.'
                    : 'Essayez avec un numéro de rôle, nom de client ou action.'}
                </p>
              </div>
            )}
          </div>

          {/* ── FOOTER HELPER KEYBOARD SHORTCUTS ───────────────────────── */}
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-2.5 bg-[#0f1222]/90 text-[0.68rem] text-stone-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="bg-[#141829] border border-white/10 px-1 rounded text-stone-300">↑</span>
                <span className="bg-[#141829] border border-white/10 px-1 rounded text-stone-300">↓</span>
                <span className="ms-1">{isAr ? 'للتنقل' : 'Naviguer'}</span>
              </span>

              <span className="flex items-center gap-1">
                <span className="bg-[#141829] border border-white/10 px-1 rounded text-stone-300 flex items-center">
                  <CornerDownLeft size={10} />
                </span>
                <span className="ms-1">{isAr ? 'للاختيار' : 'Valider'}</span>
              </span>

              <span className="flex items-center gap-1">
                <span className="bg-[#141829] border border-white/10 px-1 rounded text-stone-300">ESC</span>
                <span className="ms-1">{isAr ? 'للإغلاق' : 'Fermer'}</span>
              </span>
            </div>

            <span className="text-amber-400 font-bold">
              {flatItems.length} {isAr ? 'عنصر' : 'résultat(s)'}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

CommandPalette.displayName = 'CommandPalette'
