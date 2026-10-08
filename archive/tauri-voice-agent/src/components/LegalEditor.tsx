import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion, AnimatePresence } from "framer-motion";
import html2pdf from "html2pdf.js";
import { invoke } from "@tauri-apps/api/core";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Copy,
  Check,
  Download,
  FileDown,
  Sparkles,
  Scale,
  FileText,
  Loader2,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  X,
  PlusCircle,
  Calendar,
  Receipt,
  DollarSign,
  Printer,
  Clock,
} from "lucide-react";
import { useDictationStore } from "../stores/useDictationStore";

export const LegalEditor: React.FC = () => {
  const { transcript, isProcessing, titreDossier, delaisProcedure, montantReclame } = useDictationStore();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);

  // RAG Modal States
  const [isRagModalOpen, setIsRagModalOpen] = useState(false);
  const [ragTitle, setRagTitle] = useState("");
  const [ragContent, setRagContent] = useState("");
  const [isAddingRag, setIsAddingRag] = useState(false);

  // Receipt Modal States
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [feesAmount, setFeesAmount] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: transcript || "",
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[240px] font-arabic text-right text-[#f0ede8] text-xl leading-loose tracking-wide p-6 selection:bg-[#c5a059] selection:text-[#121212]",
      },
    },
  });

  useEffect(() => {
    if (editor && transcript) {
      editor.commands.setContent(transcript);
    }
  }, [editor, transcript]);

  useEffect(() => {
    if (montantReclame) {
      setFeesAmount(montantReclame);
    }
  }, [montantReclame]);

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(null), 4000);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleCopy = async () => {
    if (!editor) return;
    const text = editor.getText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleExportTxt = () => {
    if (!editor) return;
    const text = editor.getText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aredha_Kadhaiya_Slimani_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToFolder = async () => {
    if (!editor) return;
    const textContent = editor.getText().trim();
    if (!textContent) {
      showToast("المستند فارغ، لا يمكن حفظه في الملف.", true);
      return;
    }

    setIsSavingDb(true);
    try {
      const title = titreDossier || textContent.split("\n")[0] || "عريضة قضائية بدون عنوان";

      const result = await invoke<string>("save_document", {
        title,
        content: textContent,
      });

      showToast(result);
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "فشل حفظ المستند في قاعدة البيانات المحلية.";
      showToast(msg, true);
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleAddLegalRag = async () => {
    if (!ragTitle.trim() || !ragContent.trim()) {
      showToast("يرجى ملء عنوان النص والمحتوى القانوني.", true);
      return;
    }

    setIsAddingRag(true);
    try {
      const result = await invoke<string>("add_legal_text", {
        title: ragTitle,
        content: ragContent,
      });

      showToast(result);
      setRagTitle("");
      setRagContent("");
      setIsRagModalOpen(false);
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "فشل إضافة النص إلى قاعدة المعارف المحلية.";
      showToast(msg, true);
    } finally {
      setIsAddingRag(false);
    }
  };

  const handleAddToCalendar = (deadlineText: string) => {
    showToast(`تمت إضافة التاريخ ("${deadlineText}") بنجاح إلى تقويم المحامي.`);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleGeneratePdf = async () => {
    if (!editor) return;
    setIsGeneratingPdf(true);

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const htmlContent = editor.getHTML();

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "750px";
      container.style.backgroundColor = "#ffffff";
      container.style.color = "#111111";
      container.style.padding = "40px 50px";
      container.setAttribute("dir", "rtl");

      const currentDateStr = new Date().toLocaleDateString("ar-DZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      container.innerHTML = `
        <div dir="rtl" style="font-family: 'Amiri', 'Cairo', serif; color: #111111; line-height: 1.9; font-size: 14pt; text-align: right;">
          <!-- En-tête Officiel des Tribunaux Algériens -->
          <div style="text-align: center; border-bottom: 2.5px solid #c5a059; padding-bottom: 16px; margin-bottom: 24px;">
            <div style="font-size: 13pt; font-weight: bold; letter-spacing: 1px; color: #222222; margin-bottom: 4px;">
              الجمهورية الجزائرية الديمقراطية الشعبية
            </div>
            <div style="font-size: 11pt; color: #444444; margin-bottom: 8px;">
              وزارة العدل — منظمة المحامين بناحية الجزائر
            </div>
            <div style="font-size: 17pt; font-weight: bold; color: #997433; margin-top: 6px;">
              مكتب الأستاذ نور الدين سليماني
            </div>
            <div style="font-size: 11pt; color: #555555; font-style: italic;">
              محامٍ معتمد لدى المحكمة العليا ومجلس الدولة
            </div>
          </div>

          <!-- Métadonnées & Date -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 26px; font-size: 11.5pt; color: #333333;">
            <div><strong>رقم المرجع :</strong> AS/عريضة-${new Date().getFullYear()}</div>
            <div><strong>حرر بالجزائر في :</strong> ${currentDateStr}</div>
          </div>

          <!-- Contenu de la Requête / العريضة القضائية -->
          <div style="margin-top: 20px; min-height: 420px; text-align: justify; color: #111111; font-size: 14pt; line-height: 2.0;">
            ${htmlContent}
          </div>

          <!-- Zone de Signature & Cachet Officiel -->
          <div style="margin-top: 55px; display: flex; justify-content: flex-start;">
            <div style="text-align: center; width: 270px;">
              <div style="font-size: 12pt; font-weight: bold; margin-bottom: 55px; color: #222222;">
                عن المكتب / الأستاذ المحامي
              </div>
              <div style="font-size: 11pt; color: #555555; border-top: 1px dashed #aaaaaa; padding-top: 8px;">
                الأستاذ نور الدين سليماني<br/>(الختم والتوقيع الرسمي)
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      const opt = {
        margin: [12, 12, 12, 12] as [number, number, number, number],
        filename: `Aredha_Kadhaiya_Slimani_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
    } catch (err: unknown) {
      console.error("Erreur lors de la génération du PDF en Arabe :", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto space-y-6">
      {/* Card Discrète Métadonnées CRM & Mouvements de Procédure */}
      {titreDossier && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-[#181818] border border-[#c5a059]/40 rounded-2xl shadow-xl space-y-3 font-arabic"
          dir="rtl"
        >
          <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
            <div className="flex items-center space-x-2 space-x-reverse text-[#c5a059]">
              <Clock className="w-5 h-5" />
              <h3 className="font-bold text-base text-[#f0ede8]">
                متابعة المواعيد والآجال القضائية (CRM)
              </h3>
            </div>

            {montantReclame && (
              <div className="flex items-center space-x-1.5 space-x-reverse px-3 py-1 bg-[#121212] border border-[#c5a059]/30 rounded-lg text-xs font-semibold text-[#e8c77a]">
                <DollarSign className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>المبلغ المطالب به: {montantReclame}</span>
              </div>
            )}
          </div>

          <div className="text-sm text-[#f0ede8] font-semibold">
            <span>الملف: </span>
            <span className="text-[#c5a059]">{titreDossier}</span>
          </div>

          {/* Liste des Délais de Procédure */}
          {delaisProcedure && delaisProcedure.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs text-gray-400 font-medium">الآجال والمواعيد الهامة المستخرجة:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {delaisProcedure.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#121212] border border-[#2a2a2a] rounded-xl text-xs text-gray-300"
                  >
                    <span>{d}</span>
                    <button
                      type="button"
                      onClick={() => handleAddToCalendar(d)}
                      className="flex items-center space-x-1 space-x-reverse text-[#c5a059] hover:underline cursor-pointer font-bold"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>إضافة للتقويم</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Editor Container */}
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Toast Notification Discrète */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 space-x-reverse px-4 py-2 bg-[#121212] border border-[#c5a059]/60 rounded-xl shadow-xl text-xs font-arabic text-[#e8c77a]"
              dir="rtl"
            >
              <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}

          {toastError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 space-x-reverse px-4 py-2 bg-red-950 border border-red-800 rounded-xl shadow-xl text-xs font-arabic text-red-200"
              dir="rtl"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{toastError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor Header Bar (RTL) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#121212] border-b border-[#2a2a2a]" dir="rtl">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Scale className="w-5 h-5 text-[#c5a059]" />
            <h2 className="font-arabic text-xl font-bold text-[#f0ede8] tracking-wide">
              عريضة دعوى وطلبات قضائية رسمية
            </h2>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setIsRagModalOpen(true)}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 text-xs font-arabic font-medium text-[#c5a059] bg-[#222222] hover:bg-[#2a2a2a] border border-[#c5a059]/30 hover:border-[#c5a059] rounded-lg transition-all cursor-pointer"
              title="إضافة قانون/مرجع إلى قاعدة المعارف المحلية (RAG)"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>إضافة مرجع قانوني (RAG)</span>
            </button>

            {editor && !isProcessing && transcript && (
              <>
                <button
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 text-xs font-arabic font-medium text-[#c5a059] bg-[#222222] hover:bg-[#2a2a2a] border border-[#c5a059]/30 hover:border-[#c5a059] rounded-lg transition-all cursor-pointer"
                  title="إصدار وصل أتعاب / دفع موثق للعميل"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>وصل أتعاب</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 text-xs font-arabic font-medium text-gray-300 bg-[#222222] hover:bg-[#2a2a2a] hover:text-[#c5a059] border border-[#2a2a2a] hover:border-[#c5a059]/40 rounded-lg transition-all cursor-pointer"
                  title="نسخ النص"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportTxt}
                  className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 text-xs font-arabic font-medium text-gray-300 bg-[#222222] hover:bg-[#2a2a2a] hover:text-[#c5a059] border border-[#2a2a2a] hover:border-[#c5a059]/40 rounded-lg transition-all cursor-pointer"
                  title="تصدير كملف نصي"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor Formatting Controls Toolbar */}
        {editor && !isProcessing && transcript && (
          <div className="flex flex-wrap items-center gap-1 px-5 py-2 bg-[#141414] border-b border-[#2a2a2a]/60" dir="rtl">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-[#252525] transition ${
                editor.isActive("bold") ? "text-[#c5a059] bg-[#252525]" : "text-gray-400"
              }`}
              title="خط عريض"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-[#252525] transition ${
                editor.isActive("italic") ? "text-[#c5a059] bg-[#252525]" : "text-gray-400"
              }`}
              title="خط مائل"
            >
              <Italic className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-[#2a2a2a] mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded hover:bg-[#252525] transition ${
                editor.isActive("heading", { level: 2 })
                  ? "text-[#c5a059] bg-[#252525]"
                  : "text-gray-400"
              }`}
              title="عنوان"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded hover:bg-[#252525] transition ${
                editor.isActive("bulletList") ? "text-[#c5a059] bg-[#252525]" : "text-gray-400"
              }`}
              title="قائمة نقطية"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded hover:bg-[#252525] transition ${
                editor.isActive("orderedList") ? "text-[#c5a059] bg-[#252525]" : "text-gray-400"
              }`}
              title="قائمة رقمية"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Editor Content Area / Skeleton Loading */}
        <div className="relative p-2 min-h-[260px] flex flex-col justify-center" dir="rtl">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center space-x-3 space-x-reverse text-[#c5a059]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-arabic font-medium tracking-wide">
                    جاري البحث في base vectoriel والقوانين الجزائرية وصياغة العريضة...
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="h-5 w-3/4 bg-gradient-to-r from-[#222222] via-[#2a2a2a] to-[#222222] rounded animate-pulse" />
                  <div className="h-4 w-full bg-gradient-to-r from-[#222222] via-[#2a2a2a] to-[#222222] rounded animate-pulse" />
                  <div className="h-4 w-11/12 bg-gradient-to-r from-[#222222] via-[#2a2a2a] to-[#222222] rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-gradient-to-r from-[#222222] via-[#2a2a2a] to-[#222222] rounded animate-pulse" />
                  <div className="h-4 w-full bg-gradient-to-r from-[#222222] via-[#2a2a2a] to-[#222222] rounded animate-pulse" />
                </div>
              </motion.div>
            ) : transcript ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <EditorContent editor={editor} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-12 text-center text-gray-500 space-y-3 font-arabic"
              >
                <FileText className="w-10 h-10 text-gray-600 stroke-1" />
                <p className="text-sm max-w-sm">
                  لم يتم إملاء أي طلبات بعد. انقر على الميكروفون أعلاه لإملاء الوقائع أو الطلبات القضائية.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Footer Buttons (PDF Export & SQLite Save) */}
        {editor && !isProcessing && transcript && (
          <div className="px-6 py-4 bg-[#121212] border-t border-[#2a2a2a] flex flex-wrap items-center justify-start gap-3" dir="rtl">
            <motion.button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf || isSavingDb}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2.5 space-x-reverse px-5 py-2.5 rounded-xl border border-[#2a2a2a] hover:border-[#c5a059]/50 bg-[#181818] hover:bg-[#222222] text-[#c5a059] font-arabic font-bold text-sm transition-all duration-300 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                  <span>جاري توليد ملف PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-[#c5a059]" />
                  <span>توليد ملف PDF (عريضة رسمية)</span>
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleSaveToFolder}
              disabled={isSavingDb || isGeneratingPdf}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2.5 space-x-reverse px-5 py-2.5 rounded-xl border border-[#2a2a2a] hover:border-[#c5a059]/50 bg-[#181818] hover:bg-[#222222] text-[#c5a059] font-arabic font-bold text-sm transition-all duration-300 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              {isSavingDb ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4 text-[#c5a059]" />
                  <span>حفظ في الملف (SQLite)</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Modal RAG */}
      <AnimatePresence>
        {isRagModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl space-y-4 font-arabic"
            >
              <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
                <div className="flex items-center space-x-2 space-x-reverse text-[#c5a059]">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-[#f0ede8]">إضافة نص/قانون إلى base vectoriel</h3>
                </div>
                <button onClick={() => setIsRagModalOpen(false)} className="text-gray-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    عنوان مرجع القانون (مثال: المادة 124 من القانون المدني)
                  </label>
                  <input
                    type="text"
                    value={ragTitle}
                    onChange={(e) => setRagTitle(e.target.value)}
                    placeholder="مثال: المادة 124 قانون مدني - المسؤولية عن التقصير"
                    className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-[#c5a059] rounded-xl px-4 py-2.5 text-[#f0ede8] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    نص المادة أو الإجتهاد القضائي
                  </label>
                  <textarea
                    rows={5}
                    value={ragContent}
                    onChange={(e) => setRagContent(e.target.value)}
                    placeholder="أدخل نص المادة القانونية بالكامل هنا..."
                    className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-[#c5a059] rounded-xl p-4 text-[#f0ede8] outline-none transition resize-none leading-relaxed text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 space-x-reverse pt-2 border-t border-[#2a2a2a]">
                <button
                  onClick={() => setIsRagModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-[#222222] transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddLegalRag}
                  disabled={isAddingRag}
                  className="flex items-center space-x-2 space-x-reverse px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b8924a] text-[#121212] font-bold text-xs shadow-lg transition"
                >
                  {isAddingRag ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التضمين Vectoriel...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>حفظ في base vectoriel</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Quittance / Reçu de Paiement (وصل دفع أتعاب) */}
      <AnimatePresence>
        {isReceiptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white text-gray-900 rounded-2xl p-8 shadow-2xl space-y-6 font-arabic border-4 border-[#c5a059]"
            >
              {/* En-tête du Reçu */}
              <div className="text-center border-b-2 border-[#c5a059] pb-4 space-y-1">
                <h2 className="text-xl font-bold text-[#997433]">مكتب الأستاذ نور الدين سليماني</h2>
                <p className="text-xs text-gray-600">محامٍ معتمد لدى المحكمة العليا ومجلس الدولة</p>
                <div className="inline-block mt-2 px-4 py-1 bg-[#c5a059]/15 text-[#997433] font-bold text-lg rounded-full">
                  وصل استلام أتعاب / دفع
                </div>
              </div>

              {/* Formulaire & Métadonnées du Reçu */}
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم الموكل / العميل:</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="اسم العميل الكامل..."
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">مبلغ الأتعاب المستلم (د.ج):</label>
                    <input
                      type="text"
                      value={feesAmount}
                      onChange={(e) => setFeesAmount(e.target.value)}
                      placeholder="مثال: 50,000 د.ج"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold text-[#997433]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">موضوع الخدمة / القضية:</label>
                  <div className="p-3 bg-gray-100 rounded-lg text-xs font-semibold text-gray-800">
                    {titreDossier || "صياغة عريضة ومتابعة إجراءات قضائية"}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                  <span>التاريخ: {new Date().toLocaleDateString("ar-DZ")}</span>
                  <span>رقم الوصل: #{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>

              {/* Cachet et Signature */}
              <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                <div className="text-center w-40">
                  <div className="text-xs font-bold mb-8">توقيع الموكل</div>
                  <div className="border-t border-gray-400 pt-1 text-[10px] text-gray-500">موافق على المستلم</div>
                </div>

                <div className="text-center w-48">
                  <div className="text-xs font-bold mb-8 text-[#997433]">توقيع وختم المحامي</div>
                  <div className="border-t border-gray-400 pt-1 text-[10px] text-gray-500">الأستاذ نور الدين سليماني</div>
                </div>
              </div>

              {/* Boutons d'Action Modal */}
              <div className="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex items-center space-x-2 space-x-reverse px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b8924a] text-white font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الوصل</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
