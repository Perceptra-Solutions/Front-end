import * as React from 'react'
import { alerts as seedAlerts } from '@/data/alerts'
import { nonConformities as seedNCs } from '@/data/nonConformities'
import { actionPlans as seedPlans } from '@/data/actionPlans'
import { evidences as seedEvidences } from '@/data/evidence'
import { cameras } from '@/data/cameras'
import { currentWork } from '@/data/works'
import type { ActionPlan, Alert, Evidence, NonConformity, Severity } from '@/types'

/**
 * Estado vivo da operação: a triagem do engenheiro, a abertura da NC,
 * o plano de ação e a verificação acontecem sobre estes dados.
 */

interface ConfirmAlertInput {
  severity: Severity
  responsible: string
  deadline: string
  note?: string
}

interface CreatePlanInput {
  title: string
  description: string
  rootCause: string
  executor: string
  deadline: string
  cost: number
}

interface AppStoreValue {
  alerts: Alert[]
  nonConformities: NonConformity[]
  actionPlans: ActionPlan[]
  evidences: Evidence[]
  confirmAlert: (alertId: string, input: ConfirmAlertInput) => NonConformity | undefined
  dismissAlert: (alertId: string, reason: string) => void
  createActionPlan: (ncId: string, input: CreatePlanInput) => ActionPlan | undefined
  attachEvidence: (planId: string, title: string) => void
  sendToVerification: (planId: string) => void
  approveVerification: (planId: string, note: string) => void
  rejectVerification: (planId: string, note: string) => void
  resetDemo: () => void
  kpis: {
    compliance: number
    complianceDelta: number
    activeAlerts: number
    criticalAlerts: number
    openNCs: number
    dueToday: number
    camerasOnline: number
    camerasTotal: number
  }
}

const AppStoreContext = React.createContext<AppStoreValue | null>(null)

const pad = (n: number, size = 5) => String(n).padStart(size, '0')
const nowIso = () => new Date().toISOString().slice(0, 19)
const hhmm = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const ddmm = () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = React.useState<Alert[]>(seedAlerts)
  const [nonConformities, setNonConformities] = React.useState<NonConformity[]>(seedNCs)
  const [actionPlans, setActionPlans] = React.useState<ActionPlan[]>(seedPlans)
  const [evidences, setEvidences] = React.useState<Evidence[]>(seedEvidences)
  const seq = React.useRef({ nc: 127, pa: 91, ev: 231 })

  const confirmAlert: AppStoreValue['confirmAlert'] = (alertId, input) => {
    const alert = alerts.find((a) => a.id === alertId)
    if (!alert) return undefined

    seq.current.nc += 1
    const code = `NC-${pad(seq.current.nc)}`
    const nc: NonConformity = {
      id: `nc-${pad(seq.current.nc)}`,
      code,
      title: alert.title,
      description: alert.description,
      blockCode: alert.blockCode,
      locationCode: alert.locationCode,
      locationLabel: alert.locationLabel,
      severity: input.severity,
      status: 'open',
      responsible: input.responsible,
      responsibleRole: 'Responsável designado',
      openedAt: nowIso(),
      deadline: input.deadline,
      origin: 'ai',
      alertId: alert.id,
      standardRef: alert.standardRef,
      standardTitle: alert.detectionClass,
      cost: 0,
    }

    setNonConformities((prev) => [nc, ...prev])
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'confirmed', nonConformityId: nc.id, reviewedBy: 'Marcos Andrade', reviewedAt: nowIso() }
          : a,
      ),
    )

    seq.current.ev += 1
    setEvidences((prev) => [
      {
        id: `ev-${pad(seq.current.ev, 4)}`,
        code: `EV-${pad(seq.current.ev, 4)}`,
        kind: 'camera',
        title: `Frame da detecção · ${alert.title}`,
        capturedAt: alert.detectedAt,
        author: alert.modelCode,
        blockCode: alert.blockCode,
        locationLabel: alert.locationLabel,
        relatedCode: code,
        relatedType: 'NC',
        hash: Math.random().toString(16).slice(2, 10),
        sizeLabel: '1,9 MB',
        sceneVariant: alert.sceneVariant,
      },
      ...prev,
    ])

    return nc
  }

  const dismissAlert: AppStoreValue['dismissAlert'] = (alertId, reason) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'dismissed', reviewedBy: 'Marcos Andrade', reviewedAt: nowIso(), detectionClass: `${a.detectionClass} · descartado: ${reason}` }
          : a,
      ),
    )
  }

  const createActionPlan: AppStoreValue['createActionPlan'] = (ncId, input) => {
    const nc = nonConformities.find((n) => n.id === ncId)
    if (!nc) return undefined

    seq.current.pa += 1
    const plan: ActionPlan = {
      id: `pa-${pad(seq.current.pa, 4)}`,
      code: `PA-${pad(seq.current.pa, 4)}`,
      nonConformityId: nc.id,
      nonConformityCode: nc.code,
      title: input.title,
      description: input.description,
      rootCause: input.rootCause,
      responsible: nc.responsible,
      responsibleRole: nc.responsibleRole,
      executor: input.executor,
      priority: nc.severity === 'critical' ? 'critical' : nc.severity === 'warning' ? 'high' : 'medium',
      status: 'in_progress',
      createdAt: nowIso(),
      deadline: input.deadline,
      cost: input.cost,
      progress: 15,
      evidenceIds: [],
      timeline: [
        { time: hhmm(), date: ddmm(), label: `${nc.code} criada`, detail: `Severidade ${nc.severity} · prazo ${nc.deadline}`, author: 'Sistema', kind: 'system' },
        { time: hhmm(), date: ddmm(), label: 'Responsável designado', detail: `${nc.responsible} · execução ${input.executor}`, author: 'Marcos Andrade', kind: 'engineer' },
      ],
    }

    setActionPlans((prev) => [plan, ...prev])
    setNonConformities((prev) =>
      prev.map((n) => (n.id === ncId ? { ...n, status: 'in_progress', actionPlanId: plan.id, cost: input.cost } : n)),
    )
    return plan
  }

  const attachEvidence: AppStoreValue['attachEvidence'] = (planId, title) => {
    const plan = actionPlans.find((p) => p.id === planId)
    if (!plan) return
    seq.current.ev += 1
    const ev: Evidence = {
      id: `ev-${pad(seq.current.ev, 4)}`,
      code: `EV-${pad(seq.current.ev, 4)}`,
      kind: 'photo',
      title,
      capturedAt: nowIso(),
      author: plan.executor,
      blockCode: '—',
      locationLabel: plan.title,
      relatedCode: plan.code,
      relatedType: 'PA',
      hash: Math.random().toString(16).slice(2, 10),
      sizeLabel: '2,6 MB',
      sceneVariant: 'slab',
    }
    setEvidences((prev) => [ev, ...prev])
    setActionPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              evidenceIds: [...p.evidenceIds, ev.id],
              progress: Math.max(p.progress, 80),
              timeline: [...p.timeline, { time: hhmm(), date: ddmm(), label: 'Evidência enviada', detail: title, author: p.executor, kind: 'field' }],
            }
          : p,
      ),
    )
  }

  const sendToVerification: AppStoreValue['sendToVerification'] = (planId) => {
    setActionPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              status: 'verification',
              progress: 100,
              timeline: [...p.timeline, { time: hhmm(), date: ddmm(), label: 'Aguardando verificação', detail: 'Encaminhado ao engenheiro verificador', author: 'Sistema', kind: 'system' }],
            }
          : p,
      ),
    )
    const plan = actionPlans.find((p) => p.id === planId)
    if (plan) {
      setNonConformities((prev) => prev.map((n) => (n.id === plan.nonConformityId ? { ...n, status: 'verification' } : n)))
    }
  }

  const approveVerification: AppStoreValue['approveVerification'] = (planId, note) => {
    const plan = actionPlans.find((p) => p.id === planId)
    setActionPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              status: 'done',
              verifiedBy: 'Juliana Prado',
              verificationNote: note,
              timeline: [...p.timeline, { time: hhmm(), date: ddmm(), label: 'Verificação aprovada', detail: note, author: 'Juliana Prado', kind: 'engineer' }],
            }
          : p,
      ),
    )
    if (plan) {
      setNonConformities((prev) =>
        prev.map((n) => (n.id === plan.nonConformityId ? { ...n, status: 'resolved', closedAt: nowIso() } : n)),
      )
    }
  }

  const rejectVerification: AppStoreValue['rejectVerification'] = (planId, note) => {
    const plan = actionPlans.find((p) => p.id === planId)
    setActionPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              status: 'in_progress',
              progress: 55,
              timeline: [...p.timeline, { time: hhmm(), date: ddmm(), label: 'Verificação reprovada', detail: note, author: 'Juliana Prado', kind: 'engineer' }],
            }
          : p,
      ),
    )
    if (plan) {
      setNonConformities((prev) => prev.map((n) => (n.id === plan.nonConformityId ? { ...n, status: 'in_progress' } : n)))
    }
  }

  const resetDemo = () => {
    setAlerts(seedAlerts)
    setNonConformities(seedNCs)
    setActionPlans(seedPlans)
    setEvidences(seedEvidences)
    seq.current = { nc: 127, pa: 91, ev: 231 }
  }

  const kpis = React.useMemo(() => {
    const active = alerts.filter((a) => a.status === 'pending')
    const open = nonConformities.filter((n) => n.status !== 'resolved')
    return {
      compliance: currentWork.compliance,
      complianceDelta: 3.4,
      activeAlerts: active.length,
      criticalAlerts: active.filter((a) => a.severity === 'critical').length,
      openNCs: open.length,
      dueToday: open.filter((n) => n.deadline <= '2026-08-29').length,
      camerasOnline: cameras.filter((c) => c.status === 'online').length,
      camerasTotal: cameras.length,
    }
  }, [alerts, nonConformities])

  const value: AppStoreValue = {
    alerts,
    nonConformities,
    actionPlans,
    evidences,
    confirmAlert,
    dismissAlert,
    createActionPlan,
    attachEvidence,
    sendToVerification,
    approveVerification,
    rejectVerification,
    resetDemo,
    kpis,
  }

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = React.useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore precisa estar dentro de AppStoreProvider')
  return ctx
}
