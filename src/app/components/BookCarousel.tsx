"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CarouselProps {
  topBooks: any[];
}

export function BookCarousel({ topBooks }: CarouselProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const router = useRouter();

  // Funciones auxiliares para calcular estadísticas de reseñas
  function getBookReviews(bookId: string) {
    if (typeof window === 'undefined') return [];
    const reviews = JSON.parse(localStorage.getItem(`reviews-${bookId}`) || "[]");
    return reviews;
  }

  function getAverageStars(bookId: string): number {
    const reviews = getBookReviews(bookId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: any) => acc + review.stars, 0);
    return sum / reviews.length;
  }

  function getBestAndWorstReviews(bookId: string) {
    const reviews = getBookReviews(bookId);
    if (reviews.length === 0) return { best: null, worst: null };
    
    const sortedByStars = [...reviews].sort((a, b) => b.stars - a.stars);
    const best = sortedByStars[0];
    const worst = sortedByStars[sortedByStars.length - 1];
    
    return { best, worst };
  }

  function truncateDescription(description: string, maxLength: number = 150) {
    if (!description || description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  }

  function handleSelectBook(id: string) {
    router.push(`/book/${id}`);
  }

  if (topBooks.length === 0) return null;

  return (
    <>
      {/* Carrusel de libros, aparecen solo los que tienen reviews*/}
      <div className="fixed left-0 bg-[#251711] py-8 mt-16 flex items-center justify-center relative" style={{ marginLeft: 0 }}>
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#4b2e22] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-600"
          onClick={() => setCarouselIndex(i => (i === 0 ? topBooks.length - 1 : i - 1))}
          aria-label="Anterior"
        >&#8592;</button>
        <div className="flex flex-row items-center gap-8 w-full max-w-3xl" style={{ paddingLeft: 0 }}>
          {/* Portada */}
          {(() => {
            const book = topBooks[carouselIndex];
            if (!book) return null;
            const info = book.volumeInfo;
            const portada = info.imageLinks?.extraLarge || info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail || "";
            const averageStars = getAverageStars(book.id);
            const truncatedDesc = truncateDescription(info.description, 120);
            const isDescriptionTruncated = info.description && info.description.length > 120;
            
            return (
              <>
                {portada && <img src={portada} alt={info.title} className="w-40 h-60 object-cover rounded shadow-lg" />}
                <div className="flex flex-col justify-center ml-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white text-2xl font-bold" style={{ maxWidth: 250 }}>{info.title}</h3>
                    {averageStars > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-white text-lg">★</span>
                        <span className="text-white text-lg font-serif font-semibold">{averageStars.toFixed(1)}/5.0</span>
                      </div>
                    )}
                  </div>
                  {info.authors && <p className="text-gray-300 font-serif text-xs mb-2">de {info.authors.join(", ")}</p>}
                  {info.description && (
                    <div className="text-gray-200 font-sans text-sm" style={{ maxWidth: 320 }}>
                      <p>{truncatedDesc}</p>
                      {isDescriptionTruncated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBook(book.id);
                          }}
                          className="text-white font-sans hover:text-[#a3bb8f] underline mt-1 text-sm"
                        >
                          ver más
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#4b2e22] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-600"
          onClick={() => setCarouselIndex(i => (i === topBooks.length - 1 ? 0 : i + 1))}
          aria-label="Siguiente"
        >&#8594;</button>
      </div>
      
      {/* Sección de mejores y peores reseñas */}
      {(() => {
        const currentBook = topBooks[carouselIndex];
        if (!currentBook) return null;
        
        const { best, worst } = getBestAndWorstReviews(currentBook.id);
        const reviews = getBookReviews(currentBook.id);
        
        if (reviews.length === 0) return null;
        
        return (
          <div className="w-full bg-[#616f55] py-4 px-4 md:px-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold font-sans text-white mb-4 text-center">
                Reseñas de {currentBook.volumeInfo.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {best && (
                  <div className="bg-white border border-black rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-900 font-sans font-semibold">Mejor Reseña</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < best.stars ? "text-black" : "text-gray-300"}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm italic">"{best.text}"</p>
                  </div>
                )}
                {worst && best?.stars !== worst?.stars && (
                  <div className="bg-white border border-black rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-900 font-sans font-semibold">Peor Reseña</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < worst.stars ? "text-black" : "text-gray-300"}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm italic">"{worst.text}"</p>
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={() => handleSelectBook(currentBook.id)}
                  className="bg-white text-black font-sans hover:bg-black hover:text-white px-6 py-2 rounded-md transition"
                >
                  Ver todas las reseñas ({reviews.length})
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
