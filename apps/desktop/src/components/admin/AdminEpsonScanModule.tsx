import { memo, useState, useEffect } from 'react'
import {
  Printer,
  Sliders,
  CheckCircle2,
  FileText,
  Scan,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { useAdminStore, ScannedDocumentItem } from '@/stores/adminStore'
import { FileTree, TreeViewElement } from '@/components/ui/magicui/file-tree'
import { BorderBeam } from '@/components/ui/magicui/border-beam'
import { Spotlight } from '@/components/ui/motion/spotlight'
import { BlurFade } from '@/components/ui/magicui/blur-fade'




export const AdminEpsonScanModule = memo(() => {
  const { dossiers, scannedVault, addScannedDoc, lang } = useAdminStore()

  // Driver Bridge States
  const [driverMode, setDriverMode] = useState<'NAPS2_CLI' | 'WIA_NATIVE' | 'TWAIN_DIRECT'>('NAPS2_CLI')
  const [availableScanners, setAvailableScanners] = useState<string[]>([
    'Epson WorkForce DS-530 II (ADF Duplex)',
    'Canon ImageFORMULA DR-C225',
  ])
  const [selectedScanner, setSelectedScanner] = useState('Epson WorkForce DS-530 II (ADF Duplex)')
  const [targetCaseId, setTargetCaseId] = useState(dossiers[0]?.id || '')
  const [dpi, setDpi] = useState('300')
  const [sourceMode, setSourceMode] = useState('ADF Duplex')

  // Scanners Toggles
  const [ocrActive, setOcrActive] = useState(true)
  const [deskewActive, setDeskewActive] = useState(true)

  // Execution states
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatusText, setScanStatusText] = useState('')
  const [lastScannedDoc, setLastScannedDoc] = useState<ScannedDocumentItem | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
    if (window.electronAPI?.getAvailableScanners) {
      window.electronAPI.getAvailableScanners().then((scanners) => {
        if (scanners && scanners.length > 0) {
          setAvailableScanners(scanners)
          setSelectedScanner(scanners[0] ?? 'Epson WorkForce DS-530 II (ADF Duplex)')
        }
      }).catch(() => { })
    }
  }, [])

  const startScanProcess = async () => {
    if (isScanning) return
    setIsScanning(true)
    setScanProgress(10)
    setScanError(null)
    setLastScannedDoc(null)

    const targetCase = dossiers.find((d) => d.id === targetCaseId) || dossiers[0]

    if (driverMode === 'NAPS2_CLI') {
      setScanStatusText(
        lang === 'ar'
          ? 'تشغيل أداة NAPS2 CLI (naps2.console.exe)...'
          : 'Exécution du pont CLI NAPS2 (naps2.console.exe)...'
      )
    } else {
      setScanStatusText(
        lang === 'ar'
          ? 'تهيئة محرك إبسون TWAIN DS-530...'
          : 'Initialisation du moteur TWAIN Epson DS-530...'
      )
    }

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev < 90) return prev + 20
        return prev
      })
    }, 300)

    try {
      if (window.electronAPI?.scanDocument) {
        // Apport IPC Electron réel
        const res = await window.electronAPI.scanDocument({
          driverMode,
          scannerName: selectedScanner,
          dpi,
          sourceMode,
          ocrActive,
          deskewActive,
          caseRoleNo: targetCase?.reference,
          clientName: targetCase?.clientNameAr || targetCase?.clientName,
        })
        clearInterval(interval)
        setScanProgress(100)
        setIsScanning(false)

        if (res?.success && res.item) {
          addScannedDoc(res.item)
          setLastScannedDoc(res.item)
        } else {
          setScanError(res?.error || 'Échec de la numérisation, cause inconnue.')
        }
      } else {
        // Mode repli navigateur
        setTimeout(() => {
          clearInterval(interval)
          setScanProgress(100)
          setIsScanning(false)
          const newDoc: ScannedDocumentItem = {
            id: `scan-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            filename: `Scan_Epson_Piece_${Date.now().toString().slice(-4)}.pdf`,
            caseRoleNo: targetCase?.reference || '24/00412',
            clientName: targetCase?.clientNameAr || targetCase?.clientName || 'الموكل',
            source: driverMode === 'NAPS2_CLI' ? 'NAPS2 CLI Bridge (DS-530 II)' : 'Epson TWAIN DS-530 II',
          }
          addScannedDoc(newDoc)
          setLastScannedDoc(newDoc)
        }, 1200)
      }
    } catch (e) {
      clearInterval(interval)
      setIsScanning(false)
      setScanError(e instanceof Error ? e.message : 'Erreur inattendue pendant la numérisation.')
    }
  }

  // Construct FileTree Structure
  const treeData: TreeViewElement[] = [
    {
      id: 'root-ged',
      name: lang === 'ar' ? 'الأرشيف الرقمي للمستندات (GED)' : 'Coffre-Fort GED Cabinet',
      type: 'folder',
      children: [
        {
          id: 'cour-supreme',
          name: lang === 'ar' ? 'المحكمة العليا (Cour Suprême)' : 'Cour Suprême',
          type: 'folder',
          children: scannedVault
            .filter((_, idx) => idx % 2 === 0)
            .map((doc) => ({
              id: doc.id,
              name: doc.filename,
              type: 'file' as const,
              size: '1.4 MB',
              date: doc.timestamp,
              filePath: doc.filePath,
            })),
        },
        {
          id: 'cour-alger',
          name: lang === 'ar' ? 'مجلس قضاء الجزائر (Cour d\'Alger)' : "Cour d'Alger",
          type: 'folder',
          children: scannedVault
            .filter((_, idx) => idx % 2 !== 0)
            .map((doc) => ({
              id: doc.id,
              name: doc.filename,
              type: 'file' as const,
              size: '2.8 MB',
              date: doc.timestamp,
              filePath: doc.filePath,
            })),
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <BlurFade delay={0.05}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg">
          <div>
            <h2 className="flex items-center gap-3 font-serif text-2xl font-bold text-[var(--text-primary)]">
              <Printer size={26} className="text-[var(--gold-400)]" />
              {lang === 'ar'
                ? 'مركز الماسح الضوئي والربط بالمعدات (NAPS2 CLI & Epson TWAIN)'
                : 'Hub de Numérisation Matérielle USB (NAPS2 CLI & Epson TWAIN)'}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {lang === 'ar'
                ? 'التحكم المباشر في الماسح الضوئي وإلتقاط المستندات مع الحفظ الفوري بالأرشيف GED'
                : 'Contrôle direct du scanner matériel via CLI NAPS2 & WIA pour un archivage GED instantané.'}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--border-gold)] bg-[var(--gold-glow)] px-3 py-1 text-xs font-semibold text-[var(--gold-400)]">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {lang === 'ar' ? 'جسر NAPS2 CLI نشط' : 'NAPS2 CLI Bridge OK'}
          </div>
        </div>
      </BlurFade>

      {/* Main Split View: Control Panel + Live Scanning Monitor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Scanner Control Panel */}
        <BlurFade delay={0.1} className="lg:col-span-4">
          <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg">
            <h4 className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5 font-serif text-base font-bold text-[var(--gold-400)]">
              <Sliders size={18} />
              {lang === 'ar' ? 'إعدادات الماسح والمحرك' : 'Configuration du Driver USB'}
            </h4>

            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">
                {lang === 'ar' ? 'طريقة الربط بالمعدات' : "Mode d'intégration matériel"}
              </label>
              <select
                className="input w-full text-xs"
                value={driverMode}
                onChange={(e) => setDriverMode(e.target.value as any)}
              >
                <option value="NAPS2_CLI">
                  {lang === 'ar' ? 'NAPS2 CLI (موصى به - naps2.console.exe)' : 'NAPS2 CLI (naps2.console.exe - Recommandé)'}
                </option>
                <option value="WIA_NATIVE">
                  {lang === 'ar' ? 'سكربت Windows WIA الأصلي' : 'Windows WIA Native Script'}
                </option>
                <option value="TWAIN_DIRECT">
                  {lang === 'ar' ? 'برنامج تشغيل إبسون Direct TWAIN v2.4' : 'Epson Direct TWAIN v2.4 Driver'}
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">
                {lang === 'ar' ? 'الماسح الضوئي المكتشف' : 'Périphérique USB décelé'}
              </label>
              <select
                className="input w-full text-xs"
                value={selectedScanner}
                onChange={(e) => setSelectedScanner(e.target.value)}
              >
                {availableScanners.map((scn) => (
                  <option key={scn} value={scn}>
                    {scn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">
                {lang === 'ar' ? 'الملف القضائي الهدف (رقم الجدول)' : 'Dossier de destination (N° Rôle)'}
              </label>
              <select
                className="input w-full text-xs"
                value={targetCaseId}
                onChange={(e) => setTargetCaseId(e.target.value)}
              >
                {dossiers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.reference} - {lang === 'ar' && d.clientNameAr ? d.clientNameAr : d.clientName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[0.7rem] text-[var(--text-muted)]">
                  {lang === 'ar' ? 'دقة المسح (DPI)' : 'Résolution (DPI)'}
                </label>
                <select className="input w-full text-xs" value={dpi} onChange={(e) => setDpi(e.target.value)}>
                  <option value="150">150 DPI</option>
                  <option value="300">300 DPI</option>
                  <option value="600">600 DPI</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[0.7rem] text-[var(--text-muted)]">
                  {lang === 'ar' ? 'نمط التغذية' : 'Source Mode'}
                </label>
                <select className="input w-full text-xs" value={sourceMode} onChange={(e) => setSourceMode(e.target.value)}>
                  <option value="ADF Duplex">ADF Duplex</option>
                  <option value="ADF Simplex">ADF Simplex</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3">
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
                <input type="checkbox" checked={ocrActive} onChange={(e) => setOcrActive(e.target.checked)} />
                <span>{lang === 'ar' ? 'تطبيق OCR للبحث في نص PDF' : 'OCR Recherche de texte PDF/A'}</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
                <input type="checkbox" checked={deskewActive} onChange={(e) => setDeskewActive(e.target.checked)} />
                <span>{lang === 'ar' ? 'تعديل انحراف الصفحات تلقائياً' : 'Redressement auto-deskew'}</span>
              </label>
            </div>

            <button
              disabled={isScanning}
              onClick={startScanProcess}
              type="button"
              className={`btn-primary mt-3 w-full py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 rounded-xl shadow-lg transition-all ${isScanning ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                }`}
            >
              <Scan size={18} className={isScanning ? 'animate-spin' : ''} />
              <span>
                {isScanning
                  ? lang === 'ar'
                    ? 'جاري المسح الضوئي...'
                    : 'Numérisation en cours...'
                  : lang === 'ar'
                    ? 'بدء المسح الضوئي المباشر (NAPS2)'
                    : 'Lancer le Scan USB (NAPS2 CLI)'}
              </span>
            </button>
          </div>
        </BlurFade>

        {/* Live Scanning Screen & History Vault */}
        <BlurFade delay={0.15} className="flex flex-col gap-6 lg:col-span-8">
          {/* Live Animation Box with BorderBeam */}
          <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-[var(--border-gold)] bg-[var(--bg-elevated)] p-6 text-center shadow-xl overflow-hidden">
            <Spotlight size={220} fill="rgba(197, 160, 89, 0.18)" />
            {isScanning && <BorderBeam size={180} duration={4} colorFrom="#c5a059" colorTo="#e8c77a" />}

            {isScanning ? (
              <div className="flex w-full flex-col items-center gap-4">
                <div className="relative flex h-24 w-44 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-gold)] bg-black/60 shadow-inner">
                  <FileText size={48} className="text-[var(--gold-400)] opacity-40" />
                  <div className="absolute left-0 right-0 h-1 bg-[var(--gold-400)] shadow-[0_0_12px_#c5a059] animate-pulse" />
                </div>
                <div className="font-mono text-sm font-semibold text-[var(--gold-400)]">{scanStatusText}</div>
                <div className="h-2 w-4/5 overflow-hidden rounded-full bg-[var(--bg-surface)]">
                  <div className="h-full bg-[var(--gold-500)] transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                </div>
                <span className="text-xs text-[var(--text-muted)]">{scanProgress}% - naps2.console.exe</span>
              </div>
            ) : scanError ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/40 bg-red-500/15 text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  {lang === 'ar' ? 'فشل المسح الضوئي' : 'Échec de la numérisation'}
                </h4>
                <p className="max-w-md text-xs text-red-300">{scanError}</p>
                <button className="btn-outline text-xs mt-2" onClick={() => setScanError(null)}>
                  <RefreshCw size={14} />
                  {lang === 'ar' ? 'إعادة المحاولة' : 'Réessayer'}
                </button>
              </div>
            ) : lastScannedDoc ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-500/40 bg-green-500/15 text-green-400">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  {lang === 'ar' ? 'تم مسح المستند بنجاح وحفظه بالأرشيف الرقمي!' : 'Document numérisé & archivé dans la GED !'}
                </h4>
                <p className="font-mono text-xs text-[var(--gold-400)]">
                  {lastScannedDoc.filename} ({lang === 'ar' ? 'رقم الجدول :' : 'Rôle N° :'} {lastScannedDoc.caseRoleNo})
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {lastScannedDoc.filePath && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => {
                        if (typeof globalThis.window !== 'undefined' && globalThis.window.electronAPI?.openPath && lastScannedDoc.filePath) {
                          globalThis.window.electronAPI.openPath(lastScannedDoc.filePath)
                        }
                      }}
                    >
                      <FileText size={14} />
                      {lang === 'ar' ? 'فتح في عارض PDF المستقل (Acrobat/Foxit)' : 'Ouvrir avec le lecteur PDF par défaut'}
                    </button>
                  )}
                  <button className="btn-outline text-xs" onClick={() => setLastScannedDoc(null)}>
                    <RefreshCw size={14} />
                    {lang === 'ar' ? 'مسح وثيقة أخرى' : 'Numériser un autre document'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                <Printer size={46} className="text-[var(--border-gold)]" />
                <p className="text-xs">
                  {lang === 'ar'
                    ? 'ضع الوثائق في الماسح الضوئي واضغط على "بدء المسح الضوئي المباشر".'
                    : 'Placez les actes dans le bac ADF Epson/Canon et lancez le scan CLI.'}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Document Tree & GED Explorer */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg">
            <h4 className="mb-3 font-serif text-base font-bold text-[var(--gold-400)]">
              {lang === 'ar' ? 'شجرة أجهزة الأرشيف الرقمي (GED FileTree)' : 'Explorateur Arborescent GED (FileTree)'}
            </h4>

            <FileTree elements={treeData} />
          </div>
        </BlurFade>
      </div>
    </div>
  )
})

AdminEpsonScanModule.displayName = 'AdminEpsonScanModule'
