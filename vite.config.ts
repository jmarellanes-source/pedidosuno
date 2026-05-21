import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // ← Importar el plugin

// https://vite.dev/config/
export default defineConfig({
 // plugins: [react()],

   plugins: [
    react(),
    tailwindcss(),
   ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
