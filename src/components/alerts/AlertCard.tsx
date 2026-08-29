import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        {/*
          Densidade reduzida: antes eram até 3 badges, um título em caixa-alta,
          uma descrição e uma grade de 4 colunas com rótulo em cima de cada
          valor. Sobrou o que decide a triagem — severidade, o que foi
          detectado, onde e com que confiança — numa linha só de metadado.
          O resto está na tela de análise, a um clique.
        */}
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          {!pending && <AlertStatusBadge status={alert.status} />}
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-graphite-400">
            <Clock className="h-3 w-3" />
            {formatTime(alert.detectedAt)}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="text-[15px] font-600 leading-tight text-navy-900">{alert.title}</h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-graphite-500">{alert.description}</p>
        </div>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-graphite-500">
          <span className="font-mono text-graphite-700">{alert.cameraCode}</span>
          <span className="text-graphite-300">·</span>
          <span className="truncate" title={alert.locationLabel}>
            {alert.locationLabel}
          </span>
          <span className="text-graphite-300">·</span>
          <span
            className={cn(
              'font-mono tabular-nums',
              alert.confidence >= 90 ? 'text-status-critical' : 'text-graphite-700',
            )}
          >
            {alert.confidence.toFixed(0)}% conf.
          </span>
        </p>
      </div>

      {/* ação */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-4 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0">
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
