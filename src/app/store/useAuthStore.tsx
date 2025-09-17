import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  
  // API calls
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (email: string, password: string, name: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      token: null,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setToken: (token) => set({ token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      login: (user, token) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true, 
          isLoading: false 
        });
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },

      loginUser: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (data.success) {
            // Mapear _id a id para consistencia con la interfaz User local
            const mappedUser = {
              id: data.user._id,
              name: data.user.name,
              email: data.user.email
            };
            get().login(mappedUser, data.token);
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      registerUser: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true });
          
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          });

          const data = await response.json();

          if (data.success) {
            // Mapear _id a id para consistencia con la interfaz User local
            const mappedUser = {
              id: data.user._id,
              name: data.user.name,
              email: data.user.email
            };
            get().login(mappedUser, data.token);
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            // Mapear _id a id para consistencia con la interfaz User local
            const mappedUser = {
              id: data.user._id,
              name: data.user.name,
              email: data.user.email
            };
            get().login(mappedUser, token);
          } else {
            get().logout();
          }
        } catch (error) {
          console.error('Auth check error:', error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      logoutUser: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
