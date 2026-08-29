import { API_URL, garantirToken } from './client'

export interface DeteccaoBrutaApi {
  classe_id: number
  classe: string
  confianca: number
  /** [x1, y1, x2, y2] em pixels. */
  caixa: [number, number, number, number]
}

export interface AlertaMonitoramentoApi {
  tipo: string
  mensagem: string
}

export interface ResultadoMonitoramentoApi {
  imagemOriginal: string
  imagemUrl: string
  deteccoesEpi: DeteccaoBrutaApi[]
  deteccoesFissura: DeteccaoBrutaApi[]
  alertas: AlertaMonitoramentoApi[]
  recebidoEm: string
}

/**
 * Abre o feed ao vivo de EPI/fissura (`GET /monitoramento/eventos`, SSE) —
 * ver ARQUITETURA_AWS.md e `Backend/src/monitoramento/`. O `EventSource`
 * nativo não manda header, então o token vai na query string; por isso
 * `garantirToken()` roda antes de montar a URL, não é passado num header.
 *
 * Retorna uma função de limpeza — chame no cleanup do efeito que abriu o feed.
 */
export async function abrirFeedMonitoramento(
  aoReceber: (resultado: ResultadoMonitoramentoApi) => void,
  aoMudarStatus?: (conectado: boolean) => void,
): Promise<() => void> {
  const token = await garantirToken()
  const fonte = new EventSource(`${API_URL}/monitoramento/eventos?token=${encodeURIComponent(token)}`)

  fonte.onopen = () => aoMudarStatus?.(true)
  fonte.onerror = () => aoMudarStatus?.(false)
  fonte.onmessage = (evento) => {
    try {
      aoReceber(JSON.parse(evento.data) as ResultadoMonitoramentoApi)
    } catch {
      /* mensagem malformada — ignora, o feed segue */
    }
  }

  return () => fonte.close()
}
