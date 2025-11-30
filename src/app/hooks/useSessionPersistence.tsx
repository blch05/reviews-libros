'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Hook personalizado para manejar la persistencia de la sesión
 * Ejecuta una sola verificación al montar el componente
 */
export const useSessionPersistence = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const initializeSession = async () => {
      await checkAuth();
      setIsInitialized(true);
    };

    // Solo ejecutar una vez al montar
    initializeSession();
  }, []); // Array de dependencias vacío para ejecutar solo una vez

  return { isInitialized };
};

export default useSessionPersistence;