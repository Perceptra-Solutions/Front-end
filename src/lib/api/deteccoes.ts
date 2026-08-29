import { apiGet, apiPost } from './client'
import type { DeteccaoApi, PaginaApi, StatusTriagem } from './types'

export function listarDeteccoes(
  filtro: { statusTriagem?: StatusTriagem; obraId?: string; tamanho?: number } = {},
  signal?: AbortSignal,
) {
  return apiGet<PaginaApi<DeteccaoApi>>(
    '/deteccoes',
    { statusTriagem: filtro.statusTriagem, obraId: filtro.obraId, tamanho: filtro.tamanho ?? 100 },
    signal,
  )
}

export function buscarDeteccao(id: string) {
  return apiGet<DeteccaoApi>(`/deteccoes/${id}`)
}

/** FALSO_POSITIVO ou DUPLICADA — "confirmar" (virar NC) é uma rota separada, ver abrirNcDeDeteccao. */
export function descartarDeteccao(id: string, resultado: 'FALSO_POSITIVO' | 'DUPLICADA', duplicadaDeId?: string) {
  return apiPost<DeteccaoApi>(`/deteccoes/${id}/triagem`, { resultado, duplicadaDeId })
}

export interface AbrirNcDeDeteccaoInput {
  titulo: string
  descricao?: string
  severidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'
  requisitoNormaId?: string
  responsavelId?: string
  localId?: string
  reincidenciaDeId?: string
}

export function abrirNcDeDeteccao(deteccaoId: string, dto: AbrirNcDeDeteccaoInput) {
  return apiPost(`/deteccoes/${deteccaoId}/nao-conformidades`, dto)
}
