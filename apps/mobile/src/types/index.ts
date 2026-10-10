export type Language = 'fr' | 'ar';

export type HearingOutcomeStatus =
  | 'pending'
  | 'deliberation'    // تاريخ النطق
  | 'postponed'       // تأجيل للاطلاع والجواب
  | 'pleaded'         // تمت المرافعة
  | 'called';         // نودي عليها

export interface CourtHearing {
  id: string;
  caseNumber: string;         // e.g. "2024/01482"
  roleNumber: number;          // e.g. 14 (رقم الرول)
  jurisdiction: string;       // e.g. "Tribunal de Sidi M'hamed"
  jurisdictionAr: string;     // e.g. "محكمة سيدي امحمد"
  chamber: string;            // e.g. "Chambre Civile"
  chamberAr: string;          // e.g. "الغرفة المدنية"
  courtroom: string;          // e.g. "Salle 03" / "القاعة 3"
  judge: string;              // e.g. "Président Mansouri" / "الرئيس منصوري"
  clientName: string;
  clientPhone: string;
  opposingParty: string;
  opposingCounsel?: string;
  date: string;               // YYYY-MM-DD
  time: string;               // HH:mm
  status: HearingOutcomeStatus;
  outcomeNotes?: string;
  nextHearingDate?: string;
  nextHearingReason?: string;
  syncStatus: 'synced' | 'pending_sync';
  updatedAt: string;
}

export interface PocketCase {
  id: string;
  reference: string;
  roleNumber: string;
  title: string;
  titleAr: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  opposingParty: string;
  jurisdiction: string;
  jurisdictionAr: string;
  chamber: string;
  stage: string;
  nextHearingDate: string;
  courtroom: string;
  claimAmountDzd?: number;
  lastNotes?: string;
  syncStatus: 'synced' | 'pending_sync';
}

export interface JudicialContact {
  id: string;
  name: string;
  nameAr?: string;
  type: 'bailiff' | 'colleague' | 'expert' | 'clerk';
  phone: string;
  whatsapp?: string;
  jurisdiction: string;
  officeAddress: string;
  isAvailableForSubstitution: boolean;
  speciality?: string;
  avatarInitials: string;
}

export interface VoiceNote {
  id: string;
  caseId?: string;
  caseReference?: string;
  hearingId?: string;
  title: string;
  timestamp: string;
  durationSeconds: number;
  audioUri: string;
  transcription: string;
  transcriptionAr?: string;
  tags: string[];
  syncStatus: 'synced' | 'pending_sync';
}

export interface MutationQueueItem {
  id: string;
  entityType: 'hearing_outcome' | 'voice_note' | 'case_note' | 'substitution_request';
  entityId: string;
  action: 'UPDATE' | 'CREATE' | 'DELETE';
  payload: any;
  queuedAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

export interface SyncStatusInfo {
  isOnline: boolean;
  vpsConnected: boolean;
  pendingMutationsCount: number;
  lastSyncedAt: string | null;
  serverPingMs: number;
}

export interface UserSession {
  isAuthenticated: boolean;
  attorneyName: string;
  barreau: string;
  devicePaired: boolean;
  pairedAt?: string;
  biometricEnabled: boolean;
  authToken?: string;
}
