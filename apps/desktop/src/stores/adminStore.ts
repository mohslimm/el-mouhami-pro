import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AdminTab =
  | 'overview'
  | 'dossiers'
  | 'epson_scan'
  | 'appointments'
  | 'finances'
  | 'ai_assistant'
  | 'cpca'
  | 'team'
  | 'contacts'

export type LicensePlan = 'trial' | 'solo' | 'pro' | 'prestige'
export type LicenseStatus = 'trial' | 'active' | 'expired' | 'unlicensed'

export interface LicenseState {
  status: LicenseStatus
  plan: LicensePlan
  key: string
  trialDaysRemaining: number
  barreauNumber: string
  lawyerPhone: string
  cabinetName: string
  cabinetNameAr: string
  lawyerName: string
  lawyerNameAr: string
  maxSeats: number
  installedMachineId: string
  expirationDate: string
  isBiometricEnabled: boolean
  rememberDevice: boolean
}

export type TeamRole = 'titulaire' | 'collaborateur' | 'secretaire'

export interface DeskCollaborator {
  id: string
  name: string
  nameAr: string
  role: TeamRole
  email: string
  phone: string
  machineId: string
  deviceName: string
  ipAddress?: string
  lastActive: string
  inviteCode: string
  status: 'active' | 'pending' | 'revoked'
  permissions: string[]
}

export type JudicialContactType = 'huissier' | 'expert' | 'avocat' | 'tribunal'

export interface JudicialContact {
  id: string
  name: string
  nameAr: string
  type: JudicialContactType
  jurisdiction: string
  jurisdictionAr: string
  phone: string
  email?: string
  address: string
  addressAr: string
  speciality?: string
  specialityAr?: string
  barreauOrChamber?: string
  notes?: string
}

export interface EnaabaData {
  lawyerDelegatee: JudicialContact | null
  dossierRef: string
  clientName: string
  adversaryName: string
  jurisdiction: string
  chamber: string
  dateAudience: string
  instructions: string
  hearingType: 'renvoi' | 'plaidoirie' | 'jugement' | 'formalites'
}

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

  // SaaS Auth & Licensing
  license: LicenseState
  setLicense: (license: Partial<LicenseState>) => void
  isLoginModalOpen: boolean
  setLoginModalOpen: (isOpen: boolean) => void
  isPaywallModalOpen: boolean
  setPaywallModalOpen: (isOpen: boolean) => void
  activateLicenseKey: (keyOrCode: string) => {
    success: boolean
    type: 'cabinet' | 'invite'
    plan?: LicensePlan
    message: string
    messageAr: string
  }
  startFreeTrial: (barreauNumber: string, phone: string, lawyerName?: string) => void

  // Team & Desks Seats
  teamSeats: DeskCollaborator[]
  addCollaborator: (collab: Omit<DeskCollaborator, 'id' | 'lastActive' | 'status'>) => void
  revokeCollaborator: (id: string) => void
  generateInviteCode: (role: TeamRole) => string

  // Judicial Directory & Contacts
  contacts: JudicialContact[]
  addContact: (contact: Omit<JudicialContact, 'id'>) => void
  deleteContact: (id: string) => void

  // 1-Click Hearing Delegation Slip (Énaaba)
  isEnaabaModalOpen: boolean
  setEnaabaModalOpen: (isOpen: boolean) => void
  enaabaData: EnaabaData | null
  openEnaabaFor: (contact: JudicialContact | null, initialDossier?: Partial<EnaabaData>) => void
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

const INITIAL_LICENSE: LicenseState = {
  status: 'trial',
  plan: 'trial',
  key: '',
  trialDaysRemaining: 14,
  barreauNumber: '16-08422',
  lawyerPhone: '0550 12 98 43',
  cabinetName: 'Cabinet Me Noureddine Slimani',
  cabinetNameAr: 'مكتب الأستاذ نور الدين سليماني',
  lawyerName: 'Me Noureddine Slimani',
  lawyerNameAr: 'الأستاذ نور الدين سليماني',
  maxSeats: 3,
  installedMachineId: 'DESKTOP-ALG-8891-BUREAU',
  expirationDate: '2026-10-24',
  isBiometricEnabled: false,
  rememberDevice: true,
}

const INITIAL_COLLABORATORS: DeskCollaborator[] = [
  {
    id: 'collab-1',
    name: 'Me Noureddine Slimani',
    nameAr: 'الأستاذ نور الدين سليماني',
    role: 'titulaire',
    email: 'slimani.avocat@al-mouhami.dz',
    phone: '0550 12 98 43',
    machineId: 'DESKTOP-SLIMANI-PRO',
    deviceName: 'PC-BUREAU-MAITRE (Win 11 Pro)',
    ipAddress: '192.168.1.10',
    lastActive: 'الآن (متصل)',
    inviteCode: 'CAB-MASTER-77',
    status: 'active',
    permissions: ['all'],
  },
  {
    id: 'collab-2',
    name: 'Meriem Belkacem',
    nameAr: 'مريم بلقاسم',
    role: 'secretaire',
    email: 'secretariat@slimani-avocat.dz',
    phone: '0661 88 44 22',
    machineId: 'PC-SECRETARIAT-01',
    deviceName: 'PC-ACCUEIL-BUREAU (Win 10)',
    ipAddress: '192.168.1.15',
    lastActive: 'منذ 15 دقيقة',
    inviteCode: 'SEC-8492',
    status: 'active',
    permissions: ['read_dossiers', 'write_dossiers', 'appointments', 'quittances', 'epson_scan'],
  },
]

const INITIAL_CONTACTS: JudicialContact[] = [
  {
    id: 'h-1',
    name: 'Me Ahmed Boudiaf',
    nameAr: 'الأستاذ أحمد بوضياف',
    type: 'huissier',
    jurisdiction: "Cour d'Alger / Sidi M'Hamed",
    jurisdictionAr: 'مجلس قضاء الجزائر / محكمة سيدي امحمد',
    phone: '0555 12 34 56',
    email: 'etude.boudiaf@huissier.dz',
    address: "14 Rue Larbi Ben M'Hidi, Alger-Centre",
    addressAr: '14 شارع العربي بن مهيدي، الجزائر الوسطى',
    speciality: 'Exécution des décisions & Significations',
    specialityAr: 'تنفيذ السندات التنفيذية والتبليغ القضائي',
    barreauOrChamber: 'الغرفة الوطنية للمحضرين القضائيين - الوسط',
  },
  {
    id: 'h-2',
    name: 'Me Samia Cherfi',
    nameAr: 'الأستاذة سامية شرفي',
    type: 'huissier',
    jurisdiction: 'Tribunal de Bir Mourad Raïs',
    jurisdictionAr: 'محكمة بئر مراد رايس / بئر خادم',
    phone: '0662 98 76 54',
    email: 'cherfi.huissier@gmail.com',
    address: '05 Boulevard des Martyrs, Bir Mourad Raïs',
    addressAr: '05 شارع الشهداء، بئر مراد رايس، الجزائر',
    speciality: "Constats d'urgence & Sommation interpellative",
    specialityAr: 'المعاينات الاستعجالية والإنذارات الاستجوابية',
    barreauOrChamber: 'غرفة المحضرين - الجزائر',
  },
  {
    id: 'e-1',
    name: 'Dr. Rachid Meziani',
    nameAr: 'الدكتور رشيد مزياني',
    type: 'expert',
    jurisdiction: "Cour d'Alger & Cour de Blida",
    jurisdictionAr: 'مجلس قضاء الجزائر ومجلس قضاء البليدة',
    phone: '0560 33 22 11',
    email: 'expert.meziani.foncier@yahoo.fr',
    address: 'Cité 1000 Logements, Bab Ezzouar',
    addressAr: 'حي 1000 مسكن، باب الزوار، الجزائر',
    speciality: 'Expert Géomètre & Évaluation Foncière',
    specialityAr: 'خبير مهندس عقاري وتحديد المعالم والممتلكات',
    barreauOrChamber: 'جدول الخبراء القضائيين المعتمدين',
  },
  {
    id: 'e-2',
    name: 'M. Karim Taleb',
    nameAr: 'السيد كريم طالب',
    type: 'expert',
    jurisdiction: "Cour d'Alger",
    jurisdictionAr: 'مجلس قضاء الجزائر',
    phone: '0770 55 44 33',
    email: 'taleb.audit@expert-comptable.dz',
    address: '28 Rue Didouche Mourad, Alger',
    addressAr: '28 شارع ديدوش مراد، الجزائر العاصمة',
    speciality: 'Expertise Comptable & Commissariat aux Comptes',
    specialityAr: 'محاسبة قضائية ومراجعة النزاعات المالية والتجارية',
    barreauOrChamber: 'المصف الوطني للخبراء الحسابيين',
  },
  {
    id: 'a-1',
    name: 'Me Farida Benali',
    nameAr: 'الأستاذة فريدة بن علي',
    type: 'avocat',
    jurisdiction: "Cour d'Alger / Bab El Oued",
    jurisdictionAr: 'مجلس قضاء الجزائر / محكمة باب الوادي',
    phone: '0550 44 55 66',
    email: 'benali.avocat@alger-barreau.dz',
    address: '12 Boulevard Zighoud Youcef, Alger',
    addressAr: '12 شارع زيغود يوسف، الجزائر العاصمة',
    speciality: 'Droit Pénal & Statut Personnel',
    specialityAr: 'محامية لدى مجلس قضاء الجزائر والمحكمة العليا',
    barreauOrChamber: 'منظمة المحامين لناحية الجزائر',
  },
  {
    id: 'a-2',
    name: 'Me Yacine Khelifi',
    nameAr: 'الأستاذ ياسين خليفي',
    type: 'avocat',
    jurisdiction: "Cour d'Oran",
    jurisdictionAr: 'مجلس قضاء وهران والمحاكم التابعة له',
    phone: '0661 77 88 99',
    email: 'khelifi.avocat.oran@gmail.com',
    address: '45 Rue Larbi Tebessi, Oran',
    addressAr: '45 شارع العربي التبسي، وهران',
    speciality: 'Droit Commercial & Maritime',
    specialityAr: 'محام معتمد لدى المحكمة العليا ومجلس الدولة',
    barreauOrChamber: 'منظمة المحامين لناحية وهران',
  },
  {
    id: 'a-3',
    name: 'Me Abdelmalek Zouaoui',
    nameAr: 'الأستاذ عبد المالك زواوي',
    type: 'avocat',
    jurisdiction: 'Cour de Constantine',
    jurisdictionAr: 'مجلس قضاء قسنطينة',
    phone: '0771 22 33 44',
    email: 'zouaoui.constantine@yahoo.fr',
    address: '08 Rue Rahmani Achour, Constantine',
    addressAr: '08 شارع رحماني عاشور، قسنطينة',
    speciality: 'Contentieux Civil & Foncier',
    specialityAr: 'محام لدى المحكمة العليا ومجلس الدولة',
    barreauOrChamber: 'منظمة المحامين لناحية قسنطينة',
  },
  {
    id: 't-1',
    name: "Tribunal de Sidi M'Hamed",
    nameAr: 'محكمة سيدي امحمد (القطب الجزائي والمدني)',
    type: 'tribunal',
    jurisdiction: "Ressort de la Cour d'Alger",
    jurisdictionAr: 'دائرة اختصاص مجلس قضاء الجزائر',
    phone: '021 73 12 45',
    address: 'Rue Abane Ramdane, Alger',
    addressAr: 'شارع عبان رمضان، الجزائر العاصمة',
    speciality: 'أمانة الضبط: القسم التجاري، العقاري، شؤون الأسرة، القطب الجزائي',
    specialityAr: 'مكتب رئيس أمناء الضبط والتحصيل',
    barreauOrChamber: 'وزارة العدل الجزائرية',
  },
  {
    id: 't-2',
    name: "Cour d'Alger (Ruisseau)",
    nameAr: 'مجلس قضاء الجزائر (العناصر)',
    type: 'tribunal',
    jurisdiction: "Cour d'Alger",
    jurisdictionAr: 'مجلس قضاء الجزائر',
    phone: '021 49 20 00',
    address: 'Cité El Annasser (Ruisseau), Alger',
    addressAr: 'حي العناصر (رويسو)، الجزائر العاصمة',
    speciality: 'الغرف المدنية، الغرفة الجزائية، الغرفة العقارية، كتابة الضبط المركزية',
    specialityAr: 'مصلحة تسليم القرارات والنسخ التنفيذية (الصيغة التنفيذية)',
    barreauOrChamber: 'وزارة العدل الجزائرية',
  },
  {
    id: 't-3',
    name: 'Cour Suprême',
    nameAr: 'المحكمة العليا (الأبيار)',
    type: 'tribunal',
    jurisdiction: 'Juridiction Suprême',
    jurisdictionAr: 'المحكمة العليا للجمهورية الجزائرية',
    phone: '021 79 16 00',
    address: '11 Rue 11 Décembre 1960, El Biar, Alger',
    addressAr: '11 شارع 11 ديسمبر 1960، الأبيار، الجزائر العاصمة',
    speciality: 'كتابة ضبط الغرفة المدنية والعقارية والجزائية وأمانة طعون النقض',
    specialityAr: 'مصلحة تسجيل عرائض الطعن بالنقض',
    barreauOrChamber: 'الهيئة القضائية العليا',
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

      // SaaS Auth & Licensing
      license: INITIAL_LICENSE,
      setLicense: (partial) =>
        set((state) => ({ license: { ...state.license, ...partial } })),
      isLoginModalOpen: false,
      setLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
      isPaywallModalOpen: false,
      setPaywallModalOpen: (isOpen) => set({ isPaywallModalOpen: isOpen }),
      activateLicenseKey: (keyOrCode: string) => {
        const clean = keyOrCode.trim().toUpperCase()
        if (clean.startsWith('CAB-')) {
          let plan: LicensePlan = 'pro'
          if (clean.includes('SOLO')) plan = 'solo'
          else if (clean.includes('GRD') || clean.includes('PRES')) plan = 'prestige'

          set((state) => ({
            license: {
              ...state.license,
              status: 'active',
              plan,
              key: clean,
              trialDaysRemaining: 365,
              maxSeats: plan === 'solo' ? 1 : plan === 'pro' ? 3 : 99,
            },
            isLoginModalOpen: false,
            isPaywallModalOpen: false,
          }))
          return {
            success: true,
            type: 'cabinet' as const,
            plan,
            message: `Licence Cabinet ${plan.toUpperCase()} activée avec succès pour 1 an.`,
            messageAr: `تم تفعيل ترخيص المكتب ${plan === 'solo' ? 'الفردي' : plan === 'pro' ? 'الاحترافي' : 'الشامل'} بنجاح لمدة سنة كاملة.`,
          }
        } else if (clean.startsWith('SEC-') || clean.startsWith('ASSO-')) {
          const isSec = clean.startsWith('SEC-')
          set((state) => ({
            license: {
              ...state.license,
              status: 'active',
              key: clean,
            },
            isLoginModalOpen: false,
            isPaywallModalOpen: false,
          }))
          return {
            success: true,
            type: 'invite' as const,
            message: isSec
              ? 'Poste Secrétariat connecté au Cabinet Principal avec succès.'
              : 'Poste Confrère Associé connecté au Cabinet avec succès.',
            messageAr: isSec
              ? 'تم ربط جهاز السكرتارية بالمكتب الرئيسي بنجاح.'
              : 'تم ربط جهاز الزميل المساعد بالمكتب الرئيسي بنجاح.',
          }
        }
        return {
          success: false,
          type: 'cabinet' as const,
          message: 'Clé de licence ou code invité invalide. Format: CAB-XXXX ou SEC-XXXX.',
          messageAr: 'مفتاح الترخيص أو كود الدعوة غير صالح. الصيغة: CAB-XXXX أو SEC-XXXX.',
        }
      },
      startFreeTrial: (barreauNumber: string, phone: string, lawyerName?: string) => {
        set((state) => ({
          license: {
            ...state.license,
            status: 'trial',
            plan: 'trial',
            trialDaysRemaining: 14,
            barreauNumber: barreauNumber.trim(),
            lawyerPhone: phone.trim(),
            lawyerName: lawyerName?.trim() || state.license.lawyerName,
            expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '2026-10-24',
          },
          isLoginModalOpen: false,
        }))
      },

      // Team & Desks Seats
      teamSeats: INITIAL_COLLABORATORS,
      addCollaborator: (collab) => {
        const id = `collab-${Date.now()}`
        const newCollab: DeskCollaborator = {
          ...collab,
          id,
          lastActive: 'الآن (مضاف حديثاً)',
          status: 'active',
        }
        set((state) => ({
          teamSeats: [...state.teamSeats, newCollab],
        }))
      },
      revokeCollaborator: (id) =>
        set((state) => ({
          teamSeats: state.teamSeats.filter((c) => c.id !== id),
        })),
      generateInviteCode: (role) => {
        const prefix = role === 'secretaire' ? 'SEC' : 'ASSO'
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        return `${prefix}-${randomNum}`
      },

      // Judicial Directory & Contacts
      contacts: INITIAL_CONTACTS,
      addContact: (contact) => {
        const newContact: JudicialContact = {
          ...contact,
          id: `contact-${Date.now()}`,
        }
        set((state) => ({
          contacts: [newContact, ...state.contacts],
        }))
      },
      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      // 1-Click Hearing Delegation Slip (Énaaba)
      isEnaabaModalOpen: false,
      setEnaabaModalOpen: (isOpen) => set({ isEnaabaModalOpen: isOpen }),
      enaabaData: null,
      openEnaabaFor: (contact, initialDossier) => {
        set({
          enaabaData: {
            lawyerDelegatee: contact,
            dossierRef: initialDossier?.dossierRef || '24/00412',
            clientName: initialDossier?.clientName || 'بن محمد رضا',
            adversaryName: initialDossier?.adversaryName || 'بن عيسى كمال',
            jurisdiction: initialDossier?.jurisdiction || "Tribunal de Sidi M'Hamed",
            chamber: initialDossier?.chamber || 'القسم العقاري - الغرفة الأولى',
            dateAudience: initialDossier?.dateAudience || '2026-08-18',
            instructions:
              initialDossier?.instructions ||
              'المطالبة بتأجيل القضية لتقديم المذكرات الجوابية والوثائق المشهرة سند الملكية.',
            hearingType: initialDossier?.hearingType || 'renvoi',
          },
          isEnaabaModalOpen: true,
        })
      },
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
        license: state.license,
        teamSeats: state.teamSeats,
        contacts: state.contacts,
      }),
    }
  )
)

