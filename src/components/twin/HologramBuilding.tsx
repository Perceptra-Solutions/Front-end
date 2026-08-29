import * as React from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { cn } from '@/lib/utils'
import { FLOOR_H, GROUND_H, alturaTotal, createBuilding, createContext, createMaterials } from './geometry'

export type TwinPhase = 'plan' | 'tilt' | 'rising' | 'render' | 'complete'

export interface FloorInfo {
  code: string
  index: number
  ncCount: number
  alertCount: number
}

interface Props {
  floors: FloorInfo[]
  /** pavimento destacado por hover na lista lateral (ex.: 'PV-04') */
  highlighted?: string | null
  onPhaseChange?: (phase: TwinPhase, floorsBuilt: number) => void
  className?: string
}

/* ---------------- linha do tempo (segundos) ---------------- */
const T_PLAN = 1.2
const T_TILT = 1.2
const T_PER_FLOOR = 0.3
const T_ROOF = 1.0
const T_RISE_POR_PAVIMENTO = T_PER_FLOOR
const duracaoTotal = (pavimentos: number) => T_PLAN + T_TILT + pavimentos * T_RISE_POR_PAVIMENTO + T_ROOF

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/** céu com gradiente vertical — serve de fundo e de fonte de reflexo */
function createSky() {
  const geo = new THREE.SphereGeometry(400, 32, 16)
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x0d2033) },
      mid: { value: new THREE.Color(0x24506e) },
      bottom: { value: new THREE.Color(0x2a3a45) },
    },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
      void main(){
        float h = normalize(vP).y;
        vec3 c = h > 0.0 ? mix(mid, top, pow(h, 0.55)) : mix(mid, bottom, pow(-h, 0.4));
        gl_FragColor = vec4(c, 1.0);
      }`,
  })
  return new THREE.Mesh(geo, mat)
}

/**
 * Maquete 3D do Bloco A renderizada em WebGL (three.js).
 *
 * A estrutura sobe pavimento a pavimento a partir da fundação e, quando fecha
 * a cobertura, o modelo fica livre para girar acompanhando o mouse.
 * Os pavimentos com não conformidade aberta acendem em vermelho no concreto.
 */
export function HologramBuilding({ floors, highlighted, onPhaseChange, className }: Props) {
  // A altura do prédio e a duração da animação seguem os pavimentos REAIS
  // cadastrados na obra — antes eram 12 fixos, um edifício que não existia.
  const totalPavimentos = floors.length
  const T_RISE = totalPavimentos * T_RISE_POR_PAVIMENTO
  const T_TOTAL = duracaoTotal(totalPavimentos)
  const TOTAL_H = alturaTotal(totalPavimentos)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  const [phase, setPhase] = React.useState<TwinPhase>('plan')
  const [built, setBuilt] = React.useState(0)
  const [locked, setLocked] = React.useState(false)
  const [runId, setRunId] = React.useState(0)
  const [supported, setSupported] = React.useState(true)

  const startRef = React.useRef(performance.now())
  const camRef = React.useRef({ yaw: 0.6, pitch: 1.2, radius: 105, target: 0.45 })
  const targetRef = React.useRef({ yaw: 0.6, pitch: 1.2, radius: 105 })
  const pointerRef = React.useRef({ inside: false, autoYaw: 0.6 })
  const lockedRef = React.useRef(false)
  const phaseRef = React.useRef<TwinPhase>('plan')
  const floorsRef = React.useRef<FloorInfo[]>(floors)
  const highlightRef = React.useRef<string | null>(null)

  lockedRef.current = locked
  floorsRef.current = floors
  highlightRef.current = highlighted ?? null

  const replay = React.useCallback(() => {
    startRef.current = performance.now()
    setRunId((r) => r + 1)
    setPhase('plan')
    setBuilt(0)
    phaseRef.current = 'plan'
  }, [])

  React.useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    } catch {
      setSupported(false)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(wrap.clientWidth, wrap.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.style.display = 'block'
    wrap.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.add(createSky())
    scene.fog = new THREE.Fog(0x24404f, 190, 520)

    // reflexo de ambiente: é o que faz o vidro parecer vidro
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture

    const camera = new THREE.PerspectiveCamera(38, wrap.clientWidth / wrap.clientHeight, 0.5, 900)

    /* --- luz --- */
    const sun = new THREE.DirectionalLight(0xffeacd, 2.45)
    sun.position.set(-46, 68, 40)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 10
    sun.shadow.camera.far = 220
    sun.shadow.camera.left = -70
    sun.shadow.camera.right = 70
    sun.shadow.camera.top = 90
    sun.shadow.camera.bottom = -20
    sun.shadow.bias = -0.0009
    sun.shadow.normalBias = 0.03
    scene.add(sun)
    scene.add(new THREE.HemisphereLight(0xa6c6e2, 0x1b2126, 0.85))
    scene.add(new THREE.AmbientLight(0xffffff, 0.12))

    /* --- modelo --- */
    const mats = createMaterials()
    const building = createBuilding(mats, totalPavimentos)
    const context = createContext(mats)
    scene.add(context)
    scene.add(building.root)

    // guarda a cor original das faixas para poder realçar as com NC
    const baseBandColor = new THREE.Color(0xd2d4d2)

    let raf = 0
    const onResize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(wrap)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) startRef.current = performance.now() - T_TOTAL * 1000

    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000

      /* ---- fase ---- */
      let nextPhase: TwinPhase = 'plan'
      let floorsBuilt = 0
      let tilt = 0

      if (t < T_PLAN) {
        nextPhase = 'plan'
      } else if (t < T_PLAN + T_TILT) {
        nextPhase = 'tilt'
        tilt = easeInOut((t - T_PLAN) / T_TILT)
      } else if (t < T_PLAN + T_TILT + T_RISE) {
        nextPhase = 'rising'
        tilt = 1
        floorsBuilt = (t - T_PLAN - T_TILT) / T_PER_FLOOR
      } else {
        nextPhase = t < T_TOTAL ? 'render' : 'complete'
        tilt = 1
        floorsBuilt = totalPavimentos + (t - T_PLAN - T_TILT - T_RISE) / T_ROOF
      }

      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase
        setPhase(nextPhase)
      }
      const bi = clamp(Math.floor(floorsBuilt), 0, totalPavimentos)
      setBuilt((p) => (p === bi ? p : bi))

      /* ---- montagem progressiva ---- */
      building.foundation.visible = true
      building.podium.visible = nextPhase !== 'plan'
      const podiumGrow = nextPhase === 'plan' ? 0 : clamp(tilt * 1.4, 0, 1)
      building.podium.scale.y = Math.max(0.001, podiumGrow)

      building.floors.forEach((f, i) => {
        const appear = floorsBuilt - i
        const grow = clamp(appear, 0, 1)
        f.group.visible = grow > 0.001
        f.group.scale.y = Math.max(0.001, easeInOut(grow))

        // pavimento recém-executado brilha e esfria
        const heat = clamp(1 - (appear - 1) * 1.6, 0, 1)
        const info = floorsRef.current.find((x) => x.index === f.index + 1)
        const isHl = !!info && highlightRef.current === info.code
        const hot = !!info && info.ncCount > 0
        const warn = !!info && info.alertCount > 0 && !hot

        if (hot || isHl) {
          f.bandMaterial.color.setHex(isHl ? 0xff8a7a : 0xd8443a)
          f.bandMaterial.emissive.setHex(0x5c1410)
          f.bandMaterial.emissiveIntensity = isHl ? 0.7 : 0.35
        } else if (warn) {
          f.bandMaterial.color.setHex(0xd9a24a)
          f.bandMaterial.emissive.setHex(0x2e1c05)
          f.bandMaterial.emissiveIntensity = 0.18
        } else {
          f.bandMaterial.color.copy(baseBandColor)
          f.bandMaterial.emissive.setHex(0x3fa9e0)
          f.bandMaterial.emissiveIntensity = heat * 0.9
        }
      })

      building.roof.visible = floorsBuilt > totalPavimentos
      const roofGrow = clamp(floorsBuilt - totalPavimentos, 0, 1)
      building.roof.scale.y = Math.max(0.001, easeInOut(roofGrow))
      context.visible = nextPhase !== 'plan'

      /* ---- câmera ---- */
      const cam = camRef.current
      const target = targetRef.current
      const interactive = nextPhase === 'render' || nextPhase === 'complete'

      if (nextPhase === 'plan') {
        cam.yaw = 0.5
        cam.pitch = 1.35
        cam.radius = 78
        cam.target = 0.08
      } else if (nextPhase === 'tilt') {
        cam.yaw = lerp(0.5, 0.85, tilt)
        cam.pitch = lerp(1.35, 0.42, tilt)
        cam.radius = lerp(78, 88, tilt)
        cam.target = lerp(0.08, 0.3, tilt)
      } else if (!interactive) {
        const p = clamp(floorsBuilt / totalPavimentos, 0, 1)
        cam.yaw = 0.85 + p * 0.55
        cam.pitch = lerp(0.42, 0.24, p)
        cam.radius = lerp(88, 118, p)
        cam.target = lerp(0.3, 0.5, p)
        target.yaw = cam.yaw
        target.pitch = cam.pitch
        target.radius = cam.radius
        pointerRef.current.autoYaw = cam.yaw
      } else {
        if (!pointerRef.current.inside && !lockedRef.current) {
          pointerRef.current.autoYaw += 0.0022
          target.yaw = pointerRef.current.autoYaw
          target.pitch = 0.26
        }
        cam.yaw += (target.yaw - cam.yaw) * 0.075
        cam.pitch += (target.pitch - cam.pitch) * 0.075
        cam.radius += (target.radius - cam.radius) * 0.075
        cam.target = lerp(cam.target, 0.5, 0.05)
      }

      const ty = TOTAL_H * cam.target
      camera.position.set(
        Math.cos(cam.pitch) * Math.sin(cam.yaw) * cam.radius,
        ty + Math.sin(cam.pitch) * cam.radius,
        Math.cos(cam.pitch) * Math.cos(cam.yaw) * cam.radius,
      )
      camera.lookAt(0, ty, 0)

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      pmrem.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === wrap) wrap.removeChild(renderer.domElement)
    }
  }, [runId])

  React.useEffect(() => {
    onPhaseChange?.(phase, built)
  }, [phase, built, onPhaseChange])

  /* ---------------- interação ---------------- */
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((phaseRef.current !== 'complete' && phaseRef.current !== 'render') || lockedRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width
    const ny = (e.clientY - rect.top) / rect.height
    pointerRef.current.inside = true
    targetRef.current.yaw = -Math.PI + nx * Math.PI * 2
    targetRef.current.pitch = clamp(0.62 - ny * 0.66, -0.06, 0.7)
    pointerRef.current.autoYaw = targetRef.current.yaw
  }

  const handleLeave = () => {
    pointerRef.current.inside = false
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (phaseRef.current !== 'complete' && phaseRef.current !== 'render') return
    targetRef.current.radius = clamp(targetRef.current.radius + e.deltaY * 0.06, 48, 190)
  }

  const phaseLabel: Record<TwinPhase, string> = {
    plan: 'Locação e fundação',
    tilt: 'Térreo e pilotis executados',
    rising: `Erguendo estrutura · ${String(Math.min(built, totalPavimentos)).padStart(2, '0')}/${totalPavimentos} pavimentos`,
    render: 'Cobertura e acabamento',
    complete: locked ? 'Vista travada' : 'Obra concluída · mova o mouse para girar',
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onWheel={handleWheel}
      className={cn('relative overflow-hidden bg-navy-950', className)}
    >
      {!supported && (
        <div className="flex h-full w-full items-center justify-center px-6 text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-white/60">
            Este navegador não tem WebGL disponível para renderizar a maquete.
          </p>
        </div>
      )}

      {/* cantos de enquadramento */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-white/35" />
        <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-white/35" />
        <span className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-white/35" />
        <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/35" />
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-4">
        <div className="rounded-[2px] bg-navy-950/45 px-2.5 py-1.5 backdrop-blur-[2px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-technical-300/80">
            {totalPavimentos} pavimentos · {TOTAL_H.toFixed(2).replace('.', ',')} m
          </p>
          <p className="mt-1 font-display text-[14px] font-600 uppercase tracking-[0.09em] text-white">
            {phaseLabel[phase]}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-[2px] border border-white/15 bg-navy-950/55 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/75 backdrop-blur-[2px]">
          <span
            className={cn(
              'h-1.5 w-1.5 animate-pulse-live rounded-full',
              phase === 'complete' ? 'bg-status-success' : 'bg-technical-400',
            )}
          />
          {phase === 'complete' ? 'Render ativo · WebGL' : 'Construindo'}
        </span>
      </div>

      {/* controles */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={replay}
          className="rounded-[2px] border border-white/20 bg-navy-950/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/80 backdrop-blur-[2px] transition-colors hover:border-technical-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-technical-400"
        >
          Reconstruir
        </button>
        <button
          onClick={() => setLocked((v) => !v)}
          disabled={phase !== 'complete' && phase !== 'render'}
          className="rounded-[2px] border border-white/20 bg-navy-950/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/80 backdrop-blur-[2px] transition-colors hover:border-technical-400 hover:text-white disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-technical-400"
        >
          {locked ? 'Soltar vista' : 'Travar vista'}
        </button>
      </div>

      {/* legenda */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-1.5">
        {[
          { c: 'bg-[#DCDEDD]', t: 'Concreto executado' },
          { c: 'bg-[#D9A24A]', t: 'Pavimento com alerta' },
          { c: 'bg-[#D8443A]', t: 'Pavimento com NC aberta' },
        ].map((l) => (
          <span
            key={l.t}
            className="flex items-center gap-2 rounded-[2px] bg-navy-950/35 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/70 backdrop-blur-[2px]"
          >
            <span className={cn('h-1.5 w-4 rounded-[1px]', l.c)} />
            {l.t}
          </span>
        ))}
      </div>
    </div>
  )
}

export { FLOOR_H, GROUND_H }
