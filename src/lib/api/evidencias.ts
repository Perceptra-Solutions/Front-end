import { apiGet, apiUpload } from './client'
import type { EvidenciaApi, PaginaApi } from './types'

export function listarEvidencias(
  filtro: { naoConformidadeId?: string; deteccaoId?: string; acaoCorretivaId?: string; tamanho?: number } = {},
  signal?: AbortSignal,
) {
  return apiGet<PaginaApi<EvidenciaApi>>(
    '/evidencias',
    {
      naoConformidadeId: filtro.naoConformidadeId,
      deteccaoId: filtro.deteccaoId,
      acaoCorretivaId: filtro.acaoCorretivaId,
      tamanho: filtro.tamanho ?? 60,
    },
    signal,
  )
}

export interface AnexarEvidenciaInput {
  arquivo: File
  naoConformidadeId?: string
  acaoCorretivaId?: string
  deteccaoId?: string
}

export function anexarEvidencia(input: AnexarEvidenciaInput) {
  const form = new FormData()
  form.set('arquivo', input.arquivo)
  if (input.naoConformidadeId) form.set('naoConformidadeId', input.naoConformidadeId)
  if (input.acaoCorretivaId) form.set('acaoCorretivaId', input.acaoCorretivaId)
  if (input.deteccaoId) form.set('deteccaoId', input.deteccaoId)
  return apiUpload<EvidenciaApi>('/evidencias', form)
}

/** Caminho do arquivo (para apiBlobUrl) — não o conteúdo em si. */
export const caminhoArquivoEvidencia = (id: string) => `/evidencias/${id}/arquivo`
