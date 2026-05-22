// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'  // ← Nuevo import
import { router } from './router'                   // ← Importar el router
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />  {/* ← Cambiar App por RouterProvider */}
  </StrictMode>,
)