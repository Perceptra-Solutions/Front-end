export type CameraStatus = 'online' | 'offline' | 'maintenance'

export interface Camera {
  id: string
  code: string
  name: string
  blockCode: string
  locationCode: string
  locationLabel: string
  status: CameraStatus
  model: string
  resolution: string
  fps: number
  protocol: string
  ip: string
  aiModelCode: string
  lastDetectionAt: string
  alertsToday: number
  uptimeDays: number
  /** posição na planta baixa, em % */
  plan: { x: number; y: number; rotation: number }
  sceneVariant: 'slab' | 'facade' | 'yard' | 'shaft' | 'basement'
}
