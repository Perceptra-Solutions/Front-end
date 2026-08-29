import * as React from 'react'
import { CameraScene, type SceneVariant } from '@/components/cameras/CameraScene'
import { apiBlobUrl } from '@/lib/api/client'
import { caminhoArquivoEvidencia } from '@/lib/api/evidencias'
import { cn } from '@/lib/utils'

interface EvidenciaImageProps {
  evidenciaId: string
  fallbackVariant: SceneVariant
  compact?: boolean
  className?: string
}

/**
 * Busca o arquivo real da evidência (`GET /evidencias/:id/arquivo`, autenticado)
 * e mostra como imagem. Cai para a cena ilustrativa (`CameraScene`) enquanto
 * carrega ou se o arquivo não existir de fato no storage — o seed de demo
 * cadastra linhas de evidência sem binário real, então esse fallback é
 * esperado para elas.
 */
export function EvidenciaImage({ evidenciaId, fallbackVariant, compact, className }: EvidenciaImageProps) {
  const [url, setUrl] = React.useState<string | null>(null)
  const [falhou, setFalhou] = React.useState(false)

  React.useEffect(() => {
    let cancelado = false
    let objectUrl: string | null = null
    setUrl(null)
    setFalhou(false)

    apiBlobUrl(caminhoArquivoEvidencia(evidenciaId))
      .then((criada) => {
        if (cancelado) {
          URL.revokeObjectURL(criada)
          return
        }
        objectUrl = criada
        setUrl(criada)
      })
      .catch(() => {
        if (!cancelado) setFalhou(true)
      })

    return () => {
      cancelado = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [evidenciaId])

  if (!url || falhou) {
    return <CameraScene variant={fallbackVariant} compact={compact} className={className} />
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setFalhou(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
