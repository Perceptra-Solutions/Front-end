import { cn } from '@/lib/utils'

export type SceneVariant = 'slab' | 'facade' | 'yard' | 'shaft' | 'basement' | 'document'

interface WorkerProps {
  x: number
  y: number
  scale?: number
  vest?: string
  helmet?: string | null
}

/** Silhueta de trabalhador — o colete refletivo é o que a câmera enxerga primeiro. */
function Worker({ x, y, scale = 1, vest = '#D98A2B', helmet = '#E8C35A' }: WorkerProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity="0.94">
      {helmet ? <path d="M -7 -30 a 7 7 0 0 1 14 0 z" fill={helmet} /> : null}
      <circle cx="0" cy="-24" r="6" fill="#0C1B2B" />
      <path d="M -8 -18 h 16 l 2 20 h -20 z" fill={vest} />
      <path d="M -6 2 h 5 l 1 18 h -6 z M 1 2 h 5 l 1 18 h -6 z" fill="#16283C" />
      <path d="M -10 -16 l -4 16 M 10 -16 l 4 16" stroke="#16283C" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  )
}

interface CameraSceneProps {
  variant: SceneVariant
  className?: string
  /** desliga o scanline em miniaturas pequenas */
  compact?: boolean
}

/**
 * Cena sintética do canteiro, usada no lugar do stream real das câmeras.
 * Cada variante representa uma frente de serviço diferente da obra.
 */
export function CameraScene({ variant, className, compact = false }: CameraSceneProps) {
  const uid = variant

  return (
    <svg
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={`Imagem da câmera · ${variant}`}
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12283E" />
          <stop offset="100%" stopColor="#0A1826" />
        </linearGradient>
        <linearGradient id={`floor-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B3049" />
          <stop offset="100%" stopColor="#0D1D2E" />
        </linearGradient>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor="#04101B" stopOpacity="0" />
          <stop offset="100%" stopColor="#04101B" stopOpacity="0.85" />
        </radialGradient>
      </defs>

      <rect width="640" height="360" fill={`url(#sky-${uid})`} />

      {variant === 'slab' && (
        <g>
          <rect y="150" width="640" height="210" fill={`url(#floor-${uid})`} />
          <rect x="0" y="40" width="640" height="22" fill="#1A3049" />
          <rect x="60" y="60" width="34" height="190" fill="#16293E" />
          <rect x="300" y="40" width="42" height="215" fill="#182D44" />
          <rect x="540" y="70" width="30" height="175" fill="#16293E" />
          <g stroke="#274763" strokeWidth="1.2" opacity="0.7" fill="none">
            <path d="M0 200 H640 M0 240 H640 M0 290 H640 M0 340 H640" />
            <path d="M120 150 L60 360 M320 150 L320 360 M520 150 L580 360" />
          </g>
          <rect x="400" y="215" width="150" height="46" fill="#20374F" />
          <g stroke="#2C4B69" strokeWidth="1.4" fill="none">
            <path d="M400 227 H550 M400 240 H550 M400 252 H550" />
          </g>
          <Worker x={205} y={262} scale={1.5} helmet={null} />
          <Worker x={452} y={205} scale={1.05} vest="#C87A2E" />
        </g>
      )}

      {variant === 'facade' && (
        <g>
          <rect x="70" y="0" width="500" height="360" fill="#132639" />
          <g stroke="#1F3B56" strokeWidth="1.5" fill="none">
            <path d="M70 70 H570 M70 150 H570 M70 230 H570 M70 310 H570" />
            <path d="M190 0 V360 M320 0 V360 M450 0 V360" />
          </g>
          <g fill="#0B1B2A">
            <rect x="100" y="90" width="70" height="45" />
            <rect x="230" y="90" width="70" height="45" />
            <rect x="360" y="170" width="70" height="45" />
            <rect x="480" y="250" width="70" height="45" />
          </g>
          <g stroke="#3D6688" strokeWidth="3" opacity="0.9" fill="none">
            <path d="M110 40 V330 M250 40 V330 M390 40 V330 M530 40 V330" />
            <path d="M110 130 H530 M110 210 H530 M110 290 H530" />
          </g>
          <rect x="110" y="198" width="420" height="8" fill="#48708F" />
          <Worker x={300} y={198} scale={1.25} />
        </g>
      )}

      {variant === 'yard' && (
        <g>
          <g fill="#132538">
            <rect x="40" y="80" width="120" height="105" />
            <rect x="180" y="50" width="150" height="135" />
            <rect x="350" y="95" width="110" height="90" />
          </g>
          <rect y="185" width="640" height="175" fill={`url(#floor-${uid})`} />
          <g stroke="#33587A" strokeWidth="4" fill="none">
            <path d="M470 185 V60" />
            <path d="M380 60 H600" />
            <path d="M470 60 L520 32 L600 60" />
            <path d="M545 60 V96" strokeWidth="2" />
          </g>
          <rect x="533" y="96" width="26" height="16" fill="#C87A2E" />
          <g fill="#20374F">
            <rect x="60" y="240" width="130" height="46" />
            <rect x="80" y="222" width="90" height="20" />
            <rect x="330" y="250" width="110" height="38" />
          </g>
          <g stroke="#2C4B69" strokeWidth="1.3" fill="none">
            <path d="M60 252 H190 M60 264 H190 M60 276 H190 M330 262 H440 M330 274 H440" />
          </g>
          <path d="M240 300 H600" stroke="#C97A0E" strokeWidth="3" strokeDasharray="14 10" opacity="0.85" />
          <Worker x={250} y={302} scale={1.35} />
        </g>
      )}

      {variant === 'shaft' && (
        <g>
          <rect width="640" height="360" fill="#101F30" />
          <rect x="180" y="0" width="280" height="360" fill="#0A1727" />
          <g stroke="#22405C" strokeWidth="2" fill="none">
            <path d="M180 0 V360 M460 0 V360" />
            <path d="M180 90 H460 M180 180 H460 M180 270 H460" />
          </g>
          <ellipse cx="120" cy="220" rx="70" ry="90" fill="#17334C" opacity="0.75" />
          <ellipse cx="95" cy="260" rx="42" ry="55" fill="#1D3C57" opacity="0.7" />
          <g stroke="#2A4763" strokeWidth="1.2" opacity="0.6" fill="none">
            <path d="M0 120 H180 M0 200 H180 M0 280 H180" />
          </g>
          <Worker x={530} y={292} scale={1.2} />
        </g>
      )}

      {variant === 'basement' && (
        <g>
          <rect width="640" height="360" fill="#0B1826" />
          <rect y="230" width="640" height="130" fill="#101F31" />
          <g stroke="#1E3A54" strokeWidth="1.6" opacity="0.8" fill="none">
            <path d="M0 230 H640 M0 280 H640 M0 330 H640" />
            <path d="M120 230 L60 360 M330 230 L330 360 M520 230 L580 360" />
          </g>
          <rect x="330" y="98" width="140" height="128" fill="#16293E" stroke="#2E5273" strokeWidth="2" />
          <rect x="470" y="104" width="52" height="116" fill="#122336" stroke="#2E5273" strokeWidth="2" />
          <g fill="#C97A0E" opacity="0.85">
            <rect x="345" y="118" width="110" height="10" />
            <rect x="345" y="136" width="110" height="10" />
          </g>
          <g stroke="#7FBFEE" strokeWidth="1.4" opacity="0.55" fill="none">
            <path d="M350 160 q 20 26 44 4 q 24 -22 46 8" />
            <path d="M350 178 q 26 20 52 0 q 26 -20 44 6" />
          </g>
          <g stroke="#2E5273" strokeWidth="3" fill="none">
            <path d="M120 0 V52 M96 52 H144" />
          </g>
          <ellipse cx="120" cy="60" rx="34" ry="9" fill="#E8C35A" opacity="0.18" />
          <Worker x={150} y={292} scale={1.4} />
        </g>
      )}

      {variant === 'document' && (
        <g>
          <rect width="640" height="360" fill="#152838" />
          <rect x="150" y="30" width="340" height="300" fill="#E9EDF2" />
          <g fill="#B9C4CF">
            <rect x="180" y="96" width="280" height="8" />
            <rect x="180" y="114" width="280" height="8" />
            <rect x="180" y="132" width="230" height="8" />
            <rect x="180" y="172" width="280" height="8" />
            <rect x="180" y="190" width="250" height="8" />
            <rect x="180" y="230" width="120" height="46" />
          </g>
          <rect x="180" y="66" width="90" height="12" fill="#1567B3" />
        </g>
      )}

      <rect width="640" height="360" fill={`url(#vig-${uid})`} />

      {!compact && (
        <g opacity="0.14">
          {Array.from({ length: 45 }).map((_, i) => (
            <rect key={i} y={i * 8} width="640" height="1" fill="#9FD0F5" />
          ))}
        </g>
      )}
    </svg>
  )
}
