import { Toaster } from "@/components/ui/sonner"
import '@fontsource/google-sans/400.css'
import '@fontsource/google-sans/500.css'
import '@fontsource/google-sans/700.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
)
