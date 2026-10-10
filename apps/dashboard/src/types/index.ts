export type PlanTier = 'SOLO' | 'PRO' | 'GRAND'

export interface PlanConfig {
  name: PlanTier
  label: string
  priceDzd: number
  priceFormatted: string
  maxDesktops: number
  maxMobiles: number
  description: string
  badgeColor: string
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  SOLO: {
    name: 'SOLO',
    label: 'Solo Avocat',
    priceDzd: 35000,
    priceFormatted: '35 000 DZD',
    maxDesktops: 1,
    maxMobiles: 1,
    description: '1 Poste PC de travail + 1 Accès Mobile Android/iOS',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  },
  PRO: {
    name: 'PRO',
    label: 'Cabinet Associé (Pro)',
    priceDzd: 85000,
    priceFormatted: '85 000 DZD',
    maxDesktops: 3,
    maxMobiles: 3,
    description: '3 Postes PC en réseau local + 3 Accès Mobiles synchronisés',
    badgeColor: 'border-[#C39B57]/40 text-[#E8C77A] bg-[#C39B57]/10',
  },
  GRAND: {
    name: 'GRAND',
    label: 'Grand Cabinet d\'Affaires',
    priceDzd: 180000,
    priceFormatted: '180 000 DZD',
    maxDesktops: 8,
    maxMobiles: 8,
    description: '8 Postes PC + 8 Accès Mobiles + GED illimitée & Pôle Numérique',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
  },
}

export type Barreau =
  | 'Alger'
  | 'Oran'
  | 'Constantine'
  | 'Sétif'
  | 'Blida'
  | 'Annaba'
  | 'Tlemcen'
  | 'Béjaïa'
  | 'Batna'
  | 'Chlef'
  | 'Tizi Ouzou'
  | 'Autre'

export type LicenseStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'SUSPENDED' | 'EXPIRED' | 'TRIAL'

export type ValidityOption = '1_YEAR' | '2_YEARS' | 'TRIAL_14_DAYS' | 'CUSTOM'

export interface License {
  id: string
  key: string
  cabinetName: string
  leadAttorney: string
  barreau: Barreau
  wilaya: string
  plan: PlanTier
  validityType: ValidityOption
  issueDate: string
  expiryDate: string
  maxDesktops: number
  maxMobiles: number
  activeDesktops: number
  activeMobiles: number
  status: LicenseStatus
  ed25519Signature: string
  notes?: string
  lastVerifiedAt?: string
}

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type PaymentMethod =
  | 'CCP'
  | 'VIREMENT_BNA'
  | 'VIREMENT_CPA'
  | 'VIREMENT_BEA'
  | 'ESPECES'

export interface OfflinePayment {
  id: string
  cabinetName: string
  leadAttorney: string
  barreau: Barreau
  phone: string
  email: string
  amountDzd: number
  plan: PlanTier
  validity: ValidityOption
  paymentMethod: PaymentMethod
  transactionRef: string
  submittedAt: string
  slipImageUrl: string
  slipFileName: string
  status: PaymentStatus
  reviewedAt?: string
  rejectionReason?: string
}

export interface HardwareSeat {
  id: string
  cabinetId: string
  type: 'DESKTOP' | 'MOBILE'
  deviceName: string
  os: string
  fingerprintHash: string
  registeredAt: string
  lastSyncAt: string
  ipAddress: string
  status: 'ACTIVE' | 'RESET'
}

export interface LawFirmClient {
  id: string
  cabinetName: string
  leadAttorney: string
  barreau: Barreau
  wilaya: string
  phone: string
  email: string
  plan: PlanTier
  licenseKey: string
  licenseExpiry: string
  maxDesktops: number
  maxMobiles: number
  desktopsUsed: number
  mobilesUsed: number
  joinedDate: string
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED'
  seats: HardwareSeat[]
}

export interface WilayaStat {
  wilaya: string
  activeCabinets: number
  arrDzd: number
  percentage: number
}

export interface VpsTelemetry {
  datacenter: string
  serverNode: string
  ipAddress: string
  uptime: string
  uptimePercentage: number
  cpuUsage: number
  cpuCores: number
  cpuModel: string
  ramUsedGb: number
  ramTotalGb: number
  diskUsedGb: number
  diskTotalGb: number
  bandwidthInMbps: number
  bandwidthOutMbps: number
  activeWebSocketConnections: number
  postgresVersion: string
  dbLatencyMs: number
  dbConnections: number
  lastSovereignBackup: string
  backupStatus: 'SUCCESS' | 'WARNING' | 'FAILED'
  securityEventsCount: number
}

// ── 6 NEW EXPANSION MODULES ──

export interface AgencyInvoice {
  id: string
  invoiceNumber: string
  cabinetName: string
  leadAttorney: string
  nif: string
  nis: string
  rc: string
  barreau: Barreau
  plan: PlanTier
  amountHt: number
  tvaAmount: number
  amountTtc: number
  status: 'PAID' | 'PENDING' | 'CANCELLED'
  issueDate: string
  dueDate: string
  paymentMethod: string
}

export interface AiCabinetUsage {
  cabinetId: string
  cabinetName: string
  leadAttorney: string
  barreau: Barreau
  plan: PlanTier
  tokensUsedThisMonth: number
  monthlyTokenCap: number
  petitionsDrafted: number
  voiceMinutes: number
  estimatedCostDzd: number
  status: 'NORMAL' | 'WARNING' | 'EXCEEDED'
}

export interface BroadcastMessage {
  id: string
  title: string
  content: string
  type: 'UPDATE' | 'MAINTENANCE' | 'LEGAL_ALERT' | 'INFO'
  target: 'ALL' | 'BARREAU_ALGER' | 'BARREAU_ORAN' | 'PRO_TIER'
  versionTag?: string
  publishedAt: string
  status: 'ACTIVE' | 'ARCHIVED'
  reachCount: number
}

export interface SupportTicket {
  id: string
  ticketNumber: string
  cabinetName: string
  attorneyName: string
  phone: string
  subject: string
  category: 'SCANNER_EPSON' | 'CPCA_DELAYS' | 'BILLING' | 'MOBILE_APP' | 'OTHER'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  anydeskId?: string
  createdAt: string
  messages: Array<{ sender: 'CLIENT' | 'AGENCY'; text: string; time: string }>
}

export interface SecurityAuditLog {
  id: string
  timestamp: string
  eventType: 'UNAUTHORIZED_SEAT' | 'CLOCK_ROLLBACK' | 'INVALID_KEY' | 'IP_BLOCKED' | 'SUSPICIOUS_DECRYPT'
  cabinetName?: string
  ipAddress: string
  wilaya: string
  hardwareHash: string
  details: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  actionTaken: 'BLOCKED' | 'FLAGGED' | 'RESOLVED'
}

export interface CommercialQuotation {
  id: string
  quoteNumber: string
  clientName: string
  barreau: Barreau
  leadAttorney: string
  desktopsCount: number
  mobilesCount: number
  hasHardwareScannerAddon: boolean
  hasSovereignCloudAddon: boolean
  totalAmountDzd: number
  validUntil: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'EXPIRED'
}

export type NavigationTab =
  | 'overview'
  | 'licenses'
  | 'payments'
  | 'directory'
  | 'telemetry'
  | 'invoices'
  | 'ai_usage'
  | 'broadcast'
  | 'support'
  | 'security_logs'
  | 'quotations'
