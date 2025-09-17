import { useState, useEffect, useCallback } from 'react';

interface UseBookImageOptions {
  retryCount?: number;
  retryDelay?: number;
  fallbackStrategies?: boolean;
}

interface BookImageState {
  src: string;
  isLoading: boolean;
  hasError: boolean;
  attempts: number;
  errorMessage?: string;
}

export function useBookImage(
  originalSrc: string,
  options: UseBookImageOptions = {}
) {
  const {
    retryCount = 3,
    retryDelay = 1000,
    fallbackStrategies = true
  } = options;

  const [state, setState] = useState<BookImageState>({
    src: originalSrc,
    isLoading: !!originalSrc,
    hasError: false,
    attempts: 0
  });

  // Generar URLs de fallback para Google Books
  const generateFallbackUrls = useCallback((url: string): string[] => {
    if (!url) return [];
    
    const urls: string[] = [url];
    
    if (fallbackStrategies) {
      // Si es una URL de proxy, NO generar más fallbacks para evitar recursión
      if (url.includes('/api/proxy-image?url=')) {
        console.log('🚫 Proxy URL detected, no fallbacks to prevent recursion:', url);
        return [url]; // Solo devolver la URL proxy original
      }
      
      // Solo procesar URLs directas de Google Books
      if (url.includes('books.google.com')) {
        console.log('📚 Processing Google Books URL for fallbacks:', url);
        
        // Estrategia 1: Intentar con proxy primero para CORS
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          urls.unshift(`/api/proxy-image?url=${encodeURIComponent(url)}`);
        }
        
        // Estrategia 2: Quitar parámetros de optimización
        const cleanUrl = url.split('&fife=')[0];
        if (cleanUrl !== url) {
          urls.push(cleanUrl);
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            urls.push(`/api/proxy-image?url=${encodeURIComponent(cleanUrl)}`);
          }
        }
        
        // Estrategia 3: URL base sin parámetros
        const baseUrl = cleanUrl.split('&')[0];
        if (baseUrl !== cleanUrl) {
          urls.push(baseUrl);
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            urls.push(`/api/proxy-image?url=${encodeURIComponent(baseUrl)}`);
          }
        }
        
        // Estrategia 4: Diferentes zooms
        const zoomUrls = [`${baseUrl}&zoom=1`, `${baseUrl}&zoom=0`];
        urls.push(...zoomUrls);
        
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          zoomUrls.forEach(zoomUrl => {
            urls.push(`/api/proxy-image?url=${encodeURIComponent(zoomUrl)}`);
          });
        }
      }
    }
    
    console.log('🔄 Generated fallback URLs:', urls);
    return [...new Set(urls)]; // Eliminar duplicados
  }, [fallbackStrategies]);

  const allUrls = generateFallbackUrls(originalSrc);

  // Reset cuando cambia la URL original
  useEffect(() => {
    if (originalSrc) {
      setState({
        src: originalSrc,
        isLoading: true,
        hasError: false,
        attempts: 0
      });
    } else {
      setState({
        src: '',
        isLoading: false,
        hasError: true,
        attempts: 0,
        errorMessage: 'No image URL provided'
      });
    }
  }, [originalSrc]);

  const handleLoad = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false
    }));
  }, []);

  const handleError = useCallback(() => {
    setState(prev => {
      const nextAttempt = prev.attempts + 1;
      
      // Si hay más URLs para intentar
      if (nextAttempt < allUrls.length) {
        const nextUrl = allUrls[nextAttempt];
        
        // Delay antes del siguiente intento
        setTimeout(() => {
          setState(current => ({
            ...current,
            src: nextUrl,
            isLoading: true,
            attempts: nextAttempt
          }));
        }, retryDelay);
        
        return {
          ...prev,
          attempts: nextAttempt,
          errorMessage: `Loading attempt ${nextAttempt + 1}/${allUrls.length}`
        };
      }
      
      // No más intentos disponibles
      return {
        ...prev,
        isLoading: false,
        hasError: true,
        attempts: nextAttempt,
        errorMessage: `Failed to load image after ${nextAttempt} attempts`
      };
    });
  }, [allUrls, retryDelay]);

  const retry = useCallback(() => {
    if (originalSrc) {
      setState({
        src: originalSrc,
        isLoading: true,
        hasError: false,
        attempts: 0
      });
    }
  }, [originalSrc]);

  const preloadImage = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      img.src = url;
    });
  }, []);

  const preloadAllUrls = useCallback(async (): Promise<string | null> => {
    for (const url of allUrls) {
      const success = await preloadImage(url);
      if (success) {
        return url;
      }
    }
    return null;
  }, [allUrls, preloadImage]);

  return {
    ...state,
    retry,
    preloadImage,
    preloadAllUrls,
    handleLoad,
    handleError,
    allUrls,
    isLastAttempt: state.attempts >= allUrls.length - 1
  };
}

// Hook para optimización de URLs de Google Books
export function useOptimizedBookUrl(originalUrl: string) {
  const [optimizedUrl, setOptimizedUrl] = useState(originalUrl);

  useEffect(() => {
    if (!originalUrl) {
      setOptimizedUrl('');
      return;
    }

    let url = originalUrl;
    
    // Convertir a HTTPS
    url = url.replace('http://', 'https://');
    
    // Optimizar URLs de Google Books
    if (url.includes('books.google.com')) {
      // Agregar parámetros de optimización si no existen
      if (!url.includes('&fife=')) {
        url += '&fife=w400-h600&source=gbs_api';
      }
      
      // Optimizar para mejor compresión
      if (!url.includes('&img=')) {
        url += '&img=1&prin=frontercover';
      }
    }
    
    setOptimizedUrl(url);
  }, [originalUrl]);

  return optimizedUrl;
}

// Hook para manejo de caché de imágenes
export function useImageCache() {
  const cache = new Map<string, boolean>();
  
  const isCached = useCallback((url: string): boolean => {
    return cache.has(url) && cache.get(url) === true;
  }, []);
  
  const setCached = useCallback((url: string, success: boolean) => {
    cache.set(url, success);
  }, []);
  
  const clearCache = useCallback(() => {
    cache.clear();
  }, []);
  
  return {
    isCached,
    setCached,
    clearCache,
    cacheSize: cache.size
  };
}
