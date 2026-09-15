import { contextBridge, ipcRenderer } from 'electron'

export interface ScanOptions {
  driverMode: 'NAPS2_CLI' | 'WIA_NATIVE' | 'TWAIN_DIRECT'
  scannerName: string
  dpi: string
  sourceMode: string
  ocrActive: boolean
  deskewActive: boolean
  caseRoleNo?: string
  clientName?: string
}

export interface ScannedResultPayload {
  success: boolean
  item?: {
    id: string
    timestamp: string
    filename: string
    filePath?: string
    caseRoleNo: string
    clientName: string
    source: string
  }
  error?: string
}

// Exposition sécurisée d'une API Electron pour le processus de rendu (React)
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAvailableScanners: () => ipcRenderer.invoke('scan:get-scanners'),
  scanDocument: (options: ScanOptions) => ipcRenderer.invoke('scan:start', options),
  checkNetworkStatus: () => ipcRenderer.invoke('network:check-status'),
  openPath: (filePath: string) => ipcRenderer.invoke('shell:open-path', filePath),
  onNetworkStatusChanged: (callback: (isOnline: boolean) => void) => {
    const listener = (_event: unknown, isOnline: boolean) => callback(isOnline)
    ipcRenderer.on('network:status-changed', listener)
    return () => {
      ipcRenderer.removeListener('network:status-changed', listener)
    }
  },
})

// Exposition sécurisée du Pipeline Speech-to-Text Local (STT)
contextBridge.exposeInMainWorld('sttAPI', {
  startSession: (lang: 'ar-DZ' | 'fr-FR') => ipcRenderer.invoke('stt:startSession', lang),
  sendAudioChunk: (sessionId: string, chunk: ArrayBuffer) => ipcRenderer.send('stt:audioChunk', sessionId, chunk),
  endSession: (sessionId: string) => ipcRenderer.invoke('stt:endSession', sessionId),
  getStatus: () => ipcRenderer.invoke('stt:getStatus'),
  onPartialResult: (callback: (sessionId: string, text: string) => void) => {
    const listener = (_e: unknown, id: string, text: string) => callback(id, text)
    ipcRenderer.on('stt:partial', listener)
    return () => {
      ipcRenderer.removeListener('stt:partial', listener)
    }
  },
  onFinalResult: (callback: (sessionId: string, text: string) => void) => {
    const listener = (_e: unknown, id: string, text: string) => callback(id, text)
    ipcRenderer.on('stt:final', listener)
    return () => {
      ipcRenderer.removeListener('stt:final', listener)
    }
  },
})

export type ElectronAPI = {
  getAppVersion: () => Promise<string>
  getAvailableScanners: () => Promise<string[]>
  scanDocument: (options: ScanOptions) => Promise<ScannedResultPayload>
  checkNetworkStatus: () => Promise<boolean>
  openPath: (filePath: string) => Promise<{ success: boolean; error?: string }>
  onNetworkStatusChanged: (callback: (isOnline: boolean) => void) => () => void
}

export type SttAPI = {
  startSession: (lang: 'ar-DZ' | 'fr-FR') => Promise<{ sessionId: string; lang: 'ar-DZ' | 'fr-FR'; createdAt: number }>
  sendAudioChunk: (sessionId: string, chunk: ArrayBuffer) => void
  endSession: (sessionId: string) => Promise<{ success: boolean; transcribedText: string }>
  getStatus: () => Promise<{ ready: boolean; engine: string; availableLanguages: string[] }>
  onPartialResult: (callback: (sessionId: string, text: string) => void) => () => void
  onFinalResult: (callback: (sessionId: string, text: string) => void) => () => void
}
