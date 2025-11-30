import { NextRequest, NextResponse } from 'next/server';
import Review from '../../../../modules/reviews/Review.model';
import connectDB from '@/lib/mongoose';

// POST /api/reviews/cleanup - Limpiar reseñas duplicadas y problemáticas
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting comprehensive cleanup of review collection...');
    
    // Conectar a la base de datos
    await connectDB();
    
    // 1. Eliminar todas las reseñas con status 'deleted'
    const deletedResult = await Review.deleteMany({ status: 'deleted' });
    console.log(`🗑️ Eliminadas ${deletedResult.deletedCount} reseñas con status 'deleted'`);
    
    // 2. Buscar y eliminar reseñas duplicadas para el usuario específico que está teniendo problemas
    const problematicUserId = '68c168a616d6be893a052a86';
    const problematicBookId = 'Dc7RAgAAQBAJ';
    
    // Eliminar TODAS las reseñas de este usuario para este libro específico
    const specificCleanup = await Review.deleteMany({ 
      userId: problematicUserId, 
      bookId: problematicBookId 
    });
    console.log(`🗑️ Eliminadas ${specificCleanup.deletedCount} reseñas específicas del usuario problemático`);
    
    // 3. Buscar y eliminar reseñas duplicadas en general
    const allReviews = await Review.find({});
    const reviewMap = new Map();
    const toDelete = [];
    
    for (const review of allReviews) {
      const key = `${review.userId}_${review.bookId}`;
      if (reviewMap.has(key)) {
        // Si ya existe una reseña para este usuario/libro, marcar la actual para eliminar
        toDelete.push(review._id);
      } else {
        reviewMap.set(key, review);
      }
    }
    
    if (toDelete.length > 0) {
      const duplicateResult = await Review.deleteMany({ _id: { $in: toDelete } });
      console.log(`🗑️ Eliminadas ${duplicateResult.deletedCount} reseñas duplicadas`);
    }
    
    // 4. Mostrar estadísticas finales
    const totalReviews = await Review.countDocuments();
    const activeReviews = await Review.countDocuments({ status: 'active' });
    
    console.log('✅ Limpieza completada');
    console.log(`📊 Total de reseñas: ${totalReviews}`);
    console.log(`📊 Reseñas activas: ${activeReviews}`);
    
    return NextResponse.json({
      success: true,
      message: 'Limpieza completada exitosamente',
      results: {
        deletedSoftDeleted: deletedResult.deletedCount,
        deletedSpecific: specificCleanup.deletedCount,
        deletedDuplicates: toDelete.length,
        totalReviews,
        activeReviews
      }
    });
    
  } catch (error) {
    console.error('💥 Error during cleanup:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error durante la limpieza',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
