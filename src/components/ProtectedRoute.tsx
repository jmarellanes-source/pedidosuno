// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom' // ← Importar Outlet
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function ProtectedRoute() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Outlet renderiza las rutas hijas (products, cart, checkout, etc.)
  return <Outlet />
}