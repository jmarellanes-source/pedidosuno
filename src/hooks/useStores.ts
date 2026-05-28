// src/hooks/useStores.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type {
  Store, StoreInsert, StoreUpdate,
  StoreWithCount, MemberWithProfile, StoreRole,
} from '../types/stores'
import type { Database } from '../types/supabase'

type Product = Database['public']['Tables']['products']['Row']

// ─────────────────────────────────────────────
// Hook: directorio público de tiendas
// ─────────────────────────────────────────────
export function useStores() {
  const [stores, setStores]   = useState<StoreWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchStores = useCallback(async (search = '') => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('stores')
        .select('*, products(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (search.trim()) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, error: err } = await query
      if (err) throw err

      const mapped: StoreWithCount[] = (data ?? []).map((s: any) => ({
        ...s,
        product_count: s.products?.[0]?.count ?? 0,
      }))
      setStores(mapped)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStores() }, [fetchStores])

  return { stores, loading, error, refetch: fetchStores }
}

// ─────────────────────────────────────────────
// Hook: IDs de tiendas donde el usuario es owner
// (para mostrar el ícono de edición en el directorio)
// ─────────────────────────────────────────────
export function useMyStoreIds() {
  const { user } = useAuth()
  const [ownerStoreIds, setOwnerStoreIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    supabase
      .from('store_members')
      .select('store_id')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .then(({ data }) => {
        setOwnerStoreIds(new Set((data ?? []).map((m: any) => m.store_id)))
      })
  }, [user])

  return ownerStoreIds
}

// ─────────────────────────────────────────────
// Hook: detalle de una tienda por slug
// ─────────────────────────────────────────────
export function useStoreBySlug(slug: string) {
  const [store, setStore]       = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: storeData, error: storeErr } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        if (storeErr) throw storeErr
        if (cancelled) return
        setStore(storeData)

        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false })

        if (prodErr) throw prodErr
        if (!cancelled) setProducts(prodData ?? [])
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [slug])

  return { store, products, loading, error }
}

// ─────────────────────────────────────────────
// Hook: TODAS las tiendas del usuario + gestión
// ─────────────────────────────────────────────
export function useMyStore() {
  const { user } = useAuth()

  // Lista de todas las tiendas del usuario
  const [myStores, setMyStores]   = useState<Store[]>([])
  // Tienda actualmente seleccionada para gestionar
  const [store, setStore]         = useState<Store | null>(null)
  const [members, setMembers]     = useState<MemberWithProfile[]>([])
  const [products, setProducts]   = useState<Product[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [myRole, setMyRole]       = useState<StoreRole | null>(null)

  // Cargar lista de tiendas del usuario
  const fetchMyStores = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const { data: memberships, error: mErr } = await supabase
        .from('store_members')
        .select('role, store_id')
        .eq('user_id', user.id)
        .order('invited_at', { ascending: true })

      if (mErr) throw mErr
      if (!memberships || memberships.length === 0) {
        setMyStores([])
        setStore(null)
        setLoading(false)
        return
      }

      const storeIds = memberships.map((m: any) => m.store_id)
      const { data: storesData, error: sErr } = await supabase
        .from('stores')
        .select('*')
        .in('id', storeIds)
        .order('created_at', { ascending: false })

      if (sErr) throw sErr
      setMyStores(storesData ?? [])

      // Seleccionar la primera por defecto si no hay ninguna seleccionada
      setStore(prev => {
        if (prev) {
          // Mantener la selección actual si sigue existiendo
          const still = (storesData ?? []).find((s: Store) => s.id === prev.id)
          return still ?? (storesData?.[0] ?? null)
        }
        return storesData?.[0] ?? null
      })

      // Guardar el rol para cada tienda en un mapa
      const roleMap = memberships.reduce((acc: any, m: any) => {
        acc[m.store_id] = m.role
        return acc
      }, {})

      // El rol de la tienda actualmente seleccionada se actualiza al seleccionar
      setMyRole(roleMap[storesData?.[0]?.id] ?? null)

    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchMyStores() }, [fetchMyStores])

  // Cargar detalles (productos, miembros, logs) cuando cambia la tienda seleccionada
  const fetchStoreDetails = useCallback(async (selectedStore: Store) => {
    if (!user || !selectedStore) return

    try {
      // Rol del usuario en esta tienda
      const { data: membership } = await supabase
        .from('store_members')
        .select('role')
        .eq('store_id', selectedStore.id)
        .eq('user_id', user.id)
        .single()
      setMyRole((membership?.role as StoreRole) ?? null)

      // Productos
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', selectedStore.id)
        .order('created_at', { ascending: false })
      setProducts(prods ?? [])

      // Miembros + perfiles (dos queries para evitar el error 400)
      const { data: rawMembers } = await supabase
        .from('store_members')
        .select('*')
        .eq('store_id', selectedStore.id)

      const userIds = (rawMembers ?? []).map((m: any) => m.user_id)
      let profilesMap: Record<string, any> = {}
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, phone')
          .in('id', userIds)
        profilesMap = (profilesData ?? []).reduce((acc: any, p: any) => {
          acc[p.id] = p; return acc
        }, {})
      }
      setMembers((rawMembers ?? []).map((m: any) => ({
        ...m,
        profiles: profilesMap[m.user_id] ?? null,
      })))

      // Audit logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('store_id', selectedStore.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setAuditLogs(logs ?? [])

    } catch (e: any) {
      setError(e.message)
    }
  }, [user])

  useEffect(() => {
    if (store) fetchStoreDetails(store)
  }, [store, fetchStoreDetails])

  // Cambiar tienda activa desde el selector
  const selectStore = useCallback((storeId: string) => {
    const found = myStores.find(s => s.id === storeId)
    if (found) setStore(found)
  }, [myStores])

  // ── CRUD tienda ────────────────────────────────────────────
  const createStore = async (data: Omit<StoreInsert, 'owner_id'>) => {
    if (!user) return null
    setSaving(true)
    setError(null)
    try {
      const { data: created, error: err } = await supabase
        .from('stores')
        .insert({ ...data, owner_id: user.id })
        .select()
        .single()
      if (err) throw err
      await fetchMyStores()
      // Seleccionar la tienda recién creada
      setStore(created)
      return created
    } catch (e: any) {
      setError(e.message)
      return null
    } finally {
      setSaving(false)
    }
  }

  const updateStore = async (updates: StoreUpdate) => {
    if (!store) return false
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', store.id)
      if (err) throw err
      setStore(prev => prev ? { ...prev, ...updates } : prev)
      setMyStores(prev => prev.map(s => s.id === store.id ? { ...s, ...updates } as Store : s))
      return true
    } catch (e: any) {
      setError(e.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  // ── CRUD productos ─────────────────────────────────────────
  const createProduct = async (data: Omit<Product, 'id' | 'created_at' | 'store_id'>) => {
    if (!store) return null
    setSaving(true)
    try {
      const { data: created, error: err } = await supabase
        .from('products')
        .insert({ ...data, store_id: store.id })
        .select()
        .single()
      if (err) throw err
      setProducts(prev => [created, ...prev])
      return created
    } catch (e: any) {
      setError(e.message); return null
    } finally { setSaving(false) }
  }

  const updateProduct = async (id: string, data: Partial<Product>) => {
    setSaving(true)
    try {
      const { data: updated, error: err } = await supabase
        .from('products').update(data).eq('id', id).select().single()
      if (err) throw err
      setProducts(prev => prev.map(p => p.id === id ? updated : p))
      return true
    } catch (e: any) {
      setError(e.message); return false
    } finally { setSaving(false) }
  }

  const deleteProduct = async (id: string) => {
    setSaving(true)
    try {
      const { error: err } = await supabase.from('products').delete().eq('id', id)
      if (err) throw err
      setProducts(prev => prev.filter(p => p.id !== id))
      return true
    } catch (e: any) {
      setError(e.message); return false
    } finally { setSaving(false) }
  }

  // ── Miembros ───────────────────────────────────────────────
  const removeMember = async (memberId: string) => {
    setSaving(true)
    try {
      const { error: err } = await supabase.from('store_members').delete().eq('id', memberId)
      if (err) throw err
      setMembers(prev => prev.filter(m => m.id !== memberId))
      return true
    } catch (e: any) {
      setError(e.message); return false
    } finally { setSaving(false) }
  }

  // ── Storage ────────────────────────────────────────────────
  const uploadImage = async (file: File, bucket: 'store-logos' | 'store-covers') => {
    if (!store) return null
    const ext  = file.name.split('.').pop()
    const path = `${store.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (upErr) { setError(upErr.message); return null }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  return {
    // Lista y selección
    myStores, store, selectStore,
    // Datos de la tienda activa
    products, members, auditLogs,
    // Estado
    loading, saving, error, myRole,
    // Acciones
    createStore, updateStore,
    createProduct, updateProduct, deleteProduct,
    removeMember, uploadImage,
    refetch: fetchMyStores,
  }
}
