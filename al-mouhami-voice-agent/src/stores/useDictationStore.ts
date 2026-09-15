import { create } from "zustand";

export interface DictationState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
  audioBase64: string | null;

  // Attachment (Document/Proof ingestion)
  attachedFileName: string | null;
  attachmentText: string | null;

  // Metadata CRM & Procedural Deadlines
  titreDossier: string;
  delaisProcedure: string[];
  montantReclame: string;

  // Actions
  setIsRecording: (isRecording: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setTranscript: (transcript: string | ((prev: string) => string)) => void;
  setLegalMetadata: (titre: string, delais: string[], montant: string) => void;
  setError: (error: string | null) => void;
  setAudioBase64: (audioBase64: string | null) => void;
  setAttachment: (fileName: string | null, text: string | null) => void;
  clearAttachment: () => void;
  reset: () => void;
}

export const useDictationStore = create<DictationState>((set) => ({
  isRecording: false,
  isProcessing: false,
  transcript: "",
  error: null,
  audioBase64: null,

  attachedFileName: null,
  attachmentText: null,

  titreDossier: "",
  delaisProcedure: [],
  montantReclame: "",

  setIsRecording: (isRecording) => set({ isRecording }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setTranscript: (transcript) =>
    set((state) => ({
      transcript:
        typeof transcript === "function" ? transcript(state.transcript) : transcript,
    })),
  setLegalMetadata: (titreDossier, delaisProcedure, montantReclame) =>
    set({ titreDossier, delaisProcedure, montantReclame }),
  setError: (error) => set({ error }),
  setAudioBase64: (audioBase64) => set({ audioBase64 }),
  setAttachment: (attachedFileName, attachmentText) => set({ attachedFileName, attachmentText }),
  clearAttachment: () => set({ attachedFileName: null, attachmentText: null }),
  reset: () =>
    set({
      isRecording: false,
      isProcessing: false,
      transcript: "",
      error: null,
      audioBase64: null,
      attachedFileName: null,
      attachmentText: null,
      titreDossier: "",
      delaisProcedure: [],
      montantReclame: "",
    }),
}));
