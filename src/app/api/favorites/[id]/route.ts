import { NextRequest, NextResponse } from 'next/server';
import { FavoriteService } from '../../../../modules/favorites/favorite.service';
import { verifyToken } from '../../../../middleware/auth.middleware';
import { UpdateFavoriteRequest } from '../../../../types/index';

export async function GET(
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

    const favorite = await FavoriteService.getFavoriteById(favoriteId, user._id);

    return NextResponse.json({
      success: true,
      data: favorite
    });

  } catch (error) {
    console.error('Error getting favorite:', error);
    
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
    const body = await request.json() as UpdateFavoriteRequest;

    const favorite = await FavoriteService.updateFavorite(favoriteId, body, user._id);

    return NextResponse.json({
      success: true,
      data: favorite
    });

  } catch (error) {
    console.error('Error updating favorite:', error);
    
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

export async function DELETE(
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

    const result = await FavoriteService.removeFavorite(favoriteId, user._id);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    
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