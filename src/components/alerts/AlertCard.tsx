import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SeverityBadge, AlertStatusBadge } from '@/components/shared/StatusBadge'
import { EvidenciaImage } from '@/components/shared/EvidenciaImage'
import { DetectionFrame } from '@/components/cameras/DetectionFrame'
import { cn, formatTime } from '@/lib/utils'
import type { Alert } from '@/types'

const categoryLabel: Record<Alert['category'], string> = {
  epi: 'EPI',
  restricted_area: 'Área restrita',
  material: 'Material',
  work_at_height: 'Trabalho em altura',
  electrical: 'Elétrica',
  structural: 'Estrutural',
  housekeeping: 'Organização',
}

interface AlertCardProps {
  alert: Alert
  className?: string
}

/**
 * Cartão de ocorrência da central de alertas.
 * A faixa lateral e o pulso indicam a severidade sem depender só da cor do texto.
 */
export function AlertCard({ alert, className }: AlertCardProps) {
  const pending = alert.status === 'pending'

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-panel transition-all hover:border-technical-300 hover:shadow-raised sm:flex-row',
        alert.severity === 'critical' && pending && 'border-status-critical/35',
        className,
      )}
    >
      {/* faixa de severidade */}
      <span
        className={cn(
          'h-1 w-full shrink-0 sm:h-auto sm:w-1',
          alert.severity === 'critical' && 'bg-status-critical',
          alert.severity === 'warning' && 'bg-status-warning',
          alert.severity === 'info' && 'bg-status-info',
        )}
      />

      {/* frame da detecção — foto real quando existe (pipeline AWS), senão a cena 3D decorativa */}
      <div className="relative w-full shrink-0 sm:w-[188px]">
        {alert.evidenciaId ? (
          <EvidenciaImage
            evidenciaId={alert.evidenciaId}
            fallbackVariant={alert.sceneVariant}
            compact
            className="h-[128px] w-full sm:h-full"
          />
        ) : (
          <DetectionFrame
            variant={alert.sceneVariant}
            boxes={alert.boxes.slice(0, 2)}
            cameraCode={alert.cameraCode}
            locationLabel={alert.locationLabel}
            timestamp={alert.detectedAt}
            compact
            className="h-[128px] w-full sm:h-full"
          />
        )}
      </div>

      {/* conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <Badge variant="outline">{categoryLabel[alert.category]}</Badge>
          {!pending && <AlertStatusBadge status={alert.status} />}
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-graphite-400">
            <Clock className="h-3 w-3" />
            {formatTime(alert.detectedAt)}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="font-display text-[17px] font-600 uppercase leading-tight tracking-[0em] text-navy-900">
            {alert.title}
          </h3>
          <p className="mt-1 text-[13.5px] leading-snug text-graphite-500">{alert.description}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-3 sm:grid-cols-4">
          <div>
            <dt className="tech-label">Câmera</dt>
            <dd className="tech-value text-[13px]">{alert.cameraCode}</dd>
          </div>
          <div>
            <dt className="tech-label">Local</dt>
            <dd className="tech-value text-[13px]">{alert.locationCode}</dd>
          </div>
          <div>
            <dt className="tech-label">Confiança IA</dt>
            <dd
              className={cn(
                'tech-value text-[13px]',
                alert.confidence >= 90 ? 'text-status-critical' : 'text-graphite-900',
              )}
            >
              {alert.confidence.toFixed(1).replace('.', ',')}%
            </dd>
          </div>
          <div>
            <dt className="tech-label">Norma</dt>
            <dd className="tech-value text-[13px]">{alert.standardRef}</dd>
          </div>
        </dl>
      </div>

      {/* ação */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-4 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-graphite-300">{alert.code}</span>
        <Button asChild variant={alert.severity === 'critical' && pending ? 'destructive' : 'default'} size="sm">
          <Link to={`/alerts/${alert.id}`}>
            {pending ? 'Analisar' : 'Ver análise'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export { categoryLabel }
