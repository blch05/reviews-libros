"use client";

import { BookCarousel } from "./components/BookCarousel";
import { useTopBooks } from "./hooks/useTopBooks";
import { useAuth } from "./hooks/useAuth";
import { useAuthStatus } from "./hooks/useAuthStatus";
import Landing from "./components/Landing";
import Header from "./components/Header";

export default function Home() {
  const { topBooks, loading } = useTopBooks();
  
  useAuth();
  
  const { isAuthenticated, isLoading } = useAuthStatus();

  // Si está se está autenticando, mostrar pantalla de carga  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Fondo dividido en dos colores */}
        <div className="fixed inset-0 flex">
          <div className="w-1/2 bg-[#251711]"></div>
          <div className="w-1/2 bg-[#616f55]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            {/* Emoji de mate */}
            <div className="mb-6">
              <div className="text-6xl">🧉</div>
            </div>
            
            <p className="text-white text-lg drop-shadow-lg font-medium">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        {/* Fondo dividido en dos colores */}
        <div className="fixed inset-0 flex pt-16">
          <div className="w-1/2 bg-[#251711]"></div>
          <div className="w-1/2 bg-[#616f55]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center pt-20 min-h-screen">
          <div className="text-center">
            {/* Emoji de mate */}
            <div className="mb-6">
              <div className="text-7xl">🧉</div>
            </div>
            
            <p className="text-white text-lg drop-shadow-lg font-medium">Cargando los libros más reseñados...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show main app when authenticated and books loaded
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <BookCarousel topBooks={topBooks} />
      </main>
    </div>
  );
}
