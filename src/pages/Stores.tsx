// src/pages/Stores.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Store, Clock, MapPin, Phone, Package, ChevronRight, Plus, Pencil } from 'lucide-react'
import { useStores, useMyStoreIds } from '../hooks/useStores'
import { useAuth } from '../hooks/useAuth'
import type { WeekSchedule } from '../types/stores'

function getTodaySchedule(schedule: WeekSchedule | null): string {
  if (!schedule) return ''
  const days: (keyof WeekSchedule)[] = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
  const today = days[new Date().getDay()]
  const s = schedule[today]
  if (!s || s.closed) return 'Cerrado hoy'
  return `Hoy: ${s.open} – ${s.close}`
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function StoreCard({
  store,
  index,
  isOwner,
}: {
  store: any
  index: number
  isOwner: boolean
}) {
  const navigate = useNavigate()
  const schedule     = store.schedule as WeekSchedule | null
  const todayHours   = getTodaySchedule(schedule)
  const isClosedToday = todayHours === 'Cerrado hoy'
  const themeColor   = store.theme_color || '#3B82F6'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      {/* Botón editar — solo visible para el owner */}
      {isOwner && (
        <button
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            navigate(`/mi-tienda?store=${store.id}`)
          }}
          title="Editar tienda"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      <Link to={`/tiendas/${store.slug}`} className="group block">
        <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">

          {/* Cover */}
          <div
            className="relative h-28 flex items-end px-5 pb-0"
            style={{ background: `linear-gradient(135deg, ${themeColor}22 0%, ${themeColor}44 100%)` }}
          >
            {store.cover_url ? (
              <img src={store.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            ) : (
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: `radial-gradient(circle at 20% 80%, ${themeColor} 0%, transparent 60%)` }}
              />
            )}
            {/* Badge owner */}
            {isOwner && (
              <span
                className="absolute top-3 left-3 text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ background: themeColor }}
              >
                Mi tienda
              </span>
            )}
            {/* Logo */}
            <div
              className="relative z-10 w-14 h-14 rounded-xl border-2 border-white shadow-md flex items-center justify-center overflow-hidden translate-y-7"
              style={{ background: store.logo_url ? '#fff' : themeColor }}
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-lg leading-none">{getInitials(store.name)}</span>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div className="px-5 pt-10 pb-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 text-base leading-tight truncate">{store.name}</h2>
                {store.description && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-snug">{store.description}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors mt-0.5 shrink-0" />
            </div>

            <div className="mt-4 space-y-1.5">
              {store.address && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{store.address}</span>
                </div>
              )}
              {store.phone && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Phone className="w-3 h-3 shrink-0" /><span>{store.phone}</span>
                </div>
              )}
              {todayHours && (
                <div className={`flex items-center gap-1.5 text-xs ${isClosedToday ? 'text-red-400' : 'text-emerald-500'}`}>
                  <Clock className="w-3 h-3 shrink-0" /><span>{todayHours}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Package className="w-3 h-3" />
                <span>{store.product_count} producto{store.product_count !== 1 ? 's' : ''}</span>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: `${themeColor}18`, color: themeColor }}
              >
                Ver tienda
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}

function StoreSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="h-28 bg-gray-100" />
      <div className="px-5 pt-10 pb-5">
        <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-full mb-1" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="mt-4 space-y-1.5">
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}

export default function Stores() {
  const { user }        = useAuth()
  const [search, setSearch]           = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { stores, loading, error, refetch } = useStores()
  const ownerStoreIds   = useMyStoreIds()   // Set<string> con las tiendas que el usuario own

  const handleSearch = (value: string) => {
    setSearch(value)
    clearTimeout((window as any)._searchTimer)
    ;(window as any)._searchTimer = setTimeout(() => {
      setDebouncedSearch(value)
      refetch(value)
    }, 350)
  }

  const filtered = stores.filter(s =>
    !debouncedSearch || s.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tiendas</h1>
            <p className="text-gray-500 mt-1 text-sm">
              {loading ? 'Cargando…' : `${stores.length} tienda${stores.length !== 1 ? 's' : ''} disponible${stores.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {user && (
            <Link
              to="/mi-tienda?new=1"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva tienda
            </Link>
          )}
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar tienda…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <StoreSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Store className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {search ? `Sin resultados para "${search}"` : 'No hay tiendas disponibles aún.'}
          </p>
          {user && (
            <Link
              to="/mi-tienda?new=1"
              className="inline-flex items-center gap-2 mt-4 text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
            >
              ¿Quieres crear la primera?
            </Link>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((store, i) => (
              <StoreCard
                key={store.id}
                store={store}
                index={i}
                isOwner={ownerStoreIds.has(store.id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
