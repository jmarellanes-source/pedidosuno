// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/MainLayout'
//import App from './App'; // Tu layout principal que ya tiene el ProtectedRoute
import AuthPage from './pages/Auth';
import AuthCallback from './pages/AuthCallback'; // El componente que acabamos de crear
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Products /> },
          { path: 'products', element: <Products /> },
          { path: 'cart', element: <Cart /> },
          { path: 'checkout', element: <Checkout /> },
          { path: 'order-success', element: <OrderSuccess /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    // Ruta especial para el callback
    path: '/auth/callback',
    element: <AuthCallback />,
  },
]);