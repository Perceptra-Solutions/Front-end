import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FLOW_STAGES, type FlowStage } from '@/types'

interface FlowTimelineProps {
  current: FlowStage
  className?: string
  compact?: boolean
}

/**
 * Linha do ciclo da ocorrência: IA detecta → engenheiro tria → NC →
 * plano de ação → verificação → resolvida. O estágio atual fica marcado;
 * os pendentes ficam vazados, como em um checklist de obra.
 */
export function FlowTimeline({ current, className, compact = false }: FlowTimelineProps) {
  const currentIndex = FLOW_STAGES.findIndex((s) => s.key === current)

  return (
    <ol className={cn('flex w-full items-center', className)} aria-label="Ciclo da ocorrência">
      {FLOW_STAGES.map((stage, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        const isLast = i === FLOW_STAGES.length - 1

        return (
          <li key={stage.key} className={cn('flex items-center', !isLast && 'flex-1')}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] font-mono text-[9px] font-600 transition-colors',
                  done && 'border-status-success bg-status-success text-white',
                  active && 'border-technical-600 bg-technical-600 text-white ring-4 ring-technical-600/15',
                  !done && !active && 'border-graphite-200 bg-white text-graphite-300',
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : stage.short}
              </span>
              {!compact && (
                <span
                  className={cn(
                    'whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.1em]',
                    active ? 'text-technical-700' : done ? 'text-status-success' : 'text-graphite-300',
                  )}
                >
                  {stage.label}
                </span>
              )}
            </div>
            {!isLast && (
              <span
                className={cn(
                  'mx-2 h-[2px] flex-1 rounded-full transition-colors',
                  i < currentIndex ? 'bg-status-success' : 'bg-graphite-200',
                  compact ? 'mb-0' : 'mb-5',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
