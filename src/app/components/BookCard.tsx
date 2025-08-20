"use client";

export function BookCard({ book, onSelect }: { book: any, onSelect: (id: string) => void }) {
  const info = book.volumeInfo;
  const portada = info.imageLinks?.extraLarge || info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail || "";
  
  // Función para obtener el promedio de estrellas de localStorage
  function getAverageStars(bookId: string): number {
    if (typeof window === 'undefined') return 0;
    const reviews = JSON.parse(localStorage.getItem(`reviews-${bookId}`) || "[]");
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: any) => acc + review.stars, 0);
    return sum / reviews.length;
  }

  // Función para truncar descripción
  function truncateDescription(description: string, maxLength: number = 150) {
    if (!description || description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  }

  const averageStars = getAverageStars(book.id);
  const truncatedDesc = truncateDescription(info.description, 150);

  // Crear línea de información consolidada
  const publicationInfo = [
    info.publishedDate ? `Publicado: ${info.publishedDate}` : null,
    info.publisher ? `Editorial: ${info.publisher}` : null,
    info.pageCount ? `${info.pageCount} páginas` : null
  ].filter(Boolean).join(" • ");

  return (
    <div className="flex flex-col md:flex-row gap-4 border-b border-gray-400 p-4 bg-white shadow-md cursor-pointer" onClick={() => onSelect(book.id)}>
      {portada && (
        <img src={portada} alt={info.title} className="w-32 h-auto rounded-md object-cover" />
      )}
      <div className="flex-1 font-sans text-sm text-gray-500">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-md text-black font-bold">{info.title}</h3>
          {averageStars > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-gray-700 text-sm font-semibold">{averageStars.toFixed(1)}/5.0</span>
            </div>
          )}
        </div>
        {info.authors && <p className="mb-1"><span className="font-sans text-sm text-gray-800 font-semibold">Autor(es):</span> {info.authors.join(", ")}</p>}
        {publicationInfo && <p className="mb-2 text-gray-600 text-xs">{publicationInfo}</p>}
        {truncatedDesc && (
          <p className="mb-1 text-gray-700 text-sm leading-relaxed">{truncatedDesc}</p>
        )}
        {info.categories && <p className="mb-1"><span className="font-sans text-sm text-gray-800 font-semibold">Categorías:</span> {info.categories.join(", ")}</p>}
      </div>
    </div>
  );
}
