import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ActionStatus, AlertStatus, NonConformityStatus, Severity } from '@/types'

const severityMap: Record<Severity, { label: string; variant: 'critical' | 'warning' | 'info' }> = {
  critical: { label: 'Crítico', variant: 'critical' },
  warning: { label: 'Atenção', variant: 'warning' },
  info: { label: 'Informativo', variant: 'info' },
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const cfg = severityMap[severity]
  return (
    <Badge variant={cfg.variant} className={className}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          severity === 'critical' && 'bg-status-critical animate-pulse-live',
          severity === 'warning' && 'bg-status-warning',
          severity === 'info' && 'bg-status-info',
        )}
      />
      {cfg.label}
    </Badge>
  )
}

const ncStatusMap: Record<NonConformityStatus, { label: string; variant: 'critical' | 'warning' | 'info' | 'success' }> = {
  open: { label: 'Aberta', variant: 'critical' },
  in_progress: { label: 'Em andamento', variant: 'warning' },
  verification: { label: 'Em verificação', variant: 'info' },
  resolved: { label: 'Resolvida', variant: 'success' },
}

export function NCStatusBadge({ status, className }: { status: NonConformityStatus; className?: string }) {
  const cfg = ncStatusMap[status]
  return (
    <Badge variant={cfg.variant} className={className}>
      {cfg.label}
    </Badge>
  )
}

const actionStatusMap: Record<ActionStatus, { label: string; variant: 'default' | 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Pendente', variant: 'default' },
  in_progress: { label: 'Em execução', variant: 'warning' },
  verification: { label: 'Aguardando verificação', variant: 'info' },
  done: { label: 'Concluída', variant: 'success' },
}

export function ActionStatusBadge({ status, className }: { status: ActionStatus; className?: string }) {
  const cfg = actionStatusMap[status]
  return (
    <Badge variant={cfg.variant} className={className}>
      {cfg.label}
    </Badge>
  )
}

const alertStatusMap: Record<AlertStatus, { label: string; variant: 'info' | 'success' | 'outline' }> = {
  pending: { label: 'Aguardando triagem', variant: 'info' },
  confirmed: { label: 'Confirmada', variant: 'success' },
  dismissed: { label: 'Falso positivo', variant: 'outline' },
}

export function AlertStatusBadge({ status, className }: { status: AlertStatus; className?: string }) {
  const cfg = alertStatusMap[status]
  return (
    <Badge variant={cfg.variant} className={className}>
      {cfg.label}
    </Badge>
  )
}

/** Ponto de status operacional: online / offline / manutenção. */
export function StatusDot({ tone, label }: { tone: 'online' | 'offline' | 'maintenance'; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em]">
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'online' && 'bg-status-success animate-pulse-live',
          tone === 'offline' && 'bg-status-critical',
          tone === 'maintenance' && 'bg-status-warning',
        )}
      />
      <span
        className={cn(
          tone === 'online' && 'text-status-success',
          tone === 'offline' && 'text-status-critical',
          tone === 'maintenance' && 'text-status-warning',
        )}
      >
        {label ?? (tone === 'online' ? 'Online' : tone === 'offline' ? 'Offline' : 'Manutenção')}
      </span>
    </span>
  )
}
