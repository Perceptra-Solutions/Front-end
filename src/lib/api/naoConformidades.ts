import { apiGet, apiPost } from './client'
import type { AcaoCorretivaApi, EventoNcApi, NaoConformidadeApi, PaginaApi, StatusNc, VerificacaoApi } from './types'

export function listarNaoConformidades(
  filtro: { status?: StatusNc; obraId?: string; tamanho?: number } = {},
  signal?: AbortSignal,
) {
  return apiGet<PaginaApi<NaoConformidadeApi>>(
    '/nao-conformidades',
    { status: filtro.status, obraId: filtro.obraId, tamanho: filtro.tamanho ?? 100 },
    signal,
  )
}

export function buscarNaoConformidade(id: string) {
  return apiGet<NaoConformidadeApi>(`/nao-conformidades/${id}`)
}

export function historicoNaoConformidade(id: string) {
  return apiGet<EventoNcApi[]>(`/nao-conformidades/${id}/historico`)
}

export interface CriarAcaoCorretivaInput {
  executorId: string
  descricao: string
  causaRaiz?: string
  prazo?: string
  custo?: number
}

export function criarAcaoCorretiva(ncId: string, dto: CriarAcaoCorretivaInput) {
  return apiPost<AcaoCorretivaApi>(`/nao-conformidades/${ncId}/acoes-corretivas`, dto)
}

export function concluirAcaoCorretiva(acaoId: string, dto: { causaRaiz?: string; custo?: number } = {}) {
  return apiPost<AcaoCorretivaApi>(`/acoes-corretivas/${acaoId}/conclusao`, dto)
}

export function registrarVerificacao(acaoId: string, resultado: 'APROVADA' | 'REPROVADA', parecer?: string) {
  return apiPost<VerificacaoApi>(`/acoes-corretivas/${acaoId}/verificacoes`, { resultado, parecer })
}
