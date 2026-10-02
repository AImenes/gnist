import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

const root = document.getElementById('root')!
const app = (
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
if (root.hasChildNodes())
  hydrateRoot(root, app, {
    onRecoverableError: (err, info) => console.warn('hydration', err, (info as { componentStack?: string })?.componentStack),
  })
else createRoot(root).render(app)
