import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '../../../../modules/reviews/review.service';
import { verifyToken } from '../../../../middleware/auth.middleware';

// GET /api/reviews/stats - Obtener estadísticas de reseñas
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    // Si se especifica un bookId, obtener estadísticas de ese libro
    if (bookId) {
      const stats = await ReviewService.getBookStats(bookId);
      return NextResponse.json({
        success: true,
        data: stats
      });
    }

    // Si no se especifica bookId, obtener estadísticas globales
    const globalStats = await ReviewService.getGlobalStats();
    const topBooks = await ReviewService.getTopReviewedBooks(20);

    return NextResponse.json({
      success: true,
      data: {
        ...globalStats,
        topBooks
      }
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error obteniendo estadísticas',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
