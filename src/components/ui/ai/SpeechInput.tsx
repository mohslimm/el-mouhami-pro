import { memo } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpeechInputProps {
  className?: string
  isListening?: boolean
  isProcessing?: boolean
  onToggleListening?: () => void
  lang?: string
}

export const SpeechInput = memo(({
  className,
  isListening = false,
  isProcessing = false,
  onToggleListening,
}: SpeechInputProps) => {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Animated pulse rings */}
      {isListening &&
        [0, 1, 2].map((index) => (
          <div
            key={index}
            className="absolute inset-0 animate-ping rounded-full border-2 border-[var(--gold-400)]/40"
            style={{
              animationDelay: `${index * 0.3}s`,
              animationDuration: '2s',
            }}
          />
        ))}

      {/* Main Record Button */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={onToggleListening}
        className={cn(
          'relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:ring-offset-2',
          isListening
            ? 'border-red-500 bg-red-500/25 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse'
            : 'border-[var(--border-gold)] bg-[var(--gold-glow)] text-[var(--gold-400)] shadow-[0_0_15px_rgba(197,160,89,0.2)] hover:scale-105 hover:bg-[var(--gold-glow)]/80',
          className
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin text-[var(--gold-400)]" />
        ) : isListening ? (
          <Square className="h-6 w-6 fill-current text-red-400" />
        ) : (
          <Mic className="h-6 w-6 text-[var(--gold-400)]" />
        )}
      </button>
    </div>
  )
})

SpeechInput.displayName = 'SpeechInput'
