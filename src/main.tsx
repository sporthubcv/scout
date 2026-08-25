import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from '@/i18n'
import { DemoSessionProvider } from '@/data/demoSession'

// No StrictMode on purpose (react-dev.md): avoids double-running canvas/GSAP effects.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <I18nProvider>
      <DemoSessionProvider>
        <App />
      </DemoSessionProvider>
    </I18nProvider>
  </BrowserRouter>,
)
