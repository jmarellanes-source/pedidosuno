// src/components/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import { CartIcon } from './CartIcon'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export function MainLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Mi App de Pedidos</h1>
          <div className="flex items-center gap-4">
            <CartIcon />
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-red-500 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}