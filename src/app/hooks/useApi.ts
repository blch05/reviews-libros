import { useState, useCallback } from 'react'

// Tipos para configuración de la API
interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  requiresAuth?: boolean
}

interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

interface ApiHookReturn<T> {
  data: T | null
  error: string | null
  loading: boolean
  execute: (url: string, config?: ApiConfig) => Promise<T | null>
  reset: () => void
}

// Hook personalizado para manejo de APIs
export function useApi<T = any>(): ApiHookReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const execute = useCallback(async (url: string, config: ApiConfig = {}): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      // Construir headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers
      }

      // Agregar Authorization si es requerido
      if (config.requiresAuth !== false) {
        const token = localStorage.getItem('auth-token')
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
      }

      // Configuración del fetch
      const fetchConfig: RequestInit = {
        method: config.method || 'GET',
        headers,
        ...(config.body && { body: JSON.stringify(config.body) })
      }

      const response = await fetch(url, fetchConfig)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de red'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, error, loading, execute, reset }
}

// Hook especializado para operaciones CRUD
export function useCrudApi<T = any>(baseUrl: string) {
  const api = useApi<T>()

  const create = useCallback((data: Partial<T>) => 
    api.execute(baseUrl, { method: 'POST', body: data }), [api, baseUrl])

  const read = useCallback((id?: string) => 
    api.execute(id ? `${baseUrl}/${id}` : baseUrl), [api, baseUrl])

  const update = useCallback((id: string, data: Partial<T>) => 
    api.execute(`${baseUrl}/${id}`, { method: 'PUT', body: data }), [api, baseUrl])

  const remove = useCallback((id: string) => 
    api.execute(`${baseUrl}/${id}`, { method: 'DELETE' }), [api, baseUrl])

  return {
    ...api,
    create,
    read,
    update,
    remove
  }
}

// Hook especializado para autenticación
export function useAuthApi() {
  const api = useApi()

  const login = useCallback((credentials: { email: string; password: string }) =>
    api.execute('/api/auth/login', { 
      method: 'POST', 
      body: credentials, 
      requiresAuth: false 
    }), [api])

  const register = useCallback((userData: { name: string; email: string; password: string }) =>
    api.execute('/api/auth/register', { 
      method: 'POST', 
      body: userData, 
      requiresAuth: false 
    }), [api])

  const logout = useCallback(() =>
    api.execute('/api/auth/logout', { method: 'POST' }), [api])

  const updateProfile = useCallback((profileData: { name: string; email: string; bio?: string }) =>
    api.execute('/api/auth/profile', { method: 'PUT', body: profileData }), [api])

  const getProfile = useCallback(() =>
    api.execute('/api/auth/profile'), [api])

  return {
    ...api,
    login,
    register,
    logout,
    updateProfile,
    getProfile
  }
}

// Hook para reseñas
export function useReviewsApi() {
  return useCrudApi('/api/reviews')
}

// Hook para favoritos
export function useFavoritesApi() {
  return useCrudApi('/api/favorites')
}

// Hook para votos
export function useVotesApi() {
  return useCrudApi('/api/votes')
}

// Hook para Google Books API
export function useGoogleBooksApi() {
  const api = useApi()

  const searchBooks = useCallback((query: string) =>
    api.execute(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`, {
      requiresAuth: false
    }), [api])

  const getBook = useCallback((id: string) =>
    api.execute(`https://www.googleapis.com/books/v1/volumes/${id}`, {
      requiresAuth: false
    }), [api])

  return {
    ...api,
    searchBooks,
    getBook
  }
}