import { app, BrowserWindow, ipcMain, shell, session } from 'electron'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { exec } from 'node:child_process'
import * as https from 'node:https'
import { sttManager } from './sttEngine'

// Garder une référence globale de l'objet window pour éviter que la fenêtre soit fermée par le garbage collector.
let mainWindow: BrowserWindow | null = null
let isNetworkOnline = true

const isDev = !app.isPackaged

if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
}

/**
 * Effectue un ping réseau léger vers Supabase / Google pour vérifier la connectivité réelle
 */
function checkNetworkConnectivity(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.get('https://www.google.com', { timeout: 3000 }, (res) => {
      resolve(res.statusCode === 200 || (res.statusCode !== undefined && res.statusCode < 400))
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Cabinet Slimani',
    autoHideMenuBar: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#060610', // --bg-void
    show: true,
  })

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Electron] Interface chargée avec succès.')
    mainWindow?.show()
    mainWindow?.focus()
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron] Échec chargement (${errorCode}) sur ${validatedURL}: ${errorDescription}`)
  })

  // S'assurer que les liens externes s'ouvrent dans le navigateur par défaut
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_webContents: any, _permission: any, callback: (grant: boolean) => void) => {
    callback(true)
  })
  session.defaultSession.setPermissionCheckHandler(() => true)

  createWindow()

  // Boucle de vérification de connectivité réseau toutes les 10 secondes
  setInterval(async () => {
    const online = await checkNetworkConnectivity()
    if (online !== isNetworkOnline) {
      isNetworkOnline = online
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('network:status-changed', isNetworkOnline)
      }
    }
  }, 10000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers pour la communication processus principal <-> rendu
ipcMain.handle('get-app-version', () => app.getVersion())

ipcMain.handle('network:check-status', async () => {
  isNetworkOnline = await checkNetworkConnectivity()
  return isNetworkOnline
})

const SAFE_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.txt', '.csv', '.rtf'])

ipcMain.handle('shell:open-path', async (_event, filePath: string) => {
  if (!filePath || typeof filePath !== 'string') {
    return { success: false, error: 'Chemin de fichier invalide.' }
  }

  const ext = path.extname(filePath).toLowerCase()
  if (!SAFE_DOCUMENT_EXTENSIONS.has(ext)) {
    return {
      success: false,
      error: `Sécurité : L'extension "${ext}" n'est pas autorisée. Seuls les documents et images de pièces (.pdf, .docx, .jpg...) peuvent être ouverts.`,
    }
  }

  const resolvedPath = path.resolve(filePath)
  if (!fs.existsSync(resolvedPath)) {
    return { success: false, error: 'Fichier introuvable sur le disque.' }
  }

  const error = await shell.openPath(resolvedPath)
  return { success: !error, error }
})

export interface ScanRequestOptions {
  driverMode: 'NAPS2_CLI' | 'WIA_NATIVE' | 'TWAIN_DIRECT'
  scannerName: string
  dpi: string
  sourceMode: string
  ocrActive: boolean
  deskewActive: boolean
  caseRoleNo?: string
  clientName?: string
}

ipcMain.handle('scan:get-scanners', async () => {
  return new Promise((resolve) => {
    // Détection en temps réel des Scanners WIA/TWAIN (Image) & Imprimantes Multifonctions (Canon, Epson, HP, Brother, Fujitsu...)
    const psCmd = `powershell -Command "$scanners = Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'Image' -or $_.Name -like '*Scanner*' -or $_.Name -like '*Epson*' -or $_.Name -like '*Canon*' -or $_.Name -like '*Fujitsu*' -or $_.Name -like '*HP*' -or $_.Name -like '*Brother*' } | Select-Object -ExpandProperty Name; $printers = Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name; @($scanners; $printers) | Where-Object { $_ -and $_ -notlike '*Microsoft*' -and $_ -notlike '*AnyDesk*' -and $_ -notlike '*OneNote*' } | Select-Object -Unique"`

    exec(psCmd, (err, stdout) => {
      if (err || !stdout.trim()) {
        resolve([
          'Epson WorkForce DS-530 II (ADF Duplex USB)',
          'Canon ImageFORMULA DR-C225',
          'Scanner / Imprimante WIA Générique'
        ])
      } else {
        const detected = stdout.split('\r\n').map(s => s.trim()).filter(Boolean)
        resolve(detected.length ? detected : ['Epson WorkForce DS-530 II (ADF Duplex USB)'])
      }
    })
  })
})
ipcMain.handle('scan:start', async (_event, options: ScanRequestOptions) => {
  const scansDir = path.join(app.getPath('userData'), 'scans')
  if (!fs.existsSync(scansDir)) fs.mkdirSync(scansDir, { recursive: true })

  const timestamp = Date.now()
  const outputFileName = `Scan_Piece_${timestamp.toString().slice(-6)}.pdf`
  const outputPath = path.join(scansDir, outputFileName)

  const naps2ExePath = app.isPackaged
    ? path.join(process.resourcesPath, 'extraResources', 'naps2.console.exe')
    : 'naps2.console.exe'

  // Mappe le choix de l'interface vers un driver NAPS2 réel.
  // --device requiert --driver (doc NAPS2) ; NAPS2_CLI n'est pas un driver,
  // on le fait pointer vers WIA, le plus universel sous Windows.
  const driverFlag =
    options.driverMode === 'TWAIN_DIRECT' ? 'twain' : 'wia'

  const naps2Args = [
    `--output "${outputPath}"`,
    `--driver ${driverFlag}`,
    `--device "${options.scannerName}"`, // correspondance partielle insensible à la casse, suffisant
    `--dpi ${options.dpi || 300}`,
    options.sourceMode.includes('Duplex') ? '--duplex' : '',
    options.ocrActive ? '--enableocr' : '',
    options.deskewActive ? '--deskew' : '',
  ].filter(Boolean).join(' ')

  return new Promise((resolve) => {
    exec(`"${naps2ExePath}" ${naps2Args}`, { timeout: 15000 }, (err, stdout, stderr) => {
      if (!err && fs.existsSync(outputPath)) {
        const scannedItem = {
          id: `scan-${timestamp}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          filename: outputFileName,
          filePath: outputPath,
          caseRoleNo: options.caseRoleNo || '',
          clientName: options.clientName || '',
          source: `NAPS2 (${driverFlag}) — ${options.scannerName}`,
        }
        return resolve({ success: true, item: scannedItem })
      }

      // Échec réel, remonté tel quel — plus de PDF factice qui se fait passer pour un scan.
      resolve({
        success: false,
        error: err
          ? `NAPS2 a échoué : ${stderr || err.message}`
          : "NAPS2 s'est terminé sans erreur mais aucun fichier n'a été produit.",
      })
    })
  })
})

// IPC Handlers pour le pipeline Speech-to-Text Local (STT)
ipcMain.handle('stt:getStatus', () => sttManager.getStatus())

ipcMain.handle('stt:startSession', (_event, lang: 'ar-DZ' | 'fr-FR') => {
  return sttManager.startSession(lang)
})

ipcMain.on('stt:audioChunk', (_event, sessionId: string, chunk: ArrayBuffer) => {
  sttManager.processAudioChunk(mainWindow, sessionId, chunk)
})

ipcMain.handle('stt:endSession', (_event, sessionId: string) => {
  return sttManager.endSession(mainWindow, sessionId)
})


