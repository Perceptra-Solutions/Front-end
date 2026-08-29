import { CameraOff, Plus } from 'lucide-react'
import { StatusDot } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import type { CameraApi } from '@/lib/api/types'
import type { ItemFeed } from './useFeedMonitoramento'

const TOM_POR_STATUS = {
  ATIVA: 'online',
  OFFLINE: 'offline',
  MANUTENCAO: 'maintenance',
} as const

interface SlotCameraProps {
  camera: CameraApi
  /** Frame mais recente do feed ao vivo, quando esta é a câmera do pipeline AWS. */
  frame?: ItemFeed
  onOpen?: (camera: CameraApi) => void
}

/**
 * Slot de uma câmera real do banco (diferente do CameraTile, que desenha as
 * câmeras fictícias de demonstração com campos que a API não tem —
 * resolução, fps, uptime, posição na planta).
 *
 * Quando há frame do feed ao vivo, mostra a imagem processada de verdade;
 * senão, o estado vazio — nunca uma cena ilustrativa fingindo ser imagem.
 */
export function SlotCamera({ camera, frame, onOpen }: SlotCameraProps) {
  const online = camera.status === 'ATIVA'
  const alertas = frame?.alertas.length ?? 0

  return (
    <button
      onClick={() => onOpen?.(camera)}
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card text-left shadow-panel transition-all hover:border-technical-400 hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-navy-950">
        {frame ? (
          <>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              src={frame.imagemUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-[2px] bg-navy-950/80 px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-critical" />
              Ao vivo
            </span>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 blueprint-grid-dark">
            <CameraOff className={cn('h-6 w-6', online ? 'text-white/30' : 'text-status-critical')} />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/45">
              {online ? 'Aguardando frame' : 'Sem sinal'}
            </span>
          </div>
        )}

        {alertas > 0 && (
          <span className="absolute right-2 top-2 flex h-5 min-w-5 animate-pulse-alert items-center justify-center rounded-full bg-status-critical px-1.5 font-mono text-[10px] font-600 text-white">
            {alertas}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-display text-[13px] font-600 uppercase tracking-[0.03em] text-navy-900">
            {camera.identificador}
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-graphite-400">
            {camera.fabricante ?? 'Sem fabricante'} · {camera.protocolo}
          </p>
        </div>
        <StatusDot tone={TOM_POR_STATUS[camera.status]} />
      </div>
    </button>
  )
}

/** Slot vazio para cadastrar a próxima câmera. Leva ao cadastro de câmeras. */
export function SlotAdicionarCamera({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-graphite-300 bg-transparent text-graphite-400 transition-colors hover:border-technical-400 hover:text-technical-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current">
        <Plus className="h-4 w-4" />
      </span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em]">Adicionar câmera</span>
    </button>
  )
}
