import { NextRequest, NextResponse } from 'next/server';
import { FavoriteService } from '@/modules/favorites/favorite.service';
import { verifyToken } from '@/middleware/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' }, 
        { status: 401 }
      );
    }

    const { tag } = await params;

    // Decodificar la etiqueta ya que viene de la URL
    const decodedTag = decodeURIComponent(tag);

    const books = await FavoriteService.getBooksByTag(user._id, decodedTag);

    return NextResponse.json({
      success: true,
      data: {
        tag: decodedTag,
        books
      }
    });

  } catch (error) {
    console.error('Error getting books by tag:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}