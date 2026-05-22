// src/components/CartIcon.tsx
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { Link } from 'react-router-dom'

export function CartIcon() {
  const itemCount = useCartStore(state => state.getItemCount())
  
  return (
    <Link to="/cart" className="relative inline-block">
      <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-500 transition" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  )
}