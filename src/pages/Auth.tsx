// src/pages/Auth.tsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)

  // Escuchar errores de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('Usuario autenticado:', session?.user?.email)
      }
      if (event === 'SIGNED_OUT') {
        console.log('Usuario cerró sesión')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="text-center p-8">Cargando...</div>
  }

  if (user) {
    return <Navigate to="/products" replace />
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Mi App de Pedidos</h1>
      
      {authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {authError}
          <button 
            onClick={() => setAuthError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          style: {
            button: { borderRadius: '0.375rem' }
          }
        }}
        providers={['google']}
        redirectTo={`${window.location.origin}/products`}
      />
      

    </div>
  )
}