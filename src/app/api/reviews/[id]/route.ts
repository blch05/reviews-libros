import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '../../../../modules/reviews/review.service';
import { UpdateReviewRequest } from '../../../../types/index';
import { verifyToken } from '../../../../middleware/auth.middleware';

// GET /api/reviews/[id] - Obtener reseña específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const review = await ReviewService.getReviewById(reviewId);

    return NextResponse.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error getting review:', error);
    
    if (error instanceof Error && error.message === 'Reseña no encontrada') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Error obteniendo reseña',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Actualizar reseña
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;
    const body: UpdateReviewRequest = await request.json();

    // Validar calificación si se proporciona (solo enteros)
    if (body.rating && (body.rating < 1 || body.rating > 5 || !Number.isInteger(body.rating))) {
      return NextResponse.json(
        { success: false, message: 'La calificación debe ser un número entero entre 1 y 5' },
        { status: 400 }
      );
    }

    const updatedReview = await ReviewService.updateReview(reviewId, body, user._id);

    return NextResponse.json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: updatedReview
    });

  } catch (error) {
    console.error('Error updating review:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Reseña no encontrada') {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'No tienes permiso para editar esta reseña') {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Error actualizando reseña',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Eliminar reseña
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;
    const result = await ReviewService.deleteReview(reviewId, user._id);

    return NextResponse.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Reseña no encontrada') {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'No tienes permiso para eliminar esta reseña') {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Error eliminando reseña',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}