
"use client";
import { useState, useEffect } from "react";
import TruncatedText from "./TruncatedText";
import StarRating from "./StarRating";
import ProxyAwareBookImage from "./ProxyAwareBookImage";
import { BookReviewUtils } from "../lib/book-review-utils";

export function BookCard({ book, onSelect }: { book: any, onSelect: (id: string) => void }) {
  const [averageStars, setAverageStars] = useState(0);
  const [loading, setLoading] = useState(false);

  const info = book.volumeInfo;
  const coverUrl = BookReviewUtils.getBookCoverUrl(book);
  const publicationInfo = BookReviewUtils.getPublicationInfo(info);

  useEffect(() => {
    const loadAverageStars = async () => {
      setLoading(true);
      try {
        const stars = await BookReviewUtils.getAverageStars(book.id);
        setAverageStars(stars);
      } catch (error) {
        console.error('Error loading average stars:', error);
        setAverageStars(0);
      } finally {
        setLoading(false);
      }
    };

    loadAverageStars();
  }, [book.id]);

  return (
    <div className="flex flex-col md:flex-row gap-4 border-b border-gray-400 p-4 bg-white shadow-md cursor-pointer" onClick={() => onSelect(book.id)}>
      <ProxyAwareBookImage src={coverUrl} alt={info.title} size="md" className="rounded-md" />
      <div className="flex-1 font-sans text-sm text-gray-500">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-md text-black font-bold">{info.title}</h3>
          {averageStars > 0 && !loading && (
            <StarRating rating={averageStars} size="sm" />
          )}
        </div>
        {info.authors && <p className="mb-1"><span className="font-sans text-sm text-gray-800 font-semibold">Autor(es):</span> {info.authors.join(", ")}</p>}
        {publicationInfo && <p className="mb-2 text-gray-600 text-xs">{publicationInfo}</p>}
        {info.description && (
          <TruncatedText text={info.description} maxLength={150} className="mb-1 text-gray-700 text-sm leading-relaxed" />
        )}
        {info.categories && <p className="mb-1"><span className="font-sans text-sm text-gray-800 font-semibold">Categorias:</span> {info.categories.join(", ")}</p>}
      </div>
    </div>
  );
}
