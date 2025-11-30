import { NextRequest, NextResponse } from 'next/server';
import { FavoriteService } from '@/modules/favorites/favorite.service';
import { verifyToken } from '@/middleware/auth.middleware';

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
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

    // Obtener estadísticas generales
    const readingStats = await FavoriteService.getReadingStats(user._id);
    
    // Obtener libros que se están leyendo actualmente
    const currentReading = await FavoriteService.getCurrentReading(user._id);
    
    // Obtener datos para recomendaciones
    const recommendationData = await FavoriteService.getRecommendationData(user._id);
    
    // Obtener estadísticas anuales
    const yearlyStats = await FavoriteService.getYearlyStats(user._id, year);

    return NextResponse.json({
      success: true,
      data: {
        stats: readingStats,
        currentReading,
        recommendations: recommendationData,
        yearlyStats
      }
    });

  } catch (error) {
    console.error('Error getting reading stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}
