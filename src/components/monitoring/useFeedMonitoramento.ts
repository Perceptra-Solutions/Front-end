import * as React from 'react'
import { abrirFeedMonitoramento, type ResultadoMonitoramentoApi } from '@/lib/api/monitoramento'
import { useToast } from '@/store/toast'

const LIMITE_HISTORICO = 8

export interface ItemFeed extends ResultadoMonitoramentoApi {
  /** chave local — `imagemOriginal` sozinho não é garantidamente único se dois eventos chegarem no mesmo ms em testes locais. */
  chave: string
}

/**
 * Mantém UMA conexão SSE com `GET /monitoramento/eventos` e devolve o
 * histórico curto de frames processados.
 *
 * Existe como hook (e não dentro do componente do feed) porque a tela de
 * monitoramento mostra o mesmo frame em dois lugares — o painel grande e o
 * slot da CAM-01 no mural. Duas cópias do estado significariam duas conexões
 * SSE para o mesmo dado; por isso a página chama o hook uma vez e passa o
 * resultado para baixo.
 */
export function useFeedMonitoramento() {
  const [itens, setItens] = React.useState<ItemFeed[]>([])
  const [conectado, setConectado] = React.useState(false)
  const { push } = useToast()

  React.useEffect(() => {
    let limpar: (() => void) | undefined
    let cancelado = false

    abrirFeedMonitoramento(
      (resultado) => {
        if (cancelado) return
        setItens((prev) =>
          [{ ...resultado, chave: `${resultado.imagemOriginal}-${resultado.recebidoEm}` }, ...prev].slice(
            0,
            LIMITE_HISTORICO,
          ),
        )

        if (resultado.alertas.length > 0) {
          push({
            tone: 'warning',
            title: 'Alerta da obra',
            description: resultado.alertas.map((a) => a.mensagem).join(' · '),
          })
        }
      },
      setConectado,
    )
      .then((fn) => {
        if (cancelado) fn()
        else limpar = fn
      })
      .catch(() => {
        // Backend inacessível — o painel fica em "aguardando conexão" em vez
        // de propagar erro não tratado.
        if (!cancelado) setConectado(false)
      })

    return () => {
      cancelado = true
      limpar?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { itens, conectado, atual: itens[0], anteriores: itens.slice(1) }
}
