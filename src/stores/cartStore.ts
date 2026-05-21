// src/stores/cartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '../types/supabase'

// Extraer tipos de Database
type Product = Database['public']['Tables']['products']['Row']

type CartItem = Product & {
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  getTotal: () => number
  getItemCount: () => number
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product) => {
        const { items } = get()
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },
      
      removeItem: (productId: string) => {
        set({ items: get().items.filter(item => item.id !== productId) })
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        })
      },
      
      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0
        )
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
      
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'cart-storage'
    }
  )
)