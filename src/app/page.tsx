"use client";

import { BookCarousel } from "./components/BookCarousel";
import { SearchSection } from "./components/SearchSection";
import { useTopBooks } from "./hooks/useTopBooks";
import BuildControls from "../components/BuildControls";

export default function Home() {
  const { topBooks, loading } = useTopBooks();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black text-lg">Cargando libros más reseñados...</p>
      </div>
    );
  }

  return (
    <>
      <BookCarousel topBooks={topBooks} />
      <SearchSection />
      
      {/* Controles de Build - Solo visible en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BuildControls />
        </div>
      )}
    </>
  );
}
