import { apiGet } from './client'
import type { CameraApi, LocalApi, ModeloIaApi, ObraApi, PaginaApi, UsuarioApi } from './types'

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
