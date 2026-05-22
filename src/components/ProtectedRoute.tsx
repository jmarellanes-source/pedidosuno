// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function ProtectedRoute() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Función para validar la sesión activamente
  const validateSession = async () => {
    try {
      setIsValidating(true)
      
      // 1. Obtener la sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error al obtener sesión:', sessionError)
        setUser(null)
        return
      }
      
      if (!session) {
        console.log('No hay sesión activa')
        setUser(null)
        return
      }
      
      // 2. Verificar que el token no haya expirado
      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)
      
      if (expiresAt && expiresAt < now) {
        console.log('Sesión expirada, intentando refrescar...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          console.error('Error al refrescar sesión:', refreshError)
          setUser(null)
          return
        }
        
        setUser(refreshData.session?.user ?? null)
      } else {
        setUser(session.user)
      }
      
    } catch (error) {
      console.error('Error en validación de sesión:', error)
      setUser(null)
    } finally {
      setIsValidating(false)
      setLoading(false)
    }
  }

  // Efecto principal: validar al montar y cada cierto tiempo
  useEffect(() => {
    // Validar inmediatamente
    validateSession()
    
    // Configurar intervalo para validar cada 5 minutos (300000 ms)
    const intervalId = setInterval(validateSession, 300000)
    
    // Escuchar cambios en tiempo real de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('ProtectedRoute - Evento de auth:', event, session?.user?.email)
      
      switch (event) {
        case 'SIGNED_IN':
          setUser(session?.user ?? null)
          break
        case 'SIGNED_OUT':
          setUser(null)
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refrescado exitosamente')
          setUser(session?.user ?? null)
          break
        case 'USER_UPDATED':
          setUser(session?.user ?? null)
          break
        default:
          // En caso de eventos inesperados, revalidar
          await validateSession()
      }
    })
    
    // Limpiar al desmontar
    return () => {
      clearInterval(intervalId)
      subscription.unsubscribe()
    }
  }, [])

  // Mostrar loading mientras se valida
  if (loading || isValidating) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Verificando autenticación...' : 'Validando sesión...'}
          </p>
        </div>
      </div>
    )
  }

  // Redirigir si no hay usuario
  if (!user) {
    console.log('ProtectedRoute - No hay usuario válido, redirigiendo a /auth')
    return <Navigate to="/auth" replace />
  }

  // Renderizar las rutas hijas
  return <Outlet />
}