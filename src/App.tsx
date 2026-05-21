// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import AuthPage from './pages/Auth.tsx'
import Products from './pages/Products'
import Cart from './pages/Cart' // Asumiendo que tienes esta página
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Navigate to="/products" replace />} />
        
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App