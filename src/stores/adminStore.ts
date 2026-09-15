import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AdminTab = 'overview' | 'dossiers' | 'epson_scan' | 'appointments' | 'finances' | 'ai_assistant' | 'cpca'

export interface ScannedDocumentItem {
  id: string
  timestamp: string
  filename: string
  caseRoleNo: string
  clientName: string
  source: string
  filePath?: string
}

export type CaseChamber = 'CIVIL' | 'PENAL' | 'FAMILLE' | 'COMMERCIAL' | 'SOCIAL' | 'FONCIER' | 'ADMINISTRATIF'

export interface AiGeneratedPetition {
  id: string
  title: string
  templateType: string
  clientName: string
  defendantName?: string
  chamber: CaseChamber
  jurisdiction: string
  facts: string
  legalDemands: string
  wordFileUrl: string
  createdAt: string
}

export interface AdminDossier {
  id: string
  reference: string
  clientName: string
  clientNameAr?: string
  clientPhone: string
  clientEmail: string
  qualiteClient?: 'Demandeur' | 'Défendeur' | 'Partie Civile' | 'Inculpé / Prévenu'
  adversaryName?: string
  chamber?: CaseChamber
  typeDroit: 'Foncier' | 'Civil' | 'Commercial' | 'Pénal' | 'Statut Personnel'
  jurisdiction: string // e.g. "Tribunal de Sidi M'Hamed", "Cour d'Alger", "Cour Suprême"
  jurisdictionAr?: string
  section?: string
  statut: 'En cours' | 'Audience fixée' | 'En délibéré' | 'Gagné' | 'Clôturé' | 'Pré-contentieux' | 'Enrôlement' | 'Instruction / Renvois' | 'Exécution (Grosse)' | 'En cours de Recours' | 'EN_ATTENTE_HUISSIER' | 'EN_DELIBERE' | 'EXPERTISE_EN_COURS'
  dateProchaineAudience: string
  appealDeadline?: string
  cassationDeadline?: string
  avocatCharge: string
  avocatChargeAr?: string
  honorairesTotal: number
  honorairesPayes: number
  description: string
  descriptionAr?: string
  createdAt: string
  documents?: Array<{ id: number; title: string; date: string; source: string }>
}

export interface AdminRdv {
  id: string
  clientName: string
  clientNameAr?: string
  telephone: string
  email: string
  date: string
  heureDebut: string
  heureFin: string
  motif: string
  motifAr?: string
  chambre?: string
  motifRenvoi?: string
  statut: 'Confirmé' | 'En attente' | 'Terminé' | 'Annulé'
  creneauType: 'Cabinet (Bir Khadem)' | 'Visioconférence'
}

export type SyncActionType =
  | 'CREATE_DOSSIER'
  | 'UPDATE_DOSSIER_STATUT'
  | 'ADD_QUITTANCE'
  | 'SAVE_AI_PETITION'
  | 'ADD_SCAN_DOC'
  | 'ADD_RDV'

export interface SyncActionItem {
  id: string
  timestamp: string
  actionType: SyncActionType
  payload: Record<string, unknown>
  retryCount: number
}

interface AdminState {
  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void

  lang: 'fr' | 'ar'
  setLang: (lang: 'fr' | 'ar') => void
  toggleLang: () => void

  searchQuery: string
  setSearchQuery: (query: string) => void

  // Network & Sync Queue state
  isOnline: boolean
  setIsOnline: (online: boolean) => void
  isSyncing: boolean
  setIsSyncing: (syncing: boolean) => void
  syncQueue: SyncActionItem[]
  addToSyncQueue: (actionType: SyncActionType, payload: Record<string, unknown>) => void
  removeSyncQueueItem: (id: string) => void
  clearSyncQueue: () => void

  // Modals state
  isEpsonScanOpen: boolean
  setEpsonScanOpen: (isOpen: boolean) => void

  isQuittanceOpen: boolean
  setQuittanceOpen: (isOpen: boolean) => void
  selectedQuittanceData: { clientName: string; dossierRef: string; amountDzd: number; motif: string } | null
  openQuittanceFor: (data: { clientName: string; dossierRef: string; amountDzd: number; motif: string }) => void

  // Scanned Vault
  scannedVault: ScannedDocumentItem[]
  addScannedDoc: (doc: ScannedDocumentItem) => void

  // AI Generated Petitions
  generatedPetitions: AiGeneratedPetition[]
  addGeneratedPetition: (petition: AiGeneratedPetition) => void

  // Dossiers
  dossiers: AdminDossier[]
  selectedDossier: AdminDossier | null
  setSelectedDossier: (dossier: AdminDossier | null) => void
  updateDossierStatut: (id: string, statut: AdminDossier['statut']) => void
  addDossier: (dossier: Omit<AdminDossier, 'id' | 'createdAt'>) => void

  // Rdvs
  rdvs: AdminRdv[]
  updateRdvStatut: (id: string, statut: AdminRdv['statut']) => void
  addRdv: (rdv: Omit<AdminRdv, 'id'>) => void
}

const INITIAL_SCANNED_VAULT: ScannedDocumentItem[] = [
  { id: '1', timestamp: '2026-05-10 10:15', filename: 'Requete_Initiale_Foncier.pdf', caseRoleNo: '24/00412', clientName: 'Benmohamed Reda', source: 'Epson DS-530 II' },
  { id: '2', timestamp: '2026-05-08 14:30', filename: 'Jugement_Avant_Dire_Droit.pdf', caseRoleNo: '23/01890', clientName: 'SARL El-Djazair', source: 'Epson DS-530 II' },
]

const INITIAL_DOSSIERS: AdminDossier[] = [
  {
    id: 'dos-001',
    reference: '24/00412',
    clientName: 'Benmohamed Reda',
    clientNameAr: 'بن محمد رضا',
    clientPhone: '0661 23 45 67',
    clientEmail: 'benmohamed.r@gmail.com',
    qualiteClient: 'Demandeur',
    adversaryName: 'Benaissa Kamel',
    typeDroit: 'Foncier',
    chamber: 'FONCIER',
    jurisdiction: "Tribunal de Sidi M'Hamed",
    jurisdictionAr: 'محكمة سيدي امحمد',
    section: 'Section Foncière',
    statut: 'Instruction / Renvois',
    dateProchaineAudience: '2026-08-18',
    appealDeadline: '2026-09-20',
    cassationDeadline: '2026-10-20',
    avocatCharge: 'Me Noureddine Slimani',
    avocatChargeAr: 'الأستاذ نور الدين سليماني',
    honorairesTotal: 150000,
    honorairesPayes: 90000,
    description: 'Litige relatif à la confirmation du droit de propriété et immatriculation foncière.',
    descriptionAr: 'نزاع يتعلق بتثبيت حق الملكية والحفظ العقاري بحسب العقد التوثيقي المشهر.',
    createdAt: '2026-01-15',
    documents: [
      { id: 101, title: 'Acte de Propriété Notarié.pdf', date: '2026-04-10', source: 'Epson DS-530 II' },
      { id: 102, title: "Procès-Verbal d'Huissier de Justice.pdf", date: '2026-04-12', source: 'Epson DS-530 II' }
    ]
  },
  {
    id: 'dos-002',
    reference: '23/01890',
    clientName: 'SARL El-Djazair Import',
    clientNameAr: 'شركة الجزائر للاستيراد',
    clientPhone: '0550 12 98 43',
    clientEmail: 'contact@eldjazair.dz',
    qualiteClient: 'Défendeur',
    adversaryName: "Banque Nationale d'Algérie (BNA)",
    typeDroit: 'Commercial',
    chamber: 'COMMERCIAL',
    jurisdiction: "Cour d'Alger",
    jurisdictionAr: 'مجلس قضاء الجزائر',
    section: 'Section Commerciale',
    statut: 'En cours de Recours',
    dateProchaineAudience: '2026-09-02',
    appealDeadline: '2026-09-15',
    cassationDeadline: '2026-10-15',
    avocatCharge: 'Me Noureddine Slimani',
    avocatChargeAr: 'الأستاذ نور الدين سليماني',
    honorairesTotal: 300000,
    honorairesPayes: 300000,
    description: 'Contentieux bancaire et appel de jugement commercial.',
    descriptionAr: 'منازعة بنكية واستئناف قرار تجاري صادرة عن محكمة تجارية.',
    createdAt: '2026-02-10',
    documents: [
      { id: 103, title: "Arrêt de la Cour d'Alger.pdf", date: '2026-03-01', source: 'Epson DS-530 II' }
    ]
  },
  {
    id: 'dos-003',
    reference: '24/00109',
    clientName: 'Messaoudi Fatma / مسعودي فاطمة',
    clientNameAr: 'مسعودي فاطمة',
    clientPhone: '0770 44 55 66',
    clientEmail: 'fatma.m@outlook.com',
    qualiteClient: 'Demandeur',
    adversaryName: 'Messaoudi Ahmed',
    typeDroit: 'Statut Personnel',
    chamber: 'FAMILLE',
    jurisdiction: 'Tribunal de Bab El Oued',
    jurisdictionAr: 'محكمة باب الوادي',
    section: 'Statut Personnel',
    statut: 'En délibéré',
    dateProchaineAudience: '2026-08-22',
    appealDeadline: '2026-10-01',
    cassationDeadline: '2026-11-01',
    avocatCharge: 'Me Noureddine Slimani',
    avocatChargeAr: 'الأستاذ نور الدين سليماني',
    honorairesTotal: 80000,
    honorairesPayes: 40000,
    description: 'Procédure de divorce et révision de la pension alimentaire.',
    descriptionAr: 'دعوى فك الرابطة الزوجية وتعديل النفقة الغذائية للحقوق الحاضنة.',
    createdAt: '2026-03-01',
    documents: [
      { id: 104, title: 'Livret de Famille Scanné.pdf', date: '2026-02-15', source: 'Epson DS-530 II' }
    ]
  },
]

const INITIAL_RDVS: AdminRdv[] = [
  {
    id: 'rdv-101',
    clientName: 'Benaissa Redouane',
    clientNameAr: 'بن عيسى رضوان',
    telephone: '0662 44 11 22',
    email: 'r.benaissa@gmail.com',
    date: '2026-08-18',
    heureDebut: '10:00',
    heureFin: '10:30',
    motif: 'Consultation juridique - Litige foncier',
    motifAr: 'استشارة قانونية - نزاع عقاري وتثبيت ملكية',
    chambre: 'Section Foncière 1',
    motifRenvoi: "Rapport d'Expertise Géomètre",
    statut: 'Confirmé',
    creneauType: 'Cabinet (Bir Khadem)',
  },
  {
    id: 'rdv-102',
    clientName: 'SARL El-Djazair Import',
    clientNameAr: 'شركة الجزائر استيراد ش.ذ.م.م',
    telephone: '0555 88 99 00',
    email: 'contact@eldjazair.dz',
    date: '2026-09-02',
    heureDebut: '11:30',
    heureFin: '12:00',
    motif: 'Audience devant la Cour d\'Alger',
    motifAr: 'جلسة محاكمة أمام مجلس قضاء الجزائر',
    chambre: 'Chambre Commerciale 2',
    motifRenvoi: 'Réponse de la Banque BNA',
    statut: 'Confirmé',
    creneauType: 'Cabinet (Bir Khadem)',
  },
]

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      activeTab: 'overview',
      setActiveTab: (tab) => set({ activeTab: tab }),

      lang: 'ar',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((state) => ({ lang: state.lang === 'fr' ? 'ar' : 'fr' })),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Network & Sync Queue
      isOnline: true,
      setIsOnline: (online) => set({ isOnline: online }),
      isSyncing: false,
      setIsSyncing: (syncing) => set({ isSyncing: syncing }),

      syncQueue: [],
      addToSyncQueue: (actionType, payload) =>
        set((state) => {
          const item: SyncActionItem = {
            id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
            actionType,
            payload,
            retryCount: 0,
          }
          return { syncQueue: [...state.syncQueue, item] }
        }),
      removeSyncQueueItem: (id) =>
        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => item.id !== id),
        })),
      clearSyncQueue: () => set({ syncQueue: [] }),

      isEpsonScanOpen: false,
      setEpsonScanOpen: (isOpen) => set({ isEpsonScanOpen: isOpen }),

      isQuittanceOpen: false,
      setQuittanceOpen: (isOpen) => set({ isQuittanceOpen: isOpen }),
      selectedQuittanceData: null,
      openQuittanceFor: (data) => set({ selectedQuittanceData: data, isQuittanceOpen: true }),

      scannedVault: INITIAL_SCANNED_VAULT,
      addScannedDoc: (doc) =>
        set((state) => {
          const updated = [doc, ...state.scannedVault]
          const queueItem: SyncActionItem = {
            id: `sync-scan-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actionType: 'ADD_SCAN_DOC',
            payload: doc as unknown as Record<string, unknown>,
            retryCount: 0,
          }
          return { scannedVault: updated, syncQueue: [...state.syncQueue, queueItem] }
        }),

      generatedPetitions: [
        {
          id: 'pet-001',
          title: 'عريضة افتتاح دعوى قسم عقاري (إثبات الملكية)',
          templateType: 'foncier-petition',
          clientName: 'بن محمد رضا',
          defendantName: 'بن عيسى كمال',
          chamber: 'FONCIER',
          jurisdiction: "محكمة سيدي امحمد - القسم العقاري",
          facts: "التماس إثبات حق الملكية وتثبيت العقار الواقع ببلدية بئر خادم بحسب عقد الملكية المشهر.",
          legalDemands: "الحكم بإثبات ملكية الطالب للعقار وإلزام المدعى عليه بإخلاء الأمكنة.",
          wordFileUrl: '#',
          createdAt: '2026-08-05'
        }
      ],
      addGeneratedPetition: (petition) =>
        set((state) => {
          const updated = [petition, ...state.generatedPetitions]
          const queueItem: SyncActionItem = {
            id: `sync-pet-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actionType: 'SAVE_AI_PETITION',
            payload: petition as unknown as Record<string, unknown>,
            retryCount: 0,
          }
          return { generatedPetitions: updated, syncQueue: [...state.syncQueue, queueItem] }
        }),

      dossiers: INITIAL_DOSSIERS,
      selectedDossier: null,
      setSelectedDossier: (dossier) => set({ selectedDossier: dossier }),
      updateDossierStatut: (id, statut) =>
        set((state) => {
          const updatedDossiers = state.dossiers.map((d) => (d.id === id ? { ...d, statut } : d))
          const queueItem: SyncActionItem = {
            id: `sync-statut-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actionType: 'UPDATE_DOSSIER_STATUT',
            payload: { id, statut },
            retryCount: 0,
          }
          return {
            dossiers: updatedDossiers,
            selectedDossier: state.selectedDossier?.id === id ? { ...state.selectedDossier, statut } : state.selectedDossier,
            syncQueue: [...state.syncQueue, queueItem],
          }
        }),
      addDossier: (dossier) =>
        set((state) => {
          const newDossier: AdminDossier = {
            ...dossier,
            id: `dos-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0] ?? '2026-08-05',
          }
          const queueItem: SyncActionItem = {
            id: `sync-dos-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actionType: 'CREATE_DOSSIER',
            payload: newDossier as unknown as Record<string, unknown>,
            retryCount: 0,
          }
          return { dossiers: [newDossier, ...state.dossiers], syncQueue: [...state.syncQueue, queueItem] }
        }),

      rdvs: INITIAL_RDVS,
      updateRdvStatut: (id, statut) =>
        set((state) => ({
          rdvs: state.rdvs.map((r) => (r.id === id ? { ...r, statut } : r)),
        })),
      addRdv: (rdv) =>
        set((state) => {
          const newRdv = { ...rdv, id: `rdv-${Date.now()}` }
          const queueItem: SyncActionItem = {
            id: `sync-rdv-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actionType: 'ADD_RDV',
            payload: newRdv as unknown as Record<string, unknown>,
            retryCount: 0,
          }
          return { rdvs: [...state.rdvs, newRdv], syncQueue: [...state.syncQueue, queueItem] }
        }),
    }),
    {
      name: 'almouhami_pro_store_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dossiers: state.dossiers,
        rdvs: state.rdvs,
        scannedVault: state.scannedVault,
        generatedPetitions: state.generatedPetitions,
        syncQueue: state.syncQueue,
        lang: state.lang,
      }),
    }
  )
)

