'use client'

import { memo, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Printer, Download, X, Edit3 } from 'lucide-react'

interface ArabicQuittanceModalProps {
  isOpen: boolean
  onClose: () => void
  clientName?: string
  dossierRef?: string
  amountDzd?: number
  motif?: string
}

export const ArabicQuittanceModal = memo(({
  isOpen,
  onClose,
  clientName = 'بن علي عبد القادر',
  dossierRef = 'DOS-2026/084',
  amountDzd = 45000,
  motif = 'أتعاب المرافعة والاستشارة القانونية في القضية العقارية أمام محكمة بئر خادم',
}: ArabicQuittanceModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null)

  const [editableClient, setEditableClient] = useState(clientName)
  const [editableRef, setEditableRef] = useState(dossierRef)
  const [editableAmount, setEditableAmount] = useState<number>(amountDzd)
  const [editableMotif, setEditableMotif] = useState(motif)
  const [isEditing, setIsEditing] = useState(false)
  const [receiptNo] = useState(() => `2026/Q-${Math.floor(1000 + Math.random() * 9000)}`)

  useEffect(() => {
    setEditableClient(clientName)
    setEditableRef(dossierRef)
    setEditableAmount(amountDzd)
    setEditableMotif(motif)
  }, [clientName, dossierRef, amountDzd, motif])

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

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
          overflowY: 'auto', // Enables full modal scrolling
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '740px',
            background: 'var(--bg-surface, #1e1e2d)',
            border: '1px solid var(--border-gold, #b8924a)',
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            margin: 'auto', // Centers nicely when scrolling
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle, #2a2a3c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-elevated, #252538)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
              <h3 style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: '1.1rem', color: '#fff', margin: 0, direction: 'rtl' }}>
                تحرير ومعاينة وصل سداد الأتعاب (النموذج الرسمي للمحامي)
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid #b8924a', color: '#b8924a', borderRadius: '6px', cursor: 'pointer' }}
              >
                <Edit3 size={14} />
                {isEditing ? 'إخفاء التعديل' : 'تعديل البيانات'}
              </button>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div style={{ padding: '1.25rem', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Manual Form Editing Controls */}
            {isEditing && (
              <div
                dir="rtl"
                style={{
                  background: '#252538',
                  border: '1px solid #b8924a',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2b764', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Edit3 size={15} />
                  <span>تعبئة وتعديل بيانات الوصل يدويًا :</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '0.25rem' }}>اسم الموكل / الشركة :</label>
                    <input
                      type="text"
                      value={editableClient}
                      onChange={(e) => setEditableClient(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.75rem', background: '#1a1a24', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '0.25rem' }}>رقم القضية / الجدول :</label>
                    <input
                      type="text"
                      value={editableRef}
                      onChange={(e) => setEditableRef(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.75rem', fontFamily: 'monospace', background: '#1a1a24', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '0.25rem' }}>المبلغ المستلم (د.ج) :</label>
                    <input
                      type="number"
                      value={editableAmount}
                      onChange={(e) => setEditableAmount(Number(e.target.value) || 0)}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.75rem', fontWeight: 700, color: '#22c55e', background: '#1a1a24', border: '1px solid #444', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '0.25rem' }}>مقابل الخدمة القانونية :</label>
                    <input
                      type="text"
                      value={editableMotif}
                      onChange={(e) => setEditableMotif(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.75rem', background: '#1a1a24', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Printable Receipt Area */}
            <div
              ref={receiptRef}
              dir="rtl"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                background: '#fff',
                borderRadius: '12px',
                border: '2px solid #b8924a',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              {/* Locked Aspect Ratio Box matching Photoshop canvas proportions */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1.35', overflow: 'hidden' }}>

                {/* Receipt Image Document Base */}
                <img
                  src="/wasl.png"
                  alt="وصل سداد أتعاب قضائية"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/wasl.png'
                  }}
                />

                {/* Precise Data Overlay using Proportional % Coordinates on wasl.png */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

                  {/* 1. Receipt No */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '45.8%',
                      right: '35.5%',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1a1200',
                      fontFamily: 'monospace',
                    }}
                  >
                    {receiptNo}
                  </div>

                  {/* 2. Date */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '45.8%',
                      right: '70.0%',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1a1200',
                    }}
                  >
                    {new Date().toLocaleDateString('ar-DZ')}
                  </div>

                  {/* 3. Client Name ("استلمت من السيد(ة):") */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50.5%',
                      right: '31.5%',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#1a1200',
                    }}
                  >
                    {editableClient || '—'}
                  </div>

                  {/* 4. Dossier Ref ("رقم الملف / القضية:") */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '55.2%',
                      right: '31.5%',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#b8924a',
                      fontFamily: 'monospace',
                    }}
                  >
                    {editableRef || '—'}
                  </div>

                  {/* 5. Amount DZD ("المبلغ المالي:") */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '59.8%',
                      right: '25.0%',
                      fontSize: '1.0rem',
                      fontWeight: 800,
                      color: '#0d9488',
                    }}
                  >
                    {editableAmount ? `${editableAmount.toLocaleString('fr-DZ')} د.ج` : '—'}
                  </div>

                  {/* 6. Motif ("مقابل:") */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '64.5%',
                      right: '18.5%',
                      left: '8.0%',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: '#333',
                      lineHeight: 1.3,
                    }}
                  >
                    {editableMotif || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Footer actions */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-subtle, #2a2a3c)',
                background: 'var(--bg-elevated, #252538)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button onClick={onClose} style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                إغلاق
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handlePrint} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'transparent', border: '1px solid #b8924a', color: '#b8924a', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                  <Printer size={16} />
                  طباعة الوصل
                </button>
                <button onClick={handlePrint} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#b8924a', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                  <Download size={16} />
                  تحميل نسختي (PDF)
                </button>
              </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
})

ArabicQuittanceModal.displayName = 'ArabicQuittanceModal'