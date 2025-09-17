import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from '../utils'

// Hook para manejar localStorage de forma reactiva
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

// Hook para debounced value
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para detectar clicks fuera de un elemento
export const useClickOutside = (
  callback: () => void
): React.RefObject<HTMLElement | null> => {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [callback])

  return ref
}

// Hook para manejar el estado de carga
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState)
  
  const startLoading = useCallback(() => setIsLoading(true), [])
  const stopLoading = useCallback(() => setIsLoading(false), [])
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), [])

  return { isLoading, startLoading, stopLoading, toggleLoading }
}

// Hook para manejar estados async con loading y error
export const useAsync = <T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setData(null)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
      setStatus('success')
      return result
    } catch (error) {
      setError(error as E)
      setStatus('error')
      throw error
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === 'pending',
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle'
  }
}

// Hook para paginación
export const usePagination = (
  totalItems: number,
  itemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])
  
  const goToNext = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])
  
  const goToPrevious = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])
  
  const goToFirst = useCallback(() => {
    goToPage(1)
  }, [goToPage])
  
  const goToLast = useCallback(() => {
    goToPage(totalPages)
  }, [goToPage, totalPages])

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    canGoNext: currentPage < totalPages,
    canGoPrevious: currentPage > 1,
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast
  }
}

// Hook para scroll infinito
export const useInfiniteScroll = (
  fetchMore: () => Promise<void>,
  hasMore: boolean,
  threshold = 100
) => {
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + threshold >=
        document.documentElement.offsetHeight &&
        hasMore &&
        !isFetching
      ) {
        setIsFetching(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, isFetching, threshold])

  useEffect(() => {
    if (!isFetching) return

    const fetchData = async () => {
      try {
        await fetchMore()
      } catch (error) {
        console.error('Error fetching more data:', error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchData()
  }, [isFetching, fetchMore])

  return { isFetching }
}

// Hook para copy to clipboard
export const useClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      
      setTimeout(() => {
        setIsCopied(false)
      }, timeout)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [timeout])

  return { isCopied, copyToClipboard }
}

// Hook para toggle
export const useToggle = (initialState = false): [boolean, () => void, (value?: boolean) => void] => {
  const [state, setState] = useState(initialState)
  
  const toggle = useCallback(() => setState(prev => !prev), [])
  const setValue = useCallback((value?: boolean) => {
    setState(value !== undefined ? value : prev => !prev)
  }, [])

  return [state, toggle, setValue]
}

// Hook para window size
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined
    height: number | undefined
  }>({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// Hook para media queries
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Hook para previous value
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined)
  
  useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

// Hook para interval
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}