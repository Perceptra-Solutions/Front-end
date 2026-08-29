import type { NonConformityStatus, Severity } from './common'

export interface NonConformity {
  id: string
  code: string
  title: string
  description: string
  blockCode: string
  locationCode: string
  locationLabel: string
  severity: Severity
  status: NonConformityStatus
  responsible: string
  responsibleRole: string
  openedAt: string
  deadline: string
  closedAt?: string
  origin: 'ai' | 'manual'
  alertId?: string
  standardRef: string
  standardTitle: string
  recurrenceOf?: string
  cost?: number
  actionPlanId?: string
}
