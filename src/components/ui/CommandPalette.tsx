import React, { useState, useEffect } from 'react'
import { Icon } from './Icon'
import { useAdminStore } from '@/stores/adminStore'

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { dossiers, lang, setActiveTab } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredDossiers = dossiers.filter(
    (d) =>
      d.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.clientNameAr && d.clientNameAr.includes(searchTerm)) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectDossier = () => {
    setActiveTab('dossiers')
    onClose()
  }

  const handleSelectAction = (tab: any) => {
    setActiveTab(tab)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0B0B0D]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[600px] bg-[#1F1F24] border border-[#2A2A30] rounded-[14px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">
        <div className="flex items-center px-4 py-3 border-b border-[#2A2A30]">
          <Icon name="search" className="text-[#A3A3AC] mr-3" size={20} />
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'ابحث عن عريضة، موكل، قضية أو إجراء... (⌘K)'
                : 'Rechercher un dossier, client, audience... (⌘K)'
            }
            className="flex-1 bg-transparent border-none outline-none text-base text-[#F2F1ED] placeholder:text-[#6B6B74] font-inter"
          />
          <span className="text-xs text-[#6B6B74] font-mono bg-[#17171B] px-1.5 py-0.5 rounded border border-[#2A2A30]">
            ESC
          </span>
        </div>

        <div className="p-2 max-h-[360px] overflow-y-auto">
          <div className="px-2 py-1.5 text-xs font-semibold text-[#A3A3AC] uppercase tracking-wider mb-1 mt-1">
            {lang === 'ar' ? 'الإجراءات السريعة' : 'Actions Rapides'}
          </div>
          <button
            onClick={() => handleSelectAction('ai_assistant')}
            className="w-full flex items-center px-3 py-2 text-sm text-[#F2F1ED] hover:bg-[#C7A662]/10 hover:text-[#C7A662] rounded-control transition-colors"
          >
            <Icon name="sparkles" size={16} className="mr-3 text-[#C7A662]" />
            {lang === 'ar' ? 'مساعد الذكاء الاصطناعي والإملاء الصوتي' : 'Assistant IA & Dictée Vocale'}
          </button>
          <button
            onClick={() => handleSelectAction('epson_scan')}
            className="w-full flex items-center px-3 py-2 text-sm text-[#F2F1ED] hover:bg-[#C7A662]/10 hover:text-[#C7A662] rounded-control transition-colors"
          >
            <Icon name="printer" size={16} className="mr-3 text-[#A3A3AC]" />
            {lang === 'ar' ? 'مسح مستند بالماسح الضوئي' : 'Numériser un document (Scanner GED)'}
          </button>
          <button
            onClick={() => handleSelectAction('cpca')}
            className="w-full flex items-center px-3 py-2 text-sm text-[#F2F1ED] hover:bg-[#C7A662]/10 hover:text-[#C7A662] rounded-control transition-colors"
          >
            <Icon name="calculator" size={16} className="mr-3 text-[#A3A3AC]" />
            {lang === 'ar' ? 'حساب المواعيد والإجراءات القانونية (CPCA)' : 'Calculer les délais de procédure (CPCA)'}
          </button>

          <div className="px-2 py-1.5 text-xs font-semibold text-[#A3A3AC] uppercase tracking-wider mb-1 mt-4">
            {lang === 'ar' ? 'القضايا والمقالات الحالية' : 'Dossiers Récents'}
          </div>
          {filteredDossiers.length === 0 ? (
            <div className="px-3 py-4 text-sm text-[#6B6B74] text-center">
              {lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'Aucun résultat trouvé'}
            </div>
          ) : (
            filteredDossiers.map((dossier) => (
              <button
                key={dossier.id}
                onClick={handleSelectDossier}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#F2F1ED] hover:bg-[#17171B] rounded-control transition-colors"
              >
                <span className="flex items-center">
                  <Icon name="folder" size={16} className="mr-3 text-[#C7A662]" />
                  <span>{dossier.clientName} — {dossier.description}</span>
                </span>
                <span className="text-xs text-[#6B6B74] font-mono">{dossier.reference}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

CommandPalette.displayName = 'CommandPalette'
