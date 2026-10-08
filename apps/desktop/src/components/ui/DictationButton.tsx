// DictationButton.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CABINET SLIMANI — AL-MOUHAMI PRO DESKTOP (ANTIGRAVITY & QUIET LUXURY SPEC)
// Dictée Vocale avec Pipeline STT Local (Hors-Ligne & Conformité PII)
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, ShieldCheck, FileCheck, AlertCircle, RefreshCw, Globe, Lock, Sparkles, Volume2, Info } from 'lucide-react'
import { maskSensitiveData, unmaskData, AnonymizationMapping, KnownParty } from '@/services/anonymizer'
import { sendMaskedTextToCloudProxy, StructuredPetition } from '@/services/petitionApi'
import { generateWordDocument, PetitionDocumentData } from '@/services/documentGenerator'

export type DictationState = 'idle' | 'listening' | 'processing' | 'success' | 'error'

interface DictationButtonProps {
  petitionType?: 'divorce' | 'foncier' | 'commercial' | 'penal' | 'administratif'
  knownParties?: KnownParty[]
  onComplete?: (hydratedPetition: StructuredPetition, isFallback?: boolean) => void
}

// Preset legal phrases for quick 1-click dictation insertion
const QUICK_LEGAL_PRESETS = [
  {
    id: 'foncier_preset',
    labelAr: 'عقاري: التماس تثبيت ملكية وإخلاء',
    labelFr: 'Foncier: Droit de propriété & Expulsion',
    textAr: 'التماس إثبات حق الملكية وتثبيت العقار الواقع ببلدية بئر خادم بحسب عقد الملكية المشهر رقم 412/2020، وإلزام المدعى عليه بالإخلاء وتكليفه بالمصاريف القضائية.',
    textFr: 'Demande de confirmation du droit de propriété foncière sur l\'immeuble sis à Bir Khadem suivant acte notarié n° 412/2020 et expulsion du défendeur.',
  },
  {
    id: 'divorce_preset',
    labelAr: 'شؤون الأسرة: طلب فك الرابطة الزوجية',
    labelFr: 'Famille: Dissolution du mariage',
    textAr: 'طلب فك الرابطة الزوجية بالتطليق لإضرار الزوج طبقاً لأحكام المادة 53 من قانون الأسرة، مع المطالبة بالتعويض عن الضرر والنفقة وإسناد الحضانة.',
    textFr: 'Demande de divorce pour faute conformément aux dispositions de l\'article 53 du Code de la Famille avec réparation du préjudice moral.',
  },
  {
    id: 'commercial_preset',
    labelAr: 'تجاري: التزام بالتنفيذ والتعويض',
    labelFr: 'Commercial: Inexécution contractuelle',
    textAr: 'دعوى المطالبة بتنفيذ الالتزامات التعاقدية الناشئة عن السجل التجاري وجبر الضرر الناتج عن التأخير في التوريد.',
    textFr: 'Action en exécution des obligations contractuelles et réparation du préjudice subi consécutif au retard de livraison.',
  },
]

export const DictationButton = memo(({ petitionType = 'divorce', knownParties = [], onComplete }: DictationButtonProps) => {
  const [status, setStatus] = useState<DictationState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [committedText, setCommittedText] = useState<string>('')
  const [interimText, setInterimText] = useState<string>('')
  const [maskedPreview, setMaskedPreview] = useState<string>('')
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0)
  const [silenceSeconds, setSilenceSeconds] = useState<number>(0)
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [isFallbackNotice, setIsFallbackNotice] = useState<boolean>(false)
  const [offlineMessage, setOfflineMessage] = useState<string>('')
  const [mappingStats, setMappingStats] = useState<{ phonesCount: number; dossiersCount: number; datesCount: number; namesCount: number }>({
    phonesCount: 0,
    dossiersCount: 0,
    datesCount: 0,
    namesCount: 0,
  })
  const [lang, setLang] = useState<'ar-DZ' | 'fr-FR'>('ar-DZ')

  const isListeningRef = useRef<boolean>(false)
  const sessionIdRef = useRef<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const mappingRef = useRef<AnonymizationMapping>({})
  const timerRef = useRef<any>(null)
  const cleanupListenersRef = useRef<Array<() => void>>([])

  // Silence countdown & recording timer
  useEffect(() => {
    if (status === 'listening') {
      setRecordingSeconds(0)
      setSilenceSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
        setSilenceSeconds((prev) => {
          const next = prev + 1
          if (next >= 5 && interimText) {
            setCommittedText((cPrev) => {
              const trimmed = cPrev.trim()
              const added = interimText.trim()
              return trimmed ? `${trimmed} ${added}` : added
            })
            setInterimText('')
          }
          return next
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status, interimText])

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Clean up recording, listeners & audio analysis
  const cleanupAudio = () => {
    isListeningRef.current = false

    // Clean up event listeners
    cleanupListenersRef.current.forEach((clean) => clean())
    cleanupListenersRef.current = []

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close()
      } catch {
        // Ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      } catch {
        // Ignore
      }
      mediaRecorderRef.current = null
    }
  }

  useEffect(() => {
    return () => cleanupAudio()
  }, [])

  // Start STT pipeline with local Electron API bridge
  const startListening = async () => {
    cleanupAudio()
    setStatus('listening')
    isListeningRef.current = true
    setCommittedText('')
    setInterimText('')
    setMaskedPreview('')
    setErrorMessage('')
    setIsFallbackNotice(false)
    setOfflineMessage('')
    setAudioLevel(0)
    setSilenceSeconds(0)

    // Check availability of local STT IPC API
    if (window.sttAPI) {
      try {
        const engineStatus = await window.sttAPI.getStatus()
        if (!engineStatus.ready) {
          setOfflineMessage(
            lang === 'ar-DZ'
              ? '⚠️ محرك التفريغ الصوتي المحلي غير جاهز. تم تفعيل التحرير اليدوي.'
              : '⚠️ Moteur STT local indisponible. Saisie manuelle active.'
          )
        } else {
          // Initialize local STT session in main process
          const session = await window.sttAPI.startSession(lang)
          sessionIdRef.current = session.sessionId

          // Bind partial & final transcription callbacks
          const cleanPartial = window.sttAPI.onPartialResult((sessId, text) => {
            if (sessId === sessionIdRef.current && isListeningRef.current) {
              setInterimText(text)
            }
          })
          const cleanFinal = window.sttAPI.onFinalResult((sessId, text) => {
            if (sessId === sessionIdRef.current) {
              if (text) {
                setCommittedText((prev) => (prev ? `${prev.trim()} ${text.trim()}` : text.trim()))
              }
              setInterimText('')
            }
          })
          cleanupListenersRef.current.push(cleanPartial, cleanFinal)
        }
      } catch (err) {
        console.warn('Erreur d’initialisation du STT Local:', err)
      }
    } else {
      setOfflineMessage(
        lang === 'ar-DZ'
          ? '⚠️ يتم التشغيل في متصفح خارجي: محرك التفريغ المحلي متاح حصرياً داخل تطبيق Electron.'
          : '⚠️ Mode navigateur Web : le moteur STT local est réservé à l’application Electron.'
      )
    }

    // Microphone Audio Visualizer & Chunk Pipe
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data && e.data.size > 0 && sessionIdRef.current && window.sttAPI) {
            try {
              const arrayBuffer = await e.data.arrayBuffer()
              window.sttAPI.sendAudioChunk(sessionIdRef.current, arrayBuffer)
            } catch (chunkErr) {
              console.warn('Erreur envoi chunk audio:', chunkErr)
            }
          }
        }

        // Slice audio into 500ms chunks for live streaming
        mediaRecorder.start(500)
        mediaRecorderRef.current = mediaRecorder

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const updateVolume = () => {
          if (!isListeningRef.current) return
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] || 0
          }
          const average = sum / dataArray.length
          const currentLvl = Math.min(100, Math.round((average / 128) * 100))
          setAudioLevel(currentLvl)
          if (currentLvl > 15) {
            setSilenceSeconds(0)
          }
          animFrameRef.current = requestAnimationFrame(updateVolume)
        }
        updateVolume()
      }
    } catch (mediaErr) {
      console.warn('Erreur d’accès au microphone:', mediaErr)
      setErrorMessage(
        lang === 'ar-DZ'
          ? 'تعذر الوصول إلى الميكروفون. يرجى التحقق من إعدادات النظام.'
          : 'Impossible d’accéder au microphone. Vérifiez les autorisations OS.'
      )
    }
  }

  const stopListeningAndProcess = async () => {
    isListeningRef.current = false

    // Finalize session in main process
    if (sessionIdRef.current && window.sttAPI) {
      try {
        const finalRes = await window.sttAPI.endSession(sessionIdRef.current)
        if (finalRes.transcribedText) {
          setCommittedText((prev) => (prev ? `${prev.trim()} ${finalRes.transcribedText.trim()}` : finalRes.transcribedText.trim()))
        }
      } catch (err) {
        console.warn('Erreur clôture session STT:', err)
      }
      sessionIdRef.current = null
    }

    cleanupAudio()

    const fullTranscript = (committedText ? committedText.trim() + ' ' : '') + interimText.trim()
    const textToProcess = fullTranscript.trim()

    if (!textToProcess) {
      setStatus('idle')
      setErrorMessage(
        lang === 'ar-DZ'
          ? 'لم يتم التقاط أي نص. يرجى التكلم في الميكروفون أو كتابة الوقائع مباشرة في الصندوق.'
          : 'Aucun texte capturé. Veuillez parler au micro ou taper les faits directement.'
      )
      return
    }

    setStatus('processing')

    // STEP 1: Local PII Masking (Runs strictly BEFORE any cloud interaction)
    const maskResult = maskSensitiveData(textToProcess, knownParties)
    setMaskedPreview(maskResult.maskedText)
    mappingRef.current = maskResult.mapping
    setMappingStats({
      phonesCount: maskResult.stats.phonesCount,
      dossiersCount: maskResult.stats.dossiersCount,
      datesCount: maskResult.stats.datesCount,
      namesCount: maskResult.stats.namesCount,
    })

    // STEP 2: Send Masked Text to Cloud Proxy
    const cloudResponse = await sendMaskedTextToCloudProxy({
      maskedText: maskResult.maskedText,
      petitionType,
      lang: lang.startsWith('ar') ? 'ar' : 'fr',
    })

    if (!cloudResponse.success || !cloudResponse.data) {
      setStatus('error')
      setErrorMessage(cloudResponse.error || 'Erreur lors de la structuration de la requête par le cloud proxy.')
      return
    }

    setIsFallbackNotice(Boolean(cloudResponse.isFallbackTemplate))

    // STEP 3: Local Re-hydration
    const hydratedPetition = unmaskData<StructuredPetition>(cloudResponse.data, mappingRef.current)

    // STEP 4: Generate Word Document (.doc / .docx)
    const docxResult = await generateWordDocument(
      hydratedPetition as unknown as PetitionDocumentData,
      `عريضة_${petitionType}_${new Date().toISOString().slice(0, 10)}.doc`
    )

    if (!docxResult.success) {
      setStatus('error')
      setErrorMessage(docxResult.error || 'Erreur lors de la génération du fichier Word local.')
      return
    }

    setStatus('success')
    if (onComplete) {
      onComplete(hydratedPetition, cloudResponse.isFallbackTemplate)
    }
  }

  const resetDictation = () => {
    cleanupAudio()
    setStatus('idle')
    setCommittedText('')
    setInterimText('')
    setMaskedPreview('')
    setErrorMessage('')
    setOfflineMessage('')
    setRecordingSeconds(0)
    setSilenceSeconds(0)
    setAudioLevel(0)
    mappingRef.current = {}
    sessionIdRef.current = null
  }

  const fullDisplay = (committedText ? committedText.trim() + ' ' : '') + interimText.trim()

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-gold)] transition-all p-5 shadow-[var(--shadow-card)] w-full">
      {/* Header & Language Control Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--gold-glow)] border border-[var(--border-gold)] flex items-center justify-center text-[var(--gold-400)]">
            <Mic size={20} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-white tracking-wide">
              {lang === 'ar-DZ' ? 'محرر العرائض بالإملاء الصوتي المحلي (STT Offline)' : 'Dictée Vocale STT Locale & Structuration'}
            </h3>
            <span className="text-[0.7rem] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <Lock size={12} className="text-emerald-400" />
              {lang === 'ar-DZ' ? 'معالجة محلية 100% • تشفير PII قبل أي نقل' : 'Traitement 100% local • Cryptage PII sur l’appareil'}
            </span>
          </div>
        </div>

        {/* Language Selector & Info Tooltip */}
        <div className="flex items-center gap-2">
          <div className="relative group cursor-pointer">
            <Info size={15} className="text-[var(--gold-400)] hover:text-white transition-colors" />
            <div className="absolute right-0 top-6 hidden group-hover:block z-50 w-64 p-2.5 rounded-xl bg-[#0a0a14] border border-[var(--border-gold)] text-[0.68rem] text-[var(--text-primary)] shadow-2xl leading-relaxed">
              {lang === 'ar-DZ'
                ? 'محرك الصوت محلي بالكامل ولا يتطلب أي اتصال بالإنترنت. الصوت ينقل مشفراً محلياً في ذاكرة البرنامج.'
                : 'Moteur STT 100% local sans dépendance cloud. L’enregistrement audio reste strictement sur l’ordinateur.'}
            </div>
          </div>
          <Globe size={14} className="text-[var(--gold-400)]" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'ar-DZ' | 'fr-FR')}
            disabled={status !== 'idle'}
            className="input text-xs py-1.5 px-3 rounded-lg cursor-pointer font-medium"
          >
            <option value="ar-DZ">العربية (Algeria ar-DZ)</option>
            <option value="fr-FR">Français (fr-FR)</option>
          </select>
        </div>
      </div>

      {offlineMessage && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          {offlineMessage}
        </div>
      )}

      {/* Main Interactive Container */}
      <div className="relative rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 text-center overflow-hidden">
        <AnimatePresence mode="wait">
          {/* STATE 1: IDLE */}
          {status === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <button
                onClick={startListening}
                className="btn-primary inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold cursor-pointer shadow-lg shadow-[var(--gold-glow)]"
              >
                <Mic size={18} />
                <span>{lang === 'ar-DZ' ? 'بدء الإملاء الصوتي المحلي (STT)' : 'Démarrer la Dictée Vocale Locale'}</span>
              </button>

              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                {lang === 'ar-DZ'
                  ? 'تكلم بوضوح في الميكروفون ليتم تفريغ الصوت محلياً على جهازك دون إرسال الصوت لأي خادم.'
                  : 'Parlez au microphone : votre voix est transcrite localement sur votre appareil.'}
              </p>

              {/* Quick Legal Presets */}
              <div className="pt-2">
                <span className="text-[0.68rem] font-semibold uppercase text-[var(--gold-400)] block mb-2 tracking-wider">
                  {lang === 'ar-DZ' ? 'أو اختر نموذج صياغة جاهز بنقرة واحدة :' : 'Ou insérez une trame juridique en 1 clic :'}
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_LEGAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setCommittedText(lang === 'ar-DZ' ? preset.textAr : preset.textFr)
                        setInterimText('')
                        setStatus('listening')
                      }}
                      className="btn-outline text-[0.72rem] py-1 px-2.5 rounded-lg border-white/10 hover:border-[var(--border-gold)] hover:text-[var(--gold-400)] transition-all"
                    >
                      <Sparkles size={12} className="inline me-1 text-[var(--gold-400)]" />
                      {lang === 'ar-DZ' ? preset.labelAr : preset.labelFr}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: LISTENING (STREAMING CHUNKS VIA LOCAL IPC) */}
          {status === 'listening' && (
            <motion.div key="listening" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Mic pulse & Audio Spectrum Visualizer */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative inline-block">
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -inset-3 rounded-full bg-rose-500/40 blur-md"
                  />
                  <button
                    onClick={stopListeningAndProcess}
                    className="relative w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer mx-auto shadow-xl transition-all"
                  >
                    <MicOff size={26} />
                  </button>
                </div>

                {/* Audio Spectrum & Level */}
                <div className="flex items-center gap-1.5 pt-1">
                  <Volume2 size={14} className="text-rose-400" />
                  <div className="w-32 h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-75"
                      style={{ width: `${Math.max(8, audioLevel)}%` }}
                    />
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="text-rose-400 font-mono text-xs font-bold tracking-wider pt-0.5">
                  ● {lang === 'ar-DZ' ? `التفريغ المحلي نشط — ${formatTime(recordingSeconds)}` : `STT Local actif — ${formatTime(recordingSeconds)}`}
                </div>
              </div>

              {/* Real-time Streaming Words Layer & Editable Box */}
              <div className="space-y-3 text-right dir-rtl">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                  <span className="text-[var(--gold-400)] font-semibold flex items-center gap-1.5">
                    <Sparkles size={14} className="animate-spin text-[var(--gold-400)]" />
                    {lang === 'ar-DZ' ? 'التفريغ النصي المحلي (معالجة محليّة) :' : 'Transcription locale STT (En cours) :'}
                  </span>

                  <div className="flex items-center gap-2">
                    {audioLevel > 15 ? (
                      <span className="text-[0.68rem] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                        ● {lang === 'ar-DZ' ? 'صوت نشط ✓' : 'Voix détectée ✓'}
                      </span>
                    ) : (
                      <span className="text-[0.68rem] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
                        ● {lang === 'ar-DZ' ? `صمت: ${silenceSeconds}ث` : `Silence: ${silenceSeconds}s`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Real-Time Live Word Preview Layer */}
                {(committedText || interimText) && (
                  <div className="p-3.5 rounded-xl bg-[#060610] border border-[var(--border-gold)] text-sm leading-relaxed max-h-36 overflow-y-auto text-start dir-rtl shadow-inner">
                    <span className="text-white font-medium">{committedText}</span>
                    {interimText && (
                      <span className="text-[var(--gold-400)] font-bold italic animate-pulse ms-1.5 bg-[var(--gold-glow)] px-1.5 py-0.5 rounded border border-[var(--border-gold)]">
                        {interimText}
                      </span>
                    )}
                  </div>
                )}

                {/* Editable Textarea */}
                <textarea
                  value={fullDisplay}
                  onChange={(e) => {
                    setCommittedText(e.target.value)
                    setInterimText('')
                  }}
                  dir={lang.startsWith('ar') ? 'rtl' : 'ltr'}
                  rows={4}
                  className="input w-full font-sans text-sm p-3.5 rounded-xl text-white bg-[var(--bg-void)] border-[var(--border-gold)] focus:ring-2 focus:ring-[var(--gold-400)] leading-relaxed resize-none shadow-inner"
                  placeholder={lang === 'ar-DZ' ? 'تكلم الآن للتفريغ المحلي، أو اكتب وتعديل النص هنا...' : 'Parlez maintenant pour la transcription locale...'}
                />
              </div>

              <button
                className="btn-primary w-full justify-center text-xs py-3 font-semibold rounded-xl shadow-lg"
                onClick={stopListeningAndProcess}
              >
                <ShieldCheck size={16} />
                <span>{lang === 'ar-DZ' ? 'إيقاف وتشفير PII ثم توليد العريضة' : 'Arrêter et Anonymiser les données'}</span>
              </button>
            </motion.div>
          )}

          {/* STATE 3: PROCESSING */}
          {status === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 py-6">
              <RefreshCw size={36} className="text-[var(--gold-400)] animate-spin mx-auto mb-2" />
              <h4 className="text-[var(--gold-400)] text-sm font-semibold">
                {lang === 'ar-DZ' ? 'جاري تشفير البيانات محلياً وتوليد عريضة Word...' : 'Masquage Regex PII & Génération Word...'}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                {lang === 'ar-DZ'
                  ? 'حفظ السرية المهنية • حظر تسريب الهويات • تصدير مستند .doc'
                  : 'Cryptage PII local • Protection du secret professionnel • Export .doc'}
              </p>
            </motion.div>
          )}

          {/* STATE 4: SUCCESS */}
          {status === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 py-2">
              <FileCheck size={44} className="text-emerald-400 mx-auto" />
              <h4 className="text-emerald-400 text-sm font-bold">
                {lang === 'ar-DZ' ? '✓ تم توليد العريضة وتصدير Word بنجاح!' : '✓ Requête Générée et Téléchargée avec Succès!'}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                {lang === 'ar-DZ'
                  ? 'تمت العملية بالكامل دون تسريب الصوت أو البيانات الشخصية خارج جهازك.'
                  : 'Fichier Word ré-hydraté généré localement sans fuite de données.'}
              </p>
              {isFallbackNotice && (
                <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                  {lang === 'ar-DZ'
                    ? '💡 نمط التملية المحلي السريع : تم تطبيق النموذج المخصص بنجاح.'
                    : '💡 Mode dégradé sécurisé : Modèle appliqué avec succès.'}
                </div>
              )}
              <div className="flex justify-center gap-3 pt-2">
                <button className="btn-outline text-xs px-4 py-2" onClick={resetDictation}>
                  <RefreshCw size={14} />
                  <span>{lang === 'ar-DZ' ? 'إملاء صوتي جديد' : 'Nouvelle Dictée Vocale'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 5: ERROR */}
          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 py-2">
              <AlertCircle size={36} className="text-rose-500 mx-auto" />
              <h4 className="text-rose-400 text-sm font-bold">
                {lang === 'ar-DZ' ? 'حدث خطأ أثناء معالجة الصوت' : 'Une erreur est survenue lors de la dictée'}
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                {errorMessage}
              </p>
              <button className="btn-primary text-xs px-4 py-2 mx-auto" onClick={resetDictation}>
                {lang === 'ar-DZ' ? 'إعادة المحاولة' : 'Réessayer'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Anonymization Pipeline Telemetry Footer */}
      {(maskedPreview || mappingStats.phonesCount > 0 || mappingStats.namesCount > 0) && (
        <div className="rounded-xl bg-white/[0.02] border border-[var(--border-subtle)] p-3 text-xs space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-[var(--gold-400)] flex items-center gap-1.5">
              <Lock size={13} />
              {lang === 'ar-DZ' ? 'نتائج التشفير المحلي (السرية القانونية محفوظة)' : 'Résultat du Masquage Local (Envoyé au Cloud Proxy)'}
            </span>
            <div className="flex gap-3 text-[0.68rem] text-[var(--text-muted)]">
              <span>Noms: <strong className="text-[var(--gold-400)]">{mappingStats.namesCount}</strong></span>
              <span>Tél: <strong className="text-[var(--gold-400)]">{mappingStats.phonesCount}</strong></span>
              <span>Dossiers: <strong className="text-[var(--gold-400)]">{mappingStats.dossiersCount}</strong></span>
              <span>Dates: <strong className="text-[var(--gold-400)]">{mappingStats.datesCount}</strong></span>
            </div>
          </div>
          <div className="bg-[#060610] p-2.5 rounded-lg font-mono text-[0.72rem] text-emerald-400 max-h-20 overflow-y-auto leading-relaxed border border-[var(--border-subtle)]">
            {maskedPreview}
          </div>
        </div>
      )}
    </div>
  )
})

DictationButton.displayName = 'DictationButton'
