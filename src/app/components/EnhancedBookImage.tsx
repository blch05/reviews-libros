import React from 'react';
import { useBookImage, useOptimizedBookUrl } from '../hooks/useBookImage';

interface EnhancedBookImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  showRetry?: boolean;
  showAttempts?: boolean;
}

const EnhancedBookImage: React.FC<EnhancedBookImageProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  onLoad,
  onError,
  showRetry = false,
  showAttempts = false
}) => {
  const optimizedSrc = useOptimizedBookUrl(src);
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
    retryCount: 3,
    retryDelay: 1000,
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
    handleLoad();
    onLoad?.();
  };

  const handleImageError = () => {
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
            <p className="text-xs text-gray-400 mt-1">
              {attempts} intento{attempts > 1 ? 's' : ''}
            </p>
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
              <p className="text-xs mt-1">
                Intento {attempts + 1}/{allUrls.length}
              </p>
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
      
      {/* Indicador de múltiples intentos (opcional) */}
      {showAttempts && attempts > 0 && !isLoading && !hasError && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
          ✓{attempts + 1}
        </div>
      )}
    </div>
  );
};

export default EnhancedBookImage;
