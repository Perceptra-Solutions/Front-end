import * as React from 'react'
import { cn, formatDate, formatTime } from '@/lib/utils'
import type { BoundingBox } from '@/types'
import { CameraScene, type SceneVariant } from './CameraScene'

const toneStyles: Record<BoundingBox['tone'], { border: string; chip: string }> = {
  critical: { border: 'border-[#FF5A4E]', chip: 'bg-[#FF5A4E] text-[#250604]' },
  warning: { border: 'border-[#F2A93B]', chip: 'bg-[#F2A93B] text-[#241703]' },
  info: { border: 'border-[#5FB0F0]', chip: 'bg-[#5FB0F0] text-[#04182B]' },
  neutral: { border: 'border-[#9FB4C6]', chip: 'bg-[#9FB4C6] text-[#0A1826]' },
}

interface DetectionFrameProps {
  variant: SceneVariant
  boxes?: BoundingBox[]
  cameraCode: string
  locationLabel: string
  timestamp: string
  live?: boolean
  scanning?: boolean
  showBoxes?: boolean
  className?: string
  compact?: boolean
}

/**
 * Frame da câmera com a saída do detector desenhada por cima:
 * caixas, rótulo da classe e confiança — como sai de um modelo de visão computacional.
 */
export function DetectionFrame({
  variant,
  boxes = [],
  cameraCode,
  locationLabel,
  timestamp,
  live = false,
  scanning = false,
  showBoxes = true,
  className,
  compact = false,
}: DetectionFrameProps) {
  return (
    <div className={cn('relative overflow-hidden bg-navy-950', className)}>
      <CameraScene variant={variant} compact={compact} />

      {/* malha técnica sobre a imagem */}
      <div className="pointer-events-none absolute inset-0 blueprint-grid-dark opacity-60" />

      {/* cantos de enquadramento */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-2 top-2 h-3.5 w-3.5 border-l border-t border-white/35" />
        <span className="absolute right-2 top-2 h-3.5 w-3.5 border-r border-t border-white/35" />
        <span className="absolute bottom-2 left-2 h-3.5 w-3.5 border-b border-l border-white/35" />
        <span className="absolute bottom-2 right-2 h-3.5 w-3.5 border-b border-r border-white/35" />
      </div>

      {scanning && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 animate-scan-line bg-gradient-to-b from-technical-400/0 via-technical-400/25 to-technical-400/0" />
      )}

      {/* caixas de detecção */}
      {showBoxes &&
        boxes.map((box, i) => {
          const tone = toneStyles[box.tone]
          return (
            <div
              key={`${box.label}-${i}`}
              className={cn('absolute border-[1.5px] transition-all duration-500', tone.border)}
              style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
            >
              {!compact && (
                <span
                  className={cn(
                    'absolute -top-[17px] left-[-1.5px] whitespace-nowrap px-1.5 py-[1px] font-mono text-[9.5px] font-600 leading-[15px] tracking-[0.06em]',
                    tone.chip,
                  )}
                >
                  {box.label} {box.confidence.toFixed(1)}%
                </span>
              )}
            </div>
          )
        })}

      {/* HUD superior */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
        <div className="flex items-center gap-2">
          {live && (
            <span className="flex items-center gap-1.5 rounded-[2px] bg-status-critical px-1.5 py-[3px] font-mono text-[9.5px] font-600 tracking-[0.14em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" />
              LIVE
            </span>
          )}
          <span className="rounded-[2px] bg-navy-950/70 px-1.5 py-[3px] font-mono text-[9.5px] tracking-[0.12em] text-white/90 backdrop-blur-[2px]">
            {cameraCode}
          </span>
        </div>
        {!compact && (
          <span className="rounded-[2px] bg-navy-950/70 px-1.5 py-[3px] font-mono text-[9.5px] tracking-[0.1em] text-white/75 backdrop-blur-[2px]">
            {locationLabel.toUpperCase()}
          </span>
        )}
      </div>

      {/* HUD inferior */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5">
        <span className="font-mono text-[9.5px] tracking-[0.1em] text-white/70">
          {formatDate(timestamp)} {formatTime(timestamp)}
        </span>
        {!compact && (
          <span className="font-mono text-[9.5px] tracking-[0.1em] text-white/45">
            {boxes.length > 0 ? `${boxes.length} OBJ · H.265` : 'H.265 · 25 FPS'}
          </span>
        )}
      </div>
    </div>
  )
}

export default React.memo(DetectionFrame)
