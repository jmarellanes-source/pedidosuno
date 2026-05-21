
// src/pages/Auth.tsx (versión con CSS puro)
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export default function AuthPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-center p-8">Cargando...</div>
  }

  if (user) {
    return <Navigate to="/products" replace />
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Mi App de Pedidos</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        redirectTo={window.location.origin}
      />
    </div>
  )
}