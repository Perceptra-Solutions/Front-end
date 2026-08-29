import React from 'react'
import ReactDOM from 'react-dom/client'
/*
 * Tipografia empacotada no projeto — nada é baixado em tempo de execução.
 *
 * Inter em toda a aplicação (títulos, texto, labels, tabelas, gráficos). A
 * JetBrains Mono fica SÓ para identificador técnico e número tabular
 * (NC-00124, CAM-07, hash, timestamp) — é o que dá alinhamento de coluna e
 * distingue 0/O e 1/l num painel de engenharia.
 */
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppStoreProvider } from '@/store/AppStore'
import { ToastProvider } from '@/store/toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AppStoreProvider>
          <TooltipProvider delayDuration={200}>
            <App />
          </TooltipProvider>
        </AppStoreProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
