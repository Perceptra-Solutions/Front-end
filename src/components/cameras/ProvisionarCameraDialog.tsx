import * as React from 'react'
import { Check, Copy, KeyRound, Loader2, Radio, ShieldOff, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  ESCOPOS_DISPOSITIVO,
  ROTULO_ESCOPO,
  definirStream,
  emitirCredencial,
  revogarCredencial,
  type CredencialEmitidaApi,
  type EscopoDispositivo,
} from '@/lib/api/cameras'
import type { CameraApi } from '@/lib/api/types'
import { mensagemErro } from '@/hooks/useRecurso'
import { useToast } from '@/store/toast'

interface ProvisionarCameraDialogProps {
  camera: CameraApi | null
  aoFechar: () => void
}

/**
 * Provisionamento de dispositivo: emitir a credencial que a Perceptra-One usa
 * para enviar detecção/heartbeat, e definir a URL de stream.
 *
 * Este fluxo não tinha tela nenhuma — só existia via curl/Swagger, o que
 * torna impossível ligar uma câmera nova pelo produto.
 *
 * A chave aparece UMA vez. O backend guarda só o hash SHA-256; não há rota
 * para listá-la depois nem para recuperá-la. Por isso o diálogo insiste na
 * cópia enquanto ela está em tela.
 */
export function ProvisionarCameraDialog({ camera, aoFechar }: ProvisionarCameraDialogProps) {
  const { push } = useToast()
  const [escopos, setEscopos] = React.useState<EscopoDispositivo[]>([...ESCOPOS_DISPOSITIVO])
  const [emitindo, setEmitindo] = React.useState(false)
  const [emitida, setEmitida] = React.useState<CredencialEmitidaApi | null>(null)
  const [copiada, setCopiada] = React.useState(false)
  const [revogando, setRevogando] = React.useState(false)

  const [url, setUrl] = React.useState('')
  const [salvandoUrl, setSalvandoUrl] = React.useState(false)

  // Cada câmera começa do zero: a chave da anterior não pode vazar para o
  // diálogo da próxima.
  React.useEffect(() => {
    setEmitida(null)
    setCopiada(false)
    setUrl('')
    setEscopos([...ESCOPOS_DISPOSITIVO])
  }, [camera?.id])

  if (!camera) return null

  function alternarEscopo(escopo: EscopoDispositivo) {
    setEscopos((prev) => (prev.includes(escopo) ? prev.filter((e) => e !== escopo) : [...prev, escopo]))
  }

  async function emitir() {
    if (!camera) return
    setEmitindo(true)
    try {
      const credencial = await emitirCredencial(camera.id, escopos)
      setEmitida(credencial)
      setCopiada(false)
      push({
        tone: 'success',
        title: 'Credencial emitida',
        description: 'Copie a chave agora — ela não será mostrada de novo.',
      })
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível emitir a credencial', description: mensagemErro(erro) })
    } finally {
      setEmitindo(false)
    }
  }

  async function copiar() {
    if (!emitida) return
    try {
      await navigator.clipboard.writeText(emitida.chave)
      setCopiada(true)
    } catch {
      // clipboard bloqueado (http sem localhost, permissão negada): o campo
      // é selecionável, então o usuário ainda consegue copiar à mão.
      push({ tone: 'info', title: 'Copie manualmente', description: 'O navegador bloqueou a área de transferência.' })
    }
  }

  async function revogar() {
    if (!camera || !emitida) return
    setRevogando(true)
    try {
      await revogarCredencial(camera.id, emitida.id)
      setEmitida(null)
      push({ tone: 'info', title: 'Credencial revogada', description: 'A câmera para de autenticar em até 60s.' })
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível revogar', description: mensagemErro(erro) })
    } finally {
      setRevogando(false)
    }
  }

  async function salvarUrl() {
    if (!camera) return
    setSalvandoUrl(true)
    try {
      await definirStream(camera.id, url.trim())
      setUrl('')
      push({
        tone: 'success',
        title: 'URL de stream gravada',
        description: 'Cifrada em AES-256-GCM. A API nunca devolve a URL de volta.',
      })
    } catch (erro) {
      push({ tone: 'warning', title: 'Não foi possível gravar a URL', description: mensagemErro(erro) })
    } finally {
      setSalvandoUrl(false)
    }
  }

  return (
    <Dialog open={camera !== null} onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Provisionar {camera.identificador}</DialogTitle>
          <DialogDescription>
            Credencial de dispositivo e URL de stream. As duas exigem papel GESTOR.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ---------------------------------------------- credencial */}
          <section className="space-y-3">
            <p className="flex items-center gap-1.5 tech-label">
              <KeyRound className="h-3 w-3" />
              Credencial de dispositivo
            </p>

            {!emitida && (
              <>
                <div className="space-y-2">
                  {ESCOPOS_DISPOSITIVO.map((escopo) => (
                    <label
                      key={escopo}
                      className="flex cursor-pointer items-center gap-2.5 rounded-[3px] border border-border px-3 py-2 text-[13px] text-graphite-700 hover:border-technical-400"
                    >
                      <input
                        type="checkbox"
                        checked={escopos.includes(escopo)}
                        onChange={() => alternarEscopo(escopo)}
                        className="h-3.5 w-3.5 accent-technical-600"
                      />
                      <span className="flex-1">{ROTULO_ESCOPO[escopo]}</span>
                      <code className="font-mono text-[10.5px] text-graphite-400">{escopo}</code>
                    </label>
                  ))}
                </div>
                <p className="text-[12px] text-graphite-400">
                  Escopo mínimo limita o estrago se a câmera for comprometida fisicamente.
                </p>
                <Button
                  variant="navy"
                  size="sm"
                  onClick={() => void emitir()}
                  disabled={emitindo || escopos.length === 0}
                >
                  {emitindo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                  Emitir credencial
                </Button>
              </>
            )}

            {emitida && (
              <div className="space-y-2 rounded-[3px] border border-status-warning/40 bg-status-warning/5 px-3 py-3">
                <p className="flex items-center gap-1.5 text-[12.5px] font-600 text-graphite-800">
                  <TriangleAlert className="h-3.5 w-3.5 text-status-warning" />
                  Copie agora — esta chave não será mostrada de novo
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={emitida.chave}
                    onFocus={(e) => e.currentTarget.select()}
                    className="font-mono text-[11.5px]"
                  />
                  <Button variant="outline" size="sm" onClick={() => void copiar()} className="shrink-0">
                    {copiada ? <Check className="h-3.5 w-3.5 text-status-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiada ? 'Copiada' : 'Copiar'}
                  </Button>
                </div>
                <p className="font-mono text-[11px] text-graphite-500">
                  prefixo {emitida.prefixo} · escopos {emitida.escopos.join(', ')}
                </p>
                <Button variant="ghost" size="xs" onClick={() => void revogar()} disabled={revogando}>
                  {revogando ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldOff className="h-3 w-3" />}
                  Revogar esta credencial
                </Button>
              </div>
            )}
          </section>

          {/* ---------------------------------------------- stream */}
          <section className="space-y-2 border-t border-border pt-4">
            <p className="flex items-center gap-1.5 tech-label">
              <Radio className="h-3 w-3" />
              URL de stream (RTSP)
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="rtsp://usuario:senha@10.0.0.5:554/stream1"
                className="font-mono text-[12px]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => void salvarUrl()}
                disabled={salvandoUrl || url.trim() === ''}
                className="shrink-0"
              >
                {salvandoUrl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Gravar
              </Button>
            </div>
            <p className="text-[12px] text-graphite-400">
              Cifrada em AES-256-GCM antes de gravar. A API nunca devolve a URL — por isso o campo começa vazio mesmo
              quando já existe uma gravada.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
