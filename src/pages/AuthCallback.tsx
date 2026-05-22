// src/pages/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener la URL completa con el fragmento (#)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Si tenemos tokens en el hash, establecer la sesión manualmente
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          if (data.session) {
            console.log('Sesión establecida manualmente');
            navigate('/products', { replace: true });
            return;
          }
        }
        
        // Si no hay tokens en el hash, intentar obtener la sesión normalmente
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          navigate('/products', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
        
      } catch (err) {
        console.error('Error en callback:', err);
        setError(err instanceof Error ? err.message : 'Error al procesar autenticación');
        setTimeout(() => navigate('/auth', { replace: true }), 3000);
      }
    };
    
    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <p>Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completando inicio de sesión...</p>
      </div>
    </div>
  );
}