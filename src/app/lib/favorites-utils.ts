// Utilidades reutilizables para manejo de favoritos

export interface FavoriteItem {
  _id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookImage?: string;
  readingStatus: 'want_to_read' | 'currently_reading' | 'read';
  rating?: number;
  personalNotes?: string;
  tags: string[];
  currentPage?: number;
  totalPages?: number;
  dateAdded: string;
  dateStarted?: string;
  dateFinished?: string;
  isArchived: boolean;
}

export class FavoriteUtils {
  /*
   * Obtiene los favoritos del usuario desde la API
   */
  static async getUserFavorites(
    readingStatus?: string, 
    page: number = 1, 
    limit: number = 20,
    tag?: string,
    search?: string
  ): Promise<{ favorites: FavoriteItem[], pagination: any }> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return { favorites: [], pagination: { page: 1, total: 0, pages: 0 } };

      const params = new URLSearchParams();
      if (readingStatus) params.append('readingStatus', readingStatus);
      if (tag) params.append('tag', tag);
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/favorites?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Error fetching favorites:', response.statusText);
        return { favorites: [], pagination: { page: 1, total: 0, pages: 0 } };
      }

      const data = await response.json();
      return data.success ? data.data : { favorites: [], pagination: { page: 1, total: 0, pages: 0 } };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return { favorites: [], pagination: { page: 1, total: 0, pages: 0 } };
    }
  }

  /*
   * Agrega un libro a favoritos
   */
  static async addToFavorites(
    bookId: string,
    bookTitle: string,
    bookAuthor: string,
    bookImage?: string,
    readingStatus: string = 'want_to_read',
    tags: string[] = []
  ): Promise<FavoriteItem | null> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId,
          bookTitle,
          bookAuthor,
          bookImage,
          readingStatus,
          tags
        }),
      });

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return null;
    }
  }

  /*
   * Verifica si un libro está en favoritos
   */
  static async isBookFavorited(bookId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return false;

      const response = await fetch(`/api/favorites/check/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.success ? data.data.isFavorited : false;
    } catch (error) {
      console.error('Error checking if book is favorited:', error);
      return false;
    }
  }

  /*
   * Actualiza un favorito
   */
  static async updateFavorite(
    favoriteId: string,
    updates: Partial<FavoriteItem>
  ): Promise<FavoriteItem | null> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error updating favorite:', error);
      return null;
    }
  }

  /*
   * Elimina un favorito
   */
  static async removeFavorite(favoriteId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  /*
   * Actualiza el progreso de lectura
   */
  static async updateReadingProgress(
    favoriteId: string,
    currentPage: number,
    totalPages?: number
  ): Promise<FavoriteItem | null> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`/api/favorites/${favoriteId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPage,
          totalPages
        }),
      });

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      return null;
    }
  }

  /*
   * Obtiene estadísticas de lectura
   */
  static async getReadingStats(year?: number): Promise<any> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return null;

      const params = year ? `?year=${year}` : '';
      const response = await fetch(`/api/favorites/stats${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error getting reading stats:', error);
      return null;
    }
  }

  /*
   * Obtiene libros por etiqueta
   */
  static async getBooksByTag(tag: string): Promise<FavoriteItem[]> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return [];

      const response = await fetch(`/api/favorites/tags/${encodeURIComponent(tag)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.success ? data.data.books : [];
    } catch (error) {
      console.error('Error getting books by tag:', error);
      return [];
    }
  }

  /*
   * Obtiene el progreso de lectura en porcentaje
   */
  static getReadingProgress(favorite: FavoriteItem): number {
    if (!favorite.currentPage || !favorite.totalPages) return 0;
    return Math.min(100, Math.round((favorite.currentPage / favorite.totalPages) * 100));
  }

  /*
   * Obtiene el color de estado de lectura
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case 'want_to_read':
        return 'bg-blue-100 text-blue-800';
      case 'currently_reading':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /*
   * Obtiene el texto de estado de lectura
   */
  static getStatusText(status: string): string {
    switch (status) {
      case 'want_to_read':
        return 'Quiero leer';
      case 'currently_reading':
        return 'Leyendo';
      case 'read':
        return 'Leído';
      default:
        return 'Sin estado';
    }
  }
}