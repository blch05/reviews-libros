import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    authStore.checkAuth();
  }, []);

  return authStore;
};
