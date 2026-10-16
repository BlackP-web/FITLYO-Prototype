import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

async function prepareApp() {
  // Bật MSW cho môi trường Dev và Prototype Demo trên production
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK !== 'false') {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      quiet: false,
    })
  }
}

prepareApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
