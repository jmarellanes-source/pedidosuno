// src/pages/Auth.tsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export default function AuthPage() {
  const { user, loading } = useAuth()

  // Si ya está autenticado, redirigir a productos
  if (!loading && user) {
    return <Navigate to="/products" replace />
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Mi App de Pedidos</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#3b82f6',
                brandAccent: '#2563eb',
              }
            }
          }
        }}
        providers={['google']}
        redirectTo={window.location.origin}
      />
    </div>
  )
}