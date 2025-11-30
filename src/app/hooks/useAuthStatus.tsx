import { useAuthStore } from '../store/useAuthStore';

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  
  return {
    isAuthenticated,
    isLoading,
    user,
    isGuest: !isAuthenticated && !isLoading
  };
};
