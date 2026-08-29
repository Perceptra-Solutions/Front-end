import { apiGet, apiPatch, apiPost } from './client'
import type { CameraApi, LocalApi, ModeloIaApi, ObraApi, PaginaApi, StatusObra, UsuarioApi } from './types'

export interface RequisitoNormaApi {
  id: string
  norma: string
  item: string
  categoria: string
  descricao: string
}

/** Alimenta o seletor de obra — o filtro de todo o resto do sistema. */
export function listarObras(signal?: AbortSignal) {
  return apiGet<PaginaApi<ObraApi>>('/obras', { tamanho: 100 }, signal)
}

export function listarUsuarios(filtro: { papel?: 'GESTOR' | 'ENGENHEIRO' } = {}, signal?: AbortSignal) {
  return apiGet<PaginaApi<UsuarioApi>>('/usuarios', { papel: filtro.papel, tamanho: 100 }, signal)
}

export function listarCameras(filtro: { obraId?: string } = {}, signal?: AbortSignal) {
  return apiGet<PaginaApi<CameraApi>>('/cameras', { obraId: filtro.obraId, tamanho: 100 }, signal)
}

export function listarLocais(filtro: { obraId?: string } = {}, signal?: AbortSignal) {
  return apiGet<PaginaApi<LocalApi>>('/locais', { obraId: filtro.obraId, tamanho: 100 }, signal)
}

export function listarModelosIa(signal?: AbortSignal) {
  return apiGet<PaginaApi<ModeloIaApi>>('/modelos-ia', { tamanho: 100 }, signal)
}

export function listarRequisitosNorma(signal?: AbortSignal) {
  return apiGet<PaginaApi<RequisitoNormaApi>>('/requisitos-norma', { tamanho: 100 }, signal)
}

// ----------------------------------------------------------------- escrita
//
// Todas exigem GESTOR. Não há DELETE em nenhum cadastro — decisão do
// projeto: as FKs são RESTRICT e protegem quem tem dependente, então o
// caminho é desativar/atualizar, nunca apagar.

export interface CriarObraInput {
  codigo: string
  nome: string
  endereco?: string
  cidade?: string
  /** Sigla de 2 letras; o backend normaliza para maiúsculo. */
  uf?: string
  status?: StatusObra
  responsavelTecnicoId?: string
  /** AAAA-MM-DD. */
  inicioPrevisto?: string
  fimPrevisto?: string
}

export function criarObra(input: CriarObraInput) {
  return apiPost<ObraApi>('/obras', input)
}

/** `codigo` pode mudar; a unicidade é do banco e volta como 409. */
export function atualizarObra(id: string, input: Partial<CriarObraInput>) {
  return apiPatch<ObraApi>(`/obras/${id}`, input)
}

export interface CriarLocalInput {
  obraId: string
  tipo: TipoLocal
  nome: string
  codigo?: string
}

export const TIPOS_LOCAL = ['BLOCO', 'PAVIMENTO', 'UNIDADE', 'AMBIENTE', 'AREA_COMUM', 'EXTERNO'] as const
export type TipoLocal = (typeof TIPOS_LOCAL)[number]

export function criarLocal(input: CriarLocalInput) {
  return apiPost<LocalApi>('/locais', input)
}

/** `obraId` não entra: um local não troca de obra depois de criado. */
export function atualizarLocal(id: string, input: Partial<Omit<CriarLocalInput, 'obraId'>>) {
  return apiPatch<LocalApi>(`/locais/${id}`, input)
}
