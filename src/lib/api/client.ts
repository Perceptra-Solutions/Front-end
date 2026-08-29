/**
 * Cliente HTTP para o backend Perceptra. Sem tela de login nesta versão: o
 * app inteiro fala com a API em nome de um usuário fixo (ver DEMO_EMAIL),
 * autenticado uma vez, em silêncio, na primeira chamada.
 *
 * Isso é uma escolha deliberada do produto (login fica para depois), não uma
 * limitação técnica — o backend exige JWT em quase toda rota, então esse
 * login "silencioso" é o que torna qualquer chamada possível sem UI de auth.
 */

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api/v1'

const DEMO_EMAIL = (import.meta.env.VITE_DEMO_EMAIL as string | undefined) ?? 'ana@perceptra.dev'
const DEMO_SENHA = (import.meta.env.VITE_DEMO_SENHA as string | undefined) ?? 'perceptra123'

const TOKEN_STORAGE_KEY = 'perceptra.token'

export interface UsuarioAutenticado {
  id: string
  nome: string
  email: string
  papel: 'GESTOR' | 'ENGENHEIRO'
  crea: string | null
}

interface CorpoErro {
  erro: {
    codigo: string
    mensagem: string
    detalhes?: unknown
    requestId?: string
    timestamp?: string
    caminho?: string
  }
}

export class ApiError extends Error {
  readonly codigo: string
  readonly status: number
  readonly detalhes?: unknown

  constructor(status: number, codigo: string, mensagem: string, detalhes?: unknown) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
    this.detalhes = detalhes
  }
}

/** true quando a API nunca respondeu (backend fora do ar / sem banco) — diferente de um erro de negócio (4xx/5xx com corpo). */
export class ApiIndisponivelError extends Error {
  readonly causa?: unknown

  constructor(causa?: unknown) {
    super('Não foi possível falar com o backend. Confira se a API está rodando em ' + API_URL + '.')
    this.name = 'ApiIndisponivelError'
    this.causa = causa
  }
}

let tokenEmMemoria: string | null = null
let usuarioAtual: UsuarioAutenticado | null = null
let loginEmVoo: Promise<string> | null = null
let perfilEmVoo: Promise<UsuarioAutenticado | null> | null = null

function lerTokenCache(): string | null {
  if (tokenEmMemoria) return tokenEmMemoria
  try {
    tokenEmMemoria = window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    /* localStorage indisponível (modo privado etc.) — segue só em memória */
  }
  return tokenEmMemoria
}

function gravarTokenCache(token: string): void {
  tokenEmMemoria = token
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    /* ok seguir só em memória */
  }
}

/** Garante um token válido e o devolve — usado por quem precisa montar a URL na mão (ex.: EventSource, que não manda header). */
export async function garantirToken(): Promise<string> {
  return autenticar()
}

async function autenticar(): Promise<string> {
  const emCache = lerTokenCache()
  if (emCache) return emCache

  // Evita duas requisições de login em paralelo quando várias chamadas
  // disparam no mesmo instante (ex.: Dashboard montando 3 hooks de uma vez).
  if (!loginEmVoo) {
    loginEmVoo = (async () => {
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: DEMO_EMAIL, senha: DEMO_SENHA }),
      }).catch((causa) => {
        throw new ApiIndisponivelError(causa)
      })

      if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => null)) as CorpoErro | null
        throw new ApiError(
          resposta.status,
          corpo?.erro.codigo ?? 'FALHA_LOGIN',
          corpo?.erro.mensagem ?? 'Não foi possível autenticar o usuário de demonstração.',
        )
      }

      const dados = (await resposta.json()) as { acessoToken: string; usuario: UsuarioAutenticado }
      usuarioAtual = dados.usuario
      gravarTokenCache(dados.acessoToken)
      return dados.acessoToken
    })().finally(() => {
      loginEmVoo = null
    })
  }

  return loginEmVoo
}

/**
 * Usuário fixo atual, de forma síncrona. Pode ser `null` antes de
 * `garantirUsuario()` resolver — quem precisa do papel para decidir o que
 * mostrar deve usar `garantirUsuario()`, não isto.
 */
export function usuarioDemo(): UsuarioAutenticado | null {
  return usuarioAtual
}

/**
 * Devolve o usuário do token, buscando em `/auth/eu` quando necessário.
 *
 * Necessário porque `usuarioAtual` só era preenchido pela RESPOSTA do login,
 * e o login é pulado quando já existe token em `localStorage`. Ou seja: a
 * partir do segundo carregamento da página, `usuarioDemo()` ficava `null`
 * para sempre — a topbar mostrava "Carregando…" e rotulava qualquer um como
 * "Engenheiro responsável", e o `AppStore` desistia em silêncio de criar
 * plano de ação (`if (!ator) return undefined`).
 *
 * `/auth/eu` existe no backend exatamente para isto (ver AuthController:
 * "o front usa para montar o menu e esconder ações sem permissão").
 */
export async function garantirUsuario(): Promise<UsuarioAutenticado | null> {
  if (usuarioAtual) return usuarioAtual

  if (!perfilEmVoo) {
    perfilEmVoo = requisitar<UsuarioAutenticado>('GET', '/auth/eu')
      .then((usuario) => {
        usuarioAtual = usuario
        return usuario
      })
      .catch(() => null)
      .finally(() => {
        perfilEmVoo = null
      })
  }

  return perfilEmVoo
}

interface Opcoes {
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
  signal?: AbortSignal
}

function montarQuery(params?: Opcoes['params']): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== '') usp.set(chave, String(valor))
  }
  const texto = usp.toString()
  return texto ? `?${texto}` : ''
}

async function requisitar<T>(metodo: string, caminho: string, opcoes: Opcoes = {}, tentouReautenticar = false): Promise<T> {
  const token = await autenticar()

  const resposta = await fetch(`${API_URL}${caminho}${montarQuery(opcoes.params)}`, {
    method: metodo,
    signal: opcoes.signal,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opcoes.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
  }).catch((causa) => {
    throw new ApiIndisponivelError(causa)
  })

  // Token expirado/inválido: refaz o login uma vez e tenta de novo.
  if (resposta.status === 401 && !tentouReautenticar) {
    tokenEmMemoria = null
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
      /* ok */
    }
    return requisitar<T>(metodo, caminho, opcoes, true)
  }

  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => null)) as CorpoErro | null
    throw new ApiError(
      resposta.status,
      corpo?.erro.codigo ?? 'ERRO',
      corpo?.erro.mensagem ?? `Falha na requisição (${resposta.status}).`,
      corpo?.erro.detalhes,
    )
  }

  if (resposta.status === 204) return undefined as T
  return (await resposta.json()) as T
}

export const apiGet = <T>(caminho: string, params?: Opcoes['params'], signal?: AbortSignal) =>
  requisitar<T>('GET', caminho, { params, signal })

export const apiPost = <T>(caminho: string, body?: unknown) => requisitar<T>('POST', caminho, { body })

export const apiPatch = <T>(caminho: string, body?: unknown) => requisitar<T>('PATCH', caminho, { body })

/** Upload multipart (evidência). Não define Content-Type: o browser monta o boundary sozinho. */
export async function apiUpload<T>(caminho: string, formData: FormData): Promise<T> {
  const token = await autenticar()
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).catch((causa) => {
    throw new ApiIndisponivelError(causa)
  })

  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => null)) as CorpoErro | null
    throw new ApiError(
      resposta.status,
      corpo?.erro.codigo ?? 'ERRO',
      corpo?.erro.mensagem ?? `Falha no upload (${resposta.status}).`,
    )
  }
  return (await resposta.json()) as T
}

/**
 * Busca um recurso protegido (rota exige Bearer) e devolve um object URL —
 * é o único jeito de um `<img src>` mostrar algo de uma rota autenticada,
 * já que a tag `<img>` não manda header nenhum. Quem chama é responsável
 * por `URL.revokeObjectURL` quando a imagem sai de tela (evita vazar memória).
 */
export async function apiBlobUrl(caminho: string): Promise<string> {
  const token = await autenticar()
  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch((causa) => {
    throw new ApiIndisponivelError(causa)
  })

  if (!resposta.ok) {
    throw new ApiError(resposta.status, 'ARQUIVO_INDISPONIVEL', `Não foi possível carregar o arquivo (${resposta.status}).`)
  }

  const blob = await resposta.blob()
  return URL.createObjectURL(blob)
}
