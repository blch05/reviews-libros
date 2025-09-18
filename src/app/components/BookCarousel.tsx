"use client";

import { useState, useEffect } from "react";
import TruncatedText from "./TruncatedText";
import StarRating from "./StarRating";
import ProxyAwareBookImage from "./ProxyAwareBookImage";
import ReviewCard from "./ReviewCard";
import CarouselButton from "./CarouselButton";
import { useRouter } from "next/navigation";
import { BookReviewUtils } from "../lib/book-review-utils";
import { Review } from "../../types";

interface CarouselProps {
  topBooks: any[];
}

interface BookData {
  averageStars: number;
  reviews: Review[];
  best?: Review;
  worst?: Review;
}

export function BookCarousel({ topBooks }: CarouselProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [bookData, setBookData] = useState<{ [bookId: string]: BookData }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Cargar datos del libro actual
  useEffect(() => {
    const loadBookData = async () => {
      if (topBooks.length === 0) return;
      
      const currentBook = topBooks[carouselIndex];
      if (!currentBook || bookData[currentBook.id]) return;
      
      setLoading(true);
      try {
        const reviews = await BookReviewUtils.getBookReviews(currentBook.id);
        const averageStars = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        let best: Review | undefined, worst: Review | undefined;
        if (reviews.length > 0) {
          best = reviews.reduce((a, b) => a.rating > b.rating ? a : b);
          worst = reviews.reduce((a, b) => a.rating < b.rating ? a : b);
        }
        
        setBookData(prev => ({
          ...prev,
          [currentBook.id]: {
            averageStars,
            reviews,
            best,
            worst
          }
        }));
      } catch (error) {
        console.error('Error loading book data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookData();
  }, [carouselIndex, topBooks, bookData]);

  // Seleccionar libro
  function handleSelectBook(id: string) {
    router.push(`/book/${id}`);
  }

  if (topBooks.length === 0) return null;

  const currentBook = topBooks[carouselIndex];
  const currentBookData = currentBook ? bookData[currentBook.id] : null;

  return (
    <>
      {/* Carrusel de libros -> aparecen solo los que tienen reviews*/}
      <div className="fixed left-0 bg-[#251711] py-8 flex items-center justify-center relative" style={{ marginLeft: 0 }}>
        <CarouselButton 
          direction="prev"
          onClick={() => setCarouselIndex(i => (i === 0 ? topBooks.length - 1 : i - 1))}
        />
        <div className="flex flex-row items-center gap-8 w-full max-w-3xl" style={{ paddingLeft: 0 }}>
          {/* Portada */}
          {(() => {
            const book = topBooks[carouselIndex];
            if (!book) return null;
            const info = book.volumeInfo;
            const coverUrl = BookReviewUtils.getBookCoverUrl(book);
            const averageStars = currentBookData?.averageStars || 0;
            
            return (
              <>
                <ProxyAwareBookImage src={coverUrl} alt={info.title} size="lg" />
                <div className="flex flex-col justify-center ml-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white text-2xl font-bold" style={{ maxWidth: 250 }}>{info.title}</h3>
                    {averageStars > 0 && (
                      <StarRating 
                        rating={averageStars} 
                        size="lg" 
                        color="text-white"
                        className="text-white"
                      />
                    )}
                  </div>
                  {info.authors && <p className="text-gray-300 font-serif text-xs mb-2">de {info.authors.join(", ")}</p>}
                  {currentBookData?.reviews && currentBookData.reviews.length > 0 && (
                    <p className="text-gray-300 font-serif text-xs mb-2">
                      {currentBookData.reviews.length} reseña{currentBookData.reviews.length !== 1 ? 's' : ''}
                    </p>
                  )}
                  {info.description && (
                    <div className="text-gray-200 font-sans text-sm" style={{ maxWidth: 320 }}>
                      <TruncatedText 
                        text={info.description} 
                        maxLength={120}
                        expandable={true}
                        expandText="ver más"
                        onExpand={() => handleSelectBook(book.id)}
                        className="text-gray-200"
                      />
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
        <CarouselButton 
          direction="next"
          onClick={() => setCarouselIndex(i => (i === topBooks.length - 1 ? 0 : i + 1))}
        />
      </div>
      
      {/* Sección de mejores y peores reseñas */}
      {(() => {
        const currentBook = topBooks[carouselIndex];
        if (!currentBook || !currentBookData) return null;
        
        const { best, worst, reviews } = currentBookData;
        
        if (reviews.length === 0) return null;
        
        return (
          <div className="w-full bg-[#616f55] py-4 px-4 md:px-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold font-sans text-white mb-4 text-center">
                Reseñas de {currentBook.volumeInfo.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {best && (
                  <ReviewCard review={best} type="best" />
                )}
                {worst && best?.rating !== worst?.rating && (
                  <ReviewCard review={worst} type="worst" />
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
