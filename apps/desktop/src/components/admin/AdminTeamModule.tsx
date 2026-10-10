// AdminTeamModule.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (QUIET LUXURY & PRESTIGE SPEC)
// Team & Desks Management: Active Machine Seats (e.g. 2/3), Invite Codes, 1-Click Revoke
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Laptop,
  UserPlus,
  Trash2,
  Copy,
  Check,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useAdminStore, TeamRole, DeskCollaborator } from '@/stores/adminStore'
import { BorderBeam } from '@/components/ui/magicui/border-beam'

export const AdminTeamModule = memo(() => {
  const { lang, teamSeats, license, addCollaborator, revokeCollaborator, generateInviteCode, setPaywallModalOpen } =
    useAdminStore()
  const isAr = lang === 'ar'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [collabToRevoke, setCollabToRevoke] = useState<DeskCollaborator | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // New collaborator form state
  const [newName, setNewName] = useState('')
  const [newNameAr, setNewNameAr] = useState('')
  const [newRole, setNewRole] = useState<TeamRole>('secretaire')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'read_dossiers',
    'appointments',
    'epson_scan',
  ])
  const [generatedInviteCard, setGeneratedInviteCard] = useState<string | null>(null)

  const usedSeats = teamSeats.length
  const maxSeats = license.maxSeats || 3
  const isSeatLimitReached = usedSeats >= maxSeats

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    )
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const inviteCode = generateInviteCode(newRole)
    const deviceName =
      newRole === 'secretaire' ? 'POSTE-ACCUEIL-SECRETARIAT' : 'LAPTOP-COLLABORATEUR-PRO'

    addCollaborator({
      name: newName.trim(),
      nameAr: newNameAr.trim() || newName.trim(),
      role: newRole,
      email: newEmail.trim() || 'collaborateur@cabinet-slimani.dz',
      phone: newPhone.trim() || '0550 00 00 00',
      machineId: `PC-DESK-${Math.floor(100 + Math.random() * 900)}`,
      deviceName,
      ipAddress: `192.168.1.${Math.floor(20 + Math.random() * 50)}`,
      inviteCode,
      permissions: selectedPermissions,
    })

    setGeneratedInviteCard(inviteCode)
  }

  const handleConfirmRevoke = () => {
    if (collabToRevoke) {
      revokeCollaborator(collabToRevoke.id)
      setCollabToRevoke(null)
    }
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12 px-2 sm:px-4" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ══════════════════════════════════════════════════════════════════
          1. HEADER & METRICS BAR (SEAT CAPACITY GAUGE)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="relative p-6 rounded-3xl bg-[#0f1222] border border-amber-500/30 shadow-2xl shadow-black/80 overflow-hidden">
        <BorderBeam size={160} duration={8} colorFrom="#c5a059" colorTo="#f59e0b" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1d2e] to-[#0f1222] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/40">
              <Users size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white font-serif tracking-wide">
                  {isAr ? 'إدارة فريق العمل والمقاعد المكتبية' : 'Gestion de l’Équipe & Postes Réseau'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                  {license.plan.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {isAr
                  ? 'توزيع تراخيص الأجهزة في الشبكة المحلية للعيادة القضائية ومزامنة المهام'
                  : 'Attribution des licences machines sur le réseau local du cabinet'}
              </p>
            </div>
          </div>

          {/* Seat Capacity Gauge Card */}
          <div className="flex items-center gap-4 w-full lg:w-auto p-4 rounded-2xl bg-[#060610] border border-white/10">
            <div className="flex flex-col">
              <span className="text-[0.7rem] text-stone-400 uppercase font-semibold">
                {isAr ? 'المقاعد المستعملة' : 'Postes Occupés'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold font-mono text-amber-400">{usedSeats}</span>
                <span className="text-stone-500 font-mono text-sm">/ {maxSeats}</span>
                <span className="text-xs text-stone-400 ml-1 mr-1">
                  {isAr ? 'أجهزة نشطة' : 'machines'}
                </span>
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-32 h-2.5 rounded-full bg-white/10 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isSeatLimitReached
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
                style={{ width: `${Math.min((usedSeats / maxSeats) * 100, 100)}%` }}
              />
            </div>

            {/* Add Collaborator Button */}
            <button
              onClick={() => {
                if (isSeatLimitReached) {
                  setPaywallModalOpen(true)
                } else {
                  setIsAddModalOpen(true)
                  setGeneratedInviteCard(null)
                }
              }}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            >
              <UserPlus size={15} />
              <span>
                {isSeatLimitReached
                  ? isAr ? 'ترقية لإضافة مقاعد' : 'Ajouter des Postes'
                  : isAr ? 'إضافة متعاون جديد' : 'Ajouter un Collaborateur'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. COLLABORATORS & DESKS LIST (BENTO CARDS)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamSeats.map((collab) => {
          const isMaster = collab.role === 'titulaire'
          return (
            <motion.div
              key={collab.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isMaster
                  ? 'bg-gradient-to-br from-[#161a2e] to-[#0f1222] border-amber-500/50 shadow-xl shadow-amber-950/20'
                  : 'bg-[#121526]/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Header with Role Badge & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[0.68rem] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                      collab.role === 'titulaire'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : collab.role === 'secretaire'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}
                  >
                    {collab.role === 'titulaire'
                      ? isAr ? 'المحامي الرئيسي (رئيس المكتب)' : 'Avocat Titulaire'
                      : collab.role === 'secretaire'
                      ? isAr ? 'السكرتارية والاستقبال' : 'Secrétaire Juridique'
                      : isAr ? 'محام مساعد / متربص' : 'Avocat Collaborateur'}
                  </span>

                  <div className="flex items-center gap-1.5 text-[0.68rem] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{collab.lastActive}</span>
                  </div>
                </div>

                {/* Name & Contact */}
                <h3 className="text-base font-bold text-white mb-0.5 font-serif">
                  {isAr ? collab.nameAr || collab.name : collab.name}
                </h3>
                <p className="text-xs text-stone-400 mb-4">{collab.email}</p>

                {/* Machine / Desk Hardware Footprint */}
                <div className="p-3 rounded-2xl bg-[#060610] border border-white/10 space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-stone-300">
                      <Laptop size={14} className="text-amber-400 shrink-0" />
                      <span className="font-mono text-[0.75rem] font-semibold">{collab.deviceName}</span>
                    </div>
                    {collab.ipAddress && (
                      <span className="font-mono text-[0.68rem] text-stone-500">{collab.ipAddress}</span>
                    )}
                  </div>

                  {/* Invite Code row */}
                  {collab.inviteCode && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                      <span className="text-[0.68rem] text-stone-400 flex items-center gap-1">
                        <KeyRound size={12} className="text-amber-400" />
                        {isAr ? 'كود الربط المخصص:' : 'Code d’invitation :'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[0.75rem] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {collab.inviteCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(collab.inviteCode)}
                          className="p-1 hover:bg-white/10 rounded text-stone-400 hover:text-white transition-colors"
                          title="Copier"
                        >
                          {copiedCode === collab.inviteCode ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Permissions Chips */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[0.68rem] text-stone-400 block font-medium">
                    {isAr ? 'الصلاحيات الممنوحة:' : 'Permissions attribuées :'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {collab.permissions.includes('all') ? (
                      <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {isAr ? 'كامل الصلاحيات (Admin)' : 'Accès Total Maître'}
                      </span>
                    ) : (
                      <>
                        {collab.permissions.includes('read_dossiers') && (
                          <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-white/5 text-stone-300 border border-white/10">
                            {isAr ? 'مطالعة الملفات' : 'Dossiers'}
                          </span>
                        )}
                        {collab.permissions.includes('write_dossiers') && (
                          <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-white/5 text-stone-300 border border-white/10">
                            {isAr ? 'تعديل القضايا' : 'Édition'}
                          </span>
                        )}
                        {collab.permissions.includes('quittances') && (
                          <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-white/5 text-stone-300 border border-white/10">
                            {isAr ? 'إصدار الوصل' : 'Quittances'}
                          </span>
                        )}
                        {collab.permissions.includes('epson_scan') && (
                          <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-white/5 text-stone-300 border border-white/10">
                            {isAr ? 'الماسح الضوئي' : 'Scanner'}
                          </span>
                        )}
                        {collab.permissions.includes('appointments') && (
                          <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-white/5 text-stone-300 border border-white/10">
                            {isAr ? 'جدول الجلسات' : 'Audiences'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action: 1-Click Revoke Seat (Disabled for Master Lawyer) */}
              {!isMaster ? (
                <div className="pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCollabToRevoke(collab)}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>{isAr ? 'سحب الترخيص وفصل الجهاز (1-Click)' : 'Révoquer le Poste Machine'}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-white/10 text-center">
                  <span className="text-[0.68rem] text-amber-400 font-medium">
                    {isAr ? '★ الجهاز الرئيسي غير قابل للسحب' : '★ Poste Maître Permanent'}
                  </span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. ADD COLLABORATOR MODAL
         ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0f1222] border border-amber-500/40 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden my-auto text-[#F0EDE8]"
            >
              <div className="px-6 py-5 border-b border-white/10 bg-[#121526] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-serif">
                      {isAr ? 'إضافة متعاون وتوليد كود الدخول' : 'Ajouter un Collaborateur & Poste'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {isAr ? 'توليد كود دعوة مكون من 6 أرقام (SEC / ASSO)' : 'Génération du code invite 6-chiffres'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {generatedInviteCard ? (
                /* Success Card with Invite Code */
                <div className="p-6 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 size={26} />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {isAr ? 'تمت إضافة المتعاون وتوليد كود الربط!' : 'Poste Collaborateur Ajouté avec Succès !'}
                  </h4>
                  <p className="text-xs text-stone-300">
                    {isAr
                      ? 'شارك هذا الكود مع المساعد لإدخاله في حاسوبه عبر شاشة البداية الذكية:'
                      : 'Communiquez ce code à votre collaborateur pour connexion sur son poste :'}
                  </p>

                  <div className="p-4 bg-[#060610] rounded-2xl border border-amber-500/40 flex items-center justify-between max-w-sm mx-auto">
                    <span className="font-mono text-xl font-bold text-amber-400 tracking-wider">
                      {generatedInviteCard}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedInviteCard)}
                      className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedCode === generatedInviteCard ? (
                        <>
                          <Check size={14} />
                          <span>{isAr ? 'تم النسخ' : 'Copié'}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>{isAr ? 'نسخ الكود' : 'Copier'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="py-2.5 px-6 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    {isAr ? 'إغلاق والعودة للقائمة' : 'Fermer'}
                  </button>
                </div>
              ) : (
                /* Form to Add */
                <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                  {/* Role Switcher */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-2">
                      {isAr ? 'صفة ودور المتعاون بالمكتب:' : 'Rôle du collaborateur :'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewRole('secretaire')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          newRole === 'secretaire'
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md'
                            : 'bg-[#121526] border-white/10 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span>{isAr ? '👩‍💼 سكرتارية (SEC-...)' : '👩‍💼 Secrétaire (SEC-...)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewRole('collaborateur')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          newRole === 'collaborateur'
                            ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-md'
                            : 'bg-[#121526] border-white/10 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span>{isAr ? '⚖️ محام مساعد (ASSO-...)' : '⚖️ Associé (ASSO-...)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        {isAr ? 'الاسم باللاتينية (FR)' : 'Nom complet (FR)'}
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ex: Meriem Belkacem"
                        required
                        className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        {isAr ? 'الاسم بالعربية (AR)' : 'Nom en Arabe'}
                      </label>
                      <input
                        type="text"
                        value={newNameAr}
                        onChange={(e) => setNewNameAr(e.target.value)}
                        placeholder="مثال: مريم بلقاسم"
                        className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        {isAr ? 'البريد الإلكتروني' : 'Email Professionnel'}
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="contact@cabinet.dz"
                        className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        {isAr ? 'رقم الهاتف' : 'Téléphone'}
                      </label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="0661 00 00 00"
                        className="w-full bg-[#121526] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Permissions checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      {isAr ? 'الصلاحيات المقيدة للجهاز:' : 'Permissions attribuées :'}
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'read_dossiers', label: isAr ? 'سجل القضايا' : 'Registre Dossiers' },
                        { id: 'write_dossiers', label: isAr ? 'تعديل وإضافة قضايا' : 'Modification Dossiers' },
                        { id: 'quittances', label: isAr ? 'إصدار وصولات الأتعاب' : 'Émission Quittances' },
                        { id: 'epson_scan', label: isAr ? 'ماسح إبسون DS-530' : 'Hub Epson Scan' },
                        { id: 'appointments', label: isAr ? 'جدول الجلسات والمواعيد' : 'Agenda & Audiences' },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-[#121526] border border-white/5 cursor-pointer hover:border-white/15"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(item.id)}
                            onChange={() => handleTogglePermission(item.id)}
                            className="rounded border-stone-600 text-amber-500 focus:ring-amber-500 bg-[#060610]"
                          />
                          <span className="text-stone-300 text-[0.72rem]">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/40 transition-all"
                  >
                    <KeyRound size={15} />
                    <span>{isAr ? 'توليد كود الدعوة وتفعيل المقعد' : 'Générer le Code & Activer le Poste'}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          4. 1-CLICK REVOKE CONFIRMATION MODAL
         ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {collabToRevoke && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0f1222] border border-rose-500/40 rounded-3xl p-6 shadow-2xl shadow-black/90 text-center space-y-4 text-[#F0EDE8]"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-base font-bold text-white font-serif">
                {isAr ? 'تأكيد سحب الترخيص وفصل الجهاز' : 'Confirmer la Révocation du Poste'}
              </h3>

              <p className="text-xs text-stone-300 leading-relaxed">
                {isAr ? (
                  <>
                    هل أنت متأكد من رغبتك في سحب رخصة الجهاز التابع لـ{' '}
                    <strong className="text-white">{collabToRevoke.nameAr || collabToRevoke.name}</strong>؟
                    سيتم قطع اتصاله بقاعدة بيانات المكتب فوراً وتحرير هذا المقعد.
                  </>
                ) : (
                  <>
                    Êtes-vous sûr de vouloir révoquer le poste de{' '}
                    <strong className="text-white">{collabToRevoke.name}</strong> ? La connexion à la base
                    locale sera immédiatement coupée et le siège libéré.
                  </>
                )}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCollabToRevoke(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold border border-white/10 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>

                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 cursor-pointer"
                >
                  {isAr ? 'نعم، اسحب المقعد فوراً' : 'Révoquer Immédiatement'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
})

AdminTeamModule.displayName = 'AdminTeamModule'
