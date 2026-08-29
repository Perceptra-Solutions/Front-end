import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  /** identificador técnico exibido à direita: OBR-2025-014, PV-04... */
  meta?: { label: string; value: string }[]
  actions?: React.ReactNode
  className?: string
}

/**
 * Cabeçalho padrão das páginas — carimbo de prancha:
 * rótulo do módulo, título da tela e os identificadores técnicos do contexto.
 */
export function PageHeader({ eyebrow, title, description, meta, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('border-b border-border bg-white', className)}>
      <div className="flex flex-wrap items-start justify-between gap-6 px-6 py-5 lg:px-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-3 w-[3px] bg-technical-600" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-technical-600">{eyebrow}</span>
          </div>
          <h1 className="mt-2 font-display text-[25px] font-700 uppercase leading-none tracking-[-0.005em] text-navy-900 lg:text-[28px]">
            {title}
          </h1>
          {description && <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-graphite-500">{description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {meta?.map((m) => (
            <div key={m.label} className="min-w-0">
              <p className="tech-label">{m.label}</p>
              <p className="mt-0.5 font-mono text-[15px] font-500 tabular-nums text-navy-900">{m.value}</p>
            </div>
          ))}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  )
}

/** Faixa de conteúdo com o respiro padrão das páginas. */
export function PageBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-6 lg:px-8', className)} {...props} />
}

/** Título de bloco dentro da página. */
export function SectionTitle({
  children,
  hint,
  className,
}: {
  children: React.ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-4', className)}>
      <h2 className="font-display text-[14px] font-600 uppercase tracking-[0.11em] text-graphite-700">{children}</h2>
      {hint && <span className="tech-label">{hint}</span>}
    </div>
  )
}
