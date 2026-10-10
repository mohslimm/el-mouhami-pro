// AdminContactsModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & PRESTIGE SPEC)
// Judicial Directory & Énaaba Hub: 4 Tabs, Real Algerian Legal Contacts, 1-Click Delegation
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  Scale,
  Award,
  Plus,
  Copy,
  Check,
  FileCheck2,
  Trash2,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAdminStore, JudicialContactType } from '@/stores/adminStore'
import { BorderBeam } from '@/components/ui/magicui/border-beam'
import { EnaabaModal } from '@/components/admin/EnaabaModal'

export const AdminContactsModule = memo(() => {
  const { lang, contacts, addContact, deleteContact, isEnaabaModalOpen, setEnaabaModalOpen, openEnaabaFor } =
    useAdminStore()
  const isAr = lang === 'ar'

  const [activeTab, setActiveTab] = useState<JudicialContactType>('avocat')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)

  // Add Contact Form
  const [formName, setFormName] = useState('')
  const [formNameAr, setFormNameAr] = useState('')
  const [formType, setFormType] = useState<JudicialContactType>('avocat')
  const [formJurisdictionAr, setFormJurisdictionAr] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formSpeciality, setFormSpeciality] = useState('')

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone)
    setCopiedPhone(phone)
    setTimeout(() => setCopiedPhone(null), 2000)
  }

  // Filter contacts by active tab and search query
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesType = c.type === activeTab
      if (!matchesType) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.nameAr.toLowerCase().includes(q) ||
        c.jurisdiction.toLowerCase().includes(q) ||
        (c.jurisdictionAr && c.jurisdictionAr.toLowerCase().includes(q)) ||
        (c.speciality && c.speciality.toLowerCase().includes(q)) ||
        (c.specialityAr && c.specialityAr.toLowerCase().includes(q)) ||
        c.phone.includes(q)
      )
    })
  }, [contacts, activeTab, searchQuery])

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    addContact({
      name: formName.trim(),
      nameAr: formNameAr.trim() || formName.trim(),
      type: formType,
      jurisdiction: formJurisdictionAr.trim() || "Cour d'Alger",
      jurisdictionAr: formJurisdictionAr.trim() || 'مجلس قضاء الجزائر',
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
      address: formAddress.trim(),
      addressAr: formAddress.trim(),
      speciality: formSpeciality.trim() || undefined,
      specialityAr: formSpeciality.trim() || undefined,
    })

    setIsAddContactModalOpen(false)
    setFormName('')
    setFormNameAr('')
    setFormPhone('')
    setFormEmail('')
    setFormAddress('')
    setFormSpeciality('')
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12 px-2 sm:px-4" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ══════════════════════════════════════════════════════════════════
          1. HEADER & SEARCH HERO
         ══════════════════════════════════════════════════════════════════ */}
      <div className="relative p-6 rounded-3xl bg-[#0f1222] border border-amber-500/30 shadow-2xl shadow-black/80 overflow-hidden">
        <BorderBeam size={160} duration={8} colorFrom="#c5a059" colorTo="#f59e0b" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1d2e] to-[#0f1222] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/40">
              <Scale size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white font-serif tracking-wide">
                  {isAr ? 'دليل الأسرة القضائية وتوليد الإنابات' : 'Annuaire Judiciaire & Énaaba Hub'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                  {contacts.length} {isAr ? 'جهة اتصال' : 'Contacts'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {isAr
                  ? 'دليل المحضرين القضائيين، الخبراء المعتمدين، الزملاء المحامين والمحاكم مع الإنابة الفورية'
                  : 'Annuaire territorial des huissiers, experts, confrères avocats et greffes avec délégation 1-clic'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Search Input */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، الهيئة أو الاختصاص...' : 'Rechercher par nom, cour...'}
                className="w-full bg-[#060610] border border-white/15 focus:border-amber-400 rounded-2xl ltr:pl-9 rtl:pr-9 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none"
              />
              <Search
                size={15}
                className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
            </div>

            <button
              onClick={() => setIsAddContactModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            >
              <Plus size={15} />
              <span>{isAr ? 'إضافة جهة قضائية' : 'Nouveau Contact'}</span>
            </button>
          </div>
        </div>

        {/* 4 Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-5 border-t border-white/10">
          {[
            {
              id: 'avocat' as JudicialContactType,
              labelAr: 'الزملاء المحامون (إنابة)',
              labelFr: 'Confrères Avocats',
              icon: Users,
              count: contacts.filter((c) => c.type === 'avocat').length,
            },
            {
              id: 'huissier' as JudicialContactType,
              labelAr: 'المحضرون القضائيون',
              labelFr: 'Huissiers de Justice',
              icon: Award,
              count: contacts.filter((c) => c.type === 'huissier').length,
            },
            {
              id: 'expert' as JudicialContactType,
              labelAr: 'الخبراء المعتمدون',
              labelFr: 'Experts Judiciaires',
              icon: Scale,
              count: contacts.filter((c) => c.type === 'expert').length,
            },
            {
              id: 'tribunal' as JudicialContactType,
              labelAr: 'المحاكم وأمانة الضبط',
              labelFr: 'Tribunaux & Greffes',
              icon: Building2,
              count: contacts.filter((c) => c.type === 'tribunal').length,
            },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/20'
                    : 'bg-[#060610]/60 border-white/5 text-stone-400 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className={isActive ? 'text-amber-400' : 'text-stone-500'} />
                  <span>{isAr ? tab.labelAr : tab.labelFr}</span>
                </div>
                <span className="font-mono text-[0.65rem] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-stone-300">
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. CONTACTS DIRECTORY BENTO GRID
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-[#0f1222]/90 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-lg shadow-black/40"
          >
            <div>
              {/* Type Badge & Jurisdiction */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[0.68rem] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300 font-medium">
                  {isAr ? contact.jurisdictionAr || contact.jurisdiction : contact.jurisdiction}
                </span>

                {/* Delete button (quiet) */}
                <button
                  type="button"
                  onClick={() => deleteContact(contact.id)}
                  className="p-1 rounded text-stone-600 hover:text-rose-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Contact Name */}
              <h3 className="text-base font-bold text-white mb-1 font-serif tracking-wide">
                {isAr ? contact.nameAr || contact.name : contact.name}
              </h3>

              {/* Speciality */}
              {contact.speciality && (
                <p className="text-xs text-amber-200/80 mb-3 flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={13} className="text-amber-400 shrink-0" />
                  <span>{isAr ? contact.specialityAr || contact.speciality : contact.speciality}</span>
                </p>
              )}

              {/* Contact Details (Phone, Address, Email) */}
              <div className="p-3 rounded-2xl bg-[#060610] border border-white/5 space-y-2 text-xs mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Phone size={13} className="text-amber-400 shrink-0" />
                    <span className="font-mono text-[0.78rem] font-bold text-white">{contact.phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(contact.phone)}
                    className="p-1 hover:bg-white/10 rounded text-stone-400 hover:text-white transition-colors"
                    title="Copier le numéro"
                  >
                    {copiedPhone === contact.phone ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>

                {contact.address && (
                  <div className="flex items-start gap-2 text-stone-400 text-[0.72rem] pt-1.5 border-t border-white/5">
                    <MapPin size={13} className="text-stone-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{isAr ? contact.addressAr || contact.address : contact.address}</span>
                  </div>
                )}

                {contact.email && (
                  <div className="flex items-center gap-2 text-stone-400 text-[0.72rem] pt-1.5 border-t border-white/5">
                    <Mail size={13} className="text-stone-500 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10">
              {contact.type === 'avocat' ? (
                /* Confrère Action: 1-Click Hearing Delegation Slip (Énaaba) */
                <button
                  type="button"
                  onClick={() => openEnaabaFor(contact)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/30 transition-all active:scale-[0.99]"
                >
                  <FileCheck2 size={15} />
                  <span>{isAr ? 'إصدار ورقة إنابة قضائية (1-Click)' : 'Déléguer l’Audience (Énaaba)'}</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone size={13} />
                    <span>{isAr ? 'اتصال هاتفياً' : 'Appeler'}</span>
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center transition-colors"
                    >
                      <Mail size={13} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#0f1222] border border-white/10 text-stone-400">
          <p className="text-sm font-semibold mb-1">
            {isAr ? 'لا توجد جهات اتصال مطابقة لبحثك' : 'Aucun contact trouvé'}
          </p>
          <p className="text-xs text-stone-500">
            {isAr ? 'جرب تغيير عبارة البحث أو إضافة جهة قضائية جديدة' : 'Essayez un autre mot-clé ou ajoutez un contact.'}
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          3. ADD NEW JUDICIAL CONTACT MODAL
         ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isAddContactModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0f1222] border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-black/90 text-[#F0EDE8] space-y-4 my-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white font-serif">
                  {isAr ? 'إضافة جهة في الدليل القضائي' : 'Ajouter un Contact Judiciaire'}
                </h3>
                <button
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
                {/* Category Type */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    {isAr ? 'نوع الجهة القضائية:' : 'Type de contact :'}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="avocat">{isAr ? 'زميل محام (Avocat)' : 'Confrère Avocat'}</option>
                    <option value="huissier">{isAr ? 'محضر قضائي (Huissier)' : 'Huissier de Justice'}</option>
                    <option value="expert">{isAr ? 'خبير قضائي معتمد (Expert)' : 'Expert Judiciaire'}</option>
                    <option value="tribunal">{isAr ? 'محكمة أو أمانة ضبط (Greffe)' : 'Tribunal ou Greffe'}</option>
                  </select>
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">الاسم (FR):</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Me Farida Benali"
                      required
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">الاسم (AR):</label>
                    <input
                      type="text"
                      value={formNameAr}
                      onChange={(e) => setFormNameAr(e.target.value)}
                      placeholder="الأستاذة فريدة بن علي"
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">رقم الهاتف:</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0550 00 00 00"
                      required
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">البريد الإلكتروني:</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="contact@avocat.dz"
                      className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Jurisdiction */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">دائرة الاختصاص / المحكمة / المنظمة:</label>
                  <input
                    type="text"
                    value={formJurisdictionAr}
                    onChange={(e) => setFormJurisdictionAr(e.target.value)}
                    placeholder="مجلس قضاء الجزائر / محكمة سيدي امحمد"
                    required
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Speciality */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">الصفة أو التخصص:</label>
                  <input
                    type="text"
                    value={formSpeciality}
                    onChange={(e) => setFormSpeciality(e.target.value)}
                    placeholder="محام لدى المحكمة العليا / خبير عقاري"
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">عنوان المكتب أو المقر:</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="شارع ديدوش مراد، الجزائر العاصمة"
                    className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddContactModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400"
                  >
                    حفظ في الدليل
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          4. 1-CLICK HEARING DELEGATION SLIP MODAL (ÉNAABA)
         ══════════════════════════════════════════════════════════════════ */}
      <EnaabaModal isOpen={isEnaabaModalOpen} onClose={() => setEnaabaModalOpen(false)} />

    </div>
  )
})

AdminContactsModule.displayName = 'AdminContactsModule'
