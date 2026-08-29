import * as React from 'react'
import { Bell, Gauge, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { PageBody, PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/store/toast'

interface ToggleRow {
  key: string
  label: string
  hint: string
  defaultOn: boolean
}

const notificationRows: ToggleRow[] = [
  { key: 'critical', label: 'Alertas críticos', hint: 'Push imediato para o engenheiro de plantão.', defaultOn: true },
  { key: 'deadline', label: 'Prazos vencendo', hint: 'Aviso 24 h antes do vencimento da NC.', defaultOn: true },
  { key: 'verification', label: 'Ações aguardando verificação', hint: 'Resumo diário às 8h.', defaultOn: true },
  { key: 'offline', label: 'Câmera sem sinal', hint: 'Alerta após 10 min sem heartbeat.', defaultOn: false },
  { key: 'weekly', label: 'Relatório semanal', hint: 'Consolidado enviado por e-mail toda segunda.', defaultOn: true },
]

export default function Settings() {
  const { push } = useToast()
  const [toggles, setToggles] = React.useState<Record<string, boolean>>(
    Object.fromEntries(notificationRows.map((r) => [r.key, r.defaultOn])),
  )
  const [threshold, setThreshold] = React.useState('82')
  const [retention, setRetention] = React.useState('180')

  return (
    <>
      <PageHeader
        eyebrow="Administração · Preferências"
        title="Configurações"
        description="Parâmetros de operação da plataforma para a obra Residencial Horizonte."
        meta={[{ label: 'Escopo', value: 'OBR-2025-014' }]}
        actions={
          <Button
            size="sm"
            onClick={() => push({ tone: 'success', title: 'Configurações salvas', description: 'Parâmetros aplicados à obra atual.' })}
          >
            Salvar alterações
          </Button>
        }
      />

      <PageBody className="grid max-w-5xl gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <Bell className="h-4 w-4 text-graphite-300" />
          </CardHeader>
          <div className="divide-y divide-border">
            {notificationRows.map((r) => (
              <div key={r.key} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-500 text-graphite-900">{r.label}</p>
                  <p className="mt-0.5 text-[12.5px] text-graphite-500">{r.hint}</p>
                </div>
                <Switch
                  checked={toggles[r.key]}
                  onCheckedChange={(v) => setToggles((t) => ({ ...t, [r.key]: v }))}
                  aria-label={r.label}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Triagem automática</CardTitle>
              <Gauge className="h-4 w-4 text-graphite-300" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="tech-label mb-1.5 block">Limiar mínimo de confiança para enfileirar</label>
                <Select value={threshold} onValueChange={setThreshold}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="70">70% · mais detecções, mais ruído</SelectItem>
                    <SelectItem value="78">78% · equilibrado</SelectItem>
                    <SelectItem value="82">82% · padrão da obra</SelectItem>
                    <SelectItem value="90">90% · só alta confiança</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-[12.5px] text-graphite-500">
                  Detecções abaixo do limiar continuam registradas no histórico, mas não interrompem o engenheiro.
                </p>
              </div>

              <div>
                <label className="tech-label mb-1.5 block">Retenção de imagens e vídeos</label>
                <Select value={retention} onValueChange={setRetention}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="180">180 dias</SelectItem>
                    <SelectItem value="365">365 dias · recomendado para auditoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regras de fechamento</CardTitle>
              <ShieldCheck className="h-4 w-4 text-graphite-300" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Toda detecção passa por triagem humana antes de virar não conformidade.',
                'O verificador precisa ser diferente do executor da ação corretiva.',
                'NC crítica exige evidência fotográfica antes e depois da correção.',
                'Relatório emitido recebe hash SHA-256 e não pode ser editado.',
              ].map((rule) => (
                <div key={rule} className="flex gap-2.5">
                  <SlidersHorizontal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-technical-600" />
                  <p className="text-[13.5px] leading-snug text-graphite-600">{rule}</p>
                </div>
              ))}
              <p className="border-t border-border pt-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-graphite-400">
                Regras travadas pelo administrador da conta
              </p>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  )
}
