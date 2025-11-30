// Utilidades reutilizables para manejo de reseñas de libros
import { CookieUtils } from './cookie-utils';
import { Review } from '../../types';

export class BookReviewUtils {
  /*
   * Obtiene el token de autenticación de Zustand store o cookies como fallback
   */
  public static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Primero, intentar obtener desde Zustand persist storage
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        if (parsedAuth?.state?.token) {
          return parsedAuth.state.token;
        }
      }
    } catch (error) {
      console.warn('Error parsing Zustand auth storage:', error);
    }
    
    // Fallback: verificar localStorage legacy
    let token = localStorage.getItem('auth-token');
    
    // Si no hay token en localStorage, verificar cookies como fallback
    if (!token) {
      token = CookieUtils.getCookie('auth_token');
      // Sincronizar localStorage con cookies si encontramos el token
      if (token) {
        localStorage.setItem('auth-token', token);
      }
    }
    
    return token;
  }

  /*
   * Obtiene las reseñas de un libro desde la API
   */
  static async getBookReviews(bookId: string): Promise<Review[]> {
    if (typeof window === 'undefined') return [];
    try {
      const token = this.getAuthToken();
      if (!token) return [];

      const response = await fetch(`/api/reviews?bookId=${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Error fetching reviews:', response.statusText);
        return [];
      }

      const responseText = await response.text();
      
      if (!responseText.trim()) {
        console.warn('Empty response from reviews API');
        return [];
      }

      const data = JSON.parse(responseText);
      return data.success ? data.data.reviews : [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  /*
   * Calcula el promedio de estrellas de un libro
   */
  static async getAverageStars(bookId: string): Promise<number> {
    const reviews = await this.getBookReviews(bookId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
    return sum / reviews.length;
  }

  /*
   * Obtiene la mejor y peor reseña de un libro
   */
  static async getBestAndWorstReviews(bookId: string) {
    const reviews = await this.getBookReviews(bookId);
    if (reviews.length === 0) return { best: null, worst: null };
    
    const sortedByStars = [...reviews].sort((a, b) => b.rating - a.rating);
    const best = sortedByStars[0];
    const worst = sortedByStars[sortedByStars.length - 1];
    
    return { best, worst };
  }

  /*
   * Crea una nueva reseña
   */
  static async createReview(bookId: string, content: string, rating: number, bookTitle: string, bookAuthor: string | string[], bookImage?: string, title?: string): Promise<Review | null> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        console.error('No auth token available');
        throw new Error('No autenticado');
      }

      // Convertir bookAuthor a array si es string
      const authorsArray = Array.isArray(bookAuthor) ? bookAuthor : [bookAuthor];
      
      // Generar un título para la reseña si no se proporciona
      const reviewTitle = title || `Mi opinión sobre ${bookTitle}`;

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId,
          content,
          rating,
          title: reviewTitle,
          bookTitle,
          bookAuthor: authorsArray,
          bookThumbnail: bookImage
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Review creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        // Manejar errores específicos
        if (response.status === 409) {
          throw new Error('Ya has reseñado este libro. Solo puedes hacer una reseña por libro.');
        }
        
        if (response.status === 401) {
          throw new Error('Debes iniciar sesión para crear una reseña.');
        }
        
        throw new Error(data.message || 'Error creando reseña');
      }
      
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error creating review:', error);
      return null;
    }
  }

  /*
   * Actualiza una reseña existente
   */
  static async updateReview(reviewId: string, content: string, rating: number): Promise<Review | null> {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          rating
        }),
      });

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error updating review:', error);
      return null;
    }
  }

  /*
   * Elimina una reseña
   */
  static async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  /*
   * Marca una reseña como útil (toggle)
   */
  static async voteReview(reviewId: string, reviewAuthorId: string, bookId: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('No autenticado');

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewId,
          reviewAuthorId,
          bookId,
          voteType: 'helpful'
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error voting review:', error);
      return false;
    }
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
    
    if (!imageUrl) return "";
    
    // Convertir HTTP a HTTPS para evitar problemas de mixed content
    let httpsUrl = imageUrl.replace('http://', 'https://');
    
    // Optimizar URLs de Google Books para mejor carga
    if (httpsUrl.includes('books.google.com')) {
      // Agregar parámetros para optimizar la carga
      if (!httpsUrl.includes('&fife=')) {
        httpsUrl += '&fife=w400-h600&source=gbs_api';
      }
      
      // En entorno de desarrollo, usar proxy para evitar CORS
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return `/api/proxy-image?url=${encodeURIComponent(httpsUrl)}`;
      }
    }
    
    return httpsUrl;
  }

  /*
   * Verifica si el usuario actual ya reseñó un libro específico
   */
  static async hasUserReviewed(bookId: string): Promise<{ hasReviewed: boolean, userReview: Review | null }> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { hasReviewed: false, userReview: null };
      }

      const reviews = await this.getBookReviews(bookId);
      
      // Obtener información del usuario actual
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { hasReviewed: false, userReview: null };
      }

      const authData = await response.json();
      if (!authData.success) {
        return { hasReviewed: false, userReview: null };
      }

      const currentUserId = authData.user.id;
      
      // Buscar reseña del usuario actual - usar toString() para asegurar comparación consistente
      const userReview = reviews.find(review => 
        review.userId.toString() === currentUserId.toString()
      ) || null;

      return {
        hasReviewed: !!userReview,
        userReview
      };
    } catch (error) {
      console.error('Error checking if user reviewed:', error);
      return { hasReviewed: false, userReview: null };
    }
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

// Función exportada independiente para usar fuera de la clase
export function getAuthToken(): string | null {
  return BookReviewUtils.getAuthToken();
}
