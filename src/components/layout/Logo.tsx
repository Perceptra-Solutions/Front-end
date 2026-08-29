import { cn } from '@/lib/utils'

/**
 * Marca PERCEPTRA — um prumo/nível desenhado em traço técnico
 * sobre a tipografia condensada.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="3" className="fill-navy-800 stroke-technical-500" strokeWidth="1.5" />
      <path d="M6 23 h20" className="stroke-technical-400" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 23 V11 l10-4 10 4 v12" className="stroke-technical-400" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <circle cx="16" cy="15.5" r="2.6" className="fill-technical-400" />
      <path d="M16 4 v3" className="stroke-technical-300" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <div className="leading-none">
          <p className="font-display text-[19px] font-700 uppercase tracking-[0.09em] text-white">Perceptra</p>
          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.26em] text-technical-400">Visão de obra</p>
        </div>
      )}
    </div>
  )
}
