import { create } from 'zustand';
import {
  CourtHearing,
  PocketCase,
  JudicialContact,
  VoiceNote,
  HearingOutcomeStatus,
  Language,
  SyncStatusInfo,
  UserSession,
} from '../types';
import { localDb } from '../storage/db';
import { initialHearings, initialCases, initialContacts, initialVoiceNotes } from '../storage/mockData';

interface AppState {
  language: Language;
  isRTL: boolean;
  activeTab: 'hearings' | 'cases' | 'voice' | 'contacts' | 'profile';
  
  session: UserSession;
  syncStatus: SyncStatusInfo;
  
  hearings: CourtHearing[];
  cases: PocketCase[];
  contacts: JudicialContact[];
  voiceNotes: VoiceNote[];
  
  searchQuery: string;
  hearingFilter: 'all' | HearingOutcomeStatus;
  selectedJurisdiction: string;
  
  // Actions
  initializeStore: () => Promise<void>;
  setLanguage: (lang: Language) => void;
  setActiveTab: (tab: 'hearings' | 'cases' | 'voice' | 'contacts' | 'profile') => void;
  setSearchQuery: (query: string) => void;
  setHearingFilter: (filter: 'all' | HearingOutcomeStatus) => void;
  setSelectedJurisdiction: (jurisdiction: string) => void;
  
  // Auth & Pairing
  authenticateBiometric: () => Promise<boolean>;
  pairWithDesktop: (qrPayload?: string) => Promise<boolean>;
  logout: () => void;
  
  // Hearings
  updateHearingOutcome: (
    hearingId: string,
    status: HearingOutcomeStatus,
    outcomeNotes?: string,
    nextHearingDate?: string,
    nextHearingReason?: string
  ) => Promise<void>;
  
  // Voice Notes
  addVoiceNote: (
    title: string,
    durationSeconds: number,
    transcription: string,
    tags: string[],
    caseReference?: string,
    hearingId?: string
  ) => Promise<void>;
  
  // Case Updates
  updateCaseNotes: (caseId: string, notes: string) => Promise<void>;
  
  // Offline & Sync Engine
  toggleNetworkSimulation: () => void;
  triggerManualSync: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  language: 'fr',
  isRTL: false,
  activeTab: 'hearings',
  
  session: {
    isAuthenticated: true,
    attorneyName: 'Me Noureddine Slimani',
    barreau: "Barreau d'Alger — نقابة المحامين لناحية الجزائر",
    devicePaired: true,
    pairedAt: 'Aujourd’hui à 08:30 (PC-BUREAU-01)',
    biometricEnabled: true,
    authToken: 'jwt_slimani_secure_token',
  },
  
  syncStatus: {
    isOnline: true,
    vpsConnected: true,
    pendingMutationsCount: 0,
    lastSyncedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    serverPingMs: 24,
  },
  
  hearings: initialHearings,
  cases: initialCases,
  contacts: initialContacts,
  voiceNotes: initialVoiceNotes,
  
  searchQuery: '',
  hearingFilter: 'all',
  selectedJurisdiction: 'all',

  initializeStore: async () => {
    try {
      await localDb.initialize();
      const hearings = await localDb.getHearings();
      const cases = await localDb.getCases();
      const contacts = await localDb.getContacts();
      const voiceNotes = await localDb.getVoiceNotes();
      const queue = await localDb.getMutationQueue();

      set({
        hearings,
        cases,
        contacts,
        voiceNotes,
        syncStatus: {
          ...get().syncStatus,
          pendingMutationsCount: queue.length,
        },
      });
    } catch (e) {
      console.warn('Store initialization error:', e);
    }
  },

  setLanguage: (lang: Language) => {
    set({
      language: lang,
      isRTL: lang === 'ar',
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setHearingFilter: (hearingFilter) => set({ hearingFilter }),
  setSelectedJurisdiction: (selectedJurisdiction) => set({ selectedJurisdiction }),

  authenticateBiometric: async () => {
    // Simulated Biometric FaceID / TouchID authentication
    return new Promise((resolve) => {
      setTimeout(() => {
        set((state) => ({
          session: { ...state.session, isAuthenticated: true },
        }));
        resolve(true);
      }, 600);
    });
  },

  pairWithDesktop: async (qrPayload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        set((state) => ({
          session: {
            ...state.session,
            devicePaired: true,
            pairedAt: `Synchronisé (${qrPayload || 'Desktop Sidi M’hamed'})`,
          },
        }));
        resolve(true);
      }, 800);
    });
  },

  logout: () => {
    set((state) => ({
      session: { ...state.session, isAuthenticated: false },
    }));
  },

  updateHearingOutcome: async (hearingId, status, outcomeNotes, nextHearingDate, nextHearingReason) => {
    const updated = await localDb.saveHearingOutcome(hearingId, {
      status,
      outcomeNotes,
      nextHearingDate,
      nextHearingReason,
    });

    const isOnline = get().syncStatus.isOnline;

    set((state) => {
      const nextHearings = state.hearings.map((h) =>
        h.id === hearingId
          ? {
              ...h,
              status,
              outcomeNotes,
              nextHearingDate,
              nextHearingReason,
              syncStatus: isOnline ? ('synced' as const) : ('pending_sync' as const),
            }
          : h
      );

      const pendingCount = isOnline ? 0 : state.syncStatus.pendingMutationsCount + 1;

      return {
        hearings: nextHearings,
        syncStatus: {
          ...state.syncStatus,
          pendingMutationsCount: pendingCount,
          lastSyncedAt: isOnline
            ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : state.syncStatus.lastSyncedAt,
        },
      };
    });
  },

  addVoiceNote: async (title, durationSeconds, transcription, tags, caseReference, hearingId) => {
    const newNote = await localDb.addVoiceNote({
      title,
      durationSeconds,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      audioUri: `file://storage/audio_${Date.now()}.m4a`,
      transcription,
      tags,
      caseReference,
      hearingId,
    });

    const isOnline = get().syncStatus.isOnline;

    set((state) => ({
      voiceNotes: [newNote, ...state.voiceNotes],
      syncStatus: {
        ...state.syncStatus,
        pendingMutationsCount: isOnline
          ? state.syncStatus.pendingMutationsCount
          : state.syncStatus.pendingMutationsCount + 1,
      },
    }));
  },

  updateCaseNotes: async (caseId, notes) => {
    const updated = await localDb.updateCaseNotes(caseId, notes);
    set((state) => ({
      cases: state.cases.map((c) => (c.id === caseId ? updated : c)),
    }));
  },

  toggleNetworkSimulation: () => {
    set((state) => {
      const nextOnline = !state.syncStatus.isOnline;
      return {
        syncStatus: {
          ...state.syncStatus,
          isOnline: nextOnline,
          vpsConnected: nextOnline,
          serverPingMs: nextOnline ? 28 : 0,
        },
      };
    });
  },

  triggerManualSync: async () => {
    const isOnline = get().syncStatus.isOnline;
    if (!isOnline) return;

    // Simulate batch uploading mutations to sovereign VPS in Algiers
    await localDb.markAllSynced();

    set((state) => ({
      hearings: state.hearings.map((h) => ({ ...h, syncStatus: 'synced' })),
      voiceNotes: state.voiceNotes.map((v) => ({ ...v, syncStatus: 'synced' })),
      cases: state.cases.map((c) => ({ ...c, syncStatus: 'synced' })),
      syncStatus: {
        ...state.syncStatus,
        pendingMutationsCount: 0,
        lastSyncedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    }));
  },
}));
