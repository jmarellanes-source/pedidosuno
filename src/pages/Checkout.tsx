// src/pages/Checkout.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../hooks/useAuth'
import type { Database } from '../types/supabase'

type OrderItem = Database['public']['Tables']['order_items']['Insert']

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const { user, loading: authLoading } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createOrder() {
    if (!user) {
      setError('Debes iniciar sesión para continuar')
      return
    }

    if (items.length === 0) {
      setError('El carrito está vacío')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // 1. Crear el pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: getTotal(),
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Insertar los items del pedido
      const orderItems: OrderItem[] = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: Number(item.price)
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Limpiar carrito y redirigir
      clearCart()
      navigate('/order-success', { state: { orderId: order.id } })
      
    } catch (err) {
      console.error('Error creating order:', err)
      setError('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (authLoading) {
    return <div className="text-center p-8">Cargando...</div>
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Debes iniciar sesión para continuar</p>
        <button 
          onClick={() => navigate('/auth')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Iniciar Sesión
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Tu carrito está vacío</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ver Productos
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
              </div>
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/cart')}
          className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
          disabled={isProcessing}
        >
          Volver al Carrito
        </button>
        
        <button
          onClick={createOrder}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
          disabled={isProcessing}
        >
          {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
        </button>
      </div>
    </div>
  )
}