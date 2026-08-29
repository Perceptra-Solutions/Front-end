import * as React from 'react'
import { ApiError, ApiIndisponivelError, garantirUsuario, usuarioDemo, type UsuarioAutenticado } from '@/lib/api/client'
import {
  listarCameras,
  listarLocais,
  listarModelosIa,
  listarObras,
  listarRequisitosNorma,
  listarUsuarios,
} from '@/lib/api/cadastros'
import { abrirNcDeDeteccao, descartarDeteccao, listarDeteccoes } from '@/lib/api/deteccoes'
import { anexarEvidencia, listarEvidencias } from '@/lib/api/evidencias'
import {
  buscarNaoConformidade,
  concluirAcaoCorretiva,
  criarAcaoCorretiva,
  historicoNaoConformidade,
  listarNaoConformidades,
  registrarVerificacao,
} from '@/lib/api/naoConformidades'
import type { CameraApi, LocalApi, ModeloIaApi, NaoConformidadeApi, ObraApi, SeveridadeNc } from '@/lib/api/types'
import {
  acaoCorretivaParaActionPlan,
  cadastrosVazios,
  deteccaoParaAlert,
  evidenciaParaEvidence,
  naoConformidadeParaNC,
  type Cadastros,
} from '@/lib/adapters'
import { useToast } from '@/store/toast'
import type { ActionPlan, Alert, Evidence, NonConformity, Severity } from '@/types'

/**
 * Estado vivo da operação, agora espelhando o backend real (ver
 * src/lib/api/). Sem tela de login: todo mundo age como o usuário fixo de
 * src/lib/api/client.ts — algumas ações (ex.: aprovar/reprovar verificação)
 * vão genuinamente falhar quando o mesmo usuário é executor e verificador,
 * porque essa regra (segregação de função) é o núcleo do backend. Isso é
 * esperado e é mostrado via toast com o erro real, não escondido.
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
  loading: boolean
  /** null quando a última tentativa de falar com o backend deu certo. */
  erroConexao: string | null
  /**
   * Usuário do token e obra em contexto, vindos do backend. Existem aqui
   * porque Topbar, Dashboard, Mapa, Gêmeo Digital e Perfil liam os mesmos
   * dois objetos de `src/data/` (um "Residencial Horizonte" e um "Marcos
   * Andrade" que não existem no banco).
   *
   * `obraAtual` é a primeira obra retornada: sem seletor de obra na UI e sem
   * vínculo usuário↔obra no backend, não há critério melhor — e é honesto,
   * porque a POC opera uma obra por vez.
   */
  usuario: UsuarioAutenticado | null
  obraAtual: ObraApi | null
  cameras: CameraApi[]
  modelos: ModeloIaApi[]
  locais: LocalApi[]
  alerts: Alert[]
  nonConformities: NonConformity[]
  actionPlans: ActionPlan[]
  evidences: Evidence[]
  confirmAlert: (alertId: string, input: ConfirmAlertInput) => Promise<NonConformity | undefined>
  dismissAlert: (alertId: string, reason: string) => Promise<void>
  createActionPlan: (ncId: string, input: CreatePlanInput) => Promise<ActionPlan | undefined>
  attachEvidence: (planId: string, arquivo: File) => Promise<void>
  sendToVerification: (planId: string) => Promise<void>
  approveVerification: (planId: string, note: string) => Promise<void>
  rejectVerification: (planId: string, note: string) => Promise<void>
  /**
   * Relê tudo do backend. Necessário depois de cadastrar algo que muda o
   * contexto global — a primeira obra, por exemplo: sem isto a topbar
   * continua dizendo "sem obra cadastrada" até um F5.
   */
  recarregarTudo: () => void
  resetDemo: () => void
  kpis: {
    /** NCs encerradas / total (exclui canceladas). Derivado, e o rótulo diz isso. */
    taxaResolucao: number
    ncsVencidas: number
    activeAlerts: number
    criticalAlerts: number
    openNCs: number
    dueToday: number
    camerasOnline: number
    camerasTotal: number
  }
}

const AppStoreContext = React.createContext<AppStoreValue | null>(null)

const SEVERIDADE_POR_UI: Record<Severity, SeveridadeNc> = {
  critical: 'CRITICA',
  warning: 'MEDIA',
  info: 'BAIXA',
}

function mensagemErro(erro: unknown): string {
  if (erro instanceof ApiIndisponivelError) return erro.message
  if (erro instanceof ApiError) return erro.message
  return erro instanceof Error ? erro.message : 'Erro inesperado.'
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const { push } = useToast()
  const [loading, setLoading] = React.useState(true)
  const [erroConexao, setErroConexao] = React.useState<string | null>(null)
  const [alerts, setAlerts] = React.useState<Alert[]>([])
  const [nonConformities, setNonConformities] = React.useState<NonConformity[]>([])
  const [actionPlans, setActionPlans] = React.useState<ActionPlan[]>([])
  const [evidences, setEvidences] = React.useState<Evidence[]>([])
  const [camerasOnline, setCamerasOnline] = React.useState(0)
  const [camerasTotal, setCamerasTotal] = React.useState(0)
  const [usuario, setUsuario] = React.useState<UsuarioAutenticado | null>(null)
  const [obraAtual, setObraAtual] = React.useState<ObraApi | null>(null)
  const [cameras, setCameras] = React.useState<CameraApi[]>([])
  const [modelos, setModelos] = React.useState<ModeloIaApi[]>([])
  const [locais, setLocais] = React.useState<LocalApi[]>([])

  const cadRef = React.useRef<Cadastros>(cadastrosVazios())
  const ncsApiRef = React.useRef<Map<string, NaoConformidadeApi>>(new Map())

  const carregarTudo = React.useCallback(async () => {
    setLoading(true)
    try {
      // Antes de tudo: sem isto, num carregamento com token já em cache o
      // `usuarioDemo()` fica null e as ações que dependem do ator (criar
      // plano, abrir NC) falham em silêncio. Ver garantirUsuario().
      setUsuario(await garantirUsuario())

      const [usuarios, cameras, locais, modelos, requisitos, obras] = await Promise.all([
        listarUsuarios(),
        listarCameras(),
        listarLocais(),
        listarModelosIa(),
        listarRequisitosNorma(),
        listarObras(),
      ])

      setObraAtual(obras.itens[0] ?? null)
      setCameras(cameras.itens)
      setModelos(modelos.itens)
      setLocais(locais.itens)

      const cad = cadastrosVazios()
      for (const u of usuarios.itens) cad.usuariosPorId.set(u.id, u)
      for (const c of cameras.itens) cad.camerasPorId.set(c.id, c)
      for (const l of locais.itens) cad.locaisPorId.set(l.id, l)
      for (const m of modelos.itens) cad.modelosPorId.set(m.id, m)
      for (const r of requisitos.itens) cad.requisitosPorId.set(r.id, r)

      setCamerasTotal(cameras.itens.length)
      setCamerasOnline(cameras.itens.filter((c) => c.status === 'ATIVA').length)

      const [deteccoes, ncs, todasEvidencias] = await Promise.all([
        listarDeteccoes({ tamanho: 100 }),
        listarNaoConformidades({ tamanho: 100 }),
        listarEvidencias({ tamanho: 60 }),
      ])

      const ncsAtivas = ncs.itens.filter((nc) => nc.status !== 'CANCELADA')
      for (const nc of ncs.itens) cad.ncCodigoPorId.set(nc.id, nc.codigo)
      // Antes do map de deteccaoParaAlert (abaixo) — é ele que consulta este cadastro.
      for (const e of todasEvidencias.itens) if (e.deteccaoId) cad.evidenciaPorDeteccaoId.set(e.deteccaoId, e)

      const ncsPorId = new Map(ncsAtivas.map((nc) => [nc.id, nc]))
      ncsApiRef.current = ncsPorId
      cadRef.current = cad

      // Ações corretivas só existem em NC que já saiu de ABERTA — evita
      // buscar o dossiê completo (N+1) de toda NC sem plano de ação.
      const comPossivelAcao = ncsAtivas.filter((nc) => nc.status !== 'ABERTA')
      const detalhes = await Promise.all(
        comPossivelAcao.map((nc) => Promise.all([buscarNaoConformidade(nc.id), historicoNaoConformidade(nc.id)])),
      )

      const planos: ActionPlan[] = []
      detalhes.forEach(([detalhe, historico], i) => {
        const nc = comPossivelAcao[i]
        const ultimaAcao = detalhe.acoesCorretivas?.at(-1)
        if (ultimaAcao) planos.push(acaoCorretivaParaActionPlan(nc, ultimaAcao, historico, cad))
      })

      setAlerts(deteccoes.itens.map((d) => deteccaoParaAlert(d, cad)))
      setNonConformities(ncsAtivas.map((nc) => naoConformidadeParaNC(nc, cad)))
      setActionPlans(planos)
      setEvidences(
        todasEvidencias.itens.map((e) =>
          evidenciaParaEvidence(e, cad, { nc: e.naoConformidadeId ? ncsPorId.get(e.naoConformidadeId) : undefined }),
        ),
      )
      setErroConexao(null)
    } catch (erro) {
      setErroConexao(mensagemErro(erro))
      push({ tone: 'warning', title: 'Sem conexão com o backend', description: mensagemErro(erro) })
    } finally {
      setLoading(false)
    }
  }, [push])

  React.useEffect(() => {
    void carregarTudo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Substitui a NC (e o plano, se houver) no estado local sem recarregar tudo. */
  const atualizarNcNoEstado = React.useCallback(async (ncId: string) => {
    const [detalhe, historico] = await Promise.all([buscarNaoConformidade(ncId), historicoNaoConformidade(ncId)])
    ncsApiRef.current.set(ncId, detalhe)
    cadRef.current.ncCodigoPorId.set(ncId, detalhe.codigo)

    const ncAdaptada = naoConformidadeParaNC(detalhe, cadRef.current)
    setNonConformities((prev) => {
      const existe = prev.some((n) => n.id === ncId)
      return existe ? prev.map((n) => (n.id === ncId ? ncAdaptada : n)) : [ncAdaptada, ...prev]
    })

    const ultimaAcao = detalhe.acoesCorretivas?.at(-1)
    if (ultimaAcao) {
      const plano = acaoCorretivaParaActionPlan(detalhe, ultimaAcao, historico, cadRef.current)
      setActionPlans((prev) => {
        const existe = prev.some((p) => p.id === plano.id)
        return existe ? prev.map((p) => (p.id === plano.id ? plano : p)) : [plano, ...prev]
      })
      return { nc: ncAdaptada, plano }
    }
    return { nc: ncAdaptada, plano: undefined }
  }, [])

  const confirmAlert: AppStoreValue['confirmAlert'] = async (alertId, input) => {
    const alert = alerts.find((a) => a.id === alertId)
    if (!alert) return undefined
    const ator = usuarioDemo()

    try {
      await abrirNcDeDeteccao(alertId, {
        titulo: alert.title,
        descricao: alert.description,
        severidade: SEVERIDADE_POR_UI[input.severity],
        responsavelId: ator?.id,
      })

      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, status: 'confirmed', reviewedBy: ator?.nome, reviewedAt: new Date().toISOString() }
            : a,
        ),
      )

      // Recarrega NC + histórico completos para achar a NC recém-criada por deteccaoId.
      const ncs = await listarNaoConformidades({ tamanho: 100 })
      const criada = ncs.itens.find((nc) => nc.deteccaoId === alertId)
      if (!criada) return undefined

      cadRef.current.ncCodigoPorId.set(criada.id, criada.codigo)
      ncsApiRef.current.set(criada.id, criada)
      const ncAdaptada = naoConformidadeParaNC(criada, cadRef.current)
      setNonConformities((prev) => [ncAdaptada, ...prev])
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, nonConformityId: criada.id } : a)))

      push({
        tone: 'success',
        title: `${criada.codigo} aberta`,
        description: `Confirmada por ${ator?.nome ?? 'usuário atual'}.`,
      })
      return ncAdaptada
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível abrir a não conformidade', description: mensagemErro(erro) })
      return undefined
    }
  }

  const dismissAlert: AppStoreValue['dismissAlert'] = async (alertId, _reason) => {
    const ator = usuarioDemo()
    try {
      await descartarDeteccao(alertId, 'FALSO_POSITIVO')
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, status: 'dismissed', reviewedBy: ator?.nome, reviewedAt: new Date().toISOString() }
            : a,
        ),
      )
      push({ tone: 'info', title: 'Registrado como falso positivo', description: 'A detecção entra na base de retreino do modelo.' })
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível descartar a detecção', description: mensagemErro(erro) })
    }
  }

  const createActionPlan: AppStoreValue['createActionPlan'] = async (ncId, input) => {
    const ator = usuarioDemo()
    if (!ator) return undefined
    try {
      // Executor = o próprio usuário fixo: é o que permite "concluir ação"
      // funcionar sem tela de login. A verificação, por segregação de função,
      // vai recusar esse mesmo usuário depois — de propósito, ver comentário no topo.
      await criarAcaoCorretiva(ncId, {
        executorId: ator.id,
        descricao: input.description,
        causaRaiz: input.rootCause,
        prazo: input.deadline || undefined,
        custo: input.cost,
      })
      const { plano } = await atualizarNcNoEstado(ncId)
      if (plano) push({ tone: 'success', title: `${plano.code} criado`, description: `Executor: ${plano.executor}.` })
      return plano
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível criar o plano de ação', description: mensagemErro(erro) })
      return undefined
    }
  }

  const attachEvidence: AppStoreValue['attachEvidence'] = async (planId, arquivo) => {
    const plan = actionPlans.find((p) => p.id === planId)
    if (!plan) return
    try {
      const evidenciaCriada = await anexarEvidencia({ arquivo, acaoCorretivaId: planId })
      const nc = ncsApiRef.current.get(plan.nonConformityId)
      setEvidences((prev) => [evidenciaParaEvidence(evidenciaCriada, cadRef.current, { nc }), ...prev])
      push({ tone: 'info', title: 'Evidência anexada', description: 'Arquivo vinculado ao plano de ação com hash de integridade.' })
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível anexar a evidência', description: mensagemErro(erro) })
    }
  }

  const sendToVerification: AppStoreValue['sendToVerification'] = async (planId) => {
    try {
      await concluirAcaoCorretiva(planId)
      const plan = actionPlans.find((p) => p.id === planId)
      if (plan) await atualizarNcNoEstado(plan.nonConformityId)
      push({ tone: 'info', title: 'Enviado para verificação', description: 'Um segundo engenheiro precisa aprovar o fechamento.' })
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível enviar para verificação', description: mensagemErro(erro) })
    }
  }

  const approveVerification: AppStoreValue['approveVerification'] = async (planId, note) => {
    try {
      await registrarVerificacao(planId, 'APROVADA', note)
      const plan = actionPlans.find((p) => p.id === planId)
      if (plan) await atualizarNcNoEstado(plan.nonConformityId)
      push({ tone: 'success', title: 'Verificação aprovada', description: 'A não conformidade foi encerrada.' })
    } catch (erro) {
      // Aqui é onde a segregação de função aparece de verdade: como não há
      // troca de usuário nesta demo, o executor da ação e quem tenta
      // verificar são a mesma pessoa — e o backend recusa (ver comentário
      // no topo do arquivo). É o comportamento CORRETO, não um bug.
      push({ tone: 'warning', title: 'Verificação recusada pelo backend', description: mensagemErro(erro) })
    }
  }

  const rejectVerification: AppStoreValue['rejectVerification'] = async (planId, note) => {
    try {
      await registrarVerificacao(planId, 'REPROVADA', note)
      const plan = actionPlans.find((p) => p.id === planId)
      if (plan) await atualizarNcNoEstado(plan.nonConformityId)
      push({ tone: 'warning', title: 'Verificação reprovada', description: 'A ação volta para execução em campo.' })
    } catch (erro) {
      push({ tone: 'warning', title: 'Verificação recusada pelo backend', description: mensagemErro(erro) })
    }
  }

  const kpis = React.useMemo(() => {
    const active = alerts.filter((a) => a.status === 'pending')
    const open = nonConformities.filter((n) => n.status !== 'resolved')
    const hoje = new Date().toISOString().slice(0, 10)
    const encerradas = nonConformities.filter((n) => n.status === 'resolved')

    return {
      // Antes era `compliance: 91.8` fixo, com tendência "+3,4%" inventada.
      // Agora é a fração real de NCs encerradas sobre o total carregado.
      taxaResolucao: nonConformities.length > 0 ? (encerradas.length / nonConformities.length) * 100 : 0,
      ncsVencidas: open.filter((n) => n.deadline.slice(0, 10) < hoje).length,
      activeAlerts: active.length,
      criticalAlerts: active.filter((a) => a.severity === 'critical').length,
      openNCs: open.length,
      dueToday: open.filter((n) => n.deadline <= new Date().toISOString().slice(0, 10)).length,
      camerasOnline,
      camerasTotal,
    }
  }, [alerts, nonConformities, camerasOnline, camerasTotal])

  const value: AppStoreValue = {
    loading,
    erroConexao,
    usuario,
    obraAtual,
    cameras,
    modelos,
    locais,
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
    recarregarTudo: () => void carregarTudo(),
    resetDemo: () => void carregarTudo(),
    kpis,
  }

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = React.useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore precisa estar dentro de AppStoreProvider')
  return ctx
}
