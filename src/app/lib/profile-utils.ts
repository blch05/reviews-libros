import { Review } from '../../types';

export interface UserProfileStats {
  totalReviews: number;
  averageRating: number;
  booksReviewed: number;
  helpfulVotes: number;
  totalVotes: number;
  mostReadGenres: string[];
  mostProductiveMonth: string;
  reviewsThisYear: number;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  joinDate: Date;
  stats: UserProfileStats;
}

export class ProfileUtils {
  // Obtener estadísticas del usuario basadas en sus reseñas
  static calculateUserStats(reviews: Review[]): UserProfileStats {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        booksReviewed: 0,
        helpfulVotes: 0,
        totalVotes: 0,
        mostReadGenres: [],
        mostProductiveMonth: '',
        reviewsThisYear: 0
      };
    }

    // Calcular estadísticas básicas
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const booksReviewed = new Set(reviews.map(review => review.bookId)).size;
    const helpfulVotes = reviews.reduce((sum, review) => sum + review.helpfulVotes, 0);
    const totalVotes = reviews.reduce((sum, review) => sum + review.totalVotes, 0);

    // Calcular géneros más leídos (basado en categorías de libros)
    const genreMap = new Map<string, number>();
    reviews.forEach(review => {
      // Aquí podrías agregar lógica para extraer géneros si los tienes en los datos
      // Por ahora, como no tenemos esa información, lo dejamos vacío
    });
    const mostReadGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    // Calcular mes más productivo
    const monthMap = new Map<string, number>();
    reviews.forEach(review => {
      const date = new Date(review.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });
    
    const mostProductiveEntry = Array.from(monthMap.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    const mostProductiveMonth = mostProductiveEntry 
      ? this.formatMonth(mostProductiveEntry[0])
      : '';

    // Calcular reseñas este año
    const currentYear = new Date().getFullYear();
    const reviewsThisYear = reviews.filter(review => 
      new Date(review.createdAt).getFullYear() === currentYear
    ).length;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      booksReviewed,
      helpfulVotes,
      totalVotes,
      mostReadGenres,
      mostProductiveMonth,
      reviewsThisYear
    };
  }

  // Formatear mes para mostrar
  private static formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

  // Obtener el progreso de lectura del usuario
  static getReadingProgress(reviews: Review[]): {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  } {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const thisMonthReviews = reviews.filter(review => 
      new Date(review.createdAt) >= thisMonth
    ).length;

    const lastMonthReviews = reviews.filter(review => {
      const reviewDate = new Date(review.createdAt);
      return reviewDate >= lastMonth && reviewDate < thisMonth;
    }).length;

    const percentageChange = lastMonthReviews === 0 
      ? (thisMonthReviews > 0 ? 100 : 0)
      : ((thisMonthReviews - lastMonthReviews) / lastMonthReviews) * 100;

    return {
      thisMonth: thisMonthReviews,
      lastMonth: lastMonthReviews,
      percentageChange: Math.round(percentageChange)
    };
  }

  // Obtener los libros mejor calificados por el usuario
  static getTopRatedBooks(reviews: Review[], limit: number = 5): Review[] {
    return [...reviews]
      .sort((a, b) => {
        // Ordenar por rating descendente, luego por fecha de creación
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);
  }

  // Obtener las reseñas más útiles del usuario
  static getMostHelpfulReviews(reviews: Review[], limit: number = 5): Review[] {
    return [...reviews]
      .filter(review => review.helpfulVotes > 0)
      .sort((a, b) => {
        // Ordenar por votos útiles descendente
        if (b.helpfulVotes !== a.helpfulVotes) {
          return b.helpfulVotes - a.helpfulVotes;
        }
        // Si tienen los mismos votos útiles, ordenar por porcentaje de utilidad
        const aPercentage = a.totalVotes > 0 ? a.helpfulVotes / a.totalVotes : 0;
        const bPercentage = b.totalVotes > 0 ? b.helpfulVotes / b.totalVotes : 0;
        return bPercentage - aPercentage;
      })
      .slice(0, limit);
  }

  // Obtener actividad por mes para gráficos
  static getMonthlyActivity(reviews: Review[], months: number = 12): Array<{
    month: string;
    count: number;
    rating: number;
  }> {
    const now = new Date();
    const monthlyData: Array<{ month: string; count: number; rating: number }> = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthReviews = reviews.filter(review => {
        const reviewDate = new Date(review.createdAt);
        return reviewDate >= date && reviewDate < nextMonth;
      });

      const monthKey = date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short' 
      });

      const averageRating = monthReviews.length > 0
        ? monthReviews.reduce((sum, review) => sum + review.rating, 0) / monthReviews.length
        : 0;

      monthlyData.push({
        month: monthKey,
        count: monthReviews.length,
        rating: Math.round(averageRating * 10) / 10
      });
    }

    return monthlyData;
  }

  // Validar datos de perfil para actualización
  static validateProfileData(data: { name?: string; email?: string }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('El nombre es obligatorio');
      } else if (data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      } else if (data.name.trim().length > 50) {
        errors.push('El nombre no puede tener más de 50 caracteres');
      }
    }

    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email.trim()) {
        errors.push('El email es obligatorio');
      } else if (!emailRegex.test(data.email.trim())) {
        errors.push('El formato del email no es válido');
      } else if (data.email.trim().length > 100) {
        errors.push('El email no puede tener más de 100 caracteres');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}