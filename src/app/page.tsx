"use client";

import { BookCarousel } from "./components/BookCarousel";
import { SearchSection } from "./components/SearchSection";
import { useTopBooks } from "./hooks/useTopBooks";

export default function Home() {
  const { topBooks, loading } = useTopBooks();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-blue-600 text-lg">Cargando libros más reseñados...</p>
      </div>
    );
  }

  return (
    <>
      <BookCarousel topBooks={topBooks} />
      <SearchSection />
    </>
  );
}
