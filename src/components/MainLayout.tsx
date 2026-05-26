// src/components/MainLayout.tsx
import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Store, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useCartStore } from '../stores/cartStore'

export function MainLayout() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuth()
  const cartCount = useCartStore(s => s.getItemCount())

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  // Obtener iniciales del usuario
  const email = user?.email ?? ''
  const initials = email ? email.slice(0, 2).toUpperCase() : '?'

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo / Brand */}
          <Link
            to="/tiendas"
            className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
          >
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm hidden sm:block">Las Tiendas</span>
          </Link>

          {/* Nav central */}
          <nav className="flex items-center gap-1">
            <Link
              to="/tiendas"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/tiendas') && !isActive('/mi-tienda')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Tiendas
            </Link>
            <Link
              to="/mi-tienda"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/mi-tienda')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Mi tienda
            </Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2">

            {/* Carrito */}
            <Link
              to="/cart"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                isActive('/cart')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-xs font-bold ${isActive('/cart') ? 'text-white' : 'text-gray-900'}`}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Avatar + menú usuario */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{initials}</span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                  >
                    {/* Info usuario */}
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {user?.user_metadata?.full_name ?? 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/mi-tienda"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Mi tienda
                      </Link>
                    </div>

                    <div className="border-t border-gray-50 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
