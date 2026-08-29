import React from 'react'
import ReactDOM from 'react-dom/client'
/* tipografia empacotada no projeto — nada é baixado em tempo de execução */
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'
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
