import React from 'react';
import { useBookImage } from '../hooks/useBookImage';

interface ProxyAwareBookImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  showRetry?: boolean;
  showAttempts?: boolean;
}

const ProxyAwareBookImage: React.FC<ProxyAwareBookImageProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  onLoad,
  onError,
  showRetry = false,
  showAttempts = false
}) => {
  // Generar URL optimizada que use proxy automáticamente si es necesario
  const getOptimizedUrl = (originalUrl: string): string => {
    if (!originalUrl) return '';
    
    // Si ya es una URL proxy, no la proceses más
    if (originalUrl.includes('/api/proxy-image?url=')) {
      console.log('🚫 URL is already a proxy, skipping optimization:', originalUrl);
      return originalUrl;
    }
    
    // Convertir HTTP a HTTPS para mejor compatibilidad
    let url = originalUrl.replace('http://', 'https://');
    
    // Para URLs de Google Books, usar proxy automáticamente para evitar CORS
    if (url.includes('books.google.com')) {
      console.log('📚 Creating proxy URL for Google Books:', url);
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  };

  const optimizedSrc = getOptimizedUrl(src);
  
  const {
    src: currentSrc,
    isLoading,
    hasError,
    attempts,
    errorMessage,
    retry,
    handleLoad,
    handleError,
    allUrls,
    isLastAttempt
  } = useBookImage(optimizedSrc, {
    retryCount: 5, // Más intentos debido a CORS
    retryDelay: 500, // Delay más corto
    fallbackStrategies: true
  });

  const sizeClasses = {
    sm: 'w-20 h-28',
    md: 'w-32 h-auto',
    lg: 'w-40 h-60',
    xl: 'w-48 h-72'
  };

  const imageSize = sizeClasses[size];

  // Callbacks para los eventos de imagen
  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully: ${currentSrc}`);
    handleLoad();
    onLoad?.();
  };

  const handleImageError = () => {
    console.warn(`❌ Image failed (attempt ${attempts + 1}): ${currentSrc}`);
    handleError();
    if (isLastAttempt && onError) {
      onError(errorMessage || 'Failed to load image');
    }
  };

  // Mostrar fallback cuando no hay src o hay error
  if (!src || (!isLoading && hasError)) {
    return (
      <div className={`${imageSize} bg-gray-200 rounded shadow-lg ${className} flex flex-col items-center justify-center p-2`}>
        <div className="text-center text-gray-500">
          <div className="text-3xl mb-1">📚</div>
          <p className="text-xs font-medium">Sin imagen</p>
          
          {showAttempts && attempts > 0 && (
            <div className="mt-1">
              <p className="text-xs text-gray-400">
                {attempts} intento{attempts > 1 ? 's' : ''}
              </p>
              {hasError && (
                <p className="text-xs text-red-400 mt-1">
                  CORS bloqueado
                </p>
              )}
            </div>
          )}
          
          {showRetry && hasError && (
            <button
              onClick={retry}
              className="mt-2 px-2 py-1 text-xs bg-gray-300 hover:bg-gray-400 rounded transition-colors"
              title="Reintentar carga de imagen"
            >
              🔄 Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${imageSize} ${className} relative`}>
      {/* Indicador de carga */}
      {isLoading && (
        <div className={`${imageSize} bg-gray-200 rounded shadow-lg absolute inset-0 flex flex-col items-center justify-center z-10`}>
          <div className="text-center text-gray-400">
            <div className="text-2xl animate-pulse">⏳</div>
            <p className="text-xs">Cargando...</p>
            
            {showAttempts && attempts > 0 && (
              <div className="mt-1">
                <p className="text-xs">
                  Intento {attempts + 1}/{allUrls.length}
                </p>
                {currentSrc.includes('/api/proxy-image') && (
                  <p className="text-xs text-blue-400">
                    Proxy
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Imagen principal */}
      <img
        src={currentSrc}
        alt={alt}
        className={`${imageSize} object-cover rounded shadow-lg transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
      />
      
      {/* Indicadores de estado */}
      {!isLoading && !hasError && (
        <div className="absolute top-1 right-1 flex gap-1">
          {showAttempts && attempts > 0 && (
            <div className="bg-green-500 text-white text-xs px-1 rounded">
              ✓{attempts + 1}
            </div>
          )}
          {currentSrc.includes('/api/proxy-image') && (
            <div className="bg-blue-500 text-white text-xs px-1 rounded" title="Loaded via proxy">
              P
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProxyAwareBookImage;