import * as React from 'react'
import { AlertOctagon, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
  /** Muda quando a rota muda: zera o erro ao navegar, senão a tela quebrada gruda. */
  chaveReset?: string
}

interface State {
  erro: Error | null
}

/**
 * Contém um erro de render numa única página em vez de deixar o React
 * desmontar a árvore inteira — sem isto, qualquer exceção durante o render
 * apaga o app e deixa a tela em branco, sem menu e sem como voltar.
 *
 * Precisa ser classe: `componentDidCatch` / `getDerivedStateFromError` não
 * têm equivalente em hook.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(erro: Error): State {
    return { erro }
  }

  componentDidCatch(erro: Error, info: React.ErrorInfo) {
    // Vai para o console do navegador, que é onde se investiga em dev. Um
    // serviço de telemetria entraria aqui.
    console.error('[ErrorBoundary] erro de render:', erro, info.componentStack)
  }

  componentDidUpdate(anterior: Props) {
    if (this.state.erro && anterior.chaveReset !== this.props.chaveReset) {
      this.setState({ erro: null })
    }
  }

  render() {
    if (!this.state.erro) return this.props.children

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-lg rounded-md border border-border bg-card px-6 py-8 text-center shadow-panel">
          <AlertOctagon className="mx-auto h-6 w-6 text-status-critical" />
          <h2 className="mt-3 font-display text-[17px] font-600 uppercase tracking-[0.02em] text-navy-900">
            Esta tela falhou ao carregar
          </h2>
          <p className="mt-2 text-[13px] text-graphite-500">
            O restante do sistema continua funcionando — use o menu para ir a outra tela.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-[3px] bg-graphite-50 px-3 py-2 text-left font-mono text-[11.5px] text-graphite-600">
            {this.state.erro.message}
          </pre>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => this.setState({ erro: null })}>
            <RotateCw className="h-3.5 w-3.5" />
            Tentar renderizar de novo
          </Button>
        </div>
      </div>
    )
  }
}
