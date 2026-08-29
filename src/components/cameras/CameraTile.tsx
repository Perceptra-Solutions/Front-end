import { CameraOff, Wrench } from 'lucide-react'
import { DetectionFrame } from './DetectionFrame'
import { StatusDot } from '@/components/shared/StatusBadge'
import { cn, timeAgo } from '@/lib/utils'
import type { Alert, Camera } from '@/types'

interface CameraTileProps {
  camera: Camera
  lastAlert?: Alert
  onOpen: (camera: Camera) => void
  className?: string
}

const DEMO_NOW = new Date('2026-08-28T17:42:00')

/** Miniatura do mural de monitoramento. */
export function CameraTile({ camera, lastAlert, onOpen, className }: CameraTileProps) {
  const offline = camera.status !== 'online'

  return (
    <button
      onClick={() => onOpen(camera)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-md border border-border bg-card text-left shadow-panel transition-all hover:border-technical-400 hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {offline ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-navy-950 blueprint-grid-dark">
            {camera.status === 'maintenance' ? (
              <Wrench className="h-6 w-6 text-status-warning" />
            ) : (
              <CameraOff className="h-6 w-6 text-status-critical" />
            )}
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/45">
              {camera.status === 'maintenance' ? 'Em manutenção' : 'Sem sinal'}
            </span>
          </div>
        ) : (
          <DetectionFrame
            variant={camera.sceneVariant}
            boxes={lastAlert?.boxes.slice(0, 2)}
            cameraCode={camera.code}
            locationLabel={camera.locationLabel}
            timestamp={camera.lastDetectionAt}
            live
            compact
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}

        {camera.alertsToday > 0 && !offline && (
          <span className="absolute right-2 top-2 flex h-5 min-w-5 animate-pulse-alert items-center justify-center rounded-full bg-status-critical px-1.5 font-mono text-[10px] font-600 text-white">
            {camera.alertsToday}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-display text-[13px] font-600 uppercase tracking-[0.03em] text-navy-900">
            {camera.code} <span className="text-graphite-400">· {camera.name}</span>
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-graphite-400">
            {camera.blockCode} · {camera.locationCode} · {camera.resolution}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <StatusDot tone={camera.status} />
          <p className="mt-0.5 font-mono text-[10px] text-graphite-300">
            {offline ? 'sem detecção' : timeAgo(camera.lastDetectionAt, DEMO_NOW)}
          </p>
        </div>
      </div>
    </button>
  )
}
