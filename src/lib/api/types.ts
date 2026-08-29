/**
 * Formato das respostas do backend (nomes em português, como a API devolve).
 * Só os campos que o front realmente consome — não é o contrato completo.
 */

export type PapelUsuario = 'GESTOR' | 'ENGENHEIRO'
export type StatusTriagem = 'PENDENTE' | 'CONFIRMADA' | 'FALSO_POSITIVO' | 'DUPLICADA'
export type SeveridadeNc = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'
export type StatusNc = 'ABERTA' | 'EM_CORRECAO' | 'AGUARDANDO_VERIFICACAO' | 'RESOLVIDA' | 'CANCELADA'
export type ResultadoVerificacao = 'APROVADA' | 'REPROVADA'
export type StatusCamera = 'ATIVA' | 'OFFLINE' | 'MANUTENCAO'
export type TipoEvidencia = 'FOTO' | 'VIDEO' | 'DOCUMENTO'

export interface PaginaApi<T> {
  itens: T[]
  total: number
  pagina: number
  tamanho: number
  totalPaginas: number
}

export interface UsuarioApi {
  id: string
  nome: string
  email: string
  papel: PapelUsuario
  crea: string | null
  ativo: boolean
}

export interface CameraApi {
  id: string
  obraId: string
  localId: string | null
  modeloIaId: string | null
  identificador: string
  fabricante: string | null
  protocolo: string
  status: StatusCamera
  instaladaEm: string | null
  ultimoHeartbeat: string | null
}

export interface LocalApi {
  id: string
  obraId: string
  tipo: string
  nome: string
  codigo: string | null
}

export interface ModeloIaApi {
  id: string
  nome: string
  versao: string
  tipoDeteccao: string
  limiarConfianca: number
  ativo: boolean
}

export interface DeteccaoApi {
  id: string
  cameraId: string
  obraId: string
  modeloIaId: string
  idExterno: string | null
  classe: string
  confianca: number
  bbox: { x: number; y: number; w: number; h: number } | null
  ocorridoEm: string
  recebidoEm: string
  statusTriagem: StatusTriagem
  triadoPor: string | null
  triadoEm: string | null
  duplicadaDeId: string | null
  naoConformidade?: { id: string; codigo: string; status: StatusNc } | null
}

export interface VerificacaoApi {
  id: string
  acaoCorretivaId: string
  verificadoPor: string
  resultado: ResultadoVerificacao
  parecer: string | null
  verificadoEm: string
}

export interface AcaoCorretivaApi {
  id: string
  naoConformidadeId: string
  executorId: string
  descricao: string
  causaRaiz: string | null
  prazo: string | null
  iniciadaEm: string
  concluidaEm: string | null
  custo: number | null
  concluida?: boolean
  verificacoes?: VerificacaoApi[]
}

export interface NaoConformidadeApi {
  id: string
  obraId: string
  localId: string | null
  deteccaoId: string | null
  requisitoNormaId: string | null
  responsavelId: string | null
  reincidenciaDeId: string | null
  codigo: string
  origem: 'IA' | 'MANUAL'
  titulo: string
  descricao: string | null
  severidade: SeveridadeNc
  status: StatusNc
  prazo: string | null
  abertaEm: string
  fechadaEm: string | null
  atrasada: boolean
  acoesCorretivas?: AcaoCorretivaApi[]
}

export interface EventoNcApi {
  de: string | null
  para: string
  atorId: string | null
  motivo: string | null
  ocorridoEm: string
}

export interface EvidenciaApi {
  id: string
  tipo: TipoEvidencia
  uri: string
  hashSha256: string
  origem: 'IA' | 'MANUAL'
  autorId: string | null
  deteccaoId: string | null
  naoConformidadeId: string | null
  acaoCorretivaId: string | null
  capturadoEm: string
  criadoEm: string
  tamanhoBytes: string | null
  mime: string | null
  urlTemporaria?: string | null
}

export interface ResumoPainelApi {
  obraId: string | null
  ncsAbertasPorSeveridade: { severidade: SeveridadeNc; total: number }[]
  ncsAbertasPorCategoria: { categoria: string; total: number }[]
  ncsComPrazoVencido: number
  tempoMedioFechamentoHoras: number | null
  taxaReincidencia: number
  falsoPositivoPorModelo: {
    modeloId: string
    modeloNome: string
    modeloVersao: string
    totalTriado: number
    falsosPositivos: number
    taxa: number
  }[]
  saudeDaFrota: { total: number; ativas: number; offline: number; manutencao: number }
}
