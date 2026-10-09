import { memo, useState, useEffect, useMemo } from 'react'
import {
  Printer,
  Sliders,
  CheckCircle2,
  FileText,
  Scan,
  RefreshCw,
  AlertTriangle,
  FolderArchive,
  Layers,
  ShieldCheck,
} from 'lucide-react'
import { useAdminStore, ScannedDocumentItem } from '@/stores/adminStore'
import { FileTree, TreeViewElement } from '@/components/ui/magicui/file-tree'
import { BorderBeam } from '@/components/ui/magicui/border-beam'
import { Spotlight } from '@/components/ui/motion/spotlight'
import { BlurFade } from '@/components/ui/magicui/blur-fade'
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect'




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

  const driverOptions: SelectOption[] = useMemo(() => [
    { value: 'NAPS2_CLI', label: lang === 'ar' ? 'NAPS2 CLI (موصى به - أداء فائق)' : 'NAPS2 CLI (naps2.console.exe - Recommandé)', badge: 'CLI' },
    { value: 'WIA_NATIVE', label: lang === 'ar' ? 'بروتوكول Windows WIA الأصلي' : 'Windows WIA Native Script', badge: 'WIA' },
    { value: 'TWAIN_DIRECT', label: lang === 'ar' ? 'برنامج تشغيل إبسون Direct TWAIN v2.4' : 'Epson Direct TWAIN v2.4 Driver', badge: 'TWAIN' },
  ], [lang])

  const scannerOptions: SelectOption[] = useMemo(() => {
    return availableScanners.map((scn) => ({
      value: scn,
      label: scn,
      badge: scn.includes('DS-530') ? 'USB 3.0' : 'Scanner',
    }))
  }, [availableScanners])

  const dossierOptions: SelectOption[] = useMemo(() => {
    return dossiers.map((d) => ({
      value: d.id,
      label: `${d.reference} — ${lang === 'ar' && d.clientNameAr ? d.clientNameAr : d.clientName}`,
      badge: d.chamber || 'FONCIER',
    }))
  }, [dossiers, lang])

  const dpiOptions: SelectOption[] = useMemo(() => [
    { value: '150', label: '150 DPI (حجم خفيف)', badge: 'Fast' },
    { value: '300', label: '300 DPI (دقة قياسية موصى بها)', badge: 'Standard' },
    { value: '600', label: '600 DPI (دقة فائقة للأختام)', badge: 'HD' },
  ], [])

  const sourceModeOptions: SelectOption[] = useMemo(() => [
    { value: 'ADF Duplex', label: lang === 'ar' ? 'ADF Duplex (تغذية آلية للوجهين)' : 'ADF Duplex (Recto-Verso)' },
    { value: 'ADF Simplex', label: lang === 'ar' ? 'ADF Simplex (تغذية آلية لوجه واحد)' : 'ADF Simplex (Recto seul)' },
  ], [lang])

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
          <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/25 bg-[#0E1120] p-5 shadow-xl shadow-black/80 backdrop-blur-xl">
            <h4 className="flex items-center gap-2 border-b border-white/10 pb-3 font-serif text-base font-bold text-amber-300 m-0">
              <Sliders size={18} className="text-amber-400" />
              {lang === 'ar' ? 'إعدادات الماسح والمحرك' : 'Configuration du Driver USB'}
            </h4>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-200">
                {lang === 'ar' ? 'طريقة الربط بالمعدات' : "Mode d'intégration matériel"}
              </label>
              <CustomSelect
                value={driverMode}
                onChange={(val) => setDriverMode(val as any)}
                options={driverOptions}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-200">
                {lang === 'ar' ? 'الماسح الضوئي المكتشف' : 'Périphérique USB décelé'}
              </label>
              <CustomSelect
                value={selectedScanner}
                onChange={(val) => setSelectedScanner(val)}
                options={scannerOptions}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-200">
                {lang === 'ar' ? 'الملف القضائي الهدف (رقم الجدول)' : 'Dossier de destination (N° Rôle)'}
              </label>
              <CustomSelect
                value={targetCaseId}
                onChange={(val) => setTargetCaseId(val)}
                options={dossierOptions}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-200">
                  {lang === 'ar' ? 'دقة المسح (DPI)' : 'Résolution (DPI)'}
                </label>
                <CustomSelect
                  value={dpi}
                  onChange={(val) => setDpi(val)}
                  options={dpiOptions}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-200">
                  {lang === 'ar' ? 'نمط التغذية' : 'Source Mode'}
                </label>
                <CustomSelect
                  value={sourceMode}
                  onChange={(val) => setSourceMode(val)}
                  options={sourceModeOptions}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  className="w-full"
                />
              </div>
            </div>

            {/* Toggle Switches for OCR and Deskew */}
            <div className="flex flex-col gap-2.5 border-t border-white/10 pt-3.5">
              <div
                onClick={() => setOcrActive(!ocrActive)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className={ocrActive ? 'text-amber-400' : 'text-stone-500'} />
                  <span className="text-xs font-medium text-stone-200">
                    {lang === 'ar' ? 'تطبيق OCR للبحث في نص PDF' : 'OCR Recherche de texte PDF/A'}
                  </span>
                </div>
                <div
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    ocrActive ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      ocrActive ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <div
                onClick={() => setDeskewActive(!deskewActive)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <Layers size={15} className={deskewActive ? 'text-amber-400' : 'text-stone-500'} />
                  <span className="text-xs font-medium text-stone-200">
                    {lang === 'ar' ? 'تعديل انحراف الصفحات تلقائياً' : 'Redressement auto-deskew'}
                  </span>
                </div>
                <div
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    deskewActive ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      deskewActive ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isScanning}
              onClick={startScanProcess}
              type="button"
              className={`mt-2 w-full py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2.5 rounded-xl transition-all shadow-xl shadow-amber-500/20 ${
                isScanning
                  ? 'opacity-70 cursor-not-allowed bg-amber-500/50 text-stone-900'
                  : 'cursor-pointer bg-gradient-to-r from-[#B8924A] via-[#C39B57] to-[#D4B57A] text-[#120E05] hover:brightness-110 active:scale-[0.98]'
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
          <div className="relative flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-amber-500/25 bg-[#0E1120] p-6 text-center shadow-xl shadow-black/80 overflow-hidden">
            <Spotlight size={220} fill="rgba(197, 160, 89, 0.18)" />
            {isScanning && <BorderBeam size={180} duration={4} colorFrom="#c5a059" colorTo="#e8c77a" />}

            {isScanning ? (
              <div className="flex w-full flex-col items-center gap-4">
                <div className="relative flex h-24 w-44 items-center justify-center overflow-hidden rounded-xl border border-amber-500/40 bg-black/60 shadow-inner">
                  <FileText size={48} className="text-amber-400 opacity-40" />
                  <div className="absolute left-0 right-0 h-1 bg-amber-400 shadow-[0_0_12px_#c5a059] animate-pulse" />
                </div>
                <div className="font-mono text-sm font-semibold text-amber-300">{scanStatusText}</div>
                <div className="h-2 w-4/5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-gradient-to-r from-[#C39B57] to-[#E8C77A] transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                </div>
                <span className="text-xs text-stone-400 font-mono">{scanProgress}% - naps2.console.exe</span>
              </div>
            ) : scanError ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/40 bg-red-500/15 text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-100">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-100">
                  {lang === 'ar' ? 'تم مسح المستند بنجاح وحفظه بالأرشيف الرقمي!' : 'Document numérisé & archivé dans la GED !'}
                </h4>
                <p className="font-mono text-xs text-amber-300">
                  {lastScannedDoc.filename} ({lang === 'ar' ? 'رقم الجدول :' : 'Rôle N° :'} {lastScannedDoc.caseRoleNo})
                </p>
                <div className="flex items-center gap-2.5 mt-2">
                  {lastScannedDoc.filePath && (
                    <button
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8924A] via-[#C39B57] to-[#D4B57A] text-[#120E05] font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all"
                      onClick={() => {
                        if (typeof globalThis.window !== 'undefined' && globalThis.window.electronAPI?.openPath && lastScannedDoc.filePath) {
                          globalThis.window.electronAPI.openPath(lastScannedDoc.filePath)
                        }
                      }}
                    >
                      <FileText size={14} />
                      {lang === 'ar' ? 'فتح في عارض PDF (Acrobat/Foxit)' : 'Ouvrir avec le lecteur PDF par défaut'}
                    </button>
                  )}
                  <button
                    className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                    onClick={() => setLastScannedDoc(null)}
                  >
                    <RefreshCw size={14} />
                    {lang === 'ar' ? 'مسح وثيقة أخرى' : 'Numériser un autre document'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                  <Printer size={32} />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-bold text-stone-100 font-mono">
                      {selectedScanner}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {lang === 'ar' ? 'جاهز للالتقاط' : 'Prêt'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-400 max-w-sm">
                    {lang === 'ar'
                      ? 'ضع المستندات والعرائض في وحدة التغذية (ADF) واضغط على "بدء المسح الضوئي المباشر".'
                      : 'Placez les actes dans le bac ADF Epson et lancez le scan matériel.'}
                  </p>
                </div>

                {/* Telemetry pill badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-stone-300">
                    {dpi} DPI
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-stone-300">
                    {sourceMode}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    {driverMode}
                  </span>
                  {ocrActive && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      OCR PDF/A
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Document Tree & GED Explorer */}
          <div className="rounded-2xl border border-amber-500/25 bg-[#0E1120] p-5 shadow-xl shadow-black/80">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h4 className="flex items-center gap-2 font-serif text-base font-bold text-amber-300 m-0">
                <FolderArchive size={18} className="text-amber-400" />
                {lang === 'ar' ? 'شجرة أجهزة الأرشيف الرقمي (GED FileTree)' : 'Explorateur Arborescent GED (FileTree)'}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-stone-300">
                {scannedVault.length} {lang === 'ar' ? 'وثيقة مؤرشفة' : 'docs'}
              </span>
            </div>

            <FileTree elements={treeData} />
          </div>
        </BlurFade>
      </div>
    </div>
  )
})

AdminEpsonScanModule.displayName = 'AdminEpsonScanModule'
