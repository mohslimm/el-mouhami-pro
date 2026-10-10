import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourtHearing, PocketCase, JudicialContact, VoiceNote, MutationQueueItem } from '../types';
import { initialHearings, initialCases, initialContacts, initialVoiceNotes } from './mockData';

const STORAGE_KEYS = {
  HEARINGS: '@el_mouhami_hearings',
  CASES: '@el_mouhami_cases',
  CONTACTS: '@el_mouhami_contacts',
  VOICE_NOTES: '@el_mouhami_voice_notes',
  MUTATION_QUEUE: '@el_mouhami_mutation_queue',
  LAST_SYNC: '@el_mouhami_last_sync',
  USER_SESSION: '@el_mouhami_user_session',
  LANGUAGE: '@el_mouhami_language',
};

class LocalDatabaseManager {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if data is already seeded
      const existingHearings = await AsyncStorage.getItem(STORAGE_KEYS.HEARINGS);
      if (!existingHearings) {
        await AsyncStorage.setItem(STORAGE_KEYS.HEARINGS, JSON.stringify(initialHearings));
        await AsyncStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(initialCases));
        await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(initialContacts));
        await AsyncStorage.setItem(STORAGE_KEYS.VOICE_NOTES, JSON.stringify(initialVoiceNotes));
        await AsyncStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify([]));
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('[LocalDatabaseManager] Storage fallback initialized:', error);
      this.isInitialized = true;
    }
  }

  // === Hearings CRUD ===
  async getHearings(): Promise<CourtHearing[]> {
    await this.initialize();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HEARINGS);
    return data ? JSON.parse(data) : initialHearings;
  }

  async saveHearingOutcome(
    hearingId: string,
    outcome: Partial<CourtHearing>
  ): Promise<CourtHearing> {
    const hearings = await this.getHearings();
    const index = hearings.findIndex((h) => h.id === hearingId);

    if (index === -1) {
      throw new Error(`Hearing ${hearingId} not found`);
    }

    const updated: CourtHearing = {
      ...hearings[index],
      ...outcome,
      syncStatus: 'pending_sync',
      updatedAt: new Date().toISOString(),
    };

    hearings[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEYS.HEARINGS, JSON.stringify(hearings));

    // Enqueue FIFO mutation for Algerian VPS sync
    await this.enqueueMutation({
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      entityType: 'hearing_outcome',
      entityId: hearingId,
      action: 'UPDATE',
      payload: updated,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    });

    return updated;
  }

  // === Pocket Cases CRUD ===
  async getCases(): Promise<PocketCase[]> {
    await this.initialize();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CASES);
    return data ? JSON.parse(data) : initialCases;
  }

  async updateCaseNotes(caseId: string, notes: string): Promise<PocketCase> {
    const cases = await this.getCases();
    const index = cases.findIndex((c) => c.id === caseId);
    if (index === -1) throw new Error(`Case ${caseId} not found`);

    cases[index].lastNotes = notes;
    cases[index].syncStatus = 'pending_sync';
    await AsyncStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));

    await this.enqueueMutation({
      id: `mut_case_${Date.now()}`,
      entityType: 'case_note',
      entityId: caseId,
      action: 'UPDATE',
      payload: { lastNotes: notes },
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    });

    return cases[index];
  }

  // === Contacts CRUD ===
  async getContacts(): Promise<JudicialContact[]> {
    await this.initialize();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
    return data ? JSON.parse(data) : initialContacts;
  }

  // === Voice Notes CRUD ===
  async getVoiceNotes(): Promise<VoiceNote[]> {
    await this.initialize();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.VOICE_NOTES);
    return data ? JSON.parse(data) : initialVoiceNotes;
  }

  async addVoiceNote(note: Omit<VoiceNote, 'id' | 'syncStatus'>): Promise<VoiceNote> {
    const notes = await this.getVoiceNotes();
    const newNote: VoiceNote = {
      ...note,
      id: `voice_${Date.now()}`,
      syncStatus: 'pending_sync',
    };

    notes.unshift(newNote);
    await AsyncStorage.setItem(STORAGE_KEYS.VOICE_NOTES, JSON.stringify(notes));

    await this.enqueueMutation({
      id: `mut_voice_${Date.now()}`,
      entityType: 'voice_note',
      entityId: newNote.id,
      action: 'CREATE',
      payload: newNote,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    });

    return newNote;
  }

  // === FIFO Offline Mutation Queue ===
  async getMutationQueue(): Promise<MutationQueueItem[]> {
    await this.initialize();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MUTATION_QUEUE);
    return data ? JSON.parse(data) : [];
  }

  async enqueueMutation(item: MutationQueueItem): Promise<void> {
    const queue = await this.getMutationQueue();
    queue.push(item);
    await AsyncStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify(queue));
  }

  async dequeueMutation(mutationId: string): Promise<void> {
    let queue = await this.getMutationQueue();
    queue = queue.filter((item) => item.id !== mutationId);
    await AsyncStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify(queue));
  }

  async clearMutationQueue(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify([]));
  }

  async markAllSynced(): Promise<void> {
    const hearings = await this.getHearings();
    const updatedHearings = hearings.map((h) => ({ ...h, syncStatus: 'synced' as const }));
    await AsyncStorage.setItem(STORAGE_KEYS.HEARINGS, JSON.stringify(updatedHearings));

    const cases = await this.getCases();
    const updatedCases = cases.map((c) => ({ ...c, syncStatus: 'synced' as const }));
    await AsyncStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(updatedCases));

    const voiceNotes = await this.getVoiceNotes();
    const updatedNotes = voiceNotes.map((v) => ({ ...v, syncStatus: 'synced' as const }));
    await AsyncStorage.setItem(STORAGE_KEYS.VOICE_NOTES, JSON.stringify(updatedNotes));

    await this.clearMutationQueue();
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }

  async getLastSyncDate(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }
}

export const localDb = new LocalDatabaseManager();
