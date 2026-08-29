/**
 * Converte as respostas da API (nomes em português, formato do backend) para
 * os tipos que as telas já usam (`Alert`, `NonConformity`, `ActionPlan`,
 * `Evidence`). Existe para não reescrever ~15 componentes visuais de uma vez —
 * eles continuam recebendo exatamente a forma que já esperavam.
 *
 * Nem todo campo desses tipos tem contrapartida real no backend (a UI foi
 * desenhada antes do schema existir). Onde não há dado real, o valor é
 * derivado de um campo real por heurística (documentado campo a campo) ou
 * fica com um rótulo neutro — nunca um nome/numero inventado do zero.
 */
import type { ActionPlan, Alert, Camera, Evidence, NonConformity, TimelineEvent } from '@/types'
import type {
  AcaoCorretivaApi,
  CameraApi,
  DeteccaoApi,
  EventoNcApi,
  EvidenciaApi,
  LocalApi,
  ModeloIaApi,
  NaoConformidadeApi,
  SeveridadeNc,
  StatusNc,
  StatusTriagem,
  UsuarioApi,
} from '@/lib/api/types'
import type { RequisitoNormaApi } from '@/lib/api/cadastros'

export interface Cadastros {
  camerasPorId: Map<string, CameraApi>
  locaisPorId: Map<string, LocalApi>
  modelosPorId: Map<string, ModeloIaApi>
  usuariosPorId: Map<string, UsuarioApi>
  requisitosPorId: Map<string, RequisitoNormaApi>
  /** Preenchido com a própria lista de NCs carregada — usado para resolver reincidência (recurrenceOf). */
  ncCodigoPorId: Map<string, string>
  /** Evidência (IA) da própria detecção, quando existe — 1:1 na prática,
   * mesmo a coluna não sendo unique (ver PersistenciaDeteccaoService no
   * backend). Usado pra trocar a cena 3D decorativa pela foto real. */
  evidenciaPorDeteccaoId: Map<string, EvidenciaApi>
}

export function cadastrosVazios(): Cadastros {
  return {
    camerasPorId: new Map(),
    locaisPorId: new Map(),
    modelosPorId: new Map(),
    usuariosPorId: new Map(),
    requisitosPorId: new Map(),
    ncCodigoPorId: new Map(),
    evidenciaPorDeteccaoId: new Map(),
  }
}

/** Id da ação corretiva vira o "código do plano" (PA-xxxxxxxx) — usado tanto no ActionPlan quanto no relatedCode da evidência, para os dois baterem. */
export const codigoDaAcao = (acaoId: string) => `PA-${acaoId.slice(0, 8).toUpperCase()}`
const codigoDaEvidencia = (evidenciaId: string) => `EV-${evidenciaId.slice(0, 8).toUpperCase()}`

function nomeUsuario(id: string | null | undefined, cad: Cadastros): string {
  if (!id) return '—'
  return cad.usuariosPorId.get(id)?.nome ?? 'Usuário removido'
}

/** Local.nome do seed é um caminho tipo "Torre B / 7 pav / apto 703 / banheiro" — o primeiro segmento é o bloco/torre, o resto vira o rótulo do local. */
function partesDoLocal(localId: string | null | undefined, cad: Cadastros) {
  const local = localId ? cad.locaisPorId.get(localId) : undefined
  if (!local) return { blockCode: '—', locationCode: '—', locationLabel: 'Local não informado' }
  const partes = local.nome.split(' / ')
  return {
    blockCode: partes[0] ?? local.nome,
    locationCode: local.codigo ?? '—',
    locationLabel: local.nome,
  }
}

function mapSeveridadeNc(s: SeveridadeNc): NonConformity['severity'] {
  if (s === 'CRITICA' || s === 'ALTA') return 'critical'
  if (s === 'MEDIA') return 'warning'
  return 'info'
}

/** A detecção (Deteccao) não carrega severidade — só a NC tem esse campo, atribuído pelo engenheiro ao confirmar. Antes disso, deriva-se um indicativo da confiança do modelo (heurística, não é dado real). */
function severidadePelaConfianca(confianca: number): Alert['severity'] {
  if (confianca >= 0.9) return 'critical'
  if (confianca >= 0.8) return 'warning'
  return 'info'
}

const CLASSES_ESTRUTURAIS = new Set(['TRINCA', 'FISSURA', 'INFILTRACAO'])
// SEM_COLETE e SEM_MASCARA vêm do pipeline AWS (Raspberry Pi + epi_model,
// ver ARQUITETURA_AWS.md) — as três primeiras são do seed de demo.
const CLASSES_EPI = new Set(['SEM_CAPACETE', 'SEM_CINTO', 'SEM_LUVA', 'SEM_COLETE', 'SEM_MASCARA'])

function categoriaPelaClasse(classe: string): Alert['category'] {
  if (CLASSES_EPI.has(classe)) return 'epi'
  if (CLASSES_ESTRUTURAIS.has(classe)) return 'structural'
  return 'material'
}

/** Puramente visual (qual cenário 3D o CameraScene desenha) — sem contrapartida no backend, derivado da classe só para não ser sempre o mesmo cenário. */
function cenaPelaClasse(classe: string): Alert['sceneVariant'] {
  if (CLASSES_EPI.has(classe)) return 'yard'
  if (classe === 'INFILTRACAO') return 'basement'
  if (classe === 'FISSURA') return 'facade'
  return 'slab'
}

function mapStatusTriagem(s: StatusTriagem): Alert['status'] {
  if (s === 'PENDENTE') return 'pending'
  if (s === 'CONFIRMADA') return 'confirmed'
  return 'dismissed' // FALSO_POSITIVO ou DUPLICADA
}

export function deteccaoParaAlert(d: DeteccaoApi, cad: Cadastros): Alert {
  const camera = cad.camerasPorId.get(d.cameraId)
  const modelo = cad.modelosPorId.get(d.modeloIaId)
  const severity = severidadePelaConfianca(d.confianca)
  const { blockCode, locationCode, locationLabel } = partesDoLocal(camera?.localId, cad)
  const confidence = d.confianca * 100

  return {
    id: d.id,
    code: d.idExterno ?? d.id.slice(0, 8).toUpperCase(),
    category: categoriaPelaClasse(d.classe),
    severity,
    title: `${d.classe} · ${camera?.identificador ?? 'câmera'}`,
    description: `Detecção do modelo ${modelo?.nome ?? d.modeloIaId} com ${confidence.toFixed(1)}% de confiança.`,
    cameraId: d.cameraId,
    cameraCode: camera?.identificador ?? '—',
    blockCode,
    locationCode,
    locationLabel,
    confidence,
    detectedAt: d.ocorridoEm,
    modelCode: modelo ? `${modelo.nome}-${modelo.versao}` : d.modeloIaId.slice(0, 8),
    modelName: modelo?.nome ?? 'modelo',
    modelVersion: modelo?.versao ?? '—',
    detectionClass: d.classe,
    // A norma só existe depois que a NC é aberta e classificada — antes disso é genuinamente indefinida.
    standardRef: d.naoConformidade ? 'Classificada na NC' : 'A classificar',
    status: mapStatusTriagem(d.statusTriagem),
    boxes: d.bbox
      ? [
          {
            label: d.classe,
            confidence,
            x: d.bbox.x,
            y: d.bbox.y,
            w: d.bbox.w,
            h: d.bbox.h,
            tone: severity,
          },
        ]
      : [],
    sceneVariant: cenaPelaClasse(d.classe),
    evidenciaId: cad.evidenciaPorDeteccaoId.get(d.id)?.id,
    nonConformityId: d.naoConformidade?.id,
    reviewedBy: d.triadoPor ? nomeUsuario(d.triadoPor, cad) : undefined,
    reviewedAt: d.triadoEm ?? undefined,
  }
}

function mapStatusNc(s: StatusNc): NonConformity['status'] {
  if (s === 'ABERTA') return 'open'
  if (s === 'EM_CORRECAO') return 'in_progress'
  if (s === 'AGUARDANDO_VERIFICACAO') return 'verification'
  return 'resolved' // RESOLVIDA. CANCELADA é filtrada antes de chegar aqui — ver naoConformidadesParaLista.
}

export function naoConformidadeParaNC(nc: NaoConformidadeApi, cad: Cadastros): NonConformity {
  const { blockCode, locationCode, locationLabel } = partesDoLocal(nc.localId, cad)
  const requisito = nc.requisitoNormaId ? cad.requisitosPorId.get(nc.requisitoNormaId) : undefined
  const ultimaAcao = nc.acoesCorretivas?.at(-1)
  const custoTotal = nc.acoesCorretivas?.reduce((soma, a) => soma + (a.custo ?? 0), 0)

  return {
    id: nc.id,
    code: nc.codigo,
    title: nc.titulo,
    description: nc.descricao ?? '',
    blockCode,
    locationCode,
    locationLabel,
    severity: mapSeveridadeNc(nc.severidade),
    status: mapStatusNc(nc.status),
    responsible: nomeUsuario(nc.responsavelId, cad),
    responsibleRole: nc.responsavelId
      ? cad.usuariosPorId.get(nc.responsavelId)?.papel === 'GESTOR'
        ? 'Gestor responsável'
        : 'Engenheiro responsável'
      : 'Sem responsável definido',
    openedAt: nc.abertaEm,
    deadline: nc.prazo ?? nc.abertaEm,
    closedAt: nc.fechadaEm ?? undefined,
    origin: nc.origem === 'IA' ? 'ai' : 'manual',
    alertId: nc.deteccaoId ?? undefined,
    standardRef: requisito ? `${requisito.norma} · ${requisito.item}` : 'Não classificada',
    standardTitle: requisito?.descricao ?? 'Aguardando classificação em um requisito da norma.',
    recurrenceOf: nc.reincidenciaDeId ? (cad.ncCodigoPorId.get(nc.reincidenciaDeId) ?? nc.reincidenciaDeId) : undefined,
    cost: custoTotal,
    actionPlanId: ultimaAcao?.id,
  }
}

function statusDaAcao(ncStatus: StatusNc): ActionPlan['status'] {
  if (ncStatus === 'RESOLVIDA') return 'done'
  if (ncStatus === 'AGUARDANDO_VERIFICACAO') return 'verification'
  return 'in_progress' // EM_CORRECAO
}

function progressoDaAcao(ncStatus: StatusNc): number {
  if (ncStatus === 'RESOLVIDA') return 100
  if (ncStatus === 'AGUARDANDO_VERIFICACAO') return 90
  return 40 // EM_CORRECAO
}

function eventoParaTimeline(e: EventoNcApi, cad: Cadastros): TimelineEvent {
  const quando = new Date(e.ocorridoEm)
  return {
    time: quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    date: quando.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    label: e.de ? `${e.de} → ${e.para}` : `Aberta como ${e.para}`,
    detail: e.motivo ?? undefined,
    author: e.atorId ? nomeUsuario(e.atorId, cad) : 'Sistema',
    kind: e.atorId ? 'engineer' : 'system',
  }
}

export function acaoCorretivaParaActionPlan(
  nc: NaoConformidadeApi,
  acao: AcaoCorretivaApi,
  historico: EventoNcApi[],
  cad: Cadastros,
): ActionPlan {
  const aprovada = acao.verificacoes?.find((v) => v.resultado === 'APROVADA')
  const ultimaVerificacao = acao.verificacoes?.at(-1)

  return {
    id: acao.id,
    code: codigoDaAcao(acao.id),
    nonConformityId: nc.id,
    nonConformityCode: nc.codigo,
    title: `Correção · ${nc.titulo}`,
    description: acao.descricao,
    rootCause: acao.causaRaiz ?? 'A definir na análise de causa em campo.',
    responsible: nomeUsuario(nc.responsavelId, cad),
    responsibleRole: 'Responsável pela NC',
    executor: nomeUsuario(acao.executorId, cad),
    priority: nc.severidade === 'CRITICA' ? 'critical' : nc.severidade === 'ALTA' ? 'high' : nc.severidade === 'MEDIA' ? 'medium' : 'low',
    status: statusDaAcao(nc.status),
    createdAt: acao.iniciadaEm,
    deadline: acao.prazo ?? nc.prazo ?? acao.iniciadaEm,
    cost: acao.custo ?? 0,
    progress: progressoDaAcao(nc.status),
    evidenceIds: [],
    timeline: historico.map((e) => eventoParaTimeline(e, cad)),
    verifiedBy: aprovada ? nomeUsuario(aprovada.verificadoPor, cad) : undefined,
    verificationNote: (aprovada ?? ultimaVerificacao)?.parecer ?? undefined,
  }
}

function mapTipoEvidencia(e: EvidenciaApi): Evidence['kind'] {
  if (e.tipo === 'VIDEO') return 'video'
  if (e.tipo === 'DOCUMENTO') return 'document'
  return e.origem === 'IA' ? 'camera' : 'photo'
}

function tamanhoLegivel(bytes: string | null): string {
  if (!bytes) return '—'
  const n = Number(bytes)
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/** Cenário 3D decorativo — deriva do tipo só para variar visualmente enquanto a imagem real carrega. */
function cenaPelaEvidencia(e: EvidenciaApi): Evidence['sceneVariant'] {
  if (e.tipo === 'DOCUMENTO') return 'document'
  if (e.deteccaoId) return 'slab'
  if (e.acaoCorretivaId) return 'facade'
  return 'yard'
}

export function evidenciaParaEvidence(
  e: EvidenciaApi,
  cad: Cadastros,
  contexto: { nc?: NaoConformidadeApi },
): Evidence {
  let relatedCode = '—'
  let relatedType: Evidence['relatedType'] = 'NC'

  if (e.naoConformidadeId) {
    relatedCode = contexto.nc?.codigo ?? cad.ncCodigoPorId.get(e.naoConformidadeId) ?? e.naoConformidadeId.slice(0, 8)
    relatedType = 'NC'
  } else if (e.acaoCorretivaId) {
    relatedCode = codigoDaAcao(e.acaoCorretivaId)
    relatedType = 'PA'
  } else if (e.deteccaoId) {
    relatedCode = e.deteccaoId.slice(0, 8).toUpperCase()
    relatedType = 'ALT'
  }

  return {
    id: e.id,
    code: codigoDaEvidencia(e.id),
    kind: mapTipoEvidencia(e),
    title: contexto.nc ? `Evidência da ${contexto.nc.codigo}` : `Evidência ${relatedCode}`,
    capturedAt: e.capturadoEm,
    author: e.autorId ? nomeUsuario(e.autorId, cad) : 'Câmera (IA)',
    blockCode: contexto.nc ? partesDoLocal(contexto.nc.localId, cad).blockCode : '—',
    locationLabel: contexto.nc ? partesDoLocal(contexto.nc.localId, cad).locationLabel : 'Não vinculado a um local',
    relatedCode,
    relatedType,
    hash: e.hashSha256,
    sizeLabel: tamanhoLegivel(e.tamanhoBytes),
    sceneVariant: cenaPelaEvidencia(e),
  }
}

/**
 * Âncoras na prancha (percentuais) onde as câmeras são desenhadas.
 *
 * O backend NÃO guarda coordenada de câmera — não há latitude/longitude nem
 * posição em planta na tabela `camera`. Então a posição aqui é esquemática:
 * as câmeras reais são distribuídas por estas âncoras, na ordem em que vêm
 * da API. Identificador, status e contagem de detecção são reais; só o ponto
 * no desenho é ilustrativo, e a tela diz isso.
 */
const ANCORAS_PLANTA = [
  { x: 21, y: 20, rotation: 90 },
  { x: 31, y: 44, rotation: 200 },
  { x: 58, y: 20, rotation: 90 },
  { x: 66, y: 46, rotation: 210 },
  { x: 82, y: 18, rotation: 120 },
  { x: 24, y: 66, rotation: 0 },
  { x: 54, y: 58, rotation: 270 },
  { x: 42, y: 82, rotation: 315 },
  { x: 75, y: 74, rotation: 250 },
  { x: 8, y: 78, rotation: 45 },
] as const

const STATUS_CAMERA_UI: Record<CameraApi['status'], Camera['status']> = {
  ATIVA: 'online',
  OFFLINE: 'offline',
  MANUTENCAO: 'maintenance',
}

/**
 * Converte a câmera da API para a forma que `SitePlan` desenha.
 *
 * Recebe `local`/`modelo` já resolvidos em vez do objeto `Cadastros` inteiro:
 * quem chama é a tela do mapa, que não monta esse agregado.
 */
export function cameraParaPlanta(
  c: CameraApi,
  indice: number,
  contexto: { local?: LocalApi; modelo?: ModeloIaApi } = {},
): Camera {
  const { local, modelo } = contexto
  const ancora = ANCORAS_PLANTA[indice % ANCORAS_PLANTA.length]
  const partes = local?.nome.split(' / ') ?? []

  return {
    id: c.id,
    code: c.identificador,
    name: c.identificador,
    blockCode: partes[0] ?? '—',
    locationCode: local?.codigo ?? '—',
    locationLabel: local?.nome ?? 'Sem local vinculado',
    status: STATUS_CAMERA_UI[c.status],
    model: c.fabricante ?? '—',
    // Sem contrapartida no schema — a tela do mapa não exibe nenhum destes.
    resolution: '—',
    fps: 0,
    protocol: c.protocolo,
    ip: '—',
    aiModelCode: modelo ? `${modelo.nome}-${modelo.versao}` : '—',
    lastDetectionAt: c.ultimoHeartbeat ?? '',
    alertsToday: 0,
    uptimeDays: 0,
    plan: { ...ancora },
    sceneVariant: 'yard',
  }
}
