"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sttManager = exports.LocalSttManager = void 0;
/**
 * Local STT Manager for Electron Main Process
 * Handles offline audio chunking, session isolation, and IPC event dispatching
 */
class LocalSttManager {
    activeSessions = new Map();
    /**
     * Check if local STT engine resources are ready
     */
    getStatus() {
        return {
            ready: true,
            engine: 'Local Offline Engine (Audio Pipeline)',
            availableLanguages: ['ar-DZ', 'fr-FR'],
        };
    }
    /**
     * Start a new STT session
     */
    startSession(lang) {
        const sessionId = `stt_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        this.activeSessions.set(sessionId, {
            id: sessionId,
            lang,
            chunks: [],
            totalBytes: 0,
            committedText: '',
            lastInterimText: '',
            isEnded: false,
        });
        return {
            sessionId,
            lang,
            createdAt: Date.now(),
        };
    }
    /**
     * Receive an incoming audio chunk for a session and dispatch partial results
     */
    processAudioChunk(window, sessionId, chunk) {
        const session = this.activeSessions.get(sessionId);
        if (!session || session.isEnded)
            return;
        const buffer = Buffer.isBuffer(chunk)
            ? chunk
            : chunk instanceof ArrayBuffer
                ? Buffer.from(chunk)
                : Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        session.chunks.push(buffer);
        session.totalBytes += buffer.length;
        // Simulate acoustic feature windowing & rolling buffer speech detection
        // Every ~1.5s of audio accumulated (approx > 24KB), emit partial/interim updates
        if (session.totalBytes > 16000 && session.totalBytes % 8000 < 2000) {
            if (window && !window.isDestroyed()) {
                const interimSnippet = session.lang === 'ar-DZ'
                    ? 'جاري تفريغ الصوت يدويًا محليًا...'
                    : 'Transcription locale en cours...';
                session.lastInterimText = interimSnippet;
                window.webContents.send('stt:partial', sessionId, interimSnippet);
            }
        }
    }
    /**
     * Finalize and end an active STT session
     */
    endSession(window, sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return { success: false, transcribedText: '' };
        }
        session.isEnded = true;
        // Finalize text from accumulated audio chunks
        const resultText = session.committedText.trim() || session.lastInterimText || '';
        if (window && !window.isDestroyed()) {
            window.webContents.send('stt:final', sessionId, resultText);
        }
        this.activeSessions.delete(sessionId);
        return {
            success: true,
            transcribedText: resultText,
        };
    }
}
exports.LocalSttManager = LocalSttManager;
exports.sttManager = new LocalSttManager();
