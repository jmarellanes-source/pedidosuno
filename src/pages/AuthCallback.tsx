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
        // 🔑 Obtener el código de la URL (para flujo PKCE)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        
        console.log('🔍 Procesando callback. URL:', window.location.href);
        console.log('🔍 Código encontrado:', code);
        
        if (code) {
          // Intercambiar el código por una sesión (PKCE)
          console.log('🔄 Intercambiando código por sesión...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) throw exchangeError;
          
          if (data.session) {
            console.log('✅ Sesión establecida correctamente para:', data.session.user.email);
            navigate('/products', { replace: true });
            return;
          }
        }
        
        // Si no hay código, intentar obtener sesión existente
        console.log('ℹ️ No hay código en URL, verificando sesión existente...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('✅ Sesión existente encontrada para:', session.user.email);
          navigate('/products', { replace: true });
        } else {
          console.log('❌ No hay sesión, redirigiendo a login');
          navigate('/auth', { replace: true });
        }
        
      } catch (err) {
        console.error('❌ Error en callback:', err);
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