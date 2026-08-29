import { Radio, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ItemFeed } from './useFeedMonitoramento'
import { cn } from '@/lib/utils'

function Deteccoes({ item }: { item: ItemFeed }) {
  const semOcorrencia = item.deteccoesEpi.length === 0 && item.deteccoesFissura.length === 0
  return (
    <div className="flex flex-wrap gap-1">
      {item.deteccoesEpi.map((d, i) => (
        <Badge key={`epi-${i}`} variant="critical">
          {d.classe}
        </Badge>
      ))}
      {item.deteccoesFissura.map((d, i) => (
        <Badge key={`fis-${i}`} variant="warning">
          {d.classe}
        </Badge>
      ))}
      {semOcorrencia && <Badge variant="success">Sem ocorrência</Badge>}
    </div>
  )
}

interface LiveFeedMonitoramentoProps {
  itens: ItemFeed[]
  conectado: boolean
}

/**
 * Painel do feed ao vivo do pipeline AWS (Raspberry Pi -> S3 -> SQS ->
 * inferência -> S3 -> aqui, ver ARQUITETURA_AWS.md). O estado vem do
 * `useFeedMonitoramento` da página — este componente só desenha.
 *
 * "Ao vivo" aqui é a imagem mais recente trocando a cada novo frame (não é
 * vídeo contínuo — o pipeline manda um frame anotado por segundo, ver
 * hardware_client/config.py), com um histórico curto logo abaixo.
 */
export function LiveFeedMonitoramento({ itens, conectado }: LiveFeedMonitoramentoProps) {
  const [atual, ...anteriores] = itens
  const temAlertaAtual = (atual?.alertas.length ?? 0) > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>CAM-01 · Raspberry Pi</CardTitle>
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-[2px] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]',
              conectado ? 'bg-status-success-bg text-status-success' : 'bg-graphite-100 text-graphite-400',
            )}
          >
            <Radio className="h-3 w-3" />
            {conectado ? 'Conectado' : 'Aguardando conexão'}
          </span>
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
          EPI + fissura · AWS S3/SQS
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {!atual ? (
          <p className="rounded-[3px] border border-dashed border-graphite-200 px-4 py-8 text-center text-[13px] text-graphite-400">
            Nenhuma imagem recebida ainda. Assim que a Raspberry Pi subir um frame pro bucket e o serviço de
            inferência processar, ele aparece aqui automaticamente.
          </p>
        ) : (
          <>
            {/* frame ao vivo — o mais recente, em destaque */}
            <div
              className={cn(
                'overflow-hidden rounded-[3px] border-2 bg-navy-950',
                temAlertaAtual ? 'border-status-critical animate-pulse-alert' : 'border-technical-400/50',
              )}
            >
              <div className="relative aspect-video">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img src={atual.imagemUrl} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-[2px] bg-navy-950/80 px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-critical" />
                  Ao vivo
                </span>
              </div>
              <div className="space-y-1.5 border-t border-white/10 bg-navy-950/95 p-3">
                <Deteccoes item={atual} />
                {temAlertaAtual && (
                  <p className="flex items-start gap-1 text-[11.5px] leading-snug text-status-critical">
                    <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {atual.alertas.map((a) => a.mensagem).join(' · ')}
                  </p>
                )}
                <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-white/40">
                  {atual.imagemOriginal.split('/').pop()}
                </p>
              </div>
            </div>

            {/* histórico curto */}
            {anteriores.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-7">
                {anteriores.map((item) => {
                  const temAlerta = item.alertas.length > 0
                  return (
                    <figure
                      key={item.chave}
                      className={cn(
                        'overflow-hidden rounded-[3px] border',
                        temAlerta ? 'border-status-critical/40' : 'border-border',
                      )}
                    >
                      <div className="aspect-[4/3] bg-navy-950">
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <img src={item.imagemUrl} alt="" className="h-full w-full object-cover opacity-90" />
                      </div>
                    </figure>
                  )
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
