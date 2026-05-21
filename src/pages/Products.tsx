// src/pages/Products.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cartStore'
import type { Database } from '../types/supabase' // ← Cambio importante

// Extraer el tipo Product de Database
type Product = Database['public']['Tables']['products']['Row']

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center p-8">Cargando productos...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 shadow-sm">
          {product.image_url && (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="text-gray-600 mt-1">{product.description}</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ${Number(product.price).toFixed(2)}
          </p>
          <button
            onClick={() => addItem(product)}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      ))}
    </div>
  )
}