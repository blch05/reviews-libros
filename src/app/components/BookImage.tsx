import React, { useState, useEffect } from "react";

interface BookImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const BookImage: React.FC<BookImageProps> = ({ src, alt, size = "md", className = "" }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const sizeClasses = {
    sm: "w-20 h-28",
    md: "w-32 h-auto",
    lg: "w-40 h-60",
    xl: "w-48 h-72"
  };

  const imageSize = sizeClasses[size];

  // Generar URLs de fallback
  const generateFallbackUrls = (originalUrl: string): string[] => {
    if (!originalUrl) return [];
    
    const fallbacks: string[] = [];
    
    // URL original
    fallbacks.push(originalUrl);
    
    // Si es de Google Books, intentar diferentes variantes
    if (originalUrl.includes('books.google.com')) {
      // Quitar parámetros de optimización si fallan
      const cleanUrl = originalUrl.split('&fife=')[0];
      if (cleanUrl !== originalUrl) {
        fallbacks.push(cleanUrl);
      }
      
      // Intentar diferentes tamaños
      const baseUrl = cleanUrl.split('&')[0];
      fallbacks.push(baseUrl);
      fallbacks.push(`${baseUrl}&zoom=1`);
      fallbacks.push(`${baseUrl}&zoom=0`);
    }
    
    return [...new Set(fallbacks)]; // Eliminar duplicados
  };

  const fallbackUrls = generateFallbackUrls(src);

  // Reset cuando cambia la URL fuente
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={`${imageSize} bg-gray-200 rounded shadow-lg ${className} flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-sm">Sin imagen</p>
          {retryCount > 0 && (
            <p className="text-xs text-gray-400">
              Intentos: {retryCount}
            </p>
          )}
        </div>
      </div>
    );
  }

  const handleImageLoad = () => {
    setIsLoading(false);
    console.log(`✅ Image loaded successfully: ${currentSrc}`);
  };

  const handleImageError = () => {
    console.warn(`❌ Error loading image (attempt ${retryCount + 1}): ${currentSrc}`);
    
    const nextRetryCount = retryCount + 1;
    setRetryCount(nextRetryCount);
    
    // Intentar con la siguiente URL de fallback
    if (nextRetryCount < fallbackUrls.length) {
      const nextUrl = fallbackUrls[nextRetryCount];
      console.log(`🔄 Trying fallback URL ${nextRetryCount}: ${nextUrl}`);
      setCurrentSrc(nextUrl);
      setIsLoading(true);
    } else {
      console.error(`💥 All fallback attempts failed for: ${alt}`);
      setHasError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className={`${imageSize} ${className} relative`}>
      {isLoading && (
        <div className={`${imageSize} bg-gray-200 rounded shadow-lg absolute inset-0 flex items-center justify-center`}>
          <div className="text-center text-gray-400">
            <div className="text-2xl">⏳</div>
            <p className="text-xs">Cargando...</p>
            {retryCount > 0 && (
              <p className="text-xs">
                Intento {retryCount + 1}/{fallbackUrls.length}
              </p>
            )}
          </div>
        </div>
      )}
      <img 
        src={currentSrc} 
        alt={alt} 
        className={`${imageSize} object-cover rounded shadow-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: hasError ? 'none' : 'block' }}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default BookImage;
