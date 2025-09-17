import { NextRequest, NextResponse } from 'next/server';
import { FavoriteService } from '@/modules/favorites/favorite.service';
import { verifyToken } from '@/middleware/auth.middleware';
import { CreateFavoriteRequest } from '../../../types/index';

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
    const readingStatus = searchParams.get('readingStatus') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search');

    // Si hay búsqueda, usar el método de búsqueda
    if (search) {
      const result = await FavoriteService.searchFavorites(
        user._id, 
        search, 
        page, 
        limit
      );

      return NextResponse.json({
        success: true,
        data: result
      });
    }

    // Obtener favoritos normalmente
    const result = await FavoriteService.getUserFavorites(
      user._id,
      readingStatus,
      page,
      limit,
      tag
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting favorites:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' }, 
        { status: 401 }
      );
    }

    const body = await request.json() as CreateFavoriteRequest;

    // Validaciones básicas
    if (!body.bookId || !body.bookTitle || !body.bookAuthor) {
      return NextResponse.json(
        { 
          success: false,
          error: 'bookId, bookTitle y bookAuthor son requeridos' 
        }, 
        { status: 400 }
      );
    }

    const favorite = await FavoriteService.addToFavorites(body, user);

    return NextResponse.json({
      success: true,
      data: favorite
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    
    if (error instanceof Error && error.message === 'Este libro ya está en tu lista') {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        }, 
        { status: 409 }
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
