import { STORAGE_KEYS } from '../constants'

// Utilidades para localStorage con manejo de errores
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      if (typeof window === 'undefined') return defaultValue || null
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.warn(`Error reading from localStorage:`, error)
      return defaultValue || null
    }
  },

  set: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Error writing to localStorage:`, error)
      return false
    }
  },

  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing from localStorage:`, error)
      return false
    }
  },

  clear: (): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.clear()
      return true
    } catch (error) {
      console.warn(`Error clearing localStorage:`, error)
      return false
    }
  }
}

// Utilidades para fechas
export const dateUtils = {
  format: (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    
    if (format === 'relative') {
      return dateUtils.getRelativeTime(d)
    }
    
    const options: Intl.DateTimeFormatOptions = format === 'long' 
      ? { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }
      : { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }
    
    return d.toLocaleDateString('es-ES', options)
  },

  getRelativeTime: (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 7) {
      return dateUtils.format(date, 'short')
    } else if (diffDays > 0) {
      return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    } else if (diffMinutes > 0) {
      return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
    } else {
      return 'hace un momento'
    }
  },

  isValid: (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime())
  }
}

// Utilidades para strings
export const stringUtils = {
  truncate: (str: string, maxLength: number, suffix = '...'): string => {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength - suffix.length) + suffix
  },

  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  isEmpty: (str?: string | null): boolean => {
    return !str || str.trim().length === 0
  },

  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Utilidades para números
export const numberUtils = {
  formatRating: (rating: number): string => {
    return rating.toFixed(1)
  },

  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
  },

  random: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  round: (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }
}

// Utilidades para arrays
export const arrayUtils = {
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },

  unique: <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
      return [...new Set(array)]
    }
    
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  },

  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  }
}

// Utilidades para objetos
export const objectUtils = {
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    return result
  },

  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj }
    keys.forEach(key => {
      delete result[key]
    })
    return result
  },

  isEmpty: (obj: any): boolean => {
    return !obj || Object.keys(obj).length === 0
  },

  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj))
  }
}

// Utilidades para URLs y navegación
export const urlUtils = {
  getQueryParams: (): Record<string, string> => {
    if (typeof window === 'undefined') return {}
    
    const params = new URLSearchParams(window.location.search)
    const result: Record<string, string> = {}
    
    params.forEach((value, key) => {
      result[key] = value
    })
    
    return result
  },

  setQueryParam: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    
    const url = new URL(window.location.href)
    url.searchParams.set(key, value)
    window.history.replaceState({}, '', url.toString())
  },

  removeQueryParam: (key: string): void => {
    if (typeof window === 'undefined') return
    
    const url = new URL(window.location.href)
    url.searchParams.delete(key)
    window.history.replaceState({}, '', url.toString())
  }
}

// Utilidades para async/await y promesas
export const asyncUtils = {
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), ms)
      )
    ])
  },

  retry: async <T>(
    fn: () => Promise<T>, 
    maxRetries: number = 3, 
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries) {
          await asyncUtils.delay(delay * Math.pow(2, i)) // Exponential backoff
        }
      }
    }
    
    throw lastError!
  }
}

// Utilidades para validación
export const validationUtils = {
  isEmail: stringUtils.isValidEmail,
  
  isUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  isPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  isStrongPassword: (password: string): boolean => {
    // Al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return strongPasswordRegex.test(password)
  }
}

// Utility para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Utility para throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, wait)
    }
  }
}