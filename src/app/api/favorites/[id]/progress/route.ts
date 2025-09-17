import { NextRequest, NextResponse } from 'next/server';
import { FavoriteService } from '@/modules/favorites/favorite.service';
import { verifyToken } from '@/middleware/auth.middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' }, 
        { status: 401 }
      );
    }

    const { id: favoriteId } = await params;
    const body = await request.json();

    // Validaciones
    if (typeof body.currentPage !== 'number' || body.currentPage < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'currentPage debe ser un número válido mayor o igual a 0' 
        }, 
        { status: 400 }
      );
    }

    if (body.totalPages && (typeof body.totalPages !== 'number' || body.totalPages <= 0)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'totalPages debe ser un número válido mayor a 0' 
        }, 
        { status: 400 }
      );
    }

    const favorite = await FavoriteService.updateReadingProgress(
      favoriteId,
      user._id,
      body.currentPage,
      body.totalPages
    );

    return NextResponse.json({
      success: true,
      data: favorite
    });

  } catch (error) {
    console.error('Error updating reading progress:', error);
    
    if (error instanceof Error && error.message === 'Favorito no encontrado') {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}