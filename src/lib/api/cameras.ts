import { apiPatch, apiPost } from './client'
import type { CameraApi } from './types'

/**
 * Operações de escrita sobre câmera (`Backend/src/catalogo-ia/`). Todas
 * exigem GESTOR.
 */

export const ESCOPOS_DISPOSITIVO = ['deteccao:ingerir', 'heartbeat:enviar'] as const
export type EscopoDispositivo = (typeof ESCOPOS_DISPOSITIVO)[number]

export const ROTULO_ESCOPO: Record<EscopoDispositivo, string> = {
  'deteccao:ingerir': 'Enviar detecções',
  'heartbeat:enviar': 'Enviar heartbeat',
}

export interface CredencialEmitidaApi {
  id: string
  prefixo: string
  /**
   * O token completo, `pcr_<prefixo>_<segredo>`. **Devolvido uma única vez** —
   * o servidor guarda só o hash SHA-256. Perdeu, revoga e emite outra.
   */
  chave: string
  escopos: string[]
  criadaEm: string
}

/** Escopos omitidos = todos. Um escopo mínimo limita o estrago se a câmera for comprometida. */
export function emitirCredencial(cameraId: string, escopos?: EscopoDispositivo[]) {
  return apiPost<CredencialEmitidaApi>(`/cameras/${cameraId}/credenciais`, escopos?.length ? { escopos } : {})
}

/** Irreversível: a câmera para de autenticar assim que o cache de 60s do guard expira. */
export function revogarCredencial(cameraId: string, credencialId: string) {
  return apiPost<{ mensagem: string }>(`/cameras/${cameraId}/credenciais/${credencialId}/revogacao`)
}

/**
 * A URL vai em texto plano nesta requisição e o backend cifra (AES-256-GCM)
 * antes de gravar. A resposta nunca traz a URL de volta, cifrada ou não —
 * por isso não há como a tela "mostrar a URL atual" para conferência.
 */
export function definirStream(cameraId: string, urlStream: string) {
  return apiPatch<CameraApi>(`/cameras/${cameraId}/stream`, { urlStream })
}

export interface AtualizarCameraInput {
  localId?: string | null
  modeloIaId?: string | null
  identificador?: string
  fabricante?: string | null
  protocolo?: string
  status?: 'ATIVA' | 'OFFLINE' | 'MANUTENCAO'
  instaladaEm?: string | null
}

/** `obraId` não entra: uma câmera não troca de obra depois de instalada. */
export function atualizarCamera(cameraId: string, input: AtualizarCameraInput) {
  return apiPatch<CameraApi>(`/cameras/${cameraId}`, input)
}
