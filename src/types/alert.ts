import type { AlertStatus, Severity } from './common'

export type DetectionCategory =
  | 'epi'
  | 'restricted_area'
  | 'material'
  | 'work_at_height'
  | 'electrical'
  | 'structural'
  | 'housekeeping'

export interface BoundingBox {
  /** rótulo do detector: PERSON, HELMET, VEST... */
  label: string
  confidence: number
  /** coordenadas em % do frame */
  x: number
  y: number
  w: number
  h: number
  tone: 'critical' | 'warning' | 'neutral' | 'info'
}

export interface Alert {
  id: string
  code: string
  category: DetectionCategory
  severity: Severity
  title: string
  description: string
  cameraId: string
  cameraCode: string
  blockCode: string
  locationCode: string
  locationLabel: string
  confidence: number
  detectedAt: string
  modelCode: string
  modelName: string
  modelVersion: string
  detectionClass: string
  standardRef: string
  status: AlertStatus
  boxes: BoundingBox[]
  sceneVariant: 'slab' | 'facade' | 'yard' | 'shaft' | 'basement'
  nonConformityId?: string
  reviewedBy?: string
  reviewedAt?: string
}
