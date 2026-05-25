// src/pages/MyStore.tsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Package, Users, ClipboardList, Settings,
  Plus, Pencil, Trash2, Upload, Save, X, Eye,
  Check, AlertCircle, ChevronDown, ChevronUp,
  Phone, MapPin, Clock, Image as ImageIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMyStore } from '../hooks/useStores'
import type { WeekSchedule, DEFAULT_SCHEDULE } from '../types/stores'

const DAY_ORDER = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
const DAY_LABELS: Record<string, string> = {
  lun: 'Lun', mar: 'Mar', mie: 'Mié',
  jue: 'Jue', vie: 'Vie', sab: 'Sáb', dom: 'Dom',
}
const DEFAULT_WEEK: WeekSchedule = {
  lun: { open: '09:00', close: '18:00', closed: false },
  mar: { open: '09:00', close: '18:00', closed: false },
  mie: { open: '09:00', close: '18:00', closed: false },
  jue: { open: '09:00', close: '18:00', closed: false },
  vie: { open: '09:00', close: '18:00', closed: false },
  sab: { open: '10:00', close: '14:00', closed: false },
  dom: { open: '10:00', close: '14:00', closed: true  },
}

// ── Tabs ─────────────────────────────────────────────────────
type Tab = 'info' | 'products' | 'members' | 'audit'
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'info',     label: 'Mi tienda',  icon: Settings      },
  { id: 'products', label: 'Productos',  icon: Package       },
  { id: 'members',  label: 'Equipo',     icon: Users         },
  { id: 'audit',    label: 'Bitácora',   icon: ClipboardList },
]

// ── Componente Modal de producto ─────────────────────────────
function ProductModal({
  product,
  onClose,
  onSave,
  saving,
}: {
  product: any | null
  onClose: () => void
  onSave: (data: any) => Promise<boolean | any>
  saving: boolean
}) {
  const [form, setForm] = useState({
    name:        product?.name        ?? '',
    description: product?.description ?? '',
    price:       product?.price       ?? '',
    stock:       product?.stock       ?? 0,
    category:    product?.category    ?? '',
    image_url:   product?.image_url   ?? '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.price) return
    await onSave({ ...form, price: Number(form.price), stock: Number(form.stock) })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              placeholder="Nombre del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Precio *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => set('stock', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
            <input
              type="text"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              placeholder="Ej: Bebidas, Snacks…"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none"
              placeholder="Descripción opcional"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">URL de imagen</label>
            <input
              type="url"
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name || !form.price}
            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Tab: Info de la tienda ────────────────────────────────────
function TabInfo({ store, myRole, updateStore, uploadImage, saving }: any) {
  const [form, setForm] = useState({
    name:        store.name        ?? '',
    description: store.description ?? '',
    phone:       store.phone       ?? '',
    address:     store.address     ?? '',
    theme_color: store.theme_color ?? '#3B82F6',
    schedule:    (store.schedule as WeekSchedule) ?? DEFAULT_WEEK,
  })
  const [saved, setSaved] = useState(false)
  const logoRef  = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const setDay = (day: string, field: string, value: any) =>
    setForm(f => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: { ...f.schedule[day as keyof WeekSchedule], [field]: value },
      },
    }))

  const handleSave = async () => {
    const ok = await updateStore(form)
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  const handleImageUpload = async (file: File, bucket: 'store-logos' | 'store-covers') => {
    const url = await uploadImage(file, bucket)
    if (url) {
      await updateStore(bucket === 'store-logos' ? { logo_url: url } : { cover_url: url })
    }
  }

  const isOwner = myRole === 'owner'

  return (
    <div className="space-y-6">
      {/* Imágenes */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Identidad visual</h3>
        <div className="flex gap-4 flex-wrap">
          {/* Logo */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Logo</p>
            <div
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors relative group"
              onClick={() => isOwner && logoRef.current?.click()}
            >
              {store.logo_url ? (
                <>
                  <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                  {isOwner && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  )}
                </>
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-300" />
              )}
            </div>
            {isOwner && (
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'store-logos')}
              />
            )}
          </div>

          {/* Color */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Color principal</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.theme_color}
                onChange={e => set('theme_color', e.target.value)}
                disabled={!isOwner}
                className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer disabled:opacity-50 p-0.5"
              />
              <input
                type="text"
                value={form.theme_color}
                onChange={e => set('theme_color', e.target.value)}
                disabled={!isOwner}
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Datos básicos */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Información básica</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre de la tienda</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              disabled={!isOwner}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              disabled={!isOwner}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 resize-none transition"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  disabled={!isOwner}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  disabled={!isOwner}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 transition"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horario */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Horario de atención
        </h3>
        <div className="space-y-2">
          {DAY_ORDER.map(day => {
            const s = form.schedule[day as keyof WeekSchedule]
            return (
              <div key={day} className="flex items-center gap-3">
                <span className="w-8 text-xs font-medium text-gray-500 shrink-0">{DAY_LABELS[day]}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!s?.closed}
                    onChange={e => setDay(day, 'closed', !e.target.checked)}
                    disabled={!isOwner}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-400">Abierto</span>
                </label>
                {!s?.closed && (
                  <>
                    <input
                      type="time"
                      value={s?.open ?? '09:00'}
                      onChange={e => setDay(day, 'open', e.target.value)}
                      disabled={!isOwner}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
                    />
                    <span className="text-xs text-gray-300">–</span>
                    <input
                      type="time"
                      value={s?.close ?? '18:00'}
                      onChange={e => setDay(day, 'close', e.target.value)}
                      disabled={!isOwner}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
                    />
                  </>
                )}
                {s?.closed && <span className="text-xs text-gray-300 italic">Cerrado</span>}
              </div>
            )
          })}
        </div>
      </section>

      {/* URL pública */}
      <section className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500">URL de tu tienda</p>
          <p className="text-sm text-gray-700 font-mono mt-0.5">/tiendas/{store.slug}</p>
        </div>
        <Link
          to={`/tiendas/${store.slug}`}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Ver pública
        </Link>
      </section>

      {/* Guardar */}
      {isOwner && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {saved ? (
            <><Check className="w-4 h-4 text-emerald-400" /> Guardado</>
          ) : saving ? (
            'Guardando…'
          ) : (
            <><Save className="w-4 h-4" /> Guardar cambios</>
          )}
        </button>
      )}
    </div>
  )
}

// ── Tab: Productos ────────────────────────────────────────────
function TabProducts({ products, createProduct, updateProduct, deleteProduct, saving }: any) {
  const [modal, setModal]     = useState<'new' | any | null>(null)
  const [delConfirm, setDelConfirm] = useState<string | null>(null)
  const [search, setSearch]   = useState('')

  const filtered = products.filter((p: any) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data: any) => {
    if (modal === 'new') {
      const created = await createProduct(data)
      if (created) setModal(null)
    } else {
      const ok = await updateProduct(modal.id, data)
      if (ok) setModal(null)
    }
    return true
  }

  const handleDelete = async (id: string) => {
    await deleteProduct(id)
    setDelConfirm(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
          />
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {search ? `Sin resultados para "${search}"` : 'Aún no tienes productos. ¡Crea el primero!'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <div className="col-span-5">Producto</div>
            <div className="col-span-2 text-right">Precio</div>
            <div className="col-span-2 text-center">Stock</div>
            <div className="col-span-2">Categoría</div>
            <div className="col-span-1"></div>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((p: any) => (
              <div key={p.id} className="px-5 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors">
                <div className="col-span-11 sm:col-span-5 flex items-center gap-3">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-gray-400 truncate">{p.description}</p>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right text-sm font-semibold text-gray-800 hidden sm:block">
                  ${Number(p.price).toFixed(2)}
                </div>
                <div className="col-span-2 text-center hidden sm:block">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.stock === 0 ? 'bg-red-50 text-red-400' :
                    p.stock < 5  ? 'bg-amber-50 text-amber-500' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {p.stock}
                  </span>
                </div>
                <div className="col-span-2 hidden sm:block">
                  {p.category && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setModal(p)}
                    className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDelConfirm(p.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal producto */}
      <AnimatePresence>
        {modal !== null && (
          <ProductModal
            product={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {delConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setDelConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-gray-900 mb-2">Eliminar producto</h3>
              <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
              <div className="flex gap-2">
                <button onClick={() => setDelConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={() => handleDelete(delConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tab: Equipo ───────────────────────────────────────────────
function TabMembers({ members, myRole, removeMember, saving }: any) {
  const [delConfirm, setDelConfirm] = useState<string | null>(null)

  const ROLE_LABELS: Record<string, string> = { owner: 'Propietario', employee: 'Empleado' }
  const ROLE_COLORS: Record<string, string> = {
    owner:    'bg-purple-50 text-purple-600',
    employee: 'bg-blue-50 text-blue-600',
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {members.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay miembros aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {m.profiles?.avatar_url ? (
                    <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-gray-400">
                      {(m.profiles?.full_name ?? '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {m.profiles?.full_name ?? 'Usuario'}
                  </p>
                  {m.profiles?.phone && (
                    <p className="text-xs text-gray-400">{m.profiles.phone}</p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[m.role] ?? 'bg-gray-100 text-gray-500'}`}>
                  {ROLE_LABELS[m.role] ?? m.role}
                </span>
                {myRole === 'owner' && m.role !== 'owner' && (
                  <button
                    onClick={() => setDelConfirm(m.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <p className="text-xs text-amber-700 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          La invitación por email requiere configurar una función RPC en Supabase. Por ahora puedes agregar miembros directamente desde el dashboard de Supabase en la tabla <code className="font-mono bg-amber-100 px-1 rounded">store_members</code>.
        </p>
      </div>

      <AnimatePresence>
        {delConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setDelConfirm(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-gray-900 mb-2">Remover miembro</h3>
              <p className="text-sm text-gray-500 mb-5">¿Confirmas que quieres remover a este miembro del equipo?</p>
              <div className="flex gap-2">
                <button onClick={() => setDelConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancelar</button>
                <button onClick={() => { removeMember(delConfirm); setDelConfirm(null) }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Remover</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tab: Bitácora ─────────────────────────────────────────────
function TabAudit({ auditLogs }: { auditLogs: any[] }) {
  const ACTION_STYLES: Record<string, string> = {
    INSERT: 'bg-emerald-50 text-emerald-600',
    UPDATE: 'bg-blue-50 text-blue-600',
    DELETE: 'bg-red-50 text-red-500',
  }
  const ACTION_LABELS: Record<string, string> = {
    INSERT: 'Creó', UPDATE: 'Actualizó', DELETE: 'Eliminó',
  }
  const TABLE_LABELS: Record<string, string> = {
    products: 'producto', stores: 'tienda', store_members: 'miembro',
  }

  const [expanded, setExpanded] = useState<string | null>(null)

  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No hay registros aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {auditLogs.map((log: any) => {
        const isExpanded = expanded === log.id
        const d = new Date(log.created_at)
        const label = `${ACTION_LABELS[log.action] ?? log.action} ${TABLE_LABELS[log.table_name] ?? log.table_name}`
        const name = log.new_data?.name ?? log.old_data?.name ?? log.record_id

        return (
          <div key={log.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : log.id)}
            >
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ACTION_STYLES[log.action] ?? 'bg-gray-100 text-gray-500'}`}>
                {log.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">
                  {label} <span className="font-medium">{name}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {' · '}
                  {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-300 shrink-0" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {log.old_data && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1.5">Antes</p>
                        <pre className="text-xs bg-red-50 text-red-700 p-3 rounded-xl overflow-x-auto leading-relaxed">
                          {JSON.stringify(log.old_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_data && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1.5">Después</p>
                        <pre className="text-xs bg-emerald-50 text-emerald-700 p-3 rounded-xl overflow-x-auto leading-relaxed">
                          {JSON.stringify(log.new_data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// ── Formulario de creación de tienda ─────────────────────────
function CreateStoreForm({ onCreate, saving }: any) {
  const [name, setName]   = useState('')
  const [desc, setDesc]   = useState('')
  const [slug, setSlug]   = useState('')
  const [autoSlug, setAutoSlug] = useState(true)

  const toSlug = (s: string) =>
    s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const handleNameChange = (v: string) => {
    setName(v)
    if (autoSlug) setSlug(toSlug(v))
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Crea tu tienda</h2>
        <p className="text-gray-500 text-sm mt-1">Podrás personalizar el resto después.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nombre de tu tienda *</label>
          <input
            type="text"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            placeholder="Ej: Abarrotes La Esquina"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">URL (slug)</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 transition">
            <span className="px-3 py-2.5 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0">/tiendas/</span>
            <input
              type="text"
              value={slug}
              onChange={e => { setAutoSlug(false); setSlug(toSlug(e.target.value)) }}
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none font-mono"
              placeholder="mi-tienda"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none"
            placeholder="Cuéntanos qué vendes…"
          />
        </div>

        <button
          onClick={() => onCreate({ name, slug, description: desc })}
          disabled={saving || !name || !slug}
          className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Creando…' : 'Crear tienda'}
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function MyStore() {
  const {
    store, products, members, auditLogs,
    loading, saving, error, myRole,
    createStore, updateStore,
    createProduct, updateProduct, deleteProduct,
    removeMember, uploadImage,
  } = useMyStore()

  const [activeTab, setActiveTab] = useState<Tab>('info')

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-10 bg-gray-100 rounded-xl w-48 mb-6" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  // Sin tienda: mostrar formulario de creación
  if (!store) {
    return (
      <CreateStoreForm
        onCreate={createStore}
        saving={saving}
      />
    )
  }

  const TAB_COUNTS: Partial<Record<Tab, number>> = {
    products: products.length,
    members:  members.length,
    audit:    auditLogs.length,
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{store.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {myRole === 'owner' ? 'Propietario' : 'Empleado'} · /tiendas/{store.slug}
          </p>
        </div>
        <Link
          to={`/tiendas/${store.slug}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <Eye className="w-4 h-4" /> Ver pública
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const count = TAB_COUNTS[tab.id]
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count !== undefined && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Contenido del tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'info' && (
            <TabInfo
              store={store}
              myRole={myRole}
              updateStore={updateStore}
              uploadImage={uploadImage}
              saving={saving}
            />
          )}
          {activeTab === 'products' && (
            <TabProducts
              products={products}
              createProduct={createProduct}
              updateProduct={updateProduct}
              deleteProduct={deleteProduct}
              saving={saving}
            />
          )}
          {activeTab === 'members' && (
            <TabMembers
              members={members}
              myRole={myRole}
              removeMember={removeMember}
              saving={saving}
            />
          )}
          {activeTab === 'audit' && (
            <TabAudit auditLogs={auditLogs} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
