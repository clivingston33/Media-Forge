import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AppProviders } from './app/providers.tsx'
import { initializeRendererObservability } from './lib/observability.ts'
import './index.css'

void initializeRendererObservability()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
