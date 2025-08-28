// Utilidades reutilizables para manejo de reseñas de libros

export interface Review {
  id: string;
  text: string;
  stars: number;
  bookId: string;
  timestamp?: number;
}

export class BookReviewUtils {
  /*
   * Obtiene las reseñas de un libro desde localStorage
   */
  static getBookReviews(bookId: string): Review[] {
    if (typeof window === 'undefined') return [];
    try {
      const reviews = JSON.parse(localStorage.getItem(`reviews-${bookId}`) || "[]");
      return reviews;
    } catch {
      return [];
    }
  }

  /*
   * Calcula el promedio de estrellas de un libro
   */
  static getAverageStars(bookId: string): number {
    const reviews = this.getBookReviews(bookId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: Review) => acc + review.stars, 0);
    return sum / reviews.length;
  }

  /*
   * Obtiene la mejor y peor reseña de un libro
   */
  static getBestAndWorstReviews(bookId: string) {
    const reviews = this.getBookReviews(bookId);
    if (reviews.length === 0) return { best: null, worst: null };
    
    const sortedByStars = [...reviews].sort((a, b) => b.stars - a.stars);
    const best = sortedByStars[0];
    const worst = sortedByStars[sortedByStars.length - 1];
    
    return { best, worst };
  }

  /*
   * Obtiene la URL de la portada del libro con fallbacks
   */
  static getBookCoverUrl(book: any): string {
    const imageLinks = book.volumeInfo?.imageLinks;
    
    if (!imageLinks) return "";
    
    // Priorizar imágenes de mayor calidad y convertir a HTTPS
    const imageUrl = imageLinks.extraLarge || 
                     imageLinks.large || 
                     imageLinks.medium || 
                     imageLinks.thumbnail || 
                     "";
    
    // Convertir HTTP a HTTPS para evitar problemas de mixed content
    return imageUrl.replace('http://', 'https://');
  }

  /*
   * Crea información consolidada de publicación
   */
  static getPublicationInfo(volumeInfo: any): string {
    const info = [
      volumeInfo.publishedDate ? `Publicado: ${volumeInfo.publishedDate}` : null,
      volumeInfo.publisher ? `Editorial: ${volumeInfo.publisher}` : null,
      volumeInfo.pageCount ? `${volumeInfo.pageCount} páginas` : null
    ].filter(Boolean);
    
    return info.join(" • ");
  }
}
