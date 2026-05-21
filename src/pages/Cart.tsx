// src/pages/Cart.tsx
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
// Versión con animaciones (extensión del Cart.tsx)
import { motion, AnimatePresence } from 'framer-motion'

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, getTotal, getItemCount, clearCart } = useCartStore()

  const handleUpdateQuantity = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: string) => {
    if (confirm('¿Eliminar este producto del carrito?')) {
      removeItem(productId)
    }
  }

  const handleClearCart = () => {
    if (confirm('¿Vaciar completamente el carrito?')) {
      clearCart()
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">Parece que aún no has agregado ningún producto.</p>
          <Link
            to="/products"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mi Carrito</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de productos */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-100 p-4 font-semibold text-gray-700">
              <div className="col-span-6">Producto</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-1 text-center">Subtotal</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="divide-y divide-gray-200">

            <AnimatePresence mode="popLayout">
              {items.map((item) => (
    
        <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b"
    >

                <div 
                key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                  {/* Imagen y nombre del producto */}
                  <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      {item.category && (
                        <p className="text-sm text-gray-500">{item.category}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Precio */}
                  <div className="col-span-6 md:col-span-2 text-left md:text-center">
                    <span className="md:hidden font-semibold text-sm text-gray-500">Precio: </span>
                    ${item.price.toFixed(2)}
                  </div>
                  
                  {/* Cantidad */}
                  <div className="col-span-6 md:col-span-2">
                    <div className="flex items-center justify-start md:justify-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Subtotal */}
                  <div className="col-span-5 md:col-span-1">
                    <span className="md:hidden font-semibold text-sm text-gray-500">Subtotal: </span>
                    <span className="font-semibold text-blue-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Acciones */}
                  <div className="col-span-7 md:col-span-1 text-right">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </div>
                </div>
    </motion.div>
  ))}
</AnimatePresence>

            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Link 
              to="/products"
              className="text-blue-500 hover:text-blue-700 transition flex items-center gap-2"
            >
              ← Seguir comprando
            </Link>
            
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-700 transition"
              >
                Vaciar carrito
              </button>
            )}
          </div>
        </div>
        
        {/* Resumen del pedido */}
        <div className="lg:w-96">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({getItemCount()} productos):</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío:</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">${getTotal().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  *Los impuestos están incluidos en el precio final
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Proceder al Pago
            </button>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Aceptamos:</p>
              <div className="flex justify-center gap-2 mt-1">
                <span className="px-2 py-1 bg-gray-100 rounded">💳 Visa</span>
                <span className="px-2 py-1 bg-gray-100 rounded">💳 Mastercard</span>
                <span className="px-2 py-1 bg-gray-100 rounded">💳 PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}