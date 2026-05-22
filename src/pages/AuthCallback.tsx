// src/pages/AuthCallback.tsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  // Evita que el efecto se ejecute dos veces en modo estricto
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      // La sesión se captura automáticamente de la URL por el cliente de Supabase
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error al obtener la sesión:', error.message);
        // Redirige al login si hay error
        navigate('/auth', { replace: true });
        return;
      }

      if (data?.session) {
        // Autenticación exitosa, redirige a la página principal
        console.log('Sesión establecida para:', data.session.user.email);
        navigate('/products', { replace: true });
      } else {
        // No se encontró sesión, a login
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  // Muestra un mensaje de carga mientras se procesa
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completando inicio de sesión...</p>
      </div>
    </div>
  );
}