import type { ActionStatus, Priority } from './common'

export interface TimelineEvent {
  time: string
  date: string
  label: string
  detail?: string
  author: string
  kind: 'system' | 'engineer' | 'field' | 'ai'
}

export interface ActionPlan {
  id: string
  code: string
  nonConformityId: string
  nonConformityCode: string
  title: string
  description: string
  rootCause: string
  responsible: string
  responsibleRole: string
  executor: string
  priority: Priority
  status: ActionStatus
  createdAt: string
  deadline: string
  cost: number
  progress: number
  evidenceIds: string[]
  timeline: TimelineEvent[]
  verifiedBy?: string
  verificationNote?: string
}
