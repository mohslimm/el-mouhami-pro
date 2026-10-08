import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, AlertCircle, Paperclip, FileCheck, X, Printer } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useDictationStore } from "../stores/useDictationStore";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const base64Data = reader.result.split(",")[1] || reader.result;
        resolve(base64Data);
      } else {
        reject(new Error("خطأ في تحويل التسجيل إلى Base64"));
      }
    };
    reader.onerror = () => reject(new Error("خطأ في قراءة ملف الصوت"));
    reader.readAsDataURL(blob);
  });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const base64Data = reader.result.split(",")[1] || reader.result;
        resolve(base64Data);
      } else {
        reject(new Error("خطأ في قراءة الملف المرفق"));
      }
    };
    reader.onerror = () => reject(new Error("خطأ في قراءة الملف المرفق"));
    reader.readAsDataURL(file);
  });
};

const getSupportedMimeType = (): string => {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
};

export const DictationButton: React.FC = () => {
  const {
    isRecording,
    isProcessing,
    error,
    attachedFileName,
    attachmentText,
    setIsRecording,
    setIsProcessing,
    setTranscript,
    setLegalMetadata,
    setError,
    setAudioBase64,
    setAttachment,
    clearAttachment,
  } = useDictationStore();

  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isExtractingDoc, setIsExtractingDoc] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      stopTracks();
    };
  }, [stopTracks]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtractingDoc(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";

      const extractedText = await invoke<string>("extract_attachment_text", {
        fileBase64: base64,
        mimeType,
      });

      setAttachment(file.name, extractedText);
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "فشل تحليل المرفق واستخراج النص الضوئي (OCR).";
      setError(msg);
      clearAttachment();
    } finally {
      setIsExtractingDoc(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleScanHardware = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const scanBase64 = await invoke<string>("scan_document");
      setIsExtractingDoc(true);
      const extractedText = await invoke<string>("extract_attachment_text", {
        fileBase64: scanBase64,
        mimeType: "image/jpeg",
      });

      const fileName = `مستند_ممسوح_${new Date().toISOString().slice(0, 10)}.jpg`;
      setAttachment(fileName, extractedText);
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "تعذر الاتصال بالماسح الضوئي WIA/TWAIN.";
      setError(msg);
    } finally {
      setIsScanning(false);
      setIsExtractingDoc(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("واجهة تسجيل الصوت غير مدعومة في هذا المتصفح.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      const mimeType = getSupportedMimeType();

      const recorderOptions: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const finalMimeType = recorder.mimeType || mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });

          if (audioBlob.size === 0) {
            throw new Error("لم يتم تسجيل أي بيانات صوتية.");
          }

          const base64 = await blobToBase64(audioBlob);
          setAudioBase64(base64);

          setIsProcessing(true);
          try {
            const result = await invoke<string>("process_legal_dictation", {
              audioBase64: base64,
              attachmentText: attachmentText || null,
            });

            // Parsing du JSON Structuré
            try {
              const parsed = JSON.parse(result);
              if (parsed.revendication_arabe) {
                setTranscript(parsed.revendication_arabe);
                setLegalMetadata(
                  parsed.titre_dossier || "",
                  Array.isArray(parsed.delais_procedure) ? parsed.delais_procedure : [],
                  parsed.montant_reclame || ""
                );
              } else {
                setTranscript(result);
              }
            } catch {
              setTranscript(result);
            }
          } catch (apiErr: unknown) {
            const msg =
              typeof apiErr === "string"
                ? apiErr
                : apiErr instanceof Error
                ? apiErr.message
                : "حدث خطأ أثناء معالجة الإملاء بالذكاء الاصطناعي";
            setError(msg);
          } finally {
            setIsProcessing(false);
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : "خطأ أثناء معالجة التدفق الصوتي";
          setError(errMsg);
          setIsProcessing(false);
        } finally {
          stopTracks();
        }
      };

      recorder.start(250);
      setIsRecording(true);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      stopTracks();
      setIsRecording(false);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول في إعدادات النظام.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("لم يتم العثور على أي ميكروفون متصل.");
      } else {
        const msg = err instanceof Error ? err.message : "تعذر تهيئة الميكروفون.";
        setError(msg);
      }
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleToggleRecord = () => {
    if (isProcessing || isExtractingDoc || isScanning) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-[#121212] rounded-2xl border border-[#2a2a2a] shadow-2xl backdrop-blur-md max-w-md w-full mx-auto" dir="rtl">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,application/pdf"
        className="hidden"
      />

      <div className="flex items-center justify-center space-x-3 space-x-reverse relative w-full">
        <motion.button
          type="button"
          onClick={handleScanHardware}
          disabled={isProcessing || isRecording || isExtractingDoc || isScanning}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-1.5 space-x-reverse px-3 py-2 rounded-xl border border-[#2a2a2a] hover:border-[#c5a059]/50 bg-[#181818] hover:bg-[#222222] text-[#c5a059] text-xs font-arabic font-bold transition-all shadow-md cursor-pointer"
          title="الرسم وتأطير المسح الضوئي المباشر من جهاز Scanner (WIA/TWAIN)"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
              <span>جاري المسح...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4 text-[#c5a059]" />
              <span>مسح المستند</span>
            </>
          )}
        </motion.button>

        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || isRecording || isExtractingDoc || isScanning}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-1.5 space-x-reverse px-3 py-2 rounded-xl border text-xs font-arabic font-bold transition-all duration-300 shadow-md cursor-pointer ${
            attachedFileName
              ? "bg-[#1f2619] border-emerald-600/60 text-emerald-400"
              : "bg-[#181818] hover:bg-[#222222] border-[#2a2a2a] hover:border-[#c5a059]/50 text-[#c5a059]"
          }`}
          title="إرفاق وثيقة أو عقد ساري المفعول لتحليله (Vision OCR)"
        >
          {isExtractingDoc ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
              <span>جاري القراءة...</span>
            </>
          ) : attachedFileName ? (
            <>
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span className="max-w-[80px] truncate">{attachedFileName}</span>
              <X
                className="w-3.5 h-3.5 hover:text-red-400 transition cursor-pointer mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAttachment();
                }}
              />
            </>
          ) : (
            <>
              <Paperclip className="w-4 h-4 text-[#c5a059]" />
              <span>إرفاق مستند</span>
            </>
          )}
        </motion.button>

        <div className="relative flex items-center justify-center">
          {isRecording && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-[#c5a059]/20"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-[#c5a059]/40"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.3, opacity: 0.2 }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </>
          )}

          <motion.button
            type="button"
            onClick={handleToggleRecord}
            disabled={isProcessing || isExtractingDoc || isScanning}
            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
            className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:ring-offset-2 focus:ring-offset-[#121212] ${
              isRecording
                ? "bg-gradient-to-br from-red-600 to-red-800 text-white shadow-red-900/40"
                : isProcessing
                ? "bg-[#1f1f1f] text-gray-500 cursor-not-allowed border border-[#2a2a2a]"
                : "bg-gradient-to-br from-[#c5a059] via-[#b8924a] to-[#997433] text-[#121212] shadow-[#c5a059]/20"
            }`}
            aria-label={isRecording ? "إيقاف التسجيل" : "بدء التسجيل الصوتي"}
          >
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin text-[#c5a059]" />
            ) : isRecording ? (
              <Square className="w-6 h-6 fill-current" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-1 text-center font-arabic">
        <span className="text-xs uppercase tracking-wider text-[#c5a059] font-semibold">
          {isProcessing
            ? "جاري التحليل والمطابقة والصياغة..."
            : isScanning
            ? "جاري توجيه الماسح الضوئي المادي (Scanner WIA)..."
            : isExtractingDoc
            ? "جاري تحليل الوثيقة المرفقة بالرؤية..."
            : isRecording
            ? "جاري التسجيل الصوتي..."
            : "الإملاء الصوتي والمسح الضوئي المباشر للمستندات"}
        </span>

        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 space-x-reverse font-mono text-lg font-semibold text-[#e8c77a]"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>{formatTimer(recordingSeconds)}</span>
          </motion.div>
        )}

        {!isRecording && !isProcessing && !isExtractingDoc && !isScanning && (
          <p className="text-sm text-gray-400">
            أمر المسح الضوئي المباشر أو انقر على الميكروفون لإملاء الوقائع والطلبات
          </p>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-red-950/40 border border-red-900/50 rounded-xl p-3 flex items-start space-x-3 space-x-reverse text-red-300 text-xs font-arabic"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
