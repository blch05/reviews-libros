// Configuración de API
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' ? 'https://yourapp.com' : '',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
} as const

// Endpoints de API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile'
  },
  REVIEWS: {
    BASE: '/api/reviews',
    BY_ID: (id: string) => `/api/reviews/${id}`,
    BY_USER: '/api/reviews/user',
    STATS: '/api/reviews/stats',
    CLEANUP: '/api/reviews/cleanup'
  },
  FAVORITES: {
    BASE: '/api/favorites',
    BY_ID: (id: string) => `/api/favorites/${id}`,
    CHECK: (bookId: string) => `/api/favorites/check/${bookId}`,
    PROGRESS: (id: string) => `/api/favorites/${id}/progress`,
    STATS: '/api/favorites/stats',
    BY_TAG: (tag: string) => `/api/favorites/tags/${encodeURIComponent(tag)}`
  },
  VOTES: {
    BASE: '/api/votes'
  },
  BOOKS: {
    GOOGLE_API: {
      SEARCH: (query: string) => `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`,
      BY_ID: (id: string) => `https://www.googleapis.com/books/v1/volumes/${id}`
    }
  }
} as const

// Mensajes de error
export const ERROR_MESSAGES = {
  NETWORK: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  VALIDATION_ERROR: 'Datos inválidos. Revisa la información.',
  
  // Errores específicos de formularios
  FORM: {
    REQUIRED: 'Este campo es requerido',
    EMAIL_INVALID: 'Email inválido',
    PASSWORD_SHORT: 'La contraseña debe tener al menos 6 caracteres',
    PASSWORDS_MISMATCH: 'Las contraseñas no coinciden',
    NAME_REQUIRED: 'El nombre es requerido',
    REVIEW_SHORT: 'La reseña debe tener al menos 10 caracteres',
    REVIEW_LONG: 'La reseña no puede exceder 1000 caracteres',
    RATING_REQUIRED: 'Selecciona una calificación',
    BIO_LONG: 'La biografía no puede exceder 500 caracteres'
  },

  // Errores específicos de la aplicación
  APP: {
    LOGIN_FAILED: 'Credenciales inválidas',
    REGISTER_FAILED: 'Error al registrar usuario',
    PROFILE_UPDATE_FAILED: 'Error al actualizar perfil',
    REVIEW_SAVE_FAILED: 'Error al guardar reseña',
    REVIEW_DELETE_FAILED: 'Error al eliminar reseña',
    FAVORITE_ADD_FAILED: 'Error al agregar a favoritos',
    FAVORITE_REMOVE_FAILED: 'Error al eliminar de favoritos',
    BOOK_SEARCH_FAILED: 'Error al buscar libros',
    BOOK_LOAD_FAILED: 'Error al cargar libro',
    STATS_LOAD_FAILED: 'Error al cargar estadísticas'
  }
} as const

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  REVIEW_SAVED: 'Reseña guardada exitosamente',
  REVIEW_DELETED: 'Reseña eliminada exitosamente',
  FAVORITE_ADDED: 'Libro agregado a favoritos',
  FAVORITE_REMOVED: 'Libro eliminado de favoritos',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  REGISTER_SUCCESS: 'Registro exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente'
} as const

// Configuración de UI
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50
  },
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 300
  },
  IMAGES: {
    PLACEHOLDER: '/placeholder-book.png',
    FALLBACK: '/book-fallback.jpg'
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280
  }
} as const

// Configuración de validación
export const VALIDATION_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  REVIEW: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000
  },
  BIO: {
    MAX_LENGTH: 500
  },
  RATING: {
    MIN: 1,
    MAX: 5
  }
} as const

// Estados de carga
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// Colores de la aplicación
export const COLORS = {
  PRIMARY: '#616f55',
  SECONDARY: '#8a9a7e',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
} as const

// Configuración de localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  USER_DATA: 'user-data',
  PREFERENCES: 'user-preferences',
  THEME: 'theme',
  LAST_SEARCH: 'last-search'
} as const

// Configuración de cookies
export const COOKIE_CONFIG = {
  AUTH_TOKEN: {
    NAME: 'auth-token',
    MAX_AGE: 7 * 24 * 60 * 60, // 7 días en segundos
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'strict' as const
  }
} as const

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  BOOK: (id: string) => `/book/${id}`,
  SEARCH: '/search'
} as const

// Configuración de SEO
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'Reviews de Libros',
  TITLE_TEMPLATE: '%s | Reviews de Libros',
  DEFAULT_DESCRIPTION: 'Descubre, reseña y comparte tus libros favoritos',
  DEFAULT_KEYWORDS: 'libros, reseñas, literatura, lectura, recomendaciones',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
} as const

// Configuración de fecha y hora
export const DATE_CONFIG = {
  DEFAULT_LOCALE: 'es-ES',
  DEFAULT_TIMEZONE: 'America/Mexico_City',
  FORMATS: {
    SHORT: 'dd/MM/yyyy',
    LONG: 'dd/MM/yyyy HH:mm',
    RELATIVE: 'relative'
  }
} as const