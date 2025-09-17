import Review from './Review.model';
import { CreateReviewRequest, UpdateReviewRequest, BookStats } from '../../types/index';
import { AuthUser } from '../../types/index';

export class ReviewService {
  
  // Crear una nueva reseña
  static async createReview(reviewData: CreateReviewRequest, user: AuthUser): Promise<any> {
    try {
      // Estrategia robusta: limpiar cualquier reseña existente para este usuario y libro
      await Review.deleteMany({ 
        userId: user._id, 
        bookId: reviewData.bookId
      });
      
      const review = new Review({
        userId: user._id,
        userName: user.name,
        ...reviewData
      });

      await review.save();
      
      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      
      // Manejar específicamente el error de clave duplicada con fallback adicional
      if (error instanceof Error && (error.message.includes('E11000') || error.message.includes('duplicate key'))) {
        try {
          // Forzar eliminación de cualquier documento duplicado
          await Review.deleteMany({ 
            userId: user._id, 
            bookId: reviewData.bookId
          });
          
          // Intentar crear la reseña nuevamente
          const retryReview = new Review({
            userId: user._id,
            userName: user.name,
            ...reviewData
          });
          
          await retryReview.save();
          return retryReview;
          
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          throw new Error('Error al crear la reseña. Por favor, intenta nuevamente.');
        }
      }
      
      throw error;
    }
  }

  // Obtener reseñas de un libro
  static async getBookReviews(bookId: string, page: number = 1, limit: number = 10, sortBy: string = 'createdAt') {
    try {
      const skip = (page - 1) * limit;
      const sortOptions: any = {};
      
      switch (sortBy) {
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        case 'oldest':
          sortOptions.createdAt = 1;
          break;
        case 'highest_rating':
          sortOptions.rating = -1;
          break;
        case 'lowest_rating':
          sortOptions.rating = 1;
          break;
        case 'most_helpful':
          sortOptions.helpfulVotes = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }

      const reviews = await Review.find({ 
        bookId, 
        status: 'active' 
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

      const total = await Review.countDocuments({ bookId, status: 'active' });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting book reviews:', error);
      throw error;
    }
  }

  // Obtener reseñas de un usuario
  static async getUserReviews(
    userId: string, 
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'createdAt' | 'rating' | 'helpfulVotes';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = options;
      
      const skip = (page - 1) * limit;
      
      // Configurar opciones de ordenamiento
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const reviews = await Review.find({ 
        userId, 
        status: 'active' 
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

      const total = await Review.countDocuments({ userId, status: 'active' });
      const totalPages = Math.ceil(total / limit);

      return {
        reviews,
        totalReviews: total,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  }

  // Obtener una reseña específica
  static async getReviewById(reviewId: string) {
    try {
      const review = await Review.findById(reviewId).lean();
      if (!review) {
        throw new Error('Reseña no encontrada');
      }
      return review;
    } catch (error) {
      console.error('Error getting review by id:', error);
      throw error;
    }
  }

  // Actualizar una reseña
  static async updateReview(reviewId: string, updateData: UpdateReviewRequest, userId: string) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Reseña no encontrada');
      }

      if (review.userId.toString() !== userId) {
        throw new Error('No tienes permiso para editar esta reseña');
      }

      Object.assign(review, updateData);
      await review.save();

      return review;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Eliminar una reseña
  static async deleteReview(reviewId: string, userId: string) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Reseña no encontrada');
      }

      if (review.userId.toString() !== userId) {
        throw new Error('No tienes permiso para eliminar esta reseña');
      }

      // Eliminar completamente la reseña de la base de datos
      await Review.findByIdAndDelete(reviewId);

      return { message: 'Reseña eliminada correctamente' };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Obtener estadísticas de un libro
  static async getBookStats(bookId: string): Promise<BookStats> {
    try {
      return await (Review as any).getBookStats(bookId);
    } catch (error) {
      console.error('Error getting book stats:', error);
      throw error;
    }
  }

  // Verificar si un usuario ya reseñó un libro
  static async hasUserReviewed(userId: string, bookId: string) {
    try {
      return await (Review as any).hasUserReviewed(userId, bookId);
    } catch (error) {
      console.error('Error checking if user reviewed:', error);
      throw error;
    }
  }

  // Obtener reseñas destacadas (más útiles)
  static async getFeaturedReviews(limit: number = 5) {
    try {
      return await Review.find({ status: 'active' })
        .sort({ helpfulVotes: -1, totalVotes: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error getting featured reviews:', error);
      throw error;
    }
  }

  // Obtener estadísticas globales del sistema
  static async getGlobalStats() {
    try {
      const totalReviews = await Review.countDocuments({ status: 'active' });
      const totalBooks = await Review.distinct('bookId', { status: 'active' });
      const averageRating = await Review.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);

      return {
        totalReviews,
        totalBooks: totalBooks.length,
        averageRating: averageRating[0]?.avgRating || 0
      };
    } catch (error) {
      console.error('Error getting global stats:', error);
      throw error;
    }
  }

  // Obtener los libros más reseñados
  static async getTopReviewedBooks(limit: number = 20) {
    try {
      return await Review.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$bookId',
            bookId: { $first: '$bookId' },
            bookTitle: { $first: '$bookTitle' },
            bookAuthor: { $first: '$bookAuthor' },
            reviewCount: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        },
        { $sort: { reviewCount: -1 } },
        { $limit: limit }
      ]);
    } catch (error) {
      console.error('Error getting top reviewed books:', error);
      throw error;
    }
  }
}