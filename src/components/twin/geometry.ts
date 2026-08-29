import * as THREE from 'three'

/**
 * Modelo volumétrico do Bloco A em escala real (metros), montado em three.js.
 *
 * Tudo é procedural: laje, faixa de concreto, pele de vidro, montantes,
 * sacadas, empena cega, casa de máquinas e o entorno de escala
 * (calçada, árvores, veículos). Nenhum arquivo externo de modelo.
 */

/* ---------------- dimensões de projeto ---------------- */

export const FLOORS = 12
/** pé-direito estrutural (m) */
export const FLOOR_H = 3.0
/** térreo com pé-direito duplo (m) */
export const GROUND_H = 4.6
export const WIDTH = 26
export const DEPTH = 16
export const TOTAL_H = GROUND_H + FLOORS * FLOOR_H

/* ---------------- materiais ---------------- */

export interface Materials {
  concrete: THREE.MeshStandardMaterial
  concreteDark: THREE.MeshStandardMaterial
  glass: THREE.MeshStandardMaterial
  glassLit: THREE.MeshStandardMaterial
  mullion: THREE.MeshStandardMaterial
  metal: THREE.MeshStandardMaterial
  asphalt: THREE.MeshStandardMaterial
  sidewalk: THREE.MeshStandardMaterial
  foliage: THREE.MeshStandardMaterial
  trunk: THREE.MeshStandardMaterial
  carBody: THREE.MeshStandardMaterial
}

/** Textura procedural de concreto: variação sutil para o material não ficar chapado. */
function concreteTexture(tone = 214) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = `rgb(${tone},${tone - 2},${tone - 6})`
  g.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 14000; i++) {
    const v = (Math.random() - 0.5) * 26
    g.fillStyle = `rgba(${tone + v},${tone + v - 2},${tone + v - 6},0.5)`
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function createMaterials(): Materials {
  const map = concreteTexture()
  map.repeat.set(3, 1)

  return {
    concrete: new THREE.MeshStandardMaterial({ color: 0xd2d4d2, map, roughness: 0.84, metalness: 0.02 }),
    concreteDark: new THREE.MeshStandardMaterial({ color: 0x9aa0a4, map: concreteTexture(168), roughness: 0.88 }),
    // vidro: espelha o ambiente — é o que dá leitura de fachada real
    glass: new THREE.MeshStandardMaterial({
      color: 0x2d4757,
      roughness: 0.06,
      metalness: 0.92,
      envMapIntensity: 1.5,
    }),
    glassLit: new THREE.MeshStandardMaterial({
      color: 0x4a5a5e,
      roughness: 0.18,
      metalness: 0.4,
      emissive: 0xffc978,
      emissiveIntensity: 0.62,
      envMapIntensity: 0.8,
    }),
    mullion: new THREE.MeshStandardMaterial({ color: 0x3a4045, roughness: 0.45, metalness: 0.75 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xb8bec4, roughness: 0.35, metalness: 0.85, envMapIntensity: 1.1 }),
    asphalt: new THREE.MeshStandardMaterial({ color: 0x1b2024, roughness: 0.97 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: 0x63686d, roughness: 0.92 }),
    foliage: new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: 0.95, flatShading: true }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x5b4636, roughness: 0.95 }),
    carBody: new THREE.MeshStandardMaterial({ color: 0xb5bcc4, roughness: 0.35, metalness: 0.6 }),
  }
}

/* ---------------- pavimento ---------------- */

export interface FloorLayer {
  index: number
  code: string
  group: THREE.Group
  /** faixa de concreto — recebe o realce quando o pavimento tem NC */
  band: THREE.Mesh
  bandMaterial: THREE.MeshStandardMaterial
  baseY: number
}

const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** ruído determinístico — a mesma janela acende sempre no mesmo lugar */
function hash(a: number, b: number) {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Um pavimento-tipo: laje, pele de vidro nas quatro faces, montantes e sacada. */
function createFloor(index: number, mats: Materials): FloorLayer {
  const group = new THREE.Group()
  const baseY = GROUND_H + (index - 1) * FLOOR_H
  group.position.y = baseY

  const slabT = 0.55
  const glassH = FLOOR_H - slabT - 0.5

  // laje aparente + peitoril
  const band = box(WIDTH + 0.5, slabT, DEPTH + 0.5, mats.concrete, 0, slabT / 2)
  const bandMaterial = mats.concrete.clone()
  band.material = bandMaterial
  group.add(band)

  // pele de vidro (levemente recuada da laje)
  const inset = 0.35
  const gy = slabT + glassH / 2 + 0.12
  const faces: { w: number; d: number; x: number; z: number; panes: number; horiz: boolean }[] = [
    { w: WIDTH - inset * 2, d: 0.12, x: 0, z: DEPTH / 2 - inset, panes: 9, horiz: true },
    { w: WIDTH - inset * 2, d: 0.12, x: 0, z: -DEPTH / 2 + inset, panes: 9, horiz: true },
    { w: 0.12, d: DEPTH - inset * 2, x: WIDTH / 2 - inset, z: 0, panes: 6, horiz: false },
    { w: 0.12, d: DEPTH - inset * 2, x: -WIDTH / 2 + inset, z: 0, panes: 6, horiz: false },
  ]

  faces.forEach((f, fi) => {
    // pano contínuo de vidro
    group.add(box(f.w, glassH, f.d, mats.glass, f.x, gy, f.z))

    // janelas acesas + montantes
    const len = f.horiz ? f.w : f.d
    for (let k = 0; k < f.panes; k++) {
      const t = (k + 0.5) / f.panes - 0.5
      const px = f.horiz ? t * len : f.x
      const pz = f.horiz ? f.z : t * len

      if (hash(index * 5.1 + k, fi) > 0.74) {
        const litW = f.horiz ? (len / f.panes) * 0.62 : 0.14
        const litD = f.horiz ? 0.14 : (len / f.panes) * 0.62
        const lit = box(litW, glassH * 0.6, litD, mats.glassLit, px, gy, pz)
        lit.castShadow = false
        group.add(lit)
      }

      // montante vertical entre panos
      const t2 = (k + 1) / f.panes - 0.5
      if (k < f.panes - 1) {
        const mx = f.horiz ? t2 * len : f.x
        const mz = f.horiz ? f.z : t2 * len
        const mull = box(f.horiz ? 0.1 : 0.2, glassH, f.horiz ? 0.2 : 0.1, mats.mullion, mx, gy, mz)
        mull.castShadow = false
        group.add(mull)
      }
    }
  })

  // sacada corrida na fachada frontal, com guarda-corpo de vidro
  const balcD = 1.7
  const balc = box(WIDTH * 0.52, 0.28, balcD, mats.concrete, 0, slabT + 0.14, DEPTH / 2 + balcD / 2 - 0.2)
  group.add(balc)
  const rail = box(WIDTH * 0.52, 1.05, 0.06, mats.glass, 0, slabT + 0.28 + 0.52, DEPTH / 2 + balcD - 0.24)
  rail.castShadow = false
  group.add(rail)
  group.add(box(WIDTH * 0.52, 0.07, 0.12, mats.metal, 0, slabT + 0.28 + 1.05, DEPTH / 2 + balcD - 0.24))

  // empena cega lateral (parede de concreto, comum em prédio brasileiro)
  group.add(box(0.3, FLOOR_H, DEPTH * 0.42, mats.concreteDark, -WIDTH / 2 - 0.05, FLOOR_H / 2, -DEPTH * 0.24))

  return {
    index,
    code: `PV-${String(index).padStart(2, '0')}`,
    group,
    band,
    bandMaterial,
    baseY,
  }
}

/* ---------------- edifício completo ---------------- */

export interface BuildingModel {
  root: THREE.Group
  floors: FloorLayer[]
  podium: THREE.Group
  roof: THREE.Group
  foundation: THREE.Group
}

export function createBuilding(mats: Materials): BuildingModel {
  const root = new THREE.Group()

  /* fundação / marcação no terreno — o que aparece na fase de planta */
  const foundation = new THREE.Group()
  const slabBase = box(WIDTH + 3, 0.35, DEPTH + 3, mats.concreteDark, 0, 0.18)
  slabBase.castShadow = false
  foundation.add(slabBase)
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(WIDTH + 3, 0.36, DEPTH + 3)),
    new THREE.LineBasicMaterial({ color: 0x7fbfee, transparent: true, opacity: 0.9 }),
  )
  edge.position.y = 0.18
  foundation.add(edge)
  root.add(foundation)

  /* térreo: pilotis, hall envidraçado e marquise */
  const podium = new THREE.Group()
  const hallH = GROUND_H - 0.9
  podium.add(box(WIDTH - 3, hallH, DEPTH - 3, mats.glass, 0, hallH / 2 + 0.35, 0))
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      podium.add(box(0.85, GROUND_H, 0.85, mats.concrete, sx * (WIDTH / 2 - 0.9), GROUND_H / 2, sz * (DEPTH / 2 - 0.9)))
    }
  }
  podium.add(box(WIDTH * 0.34, 0.35, 3.4, mats.concrete, 0, GROUND_H - 1.4, DEPTH / 2 + 1.4))
  podium.add(box(WIDTH + 1, 0.5, DEPTH + 1, mats.concrete, 0, GROUND_H - 0.25, 0))
  root.add(podium)

  /* pavimentos-tipo */
  const floors: FloorLayer[] = []
  for (let i = 1; i <= FLOORS; i++) {
    const f = createFloor(i, mats)
    floors.push(f)
    root.add(f.group)
  }

  /* cobertura */
  const roof = new THREE.Group()
  const roofY = GROUND_H + FLOORS * FLOOR_H
  roof.add(box(WIDTH + 0.6, 0.4, DEPTH + 0.6, mats.concrete, 0, roofY + 0.2))
  // platibanda
  for (const [w, d, x, z] of [
    [WIDTH + 0.6, 0.25, 0, DEPTH / 2],
    [WIDTH + 0.6, 0.25, 0, -DEPTH / 2],
    [0.25, DEPTH + 0.6, WIDTH / 2, 0],
    [0.25, DEPTH + 0.6, -WIDTH / 2, 0],
  ] as const) {
    roof.add(box(w, 1.1, d, mats.concrete, x, roofY + 0.95, z))
  }
  // casa de máquinas + reservatório
  roof.add(box(7, 3.2, 5, mats.concrete, -4, roofY + 2, -2))
  roof.add(box(4.6, 2.6, 3.4, mats.metal, 5, roofY + 1.7, 1))
  // condensadoras
  for (let i = 0; i < 4; i++) {
    roof.add(box(1.1, 0.8, 0.8, mats.metal, 1.5 + i * 1.6, roofY + 0.8, -5.4))
  }
  // antena
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 6, 8), mats.metal)
  mast.position.set(-4, roofY + 6.6, -2)
  mast.castShadow = true
  roof.add(mast)
  root.add(roof)

  return { root, floors, podium, roof, foundation }
}

/* ---------------- entorno (dá escala ao prédio) ---------------- */

export function createContext(mats: Materials): THREE.Group {
  const g = new THREE.Group()

  // via e calçada
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mats.asphalt)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  g.add(ground)

  const walk = new THREE.Mesh(new THREE.PlaneGeometry(WIDTH + 22, DEPTH + 20), mats.sidewalk)
  walk.rotation.x = -Math.PI / 2
  walk.position.y = 0.02
  walk.receiveShadow = true
  g.add(walk)

  // árvores
  const tree = (x: number, z: number, s: number) => {
    const t = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.6, 6), mats.trunk)
    trunk.position.y = 1.3
    trunk.castShadow = true
    t.add(trunk)
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), mats.foliage)
    crown.position.y = 3.4
    crown.scale.set(1, 0.86, 1)
    crown.castShadow = true
    t.add(crown)
    t.position.set(x, 0, z)
    t.scale.setScalar(s)
    return t
  }
  g.add(tree(-20, 14, 1.1), tree(-13, 17, 0.92), tree(20, 13, 1.05), tree(24, -6, 0.95), tree(-22, -10, 1))

  // veículos (escala humana imediata)
  const car = (x: number, z: number, rot: number, color: number) => {
    const c = new THREE.Group()
    const body = box(4.3, 0.85, 1.85, new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.6 }), 0, 0.62)
    const cab = box(2.2, 0.72, 1.72, new THREE.MeshStandardMaterial({ color: 0x20262b, roughness: 0.2, metalness: 0.5 }), -0.2, 1.34)
    c.add(body, cab)
    for (const wx of [-1.4, 1.45]) {
      for (const wz of [-0.9, 0.9]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12), mats.mullion)
        wheel.rotation.x = Math.PI / 2
        wheel.position.set(wx, 0.34, wz)
        wheel.castShadow = true
        c.add(wheel)
      }
    }
    c.position.set(x, 0, z)
    c.rotation.y = rot
    return c
  }
  g.add(car(-16, 20, 0, 0xc8ccd2), car(9, 21, Math.PI, 0x2f4f74))

  // poste
  const pole = new THREE.Group()
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 8, 8), mats.metal)
  p.position.y = 4
  p.castShadow = true
  pole.add(p)
  const arm = box(1.6, 0.12, 0.12, mats.metal, 0.8, 7.9)
  pole.add(arm)
  pole.position.set(17, 0, 16)
  g.add(pole)

  return g
}
