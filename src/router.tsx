// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/MainLayout'
import AuthPage from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Stores from './pages/Stores'
import StoreDetail from './pages/StoreDetail'
import MyStore from './pages/MyStore'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // Redirige raíz al directorio de tiendas
          { index: true,             element: <Stores />      },
          { path: 'tiendas',         element: <Stores />      },
          { path: 'tiendas/:slug',   element: <StoreDetail /> },
          { path: 'mi-tienda',       element: <MyStore />     },
          // Rutas existentes
          { path: 'products',        element: <Products />    },
          { path: 'cart',            element: <Cart />        },
          { path: 'checkout',        element: <Checkout />    },
          { path: 'order-success',   element: <OrderSuccess />},
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <p className="text-gray-500">Página no encontrada</p>
        <a href="/" className="mt-4 text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900">
          Volver al inicio
        </a>
      </div>
    ),
  },
])
