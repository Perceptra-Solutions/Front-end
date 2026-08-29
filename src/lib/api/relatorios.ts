import { apiGet, apiPost } from './client'
import type { IntegridadeApi, PaginaApi, RelatorioApi, SeveridadeNc, StatusNc, TipoRelatorio } from './types'

/**
 * Relatórios PBQP-H (`Backend/src/relatorios/`).
 *
 * O relatório é um **snapshot**: as NCs que atendem aos filtros no momento
 * da geração viram itens ordenados e o arquivo gerado é hasheado. Emitir de
 * novo não altera um relatório já emitido — é essa imutabilidade que o torna
 * utilizável numa auditoria.
 */

export interface GerarRelatorioInput {
  obraId: string
  tipo: TipoRelatorio
  titulo?: string
  /** AAAA-MM-DD. Obrigatórios quando `tipo === 'PERIODICO'`. */
  periodoInicio?: string
  periodoFim?: string
  severidades?: SeveridadeNc[]
  statuses?: StatusNc[]
}

/** Só GESTOR emite — quem assina o documento que vai para a auditoria. */
export function gerarRelatorio(input: GerarRelatorioInput) {
  return apiPost<RelatorioApi>('/relatorios', input)
}

export function listarRelatorios(
  filtro: { obraId?: string; tipo?: TipoRelatorio; tamanho?: number } = {},
  signal?: AbortSignal,
) {
  return apiGet<PaginaApi<RelatorioApi>>(
    '/relatorios',
    { obraId: filtro.obraId, tipo: filtro.tipo, tamanho: filtro.tamanho ?? 20 },
    signal,
  )
}

/** Detalhe com as NCs congeladas, na ordem persistida em `relatorio_item.ordem`. */
export function buscarRelatorio(id: string, signal?: AbortSignal) {
  return apiGet<RelatorioApi>(`/relatorios/${id}`, undefined, signal)
}

/**
 * Recalcula o hash a partir do arquivo no storage e compara com o gravado —
 * a mesma prova de cadeia de custódia da evidência. Não confia no banco.
 */
export function verificarIntegridadeRelatorio(id: string, signal?: AbortSignal) {
  return apiGet<IntegridadeApi>(`/relatorios/${id}/integridade`, undefined, signal)
}

/**
 * Caminho do documento (para `apiBlobUrl`) — não o conteúdo.
 *
 * A rota exige Bearer, então não dá para usar como `href` direto: quem
 * consome busca o blob e monta um object URL, igual ao que
 * `EvidenciaImage` já faz para imagem.
 */
export const caminhoArquivoRelatorio = (id: string) => `/relatorios/${id}/arquivo`
