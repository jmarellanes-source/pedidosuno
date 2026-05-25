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
// Hook: detalle de una tienda por slug
// ─────────────────────────────────────────────
export function useStoreBySlug(slug: string) {
  const [store, setStore]     = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    const fetch = async () => {
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

    fetch()
    return () => { cancelled = true }
  }, [slug])

  return { store, products, loading, error }
}

// ─────────────────────────────────────────────
// Hook: tienda del usuario autenticado
// ─────────────────────────────────────────────
export function useMyStore() {
  const { user } = useAuth()
  const [store, setStore]       = useState<Store | null>(null)
  const [members, setMembers]   = useState<MemberWithProfile[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [myRole, setMyRole]     = useState<StoreRole | null>(null)

  const fetchStore = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      // Buscar si el usuario es miembro de alguna tienda
      const { data: memberData, error: mErr } = await supabase
        .from('store_members')
        .select('*, stores(*)')
        .eq('user_id', user.id)
        .order('invited_at', { ascending: true })
        .limit(1)
        .single()

      if (mErr && mErr.code !== 'PGRST116') throw mErr
      if (!memberData) { setLoading(false); return }

      setMyRole(memberData.role as StoreRole)
      const storeData = memberData.stores as unknown as Store
      setStore(storeData)

      // Productos
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })
      setProducts(prods ?? [])

      // Miembros con perfil
      const { data: mems } = await supabase
        .from('store_members')
        .select('*, profiles(full_name, avatar_url, phone)')
        .eq('store_id', storeData.id)
      setMembers((mems ?? []) as MemberWithProfile[])

      // Últimos 50 logs de auditoría
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setAuditLogs(logs ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchStore() }, [fetchStore])

  // ── CRUD tienda ──
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
      await fetchStore()
      return created
    } catch (e: any) {
      setError(e.message); return null
    } finally { setSaving(false) }
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
      return true
    } catch (e: any) {
      setError(e.message); return false
    } finally { setSaving(false) }
  }

  // ── CRUD productos ──
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
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single()
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
      const { error: err } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      if (err) throw err
      setProducts(prev => prev.filter(p => p.id !== id))
      return true
    } catch (e: any) {
      setError(e.message); return false
    } finally { setSaving(false) }
  }

  // ── Miembros ──
  const inviteMember = async (email: string, role: StoreRole = 'employee') => {
    if (!store) return false
    setSaving(true)
    try {
      // Buscar usuario por email en profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (
          await supabase.auth.admin?.listUsers?.() as any
        ))
        .single()

      // Alternativa: buscar por email directamente via función RPC si se implementa
      // Por ahora insertamos por user_id cuando ya se conoce
      setError('Funcionalidad de invitación por email requiere RPC adicional')
      return false
    } catch (e: any) {
      setError(e.message); return false
    } finally { setSaving(false) }
  }

  const removeMember = async (memberId: string) => {
    setSaving(true)
    try {
      const { error: err } = await supabase
        .from('store_members')
        .delete()
        .eq('id', memberId)
      if (err) throw err
      setMembers(prev => prev.filter(m => m.id !== memberId))
      return true
    } catch (e: any) {
      setError(e.message); return false
    } finally { setSaving(false) }
  }

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
    store, products, members, auditLogs,
    loading, saving, error, myRole,
    createStore, updateStore,
    createProduct, updateProduct, deleteProduct,
    inviteMember, removeMember,
    uploadImage,
    refetch: fetchStore,
  }
}