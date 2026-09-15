import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, X, Mic } from "lucide-react";
import { DictationButton } from "./components/DictationButton";
import { LegalEditor } from "./components/LegalEditor";
import PleadingMode from "./components/PleadingMode";

export function App() {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPleadingModeOpen, setIsPleadingModeOpen] = useState(false);

  useEffect(() => {
    // Vérifier les mises à jour automatiques au démarrage de l'application
    const checkForUpdates = async () => {
      try {
        const availableVersion = await invoke<string | null>("check_for_updates");
        if (availableVersion) {
          setUpdateVersion(availableVersion);
        }
      } catch (err) {
        console.log("Recherche de mise à jour ignorable en dev :", err);
      }
    };

    checkForUpdates();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-[#f0ede8] flex flex-col items-center justify-start py-10 px-6 selection:bg-[#c5a059] selection:text-[#121212] relative font-sans">
      {/* Toast Notification Discrète Mises à Jour Automatiques (Quiet Luxury Gold) */}
      <AnimatePresence>
        {updateVersion && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 z-50 flex items-center space-x-3 space-x-reverse px-5 py-3 bg-[#181818] border border-[#c5a059] rounded-2xl shadow-2xl backdrop-blur-lg font-arabic text-sm text-[#f0ede8]"
            dir="rtl"
          >
            <div className="p-1.5 rounded-lg bg-[#c5a059]/20 text-[#c5a059]">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-[#c5a059]">
                تحديث جديد متاح ({updateVersion})
              </span>
              <span className="text-xs text-gray-400">
                تحديث جديد متاح. أعد التشغيل للتثبيت.
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 bg-[#c5a059] hover:bg-[#b8924a] text-[#121212] font-bold text-xs rounded-xl shadow transition cursor-pointer mr-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة التشغيل والتثبيت</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="text-gray-500 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar with Quiet Luxury & Arabic Branding */}
      <header className="text-center mb-8 space-y-3 max-w-2xl" dir="rtl">
        <div className="inline-flex items-center space-x-2 space-x-reverse px-3.5 py-1 bg-[#181818] border border-[#c5a059]/30 rounded-full text-xs font-arabic uppercase tracking-wider text-[#c5a059] shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
          <span>المساعد الصوتي والمحرر القانوني الذكي</span>
        </div>

        <h1 className="font-arabic text-4xl md:text-5xl font-bold tracking-tight text-[#f0ede8]">
          مكتب الأستاذ <span className="italic text-[#c5a059]">نور الدين سليماني</span> — المحامي المحترف
        </h1>

        <p className="text-sm font-arabic text-gray-400 tracking-wide max-w-lg mx-auto leading-relaxed">
          تحويل الإملاء الصوتي إلى عرائض دعوى وطلبات قضائية رسمية مصاغة وفقاً للقانون الجزائري
        </p>

        {/* Bouton d'activation du Mode Plaidoirie Immersif */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsPleadingModeOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2a2a2a] hover:border-[#c5a059] bg-[#181818] hover:bg-[#222222] text-[#c5a059] font-arabic text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Mic className="w-4 h-4 text-[#c5a059]" />
            <span>وضع المرافعة الشفهية المباشرة (Mode Plaidoirie)</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl space-y-8 flex flex-col items-center">
        <DictationButton />
        <LegalEditor />
      </main>

      {/* Mode Plaidoirie Overlay Immersif */}
      <PleadingMode
        isActive={isPleadingModeOpen}
        onClose={() => setIsPleadingModeOpen(false)}
      />
    </div>
  );
}

export default App;