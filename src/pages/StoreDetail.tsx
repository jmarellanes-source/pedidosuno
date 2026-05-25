// src/pages/StoreDetail.tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Phone, Clock, Package,
  ShoppingCart, Plus, Minus, Search, AlertCircle
} from 'lucide-react'
import { useStoreBySlug } from '../hooks/useStores'
import { useCartStore } from '../stores/cartStore'
import type { WeekSchedule, DAY_LABELS } from '../types/stores'

const DAY_LABELS_MAP: Record<string, string> = {
  lun: 'Lunes', mar: 'Martes', mie: 'Miércoles',
  jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo',
}

const DAY_ORDER = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']

function getTodayKey(): string {
  const keys = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
  return keys[new Date().getDay()]
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// ── Tarjeta de producto ───────────────────────────────────────
function ProductCard({
  product,
  themeColor,
}: {
  product: any
  themeColor: string
}) {
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find(i => i.id === product.id)
  const qty = cartItem?.quantity ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${themeColor}12` }}
          >
            <Package className="w-10 h-10" style={{ color: `${themeColor}60` }} />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">{product.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>

          {product.stock === 0 ? (
            <span className="text-xs text-gray-400">Agotado</span>
          ) : qty === 0 ? (
            <button
              onClick={() => addItem(product)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-opacity hover:opacity-90 active:scale-95"
              style={{ background: themeColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(product.id, qty - 1)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-3 h-3 text-gray-600" />
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-800">{qty}</span>
              <button
                onClick={() => updateQuantity(product.id, qty + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-90"
                style={{ background: themeColor }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function StoreDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { store, products, loading, error } = useStoreBySlug(slug)
  const { getItemCount } = useCartStore()

  const [search, setSearch]       = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [showSchedule, setShowSchedule] = useState(false)

  const themeColor = store?.theme_color || '#3B82F6'
  const cartCount  = getItemCount()
  const todayKey   = getTodayKey()

  // Categorías únicas
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = activeCategory === 'Todos' || p.category === activeCategory
    return matchSearch && matchCat
  })

  const schedule = store?.schedule as WeekSchedule | null
  const todaySchedule = schedule?.[todayKey as keyof WeekSchedule]
  const isOpenToday = todaySchedule && !todaySchedule.closed

  // ── Loading ──
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-48 bg-gray-100 rounded-2xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error / Not found ──
  if (error || !store) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h2 className="text-gray-600 font-semibold mb-2">Tienda no encontrada</h2>
        <p className="text-gray-400 text-sm mb-6">{error || 'Esta tienda no existe o no está disponible.'}</p>
        <Link to="/tiendas" className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2">
          ← Volver al directorio
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Back */}
      <Link
        to="/tiendas"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Tiendas
      </Link>

      {/* Hero de la tienda */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden mb-8"
        style={{ background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}30 100%)` }}
      >
        {store.cover_url && (
          <img
            src={store.cover_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
        )}

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
          {/* Logo */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/60 shadow-lg flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: store.logo_url ? '#fff' : themeColor }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-2xl">{getInitials(store.name)}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              {store.name}
            </h1>
            {store.description && (
              <p className="text-gray-600 text-sm mt-1.5 leading-relaxed max-w-xl">
                {store.description}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {store.address && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />{store.address}
                </span>
              )}
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <Phone className="w-3 h-3" />{store.phone}
                </a>
              )}
              {schedule && (
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    isOpenToday ? 'text-emerald-600' : 'text-red-400'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {isOpenToday
                    ? `Abierto · ${todaySchedule!.open}–${todaySchedule!.close}`
                    : 'Cerrado hoy'}
                  <span className="underline underline-offset-2">(ver horario)</span>
                </button>
              )}
            </div>

            {/* Horario expandible */}
            <AnimatePresence>
              {showSchedule && schedule && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 bg-white/70 backdrop-blur-sm rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {DAY_ORDER.map(day => {
                      const s = schedule[day as keyof WeekSchedule]
                      const isToday = day === todayKey
                      return (
                        <div
                          key={day}
                          className={`text-xs rounded-lg px-2.5 py-2 ${
                            isToday ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          <p className="font-medium">{DAY_LABELS_MAP[day]}</p>
                          <p className={isToday ? 'text-gray-300' : 'text-gray-400'}>
                            {s?.closed ? 'Cerrado' : `${s?.open} – ${s?.close}`}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Carrito flotante */}
          {cartCount > 0 && (
            <Link
              to="/cart"
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-md transition-opacity hover:opacity-90"
              style={{ background: themeColor }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{cartCount}</span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        {/* Categorías */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={
                  activeCategory === cat
                    ? { background: themeColor, color: '#fff' }
                    : { background: '#f3f4f6', color: '#6b7280' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de productos */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {search || activeCategory !== 'Todos'
              ? 'Sin productos con ese filtro.'
              : 'Esta tienda aún no tiene productos.'}
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                themeColor={themeColor}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* FAB carrito mobile */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 sm:hidden"
          >
            <Link
              to="/cart"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-medium shadow-xl"
              style={{ background: themeColor }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Ver carrito · {cartCount}</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
