import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { LiveFeedMonitoramento } from '@/components/monitoring/LiveFeedMonitoramento'
import { SlotAdicionarCamera, SlotCamera } from '@/components/monitoring/SlotCamera'
import { useFeedMonitoramento } from '@/components/monitoring/useFeedMonitoramento'
import { listarCameras } from '@/lib/api/cadastros'
import type { CameraApi } from '@/lib/api/types'

/**
 * A câmera do pipeline AWS (Raspberry Pi) — a única real do projeto. O mural
 * mostra só ela: as CAM-01..CAM-04 do banco vêm do seed de demonstração e não
 * existem em campo, então apareceriam eternamente OFFLINE, poluindo a tela.
 */
const CAMERA_DO_PIPELINE = 'RPI-01'

export default function Monitoring() {
  const navigate = useNavigate()
  const { itens, conectado, atual } = useFeedMonitoramento()
  const [cameras, setCameras] = React.useState<CameraApi[]>([])

  React.useEffect(() => {
    const controle = new AbortController()
    listarCameras({}, controle.signal)
      .then((pagina) => setCameras(pagina.itens))
      // Backend fora do ar: o mural fica só com o slot de adicionar, e o
      // painel do feed já sinaliza "aguardando conexão" por conta própria.
      .catch(() => setCameras([]))
    return () => controle.abort()
  }, [])

  const doPipeline = cameras.filter((c) => c.identificador === CAMERA_DO_PIPELINE)
  const online = doPipeline.filter((c) => c.status === 'ATIVA').length

  return (
    <>
      <PageHeader
        eyebrow="Operação · Mural de câmeras"
        title="Monitoramento"
        description="Transmissão das câmeras do canteiro com a inferência dos modelos aplicada em tempo real."
        meta={[
          { label: 'Online', value: `${online} / ${doPipeline.length}` },
          { label: 'Origem', value: 'AWS S3 · SQS' },
        ]}
      />

      <PageBody className="space-y-4">
        <LiveFeedMonitoramento itens={itens} conectado={conectado} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {doPipeline.map((c) => (
            <SlotCamera key={c.id} camera={c} frame={atual} onOpen={() => navigate('/cameras')} />
          ))}
          <SlotAdicionarCamera onClick={() => navigate('/cameras')} />
        </div>
      </PageBody>
    </>
  )
}
