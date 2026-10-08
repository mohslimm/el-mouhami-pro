import { memo, useState } from 'react'
import { Brain, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ReasoningStep {
  id: string
  title: string
  detail?: string
  status: 'pending' | 'active' | 'completed'
}

export interface ReasoningBoxProps {
  steps: ReasoningStep[]
  isStreaming?: boolean
  className?: string
}

export const ReasoningBox = memo(({ steps, isStreaming = false, className }: ReasoningBoxProps) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border-gold)] bg-[var(--bg-surface)] p-3.5 shadow-md transition-all duration-300',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-xs font-semibold text-[var(--gold-400)] hover:text-[var(--text-primary)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[var(--gold-400)] animate-pulse" />
          <span>
            {isStreaming
              ? 'جاري التحليل القانوني وفحص مواد CPCA...'
              : 'التأصيل القانوني وتحليل الإجراءات (CPCA)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming && <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--gold-400)]" />}
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', isOpen ? 'rotate-180' : 'rotate-0')}
          />
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-col gap-2.5 border-t border-[var(--border-subtle)] pt-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-2.5 text-xs">
              {step.status === 'completed' && (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              )}
              {step.status === 'active' && (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[var(--gold-400)]" />
              )}
              {step.status === 'pending' && (
                <div className="mt-1 h-2 w-2 rounded-full bg-white/20" />
              )}

              <div className="flex flex-col">
                <span
                  className={cn(
                    'font-medium',
                    step.status === 'completed'
                      ? 'text-emerald-300'
                      : step.status === 'active'
                      ? 'text-[var(--gold-400)] font-bold'
                      : 'text-white/40'
                  )}
                >
                  {step.title}
                </span>
                {step.detail && (
                  <span className="mt-0.5 text-[0.7rem] text-[var(--text-muted)] font-mono">
                    {step.detail}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

ReasoningBox.displayName = 'ReasoningBox'
