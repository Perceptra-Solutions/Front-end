/** Tipos compartilhados da plataforma PERCEPTRA. */

export type Severity = 'critical' | 'warning' | 'info'

export type AlertStatus = 'pending' | 'confirmed' | 'dismissed'

export type NonConformityStatus = 'open' | 'in_progress' | 'verification' | 'resolved'

export type ActionStatus = 'pending' | 'in_progress' | 'verification' | 'done'

export type Priority = 'critical' | 'high' | 'medium' | 'low'

/** Etapas do ciclo: da detecção da IA até o fechamento pelo engenheiro. */
export type FlowStage = 'detection' | 'triage' | 'nonconformity' | 'action' | 'verification' | 'resolved'

export const FLOW_STAGES: { key: FlowStage; label: string; short: string }[] = [
  { key: 'detection', label: 'Detecção', short: 'DET' },
  { key: 'triage', label: 'Triagem', short: 'TRI' },
  { key: 'nonconformity', label: 'Não conformidade', short: 'NC' },
  { key: 'action', label: 'Plano de ação', short: 'PA' },
  { key: 'verification', label: 'Verificação', short: 'VER' },
  { key: 'resolved', label: 'Resolvida', short: 'OK' },
]

/** Local da obra em nomenclatura de projeto: BLOCO A · PV-04 · SETOR C */
export interface SiteLocation {
  blockCode: string
  blockLabel: string
  floorCode: string
  floorLabel: string
  sector?: string
  coordinates?: string
}
