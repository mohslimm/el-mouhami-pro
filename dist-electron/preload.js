"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Exposition sécurisée d'une API Electron pour le processus de rendu (React)
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    getAvailableScanners: () => electron_1.ipcRenderer.invoke('scan:get-scanners'),
    scanDocument: (options) => electron_1.ipcRenderer.invoke('scan:start', options),
    checkNetworkStatus: () => electron_1.ipcRenderer.invoke('network:check-status'),
    openPath: (filePath) => electron_1.ipcRenderer.invoke('shell:open-path', filePath),
    onNetworkStatusChanged: (callback) => {
        const listener = (_event, isOnline) => callback(isOnline);
        electron_1.ipcRenderer.on('network:status-changed', listener);
        return () => {
            electron_1.ipcRenderer.removeListener('network:status-changed', listener);
        };
    },
});
// Exposition sécurisée du Pipeline Speech-to-Text Local (STT)
electron_1.contextBridge.exposeInMainWorld('sttAPI', {
    startSession: (lang) => electron_1.ipcRenderer.invoke('stt:startSession', lang),
    sendAudioChunk: (sessionId, chunk) => electron_1.ipcRenderer.send('stt:audioChunk', sessionId, chunk),
    endSession: (sessionId) => electron_1.ipcRenderer.invoke('stt:endSession', sessionId),
    getStatus: () => electron_1.ipcRenderer.invoke('stt:getStatus'),
    onPartialResult: (callback) => {
        const listener = (_e, id, text) => callback(id, text);
        electron_1.ipcRenderer.on('stt:partial', listener);
        return () => {
            electron_1.ipcRenderer.removeListener('stt:partial', listener);
        };
    },
    onFinalResult: (callback) => {
        const listener = (_e, id, text) => callback(id, text);
        electron_1.ipcRenderer.on('stt:final', listener);
        return () => {
            electron_1.ipcRenderer.removeListener('stt:final', listener);
        };
    },
});
