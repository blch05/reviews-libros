import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { ReviewService } from '@/modules/reviews/review.service';

export async function GET(request: NextRequest) {
  console.log('🔄 GET /api/reviews/user - Fetching user reviews');

  try {
    // Verificar autenticación
    console.log('🔐 Verifying authentication...');
    const user = await verifyToken(request);
    
    if (!user) {
      console.log('❌ User not authenticated');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', { id: user._id, name: user.name });

    // Obtener parámetros de paginación
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    console.log('📋 Query parameters:', { page, limit, sortBy, sortOrder });

    // Obtener reseñas del usuario
    console.log('🔍 Fetching reviews for user:', user._id);
    const result = await ReviewService.getUserReviews(user._id, {
      page,
      limit,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    console.log('✅ Reviews fetched successfully:', { 
      count: result.reviews.length, 
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User reviews retrieved successfully',
        ...result
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 Error fetching user reviews:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
