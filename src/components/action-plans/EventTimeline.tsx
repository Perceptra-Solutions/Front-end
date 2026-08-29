import { Bot, HardHat, Settings2, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineEvent } from '@/types'

const kindStyle: Record<TimelineEvent['kind'], { icon: typeof Bot; dot: string; ring: string }> = {
  ai: { icon: Bot, dot: 'bg-technical-600', ring: 'ring-technical-600/15' },
  engineer: { icon: UserCheck, dot: 'bg-navy-800', ring: 'ring-navy-800/15' },
  field: { icon: HardHat, dot: 'bg-status-warning', ring: 'ring-status-warning/15' },
  system: { icon: Settings2, dot: 'bg-graphite-400', ring: 'ring-graphite-400/15' },
}

/** Linha do tempo da execução: cada evento com hora, autor e origem. */
export function EventTimeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <ol className={cn('relative space-y-3 pl-6', className)}>
      <span className="absolute bottom-2 left-[9px] top-2 w-px bg-border" aria-hidden />
      {events.map((e, i) => {
        const style = kindStyle[e.kind]
        const Icon = style.icon
        const last = i === events.length - 1
        return (
          <li key={`${e.time}-${i}`} className="relative">
            <span
              className={cn(
                'absolute -left-6 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full text-white ring-4',
                style.dot,
                style.ring,
                last && 'animate-pulse-live',
              )}
            >
              <Icon className="h-2.5 w-2.5" />
            </span>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-mono text-[12px] font-600 tabular-nums text-graphite-900">{e.time}</span>
              <span className="font-mono text-[10px] text-graphite-300">{e.date}</span>
              <span className="text-[13.5px] font-500 text-graphite-900">{e.label}</span>
            </div>
            {e.detail && <p className="mt-0.5 text-[12.5px] leading-snug text-graphite-500">{e.detail}</p>}
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-graphite-400">{e.author}</p>
          </li>
        )
      })}
    </ol>
  )
}
