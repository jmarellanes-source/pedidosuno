// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Verificar si hay una sesión después de la redirección
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al obtener sesión:', error);
          navigate('/auth', { replace: true });
          return;
        }
        
        if (session) {
          console.log('✅ Sesión establecida para:', session.user.email);
          navigate('/products', { replace: true });
        } else {
          console.log('❌ No se encontró sesión');
          navigate('/auth', { replace: true });
        }
        
      } catch (err) {
        console.error('Error en callback:', err);
        navigate('/auth', { replace: true });
      }
    };
    
    // Pequeño retraso para asegurar que Supabase procese la URL
    setTimeout(handleCallback, 100);
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completando inicio de sesión...</p>
      </div>
    </div>
  );
}