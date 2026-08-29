import { cn } from '@/lib/utils'
import type { Camera } from '@/types'

interface Zone {
  code: string
  label: string
  x: number
  y: number
  w: number
  h: number
  kind: 'building' | 'yard' | 'restricted' | 'support'
  detail?: string
}

/** Setores do canteiro em coordenadas percentuais da prancha. */
export const zones: Zone[] = [
  { code: 'BL-A', label: 'Bloco A', x: 10, y: 12, w: 23, h: 38, kind: 'building', detail: '12 pav · em execução' },
  { code: 'BL-B', label: 'Bloco B', x: 48, y: 12, w: 20, h: 40, kind: 'building', detail: '12 pav · estrutura' },
  { code: 'BL-C', label: 'Bloco C', x: 72, y: 8, w: 20, h: 24, kind: 'building', detail: '8 pav · alvenaria' },
  { code: 'ST-EXT', label: 'Área de materiais', x: 12, y: 60, w: 24, h: 16, kind: 'yard', detail: 'Estocagem coberta e pátio' },
  { code: 'ZR-01', label: 'Área restrita', x: 46, y: 50, w: 16, h: 17, kind: 'restricted', detail: 'Raio de içamento da grua' },
  { code: 'AV-01', label: 'Área de vivência', x: 36, y: 76, w: 12, h: 13, kind: 'support', detail: 'Refeitório e vestiário' },
  { code: 'EST-01', label: 'Estacionamento', x: 66, y: 68, w: 19, h: 17, kind: 'support', detail: 'Veículos de obra' },
  { code: 'PT-01', label: 'Portaria', x: 3, y: 72, w: 11, h: 13, kind: 'support', detail: 'Controle de acesso' },
]

const W = 1000
const H = 620
const px = (v: number) => (v / 100) * W
const py = (v: number) => (v / 100) * H

interface SitePlanProps {
  cameras: Camera[]
  alertCountByCamera: Record<string, number>
  selectedId?: string
  onSelect: (camera: Camera) => void
  className?: string
}

/**
 * Planta baixa simplificada do canteiro, no traço de uma prancha de projeto:
 * eixos, cotas, norte e as câmeras posicionadas com o cone de visão.
 */
export function SitePlan({ cameras, alertCountByCamera, selectedId, onSelect, className }: SitePlanProps) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('h-auto w-full', className)} role="img" aria-label="Planta do canteiro de obras">
      <defs>
        <pattern id="plan-grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#DDE4EC" strokeWidth="0.8" />
        </pattern>
        <pattern id="hatch-restricted" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#C8322B" strokeWidth="2.4" opacity="0.28" />
        </pattern>
        <pattern id="hatch-yard" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#5B6875" strokeWidth="1.8" opacity="0.16" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill="#FBFCFD" />
      <rect width={W} height={H} fill="url(#plan-grid)" />

      {/* limite do terreno */}
      <rect x="18" y="18" width={W - 36} height={H - 36} fill="none" stroke="#9AA7B4" strokeWidth="2" strokeDasharray="14 6 3 6" />

      {/* eixos de projeto */}
      <g stroke="#C3CDD8" strokeWidth="1" strokeDasharray="6 5">
        <path d={`M ${px(40)} 18 V ${H - 18}`} />
        <path d={`M 18 ${py(56)} H ${W - 18}`} />
      </g>
      <g fill="#A9B4BF" fontFamily="JetBrains Mono, monospace" fontSize="11">
        <text x={px(40) + 6} y="34">
          EIXO 04
        </text>
        <text x="26" y={py(56) - 6}>
          EIXO C
        </text>
      </g>

      {/* setores */}
      {zones.map((z) => {
        const x = px(z.x)
        const y = py(z.y)
        const w = px(z.w)
        const h = py(z.h)
        const isBuilding = z.kind === 'building'
        return (
          <g key={z.code}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={
                z.kind === 'restricted'
                  ? 'url(#hatch-restricted)'
                  : z.kind === 'yard'
                    ? 'url(#hatch-yard)'
                    : isBuilding
                      ? '#E7EDF4'
                      : '#F1F4F7'
              }
              stroke={z.kind === 'restricted' ? '#C8322B' : isBuilding ? '#5E7691' : '#B6C1CC'}
              strokeWidth={isBuilding ? 2 : 1.4}
              strokeDasharray={z.kind === 'restricted' ? '8 5' : undefined}
            />
            {/* malha estrutural dos blocos */}
            {isBuilding && (
              <g stroke="#B9C7D6" strokeWidth="1">
                <path d={`M ${x} ${y + h / 3} H ${x + w} M ${x} ${y + (2 * h) / 3} H ${x + w}`} />
                <path d={`M ${x + w / 3} ${y} V ${y + h} M ${x + (2 * w) / 3} ${y} V ${y + h}`} />
              </g>
            )}
            <text
              x={x + 10}
              y={y + 22}
              fontFamily="Space Grotesk, sans-serif"
              fontSize="17"
              fontWeight="600"
              letterSpacing="1.6"
              fill={z.kind === 'restricted' ? '#A8241E' : '#22384F'}
            >
              {z.label.toUpperCase()}
            </text>
            <text x={x + 10} y={y + 38} fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#8794A2" letterSpacing="1">
              {z.code}
            </text>
            {z.detail && isBuilding && (
              <text x={x + 10} y={y + h - 12} fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#A3AEBA">
                {z.detail.toUpperCase()}
              </text>
            )}
          </g>
        )
      })}

      {/* cotas */}
      <g stroke="#9AA7B4" strokeWidth="1" fill="none">
        <path d={`M 18 ${H - 10} H ${W - 18}`} />
        <path d={`M 18 ${H - 16} V ${H - 4} M ${W - 18} ${H - 16} V ${W ? H - 4 : 0}`} />
      </g>
      <text
        x={W / 2}
        y={H - 14}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="10.5"
        fill="#8794A2"
        letterSpacing="1"
      >
        184,60 m
      </text>

      {/* norte */}
      <g transform={`translate(${W - 74} 62)`}>
        <circle r="26" fill="#fff" stroke="#C3CDD8" strokeWidth="1" />
        <path d="M 0 -18 L 7 8 L 0 3 L -7 8 Z" fill="#1567B3" />
        <text y="22" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#5B6875">
          N
        </text>
      </g>

      {/* câmeras */}
      {cameras.map((c) => {
        const cx = px(c.plan.x)
        const cy = py(c.plan.y)
        const alerts = alertCountByCamera[c.id] ?? 0
        const hasAlert = alerts > 0 && c.status === 'online'
        const color = c.status === 'offline' ? '#C8322B' : c.status === 'maintenance' ? '#C97A0E' : hasAlert ? '#C8322B' : '#1567B3'
        const selected = selectedId === c.id

        return (
          <g
            key={c.id}
            transform={`translate(${cx} ${cy})`}
            className="cursor-pointer"
            onClick={() => onSelect(c)}
            role="button"
            aria-label={`Câmera ${c.code} · ${c.locationLabel}`}
          >
            {/* cone de visão */}
            <g transform={`rotate(${c.plan.rotation})`}>
              <path d="M 0 0 L 46 -20 A 50 50 0 0 1 46 20 Z" fill={color} opacity={hasAlert ? 0.2 : 0.12} />
            </g>
            {hasAlert && <circle r="16" fill="#C8322B" opacity="0.18" className="animate-ping" />}
            <circle r="9" fill="#fff" stroke={color} strokeWidth={selected ? 3 : 2} />
            <circle r="3.5" fill={color} />
            <text
              y="-15"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10.5"
              fontWeight="500"
              fill={hasAlert ? '#A8241E' : '#2C3742'}
            >
              {c.code}
            </text>
            {alerts > 0 && (
              <g transform="translate(10 -10)">
                <circle r="7.5" fill="#C8322B" />
                <text textAnchor="middle" y="3" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="600" fill="#fff">
                  {alerts}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
