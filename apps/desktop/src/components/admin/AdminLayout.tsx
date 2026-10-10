// AdminLayout.tsx
// ─────────────────────────────────────────
// IMPORTS (react → libs → local)
import { memo, useEffect, useState, useCallback, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarCheck,
  FolderKanban,
  Scale,
  Scan,
  Printer,
  Receipt,
  Brain,
  Globe,
  Search,
  Sparkles,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Wifi,
  WifiOff,
  RefreshCw,
  UsersRound,
  BookUser,
  KeyRound,
} from 'lucide-react'

import { useAdminStore, AdminTab } from '@/stores/adminStore'
import { initSyncEngineListener } from '@/services/syncEngine'
import { EpsonScanModal } from '@/components/ui/EpsonScanModal'
import { ArabicQuittanceModal } from '@/components/ui/ArabicQuittanceModal'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { AdminOverviewModule } from '@/components/admin/AdminOverviewModule'
import { AdminDossiersModule } from '@/components/admin/AdminDossiersModule'
import { AdminRdvModule } from '@/components/admin/AdminRdvModule'
import { AdminCpcaModule } from '@/components/admin/AdminCpcaModule'
import { AdminEpsonScanModule } from '@/components/admin/AdminEpsonScanModule'
import { AdminFinancesModule } from '@/components/admin/AdminFinancesModule'
import { AdminAiModule } from '@/components/admin/AdminAiModule'
import { AdminTeamModule } from '@/components/admin/AdminTeamModule'
import { AdminContactsModule } from '@/components/admin/AdminContactsModule'
import { LoginModal } from '@/components/auth/LoginModal'
import { PaywallModal } from '@/components/licensing/PaywallModal'
import { EnaabaModal } from '@/components/admin/EnaabaModal'

// CONSTANTS
const NAV_ITEMS: Array<{ id: AdminTab; labelFr: string; labelAr: string; icon: any }> = [
  { id: 'overview', labelFr: 'Tableau de Bord', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'dossiers', labelFr: 'Registre des Affaires', labelAr: 'سجل القضايا', icon: FolderKanban },
  { id: 'epson_scan', labelFr: 'Hub Numérisation', labelAr: 'الماسح الضوئي', icon: Scan },
  { id: 'appointments', labelFr: 'Agenda & Audiences', labelAr: 'جدول الجلسات', icon: CalendarCheck },
  { id: 'finances', labelFr: 'Suivi Comptable', labelAr: 'الأتعاب والوصل', icon: Receipt },
  { id: 'ai_assistant', labelFr: 'Assistant IA DZ', labelAr: 'المساعد الذكي', icon: Brain },
  { id: 'cpca', labelFr: 'Calculateur CPCA', labelAr: 'حساب المواعيد', icon: Scale },
  { id: 'contacts', labelFr: 'Annuaire & الإنابة', labelAr: 'دليل القضاء والإنابة', icon: BookUser },
  { id: 'team', labelFr: 'Équipe & Postes', labelAr: 'فريق العمل والتراخيص', icon: UsersRound },
]

const PAGE_TITLES: Record<AdminTab, { fr: string; ar: string }> = {
  overview: { fr: 'Tableau de Bord', ar: 'لوحة التحكم والأنشطة' },
  dossiers: { fr: 'Gestion des Dossiers', ar: 'سجل القضايا والملفات' },
  epson_scan: { fr: 'Hub Numérisation', ar: 'مركز الماسح الضوئي' },
  appointments: { fr: 'Agenda & Audiences', ar: 'جدول الجلسات والمواعيد' },
  finances: { fr: 'Suivi Comptable', ar: 'سجل الأتعاب والوصل الرسمي' },
  ai_assistant: { fr: 'Assistant IA DZ', ar: 'المساعد الذكي للقانون الجزائري' },
  cpca: { fr: 'Calculateur CPCA', ar: 'حساب المواعيد والإجراءات' },
  contacts: { fr: 'Annuaire Judiciaire & Énaaba Hub', ar: 'دليل الأسرة القضائية وتوليد الإنابات' },
  team: { fr: 'Gestion de l’Équipe & Postes Réseau', ar: 'إدارة فريق المكتب وتوزيع المقاعد' },
}

const CONTENT_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

interface AdminLayoutProps {
  children?: ReactNode
}

export const AdminLayout = memo(({ children: _children }: AdminLayoutProps) => {
  const location = useLocation()
  const [isCmdKOpen, setIsCmdKOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  const {
    activeTab,
    setActiveTab,
    lang,
    toggleLang,
    isOnline,
    isSyncing,
    syncQueue,
    isEpsonScanOpen,
    setEpsonScanOpen,
    isQuittanceOpen,
    setQuittanceOpen,
    selectedQuittanceData,
    license,
    isLoginModalOpen,
    setLoginModalOpen,
    isPaywallModalOpen,
    setPaywallModalOpen,
    isEnaabaModalOpen,
    setEnaabaModalOpen,
  } = useAdminStore()

  // Sync Engine listener initialization
  useEffect(() => {
    const cleanup = initSyncEngineListener()
    return () => cleanup()
  }, [])

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Route sync
  useEffect(() => {
    if (location.pathname.includes('/calendar')) {
      if (activeTab !== 'appointments') setActiveTab('appointments')
    } else if (location.pathname.includes('/documents')) {
      if (activeTab !== 'dossiers') setActiveTab('dossiers')
    } else if (location.pathname.includes('/cpca')) {
      if (activeTab !== 'cpca') setActiveTab('cpca')
    } else if (location.pathname.includes('/contacts')) {
      if (activeTab !== 'contacts') setActiveTab('contacts')
    }
  }, [location.pathname, activeTab, setActiveTab])

  // Keyboard shortcut ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCmdKOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleTabChange = useCallback((tabId: AdminTab) => {
    setActiveTab(tabId)
  }, [setActiveTab])

  const formatTime = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('ar-DZ', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(date)
  }, [])

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('ar-DZ', {
      weekday: 'long', day: 'numeric', month: 'long',
    }).format(date)
  }, [])

  const pageTitle = PAGE_TITLES[activeTab]

  return (
    <div
      className="h-screen w-screen max-h-screen max-w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: isSidebarCollapsed ? '76px 1fr' : '280px 1fr',
        transition: 'grid-template-columns 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {/* ═══════════════════════════════════════════════
          SIDEBAR — Luxury Navigation
         ═══════════════════════════════════════════════ */}
      <motion.aside
        initial={{ x: lang === 'ar' ? 60 : -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        className="bg-[var(--bg-surface)] flex flex-col z-20 shadow-2xl relative overflow-hidden"
        style={{
          borderRight: lang === 'ar' ? 'none' : '1px solid var(--border-subtle)',
          borderLeft: lang === 'ar' ? '1px solid var(--border-subtle)' : 'none',
        }}
      >
        {/* Top Gold Decorative Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold-500)] to-transparent opacity-50" />

        {/* Brand Header */}
        <div className={`flex flex-col items-center border-b border-[var(--border-subtle)] ${isSidebarCollapsed ? 'p-4' : 'p-5 pb-4'}`}>
          <div className="flex items-center justify-between w-full mb-3">
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-primary)] border border-[var(--border-medium)] flex items-center justify-center shadow-lg shadow-black/50 text-[var(--gold-500)]">
                  <Scale size={18} />
                </div>
                <span className="text-[0.62rem] text-[var(--gold-500)] font-semibold tracking-[0.15em] uppercase leading-tight">
                  AL-MOUHAMI PRO<br />
                  <span className="text-[0.6rem] text-[var(--text-muted)]">المحامي برو V3.0</span>
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-primary)] border border-[var(--border-gold)] flex items-center justify-center text-[var(--gold-500)] font-bold text-sm font-serif shadow-lg">
                NS
              </div>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg bg-white/5 border border-[var(--border-subtle)] text-[var(--gold-400)] hover:bg-white/10 cursor-pointer transition-all"
              title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              {isSidebarCollapsed ? (
                lang === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
              ) : (
                lang === 'ar' ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />
              )}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <div className="text-center w-full">
              <h2 className="text-lg font-bold text-white leading-tight font-serif">
                مكتب الأستاذ نور الدين سليماني
              </h2>
              <p className="text-[0.68rem] text-[var(--text-muted)] mt-1 leading-relaxed">
                محام معتمد لدى المحكمة العليا ومجلس الدولة
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange(item.id)}
                title={lang === 'ar' ? item.labelAr : item.labelFr}
                className={`w-full flex items-center gap-3.5 rounded-xl transition-all duration-200 relative group cursor-pointer ${isSidebarCollapsed
                    ? 'justify-center px-0 py-3'
                    : 'px-3.5 py-3'
                  } ${isActive
                    ? 'bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-gold)] text-[var(--gold-400)] shadow-lg'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent hover:bg-white/[0.03]'
                  }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className={`absolute ${lang === 'ar' ? 'left-0 rounded-r-full' : 'right-0 rounded-l-full'} top-1/2 -translate-y-1/2 w-[3px] h-7 bg-[var(--gold-500)] shadow-[0_0_8px_var(--gold-glow)]`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon
                  size={isSidebarCollapsed ? 22 : 19}
                  className={`shrink-0 transition-colors ${isActive ? 'text-[var(--gold-400)]' : 'group-hover:text-[var(--gold-500)]'}`}
                />
                {!isSidebarCollapsed && (
                  <span className={`text-[0.85rem] font-medium ${isActive ? 'text-[var(--gold-400)]' : ''}`}>
                    {lang === 'ar' ? item.labelAr : item.labelFr}
                  </span>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* Bottom: Device Status + Identity */}
        <div className="p-3 space-y-3">
          {/* Quick Hardware Tools */}
          <div className={`bg-[#0f1222]/90 border border-white/10 rounded-2xl shadow-xl transition-all ${isSidebarCollapsed ? 'p-2' : 'p-3.5'}`}>
            {!isSidebarCollapsed && (
              <h3 className="text-amber-400 text-[0.68rem] font-bold mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <Printer size={13} /> {lang === 'ar' ? 'أجهزة الماسح والطابعة' : 'Matériel Scanner & Impression'}
              </h3>
            )}
            <div className={`flex flex-col gap-1.5 ${isSidebarCollapsed ? 'items-center' : ''}`}>
              <button
                type="button"
                onClick={() => setEpsonScanOpen(true)}
                title={lang === 'ar' ? 'ماسح إبسون Epson DS-530 II' : 'Scanner Epson WorkForce DS-530 II'}
                className="w-full flex items-center gap-2.5 text-stone-300 hover:text-white p-2 rounded-xl hover:bg-amber-500/10 hover:border-amber-500/30 border border-transparent transition-all text-xs cursor-pointer group"
                style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
              >
                <div className="p-1 rounded-lg bg-white/5 group-hover:bg-amber-500/20 text-stone-300 group-hover:text-amber-400 transition-colors shrink-0">
                  <Scan size={isSidebarCollapsed ? 18 : 15} />
                </div>
                {!isSidebarCollapsed && <span>{lang === 'ar' ? 'ماسح إبسون DS-530' : 'Epson DS-530 II'}</span>}
              </button>
              <button
                type="button"
                onClick={() => setQuittanceOpen(true)}
                title={lang === 'ar' ? 'إصدار وصل سداد رسمي' : 'Émettre Quittance Officielle'}
                className="w-full flex items-center gap-2.5 text-stone-300 hover:text-white p-2 rounded-xl hover:bg-amber-500/10 hover:border-amber-500/30 border border-transparent transition-all text-xs cursor-pointer group"
                style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
              >
                <div className="p-1 rounded-lg bg-white/5 group-hover:bg-amber-500/20 text-stone-300 group-hover:text-amber-400 transition-colors shrink-0">
                  <Printer size={isSidebarCollapsed ? 18 : 15} />
                </div>
                {!isSidebarCollapsed && <span>{lang === 'ar' ? 'إصدار وصل سداد رسمي' : 'Quittance d’honoraires'}</span>}
              </button>
            </div>
          </div>

          {/* Lawyer Identity Footer */}
          <div className={`flex items-center border-t border-[var(--border-subtle)] pt-3 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--gold-500)] to-[#8C6D39] flex items-center justify-center text-[var(--bg-surface)] font-bold text-xs shadow-[0_0_12px_var(--gold-glow)] shrink-0">
              NS
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h4 className="text-xs font-bold text-white">الأستاذ ن. سليماني</h4>
                <p className="text-[0.65rem] text-[var(--text-muted)]">منظمة المحامين - ناحية الجزائر</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT AREA
         ═══════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">

        {/* ── TOP HEADER BAR ── */}
        <header className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
          <div className="flex flex-col min-w-0 shrink-0">
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-wide font-serif truncate">
              {lang === 'ar' ? pageTitle.ar : pageTitle.fr}
            </h1>
            <p className="text-[var(--text-muted)] text-[0.7rem] mt-0.5 hidden sm:block">
              المحامي برو &bull; فضاء الإدارة وتسيير المكتب
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
            {/* SaaS License & Trial Badge */}
            <button
              type="button"
              onClick={() => setPaywallModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/35 hover:border-amber-400 text-amber-300 text-xs font-semibold cursor-pointer transition-all shrink-0 shadow-sm"
              title={lang === 'ar' ? 'معلومات الاشتراك والترقية' : 'Abonnement & Renouvellement'}
            >
              <Sparkles size={13} className="text-amber-400" />
              <span className="whitespace-nowrap">
                {license.status === 'trial'
                  ? lang === 'ar'
                    ? `تجريبي: ${license.trialDaysRemaining} أيام`
                    : `Essai: ${license.trialDaysRemaining}j restants`
                  : lang === 'ar'
                  ? `ترخيص ${license.plan.toUpperCase()} ✓`
                  : `Licence ${license.plan.toUpperCase()} ✓`}
              </span>
            </button>

            {/* Quick Key Entry Button */}
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 text-stone-300 hover:text-amber-400 transition-all cursor-pointer shrink-0"
              title={lang === 'ar' ? 'إدخال مفتاح ترخيص أو كود دعوة' : 'Saisir une clé / code invité'}
            >
              <KeyRound size={14} />
            </button>

            {/* Network & Sync Queue Status — condensed, icon-only under xl */}
            {isSyncing ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium" title={lang === 'ar' ? 'جاري مزامنة السحابة...' : 'Mise à jour Cloud...'}>
                <RefreshCw size={13} className="animate-spin shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">{lang === 'ar' ? 'جاري المزامنة' : 'Synchronisation'}</span>
              </div>
            ) : isOnline ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium" title={lang === 'ar' ? 'سحابي متصل' : 'Cloud Connecté'}>
                <Wifi size={13} className="shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">
                  {syncQueue.length > 0
                    ? lang === 'ar' ? `متصل (${syncQueue.length})` : `${syncQueue.length} en attente`
                    : lang === 'ar' ? 'متصل ✓' : 'Connecté ✓'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium" title={lang === 'ar' ? 'غير متصل' : 'Mode hors-ligne'}>
                <WifiOff size={13} className="shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">
                  {lang === 'ar' ? `غير متصل (${syncQueue.length})` : `Hors-ligne (${syncQueue.length})`}
                </span>
              </div>
            )}

            {/* Search / Command Palette */}
            <button
              type="button"
              onClick={() => setIsCmdKOpen(true)}
              title={lang === 'ar' ? 'بحث شامل (Ctrl+K)' : 'Recherche Globale (Ctrl+K)'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121526] border border-white/10 hover:border-amber-500/40 text-stone-300 hover:text-white text-xs cursor-pointer transition-all shrink-0 shadow-sm"
            >
              <Search size={14} className="text-amber-400 shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">{lang === 'ar' ? 'بحث شامل...' : 'Rechercher...'}</span>
              <span className="hidden sm:inline font-mono text-[0.65rem] bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 text-amber-300 font-bold">
                Ctrl+K
              </span>
            </button>

            {/* Presence Status — icon-only under lg, hidden under md */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium shrink-0"
              title={lang === 'ar' ? 'حاضر بالمكتب' : 'Au Cabinet'}
            >
              <UserCheck size={14} className="shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">{lang === 'ar' ? 'حاضر بالمكتب' : 'Au Cabinet'}</span>
            </motion.div>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-[var(--border-subtle)] hover:border-[var(--border-gold)] text-[var(--text-muted)] hover:text-[var(--gold-400)] text-xs cursor-pointer transition-all shrink-0"
            >
              <Globe size={14} className="shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">{lang === 'fr' ? 'العربية' : 'Français'}</span>
            </button>

            {/* AI Quick Toggle */}
            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`p-2 rounded-full border cursor-pointer transition-all shrink-0 ${activeTab === 'ai_assistant'
                  ? 'bg-[var(--gold-glow)] border-[var(--border-gold)] text-[var(--gold-400)]'
                  : 'bg-white/5 border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--gold-400)] hover:border-[var(--border-gold)]'
                }`}
              title="المساعد الذكي"
            >
              <Sparkles size={15} />
            </button>

            {/* Live Clock Widget */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[110px] shadow-lg shrink-0">
              <span className="text-[var(--gold-400)] font-mono text-sm tracking-wider font-bold whitespace-nowrap">
                {formatTime(currentTime)}
              </span>
              <span className="text-[var(--text-muted)] text-[0.6rem] mt-0.5 whitespace-nowrap hidden sm:block">
                {formatDate(currentTime)}
              </span>
            </div>
          </div>
        </header>

        {/* ── SCROLLABLE CONTENT AREA ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={CONTENT_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activeTab === 'overview' && <AdminOverviewModule />}
              {activeTab === 'dossiers' && <AdminDossiersModule />}
              {activeTab === 'epson_scan' && <AdminEpsonScanModule />}
              {activeTab === 'appointments' && <AdminRdvModule />}
              {activeTab === 'finances' && <AdminFinancesModule />}
              {activeTab === 'ai_assistant' && <AdminAiModule />}
              {activeTab === 'cpca' && <AdminCpcaModule />}
              {activeTab === 'contacts' && <AdminContactsModule />}
              {activeTab === 'team' && <AdminTeamModule />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── MODALS ── */}
      <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
      <EpsonScanModal isOpen={isEpsonScanOpen} onClose={() => setEpsonScanOpen(false)} isAr={lang === 'ar'} />
      <ArabicQuittanceModal
        isOpen={isQuittanceOpen}
        onClose={() => setQuittanceOpen(false)}
        clientName={selectedQuittanceData?.clientName}
        dossierRef={selectedQuittanceData?.dossierRef}
        amountDzd={selectedQuittanceData?.amountDzd}
        motif={selectedQuittanceData?.motif}
      />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <PaywallModal isOpen={isPaywallModalOpen} onClose={() => setPaywallModalOpen(false)} />
      <EnaabaModal isOpen={isEnaabaModalOpen} onClose={() => setEnaabaModalOpen(false)} />
    </div>
  )
})

AdminLayout.displayName = 'AdminLayout'
