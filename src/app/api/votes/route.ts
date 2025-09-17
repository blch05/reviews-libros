import { NextRequest, NextResponse } from 'next/server';
import { VoteService } from '../../../modules/votes/vote.service';
import { CreateVoteRequest } from '../../../types/index';
import { verifyToken } from '../../../middleware/auth.middleware';

// GET /api/votes - Obtener votos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');
    const bookId = searchParams.get('bookId');
    const userId = searchParams.get('userId');
    const reviewIds = searchParams.get('reviewIds');

    // Verificar autenticación para algunas consultas
    const user = await verifyToken(request);

    if (reviewId && user) {
      // Obtener voto específico de un usuario en una reseña
      const vote = await VoteService.getUserVote(user._id, reviewId);
      return NextResponse.json({
        success: true,
        data: { vote }
      });
    }

    if (reviewIds) {
      // Obtener conteos de votos para múltiples reseñas
      const reviewIdArray = reviewIds.split(',');
      const voteCounts = await VoteService.getVoteCountsForReviews(reviewIdArray);
      
      let userVotes = {};
      if (user) {
        userVotes = await VoteService.getUserVotesForReviews(user._id, reviewIdArray);
      }

      return NextResponse.json({
        success: true,
        data: {
          voteCounts,
          userVotes
        }
      });
    }

    if (bookId) {
      // Obtener reseñas más votadas de un libro
      const limit = parseInt(searchParams.get('limit') || '10');
      const topReviews = await VoteService.getTopVotedReviews(bookId, limit);
      return NextResponse.json({
        success: true,
        data: { topReviews }
      });
    }

    if (userId) {
      // Obtener estadísticas de votos de un usuario
      const stats = await VoteService.getUserVoteStats(userId);
      return NextResponse.json({
        success: true,
        data: { stats }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Parámetros insuficientes' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error getting votes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error obteniendo votos',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/votes - Crear o actualizar voto
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/votes - Starting vote operation');
    
    // Verificar autenticación
    const user = await verifyToken(request);
    if (!user) {
      console.log('❌ Authentication failed');
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }
    console.log('✅ User authenticated:', { id: user._id, name: user.name });

    const body: CreateVoteRequest = await request.json();
    console.log('📋 Vote request body:', body);

    // Validar datos requeridos
    if (!body.reviewId || !body.reviewAuthorId || !body.bookId) {
      console.log('❌ Missing required fields:', {
        reviewId: !!body.reviewId,
        reviewAuthorId: !!body.reviewAuthorId,
        bookId: !!body.bookId
      });
      return NextResponse.json(
        { success: false, message: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // El voteType siempre será 'helpful' en el nuevo sistema
    body.voteType = 'helpful';
    console.log('✅ All required fields present, voteType set to helpful');

    // Validar que el usuario no vote su propia reseña
    if (user._id === body.reviewAuthorId) {
      console.log('❌ User trying to vote on own review:', { userId: user._id, reviewAuthorId: body.reviewAuthorId });
      return NextResponse.json(
        { success: false, message: 'No puedes votar tu propia reseña' },
        { status: 400 }
      );
    }
    console.log('✅ User is not voting on own review');

    console.log('🔄 Calling VoteService.setVote...');
    const result = await VoteService.setVote(body, user);
    console.log('✅ VoteService.setVote result:', result);

    return NextResponse.json({
      success: true,
      message: `Voto ${result.action === 'removed' ? 'eliminado' : 'añadido'} exitosamente`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error setting vote:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error procesando voto',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
