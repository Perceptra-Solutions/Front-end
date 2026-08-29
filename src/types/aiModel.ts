export interface AIModel {
  id: string
  code: string
  name: string
  version: string
  purpose: string
  precision: number
  recall: number
  f1: number
  threshold: number
  status: 'active' | 'training' | 'deprecated'
  publishedAt: string
  detectionsToday: number
  confirmedRate: number
  falsePositiveRate: number
  classes: string[]
  cameras: number
  latencyMs: number
}
