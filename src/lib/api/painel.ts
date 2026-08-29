import { apiGet } from './client'
import type { ResumoPainelApi } from './types'

export function buscarResumoPainel(obraId?: string, signal?: AbortSignal) {
  return apiGet<ResumoPainelApi>('/painel/resumo', { obraId }, signal)
}
