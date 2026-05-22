// src/pages/Products.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cartStore'
import type { Database } from '../types/supabase'

type Product = Database['public']['Tables']['products']['Row']

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    // Verificar que hay una sesión activa antes de cargar productos
    const checkSessionAndFetch = async () => {
      try {
        // Verificar sesión actual
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('No hay sesión activa, redirigiendo al login...')
          // Redirigir al login si no hay sesión
          window.location.href = '/auth'
          return
        }
        
        console.log('Sesión activa para:', session.user.email)
        await fetchProducts()
        
      } catch (err) {
        console.error('Error verificando sesión:', err)
        setError('Error de autenticación. Por favor, inicia sesión nuevamente.')
      }
    }
    
    checkSessionAndFetch()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      setError(null)
      
      // Intentar obtener productos con manejo de errores específico
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (fetchError) {
        console.error('Error de Supabase:', fetchError)
        
        // Si el error es de autenticación, redirigir al login
        if (fetchError.message.includes('JWT') || fetchError.message.includes('auth')) {
          console.log('Error de autenticación, redirigiendo...')
          await supabase.auth.signOut()
          window.location.href = '/auth'
          return
        }
        
        throw fetchError
      }
      
      console.log('Productos cargados:', data?.length || 0)
      setProducts(data || [])
      
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-red-800 font-bold mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No hay productos disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
          {product.image_url && (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-48 object-cover rounded-md mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Sin+imagen'
              }}
            />
          )}
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="text-gray-600 mt-1">{product.description || 'Sin descripción'}</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ${Number(product.price).toFixed(2)}
          </p>
          <button
            onClick={() => addItem(product)}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      ))}
    </div>
  )
}