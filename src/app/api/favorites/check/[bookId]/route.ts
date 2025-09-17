import { NextRequest, NextResponse } from 'next/server';
import { FavoriteService } from '@/modules/favorites/favorite.service';
import { verifyToken } from '@/middleware/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' }, 
        { status: 401 }
      );
    }

    const { bookId } = await params;

    const isFavorited = await FavoriteService.isBookFavorited(user._id, bookId);

    return NextResponse.json({
      success: true,
      data: { isFavorited }
    });

  } catch (error) {
    console.error('Error checking if book is favorited:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}