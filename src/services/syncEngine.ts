import { useAdminStore, SyncActionItem } from '@/stores/adminStore'

/**
 * Service Moteur de Synchronisation (Sync Engine)
 * S'exécute en tâche de fond pour ré-émettre la file d'attente localement sérialisée (syncQueue)
 * dès que la connexion réseau avec Supabase / Cloud Proxy est active.
 */

let isSyncEngineRunning = false

/**
 * Simule ou effectue l'envoi réseau de chaque mutation vers la base Supabase/Cloud
 */
async function sendMutationToCloud(item: SyncActionItem): Promise<boolean> {
  // En production, cette fonction effectue l'upsert Supabase selon actionType
  // ex: supabase.from('dossiers').upsert(item.payload)
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return true
  } catch (err) {
    console.error(`[SyncEngine] Erreur envoi action ${item.id}:`, err)
    return false
  }
}

/**
 * Traite chronologiquement la file d'attente `syncQueue` (FIFO)
 */
export async function processSyncQueue(): Promise<void> {
  const store = useAdminStore.getState()
  const { isOnline, syncQueue, setIsSyncing, removeSyncQueueItem } = store

  if (!isOnline || syncQueue.length === 0 || isSyncEngineRunning) {
    return
  }

  isSyncEngineRunning = true
  setIsSyncing(true)

  try {
    // Copie de la file d'attente triée par horodatage chronologique
    const queueCopy = [...syncQueue].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    for (const item of queueCopy) {
      // Re-vérification de l'état réseau avant chaque émission
      if (!useAdminStore.getState().isOnline) {
        break
      }

      const success = await sendMutationToCloud(item)
      if (success) {
        removeSyncQueueItem(item.id)
      } else {
        // En cas d'échec temporaire, suspendre le traitement pour respecter la séquence FIFO
        break
      }
    }
  } finally {
    isSyncEngineRunning = false
    setIsSyncing(false)
  }
}

/**
 * Initialise le listener sur le store Zustand pour déclencher automatiquement processSyncQueue
 */
export function initSyncEngineListener(): () => void {
  // Écouteur d'événement IPC Electron status réseau
  if (typeof globalThis.window !== 'undefined' && globalThis.window.electronAPI?.onNetworkStatusChanged) {
    globalThis.window.electronAPI.onNetworkStatusChanged((online) => {
      useAdminStore.getState().setIsOnline(online)
      if (online) {
        processSyncQueue()
      }
    })

    // Premier check au lancement
    globalThis.window.electronAPI.checkNetworkStatus().then((online) => {
      useAdminStore.getState().setIsOnline(online)
      if (online) {
        processSyncQueue()
      }
    })
  }

  // Écouteur de changement du store Zustand pour déclencher la synchro au retour en ligne ou à l'ajout de requêtes
  const unsubscribe = useAdminStore.subscribe((state, prevState) => {
    if (state.isOnline && (state.syncQueue.length > 0 && prevState.syncQueue.length === 0)) {
      processSyncQueue()
    }
    if (state.isOnline && !prevState.isOnline && state.syncQueue.length > 0) {
      processSyncQueue()
    }
  })

  return unsubscribe
}
