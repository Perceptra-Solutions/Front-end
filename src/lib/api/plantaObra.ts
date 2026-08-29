import { apiGet, apiUpload } from './client'
import type { PlantaObraApi } from './types'

/**
 * Planta / mapa da obra (`Backend/src/obras/planta-obra.service.ts`).
 *
 * O binário vive no storage do servidor (mesmo `ArmazenamentoPort` da
 * evidência) e o banco guarda a chave e o SHA-256 — nada fica no navegador.
 */

export const MIMES_PLANTA = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'] as const

/** `existe: false` quando a obra ainda não tem planta — não é erro. */
export function buscarPlanta(obraId: string, signal?: AbortSignal) {
  return apiGet<PlantaObraApi>(`/obras/${obraId}/planta`, undefined, signal)
}

/** Só GESTOR. Enviar de novo substitui a planta vigente. */
export function enviarPlanta(obraId: string, arquivo: File) {
  const form = new FormData()
  form.set('arquivo', arquivo)
  return apiUpload<PlantaObraApi>(`/obras/${obraId}/planta`, form)
}

/**
 * Caminho do arquivo (para `apiBlobUrl`) — não o conteúdo.
 *
 * A rota exige Bearer, então não serve como `src` de `<img>` direto: quem
 * exibe busca o blob autenticado e monta um object URL, igual ao que
 * `EvidenciaImage` já faz.
 */
export const caminhoArquivoPlanta = (obraId: string) => `/obras/${obraId}/planta/arquivo`
