import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X } from 'lucide-react';

interface PleadingModeProps {
    isActive: boolean;
    onClose: () => void;
}

// Composant pour l'apparition organique mot par mot (Plume invisible)
const AnimatedWord = ({ word }: { word: string }) => {
    return (
        <motion.span
            initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="inline-block mr-2 mb-2"
        >
            {word}
        </motion.span>
    );
};

export default function PleadingMode({ isActive, onClose }: PleadingModeProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<string[]>([]);

    // Simulation d'une transcription en flux continu (streaming)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            const mockText = "À l'attention de Monsieur le Président du Tribunal. Nous sollicitons par la présente la condamnation de la partie adverse au versement de la somme de 500 000 DZD au titre des dommages et intérêts, conformément à l'article 124 du Code Civil.".split(' ');
            let currentIndex = 0;
            setTranscript([]); // Reset

            interval = setInterval(() => {
                if (currentIndex < mockText.length) {
                    setTranscript((prev) => [...prev, mockText[currentIndex]]);
                    currentIndex++;
                } else {
                    clearInterval(interval);
                    setIsRecording(false);
                }
            }, 300); // Vitesse d'apparition des mots
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#121212]/85 p-8"
                >
                    {/* Bouton de fermeture minimaliste */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-gray-500 hover:text-[#c5a059] transition-colors"
                    >
                        <X size={32} strokeWidth={1} />
                    </button>

                    {/* Espace d'affichage du texte juridique (Typographie Serif) */}
                    <div className="w-full max-w-4xl h-3/5 overflow-y-auto mb-12">
                        <div
                            className="text-3xl md:text-5xl leading-relaxed text-[#eaeaea]"
                            style={{ fontFamily: "'Cormorant Garamond', 'Amiri', serif" }}
                            dir="auto" // Gère élégamment le français et l'arabe
                        >
                            {transcript.length === 0 && !isRecording && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="text-center italic mt-32">
                                    L'audience est ouverte. Commencez la dictée...
                                </motion.div>
                            )}
                            {transcript.map((word, i) => (
                                <AnimatedWord key={i} word={word} />
                            ))}
                        </div>
                    </div>

                    {/* Onde vocale dorée "Antigravity" */}
                    <div className="flex items-center justify-center gap-1 h-16 mb-8">
                        {[...Array(7)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: isRecording ? [10, 30 + Math.random() * 40, 10] : 4,
                                    opacity: isRecording ? 1 : 0.2
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: isRecording ? 0.6 + Math.random() * 0.4 : 1,
                                    ease: "easeInOut"
                                }}
                                className="w-1.5 bg-[#c5a059] rounded-full"
                            />
                        ))}
                    </div>

                    {/* Bouton Micro "Quiet Luxury" */}
                    <motion.button
                        onClick={() => setIsRecording(!isRecording)}
                        animate={{
                            boxShadow: isRecording ? '0px 0px 30px 5px rgba(197, 160, 89, 0.3)' : '0px 0px 0px 0px rgba(0,0,0,0)',
                        }}
                        className={`p-6 rounded-full border transition-all duration-500 ${isRecording
                                ? 'bg-[#121212] border-[#c5a059] text-[#c5a059]'
                                : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#c5a059] hover:text-[#c5a059]'
                            }`}
                    >
                        <Mic size={32} strokeWidth={isRecording ? 2 : 1} />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}