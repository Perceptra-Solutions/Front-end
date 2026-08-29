import * as React from 'react'
import { ApiError, ApiIndisponivelError } from '@/lib/api/client'

export function mensagemErro(erro: unknown): string {
  if (erro instanceof ApiIndisponivelError || erro instanceof ApiError) return erro.message
  return erro instanceof Error ? erro.message : 'Erro inesperado.'
}

export interface Recurso<T> {
  dados: T | null
  carregando: boolean
  erro: string | null
  recarregar: () => void
}

/**
 * Carrega dados do backend com estado de carregamento e de erro, cancelando
 * a requisição se o componente sair de tela antes de a resposta chegar.
 *
 * Existe porque as telas de cadastro liam de `src/data/` (mock em memória) e
 * não tinham estado nenhum — sem loading, sem erro, sem "vazio". Ao trocar a
 * fonte para a API, esses três estados passam a ser obrigatórios: a requisição
 * demora, pode falhar e pode voltar sem nada.
 *
 * `carregar` recebe o `AbortSignal` e deve repassá-lo às chamadas de API — é
 * o que evita o `setState` depois do unmount quando alguém troca de página
 * no meio do carregamento.
 */
export function useRecurso<T>(
  carregar: (signal: AbortSignal) => Promise<T>,
  /**
   * Chave de recarga. Quando muda, o recurso é buscado de novo.
   *
   * Existe porque `carregar` vive numa ref (para não re-executar a cada
   * render) — sem a chave, um carregamento que dependa de algo que chega
   * DEPOIS da montagem nunca acontece. Foi o caso do mapa da obra: na
   * primeira renderização `obraAtual` ainda é null, o carregamento resolvia
   * vazio e a tela ficava presa no estado "sem mapa" mesmo com o arquivo no
   * servidor.
   */
  chave: string | number | null = null,
): Recurso<T> {
  const [dados, setDados] = React.useState<T | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)
  const [tentativa, setTentativa] = React.useState(0)

  // `carregar` costuma ser uma arrow function criada no corpo do componente,
  // ou seja, nova a cada render. Guardá-la numa ref evita que o efeito rode
  // em loop sem obrigar cada página a memoizar a função.
  const carregarRef = React.useRef(carregar)
  carregarRef.current = carregar

  React.useEffect(() => {
    const controle = new AbortController()
    setCarregando(true)
    setErro(null)

    carregarRef
      .current(controle.signal)
      .then((resultado) => {
        if (!controle.signal.aborted) setDados(resultado)
      })
      .catch((causa) => {
        if (!controle.signal.aborted) setErro(mensagemErro(causa))
      })
      .finally(() => {
        if (!controle.signal.aborted) setCarregando(false)
      })

    return () => controle.abort()
  }, [tentativa, chave])

  return { dados, carregando, erro, recarregar: () => setTentativa((n) => n + 1) }
}
