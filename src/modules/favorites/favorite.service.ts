import Favorite from './Favorite.model';
import { CreateFavoriteRequest, UpdateFavoriteRequest, ReadingStats, RecommendationData, YearlyReadingStats } from '../../types/index';
import { AuthUser } from '../../types/index';

export class FavoriteService {
  
  // Agregar libro a favoritos
  static async addToFavorites(favoriteData: CreateFavoriteRequest, user: AuthUser) {
    try {
      // Verificar si el libro ya está en favoritos
      const existingFavorite = await Favorite.findOne({
        userId: user._id,
        bookId: favoriteData.bookId,
        isArchived: false
      });

      if (existingFavorite) {
        throw new Error('Este libro ya está en tu lista');
      }

      const favorite = new Favorite({
        userId: user._id,
        ...favoriteData
      });

      await favorite.save();
      return favorite;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Obtener favoritos de un usuario
  static async getUserFavorites(
    userId: string, 
    readingStatus?: string, 
    page: number = 1, 
    limit: number = 20,
    tag?: string
  ) {
    try {
      const skip = (page - 1) * limit;
      const query: any = { userId, isArchived: false };

      if (readingStatus) {
        query.readingStatus = readingStatus;
      }

      if (tag) {
        query.tags = tag;
      }

      const favorites = await Favorite.find(query)
        .sort({ dateAdded: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Favorite.countDocuments(query);

      return {
        favorites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user favorites:', error);
      throw error;
    }
  }

  // Obtener un favorito específico
  static async getFavoriteById(favoriteId: string, userId: string) {
    try {
      const favorite = await Favorite.findOne({ 
        _id: favoriteId, 
        userId,
        isArchived: false 
      }).lean();

      if (!favorite) {
        throw new Error('Favorito no encontrado');
      }

      return favorite;
    } catch (error) {
      console.error('Error getting favorite by id:', error);
      throw error;
    }
  }

  // Verificar si un libro está en favoritos
  static async isBookFavorited(userId: string, bookId: string) {
    try {
      return await (Favorite as any).isBookFavorited(userId, bookId);
    } catch (error) {
      console.error('Error checking if book is favorited:', error);
      throw error;
    }
  }

  // Actualizar favorito
  static async updateFavorite(favoriteId: string, updateData: UpdateFavoriteRequest, userId: string) {
    try {
      const favorite = await Favorite.findOne({ 
        _id: favoriteId, 
        userId,
        isArchived: false 
      });

      if (!favorite) {
        throw new Error('Favorito no encontrado');
      }

      Object.assign(favorite, updateData);
      await favorite.save();

      return favorite;
    } catch (error) {
      console.error('Error updating favorite:', error);
      throw error;
    }
  }

  // Eliminar favorito (archivar)
  static async removeFavorite(favoriteId: string, userId: string) {
    try {
      const favorite = await Favorite.findOne({ 
        _id: favoriteId, 
        userId,
        isArchived: false 
      });

      if (!favorite) {
        throw new Error('Favorito no encontrado');
      }

      favorite.isArchived = true;
      await favorite.save();

      return { message: 'Libro eliminado de favoritos' };
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  // Obtener estadísticas de lectura
  static async getReadingStats(userId: string): Promise<ReadingStats> {
    try {
      return await (Favorite as any).getUserReadingStats(userId);
    } catch (error) {
      console.error('Error getting reading stats:', error);
      throw error;
    }
  }

  // Obtener libros que se están leyendo actualmente
  static async getCurrentReading(userId: string) {
    try {
      return await (Favorite as any).getCurrentReading(userId);
    } catch (error) {
      console.error('Error getting current reading:', error);
      throw error;
    }
  }

  // Obtener datos para recomendaciones
  static async getRecommendationData(userId: string): Promise<RecommendationData> {
    try {
      return await (Favorite as any).getRecommendationData(userId);
    } catch (error) {
      console.error('Error getting recommendation data:', error);
      throw error;
    }
  }

  // Obtener libros por etiqueta
  static async getBooksByTag(userId: string, tag: string) {
    try {
      return await (Favorite as any).getBooksByTag(userId, tag);
    } catch (error) {
      console.error('Error getting books by tag:', error);
      throw error;
    }
  }

  // Obtener estadísticas anuales
  static async getYearlyStats(userId: string, year?: number): Promise<YearlyReadingStats[]> {
    try {
      return await (Favorite as any).getYearlyStats(userId, year);
    } catch (error) {
      console.error('Error getting yearly stats:', error);
      throw error;
    }
  }

  // Actualizar progreso de lectura
  static async updateReadingProgress(
    favoriteId: string, 
    userId: string, 
    currentPage: number, 
    totalPages?: number
  ) {
    try {
      const favorite = await Favorite.findOne({ 
        _id: favoriteId, 
        userId,
        isArchived: false 
      });

      if (!favorite) {
        throw new Error('Favorito no encontrado');
      }

      favorite.currentPage = currentPage;
      if (totalPages) {
        favorite.totalPages = totalPages;
      }

      // Cambiar estado a "leyendo" si no lo está
      if (favorite.readingStatus === 'want_to_read') {
        favorite.readingStatus = 'currently_reading';
      }

      // Marcar como leído si se completó
      if (favorite.totalPages && currentPage >= favorite.totalPages) {
        favorite.readingStatus = 'read';
      }

      await favorite.save();
      return favorite;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      throw error;
    }
  }

  // Buscar en favoritos
  static async searchFavorites(userId: string, query: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const searchQuery = {
        userId,
        isArchived: false,
        $or: [
          { bookTitle: { $regex: query, $options: 'i' } },
          { bookAuthor: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
          { personalNotes: { $regex: query, $options: 'i' } }
        ]
      };

      const favorites = await Favorite.find(searchQuery)
        .sort({ dateAdded: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Favorite.countDocuments(searchQuery);

      return {
        favorites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error searching favorites:', error);
      throw error;
    }
  }
}