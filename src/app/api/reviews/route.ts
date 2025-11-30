import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '../../../modules/reviews/review.service';
import { CreateReviewRequest } from '../../../types/index';
import { verifyToken } from '../../../middleware/auth.middleware';

// GET /api/reviews - Obtener reseñas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'newest';

    if (bookId) {
      // Obtener reseñas de un libro específico
      const result = await ReviewService.getBookReviews(bookId, page, limit, sortBy);
      return NextResponse.json({
        success: true,
        data: result
      });
    }

    if (userId) {
      // Obtener reseñas de un usuario específico
      const result = await ReviewService.getUserReviews(userId, { page, limit });
      return NextResponse.json({
        success: true,
        data: result
      });
    }

    // Obtener reseñas destacadas
    const featuredReviews = await ReviewService.getFeaturedReviews(limit);
    return NextResponse.json({
      success: true,
      data: { reviews: featuredReviews }
    });

  } catch (error) {
    console.error('Error getting reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error obteniendo reseñas',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Crear nueva reseña
export async function POST(request: NextRequest) {
  console.log('🔄 POST /api/reviews - Starting review creation');
  
  try {
    // Verificar autenticación
    console.log('🔐 Verifying authentication...');
    const user = await verifyToken(request);
    console.log('🔐 Authentication result:', user ? 'Success' : 'Failed');
    
    if (!user) {
      console.log('❌ No authorization - returning 401');
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('📋 Parsing request body...');
    const body: CreateReviewRequest = await request.json();
    console.log('📋 Received review data:', JSON.stringify(body, null, 2));
    console.log('📋 Rating type and value:', typeof body.rating, body.rating);

    // Validar datos requeridos
    console.log('✅ Validating required fields...');
    if (!body.bookId || !body.rating || !body.title || !body.content) {
      const missingFields = {
        bookId: !body.bookId,
        rating: !body.rating,
        title: !body.title,
        content: !body.content
      };
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Faltan campos requeridos: bookId, rating, title, content',
          missingFields
        },
        { status: 400 }
      );
    }

    // Validar calificación (solo enteros entre 1 y 5)
    if (body.rating < 1 || body.rating > 5 || !Number.isInteger(body.rating)) {
      console.log('❌ Invalid rating:', body.rating);
      return NextResponse.json(
        { success: false, message: 'La calificación debe ser un número entero entre 1 y 5' },
        { status: 400 }
      );
    }

    console.log('🚀 Creating review with user:', { id: user._id, name: user.name });
    const review = await ReviewService.createReview(body, user);
    console.log('✅ Review created successfully:', review ? 'Success' : 'Failed');

    return NextResponse.json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: review
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Error creating review:', error);
    
    if (error instanceof Error && error.message === 'Ya has reseñado este libro') {
      console.log('⚠️ User already reviewed this book');
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Error creando reseña',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
