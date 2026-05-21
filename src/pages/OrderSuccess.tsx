// src/pages/OrderSuccess.tsx
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderId = location.state?.orderId
  const clearCart = useCartStore(state => state.clearCart)

  useEffect(() => {
    // Asegurar que el carrito está limpio
    clearCart()
    
    // Opcional: Enviar evento de conversión a analytics
    if (orderId) {
      console.log('Pedido completado:', orderId)
    }
  }, [orderId, clearCart])

  if (!orderId) {
    navigate('/products')
    return null
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-lg shadow-md">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold mb-4">¡Pedido Exitoso!</h1>
      <p className="text-gray-600 mb-2">
        Tu pedido ha sido creado exitosamente.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Número de pedido: <span className="font-mono">{orderId.substring(0, 8)}</span>
      </p>
      <button
        onClick={() => navigate('/products')}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Seguir Comprando
      </button>
    </div>
  )
}