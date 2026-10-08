'use client'

import { memo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, CheckCircle2, ShieldCheck, RefreshCw, X, Cpu, Lock } from 'lucide-react'

interface EpsonScanModalProps {
  isOpen: boolean
  onClose: () => void
  dossierRef?: string
  clientName?: string
  isAr?: boolean
}

type ScanStage = 'idle' | 'connecting' | 'scanning' | 'ocr' | 'encrypting' | 'complete'

export const EpsonScanModal = memo(({ isOpen, onClose, dossierRef = 'DOS-2026-084', clientName = 'Slimani / Sonatrach', isAr = false }: EpsonScanModalProps) => {
  const [stage, setStage] = useState<ScanStage>('idle')
  const [progress, setProgress] = useState(0)
  const [scannedText, setScannedText] = useState('')
  const [resolution, setResolution] = useState<'300' | '600'>('300')
  const [mode, setMode] = useState<'adf_duplex' | 'flatbed'>('adf_duplex')

  useEffect(() => {
    if (!isOpen) {
      setStage('idle')
      setProgress(0)
      setScannedText('')
    }
  }, [isOpen])

  const handleStartScan = () => {
    setStage('connecting')
    setProgress(15)

    setTimeout(() => {
      setStage('scanning')
      setProgress(45)
    }, 1200)

    setTimeout(() => {
      setStage('ocr')
      setProgress(75)
      setScannedText(
        isAr
          ? 'المملكة الجزائرية / عريضة افتتاح دعوى عقارية - محكمة بئر خادم\nالمدعي: شركي الطيب / المدعى عليه: شركة الإعمار\nالموضوع: المطالبة بتثبيت الملكية العقارية وإخلاء الأماكن...'
          : 'REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE\nTribunal de Bir Khadem - Chambre Foncière\nRequête introductive d\'instance en matière immobilière.\nDemandeur: Cherki et Cie / Défendeur: Etablissement Public...'
      )
    }, 3200)

    setTimeout(() => {
      setStage('encrypting')
      setProgress(95)
    }, 4800)

    setTimeout(() => {
      setStage('complete')
      setProgress(100)
    }, 6000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(6, 6, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '1rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '680px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 32px var(--gold-glow)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-elevated)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--gold-glow)',
                  border: '1px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-400)',
                }}
              >
                <Scan size={20} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>
                  {isAr ? 'بروتوكول Numérisation Directe (Epson TWAIN/WIA)' : 'Numérisation Directe Epson Scan (ADF 300 DPI)'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                  AGENT LOCAL: ON-LINE (WebSocket ws://127.0.0.1:28164) &bull; {dossierRef}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Context bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>{isAr ? 'الملف المستهدف' : 'Dossier Cible'}</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--gold-400)' }}>{dossierRef} ({clientName})</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>{isAr ? 'الماسح الضوئي' : 'Scanner Connecté'}</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Epson WorkForce DS-530 II (USB 3.0)</strong>
              </div>
            </div>

            {/* Config controls */}
            {stage === 'idle' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Mode Alimentation</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="adf_duplex">ADF Chargeur Auto (Recto-Verso)</option>
                    <option value="flatbed">Vitre Plate (Flatbed 600 DPI)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Résolution Numérisation</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="300">300 DPI (Recommandé GED & OCR)</option>
                    <option value="600">600 DPI (Haute Définition Pièces Anciennes)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active scan simulation area */}
            {stage !== 'idle' && (
              <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                {/* Progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.375rem', color: 'var(--text-muted)' }}>
                    <span>
                      {stage === 'connecting' && '⚡ Initialisation du pilote Epson TWAIN/WIA...'}
                      {stage === 'scanning' && '📄 Acquisition matérielle ADF 300 DPI en cours (Auto-deskew)...'}
                      {stage === 'ocr' && '🧠 Traitement OCR Bilingue (Moteur Arabe/Français)...'}
                      {stage === 'encrypting' && '🔒 Chiffrement de la pièce (AES-256) & Indexation GED...'}
                      {stage === 'complete' && 'Numérisation & Classement GED terminés avec succès ✓'}
                    </span>
                    <strong style={{ color: 'var(--gold-400)' }}>{progress}%</strong>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #b8924a, #e8c77a)' }}
                    />
                  </div>
                </div>

                {/* Laser beam animation during scan */}
                {stage === 'scanning' && (
                  <div style={{ position: 'relative', height: '80px', background: '#0a0a14', borderRadius: '6px', overflow: 'hidden', border: '1px dashed var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', zIndex: 1 }}>Acquisition du document physique via chargeur Epson...</span>
                  </div>
                )}

                {/* Scanned OCR text preview */}
                {(stage === 'ocr' || stage === 'encrypting' || stage === 'complete') && (
                  <div style={{ background: '#060610', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#a0ecb1', maxHeight: '120px', overflowY: 'auto' }}>
                    <div style={{ color: 'var(--gold-400)', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>[TEXTE EXTRAIT PAR OCR - ARABE & FRANÇAIS]</div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{scannedText}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Status indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Cpu size={14} style={{ color: 'var(--gold-500)' }} />
                <span>Auto-Deskew: ON</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Lock size={14} style={{ color: 'var(--gold-500)' }} />
                <span>Chiffrement: AES-256</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--gold-500)' }} />
                <span>MinIO GED: Prêt</span>
              </div>
            </div>

          </div>

          {/* Footer actions */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button className="btn-outline" onClick={onClose} style={{ fontSize: '0.85rem' }}>
              {isAr ? 'إلغاء' : 'Annuler'}
            </button>

            {stage === 'idle' ? (
              <button className="btn-primary" onClick={handleStartScan} style={{ fontSize: '0.85rem' }}>
                <Scan size={16} />
                {isAr ? 'بدء المسح الضوئي (Epson)' : 'Lancer la numérisation (Epson)'}
              </button>
            ) : stage === 'complete' ? (
              <button className="btn-primary" onClick={onClose} style={{ fontSize: '0.85rem', background: '#22c55e', color: '#fff' }}>
                <CheckCircle2 size={16} />
                {isAr ? 'تأكيد الحفظ في الأرشيف الرقمي' : 'Valider & Classer dans la GED'}
              </button>
            ) : (
              <button className="btn-primary" disabled style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Traitement en cours...
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
})

EpsonScanModal.displayName = 'EpsonScanModal'
