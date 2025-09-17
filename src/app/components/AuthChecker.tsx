'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthChecker({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Solo verificar autenticación una vez al cargar la aplicación
    checkAuth();
  }, []); // Sin dependencias para que solo se ejecute una vez

  return <>{children}</>;
}