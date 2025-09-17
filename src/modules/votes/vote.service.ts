import Vote from './Vote.model';
import { CreateVoteRequest, UserVoteStats } from '../../types/index';
import { AuthUser } from '../../types/index';

export class VoteService {
  
  // Crear o alternar un voto útil
  static async setVote(voteData: CreateVoteRequest, user: AuthUser) {
    try {
      const result = await (Vote as any).setVote(
        user._id,
        voteData.reviewId,
        voteData.reviewAuthorId,
        voteData.bookId
      );

      return result;
    } catch (error) {
      console.error('Error setting vote:', error);
      throw error;
    }
  }

  // Obtener el voto de un usuario en una reseña
  static async getUserVote(userId: string, reviewId: string) {
    try {
      return await (Vote as any).getUserVote(userId, reviewId);
    } catch (error) {
      console.error('Error getting user vote:', error);
      throw error;
    }
  }

  // Obtener estadísticas de votos de un usuario
  static async getUserVoteStats(userId: string): Promise<UserVoteStats> {
    try {
      return await (Vote as any).getUserVoteStats(userId);
    } catch (error) {
      console.error('Error getting user vote stats:', error);
      throw error;
    }
  }

  // Obtener reseñas más votadas de un libro
  static async getTopVotedReviews(bookId: string, limit: number = 10) {
    try {
      return await (Vote as any).getTopVotedReviews(bookId, limit);
    } catch (error) {
      console.error('Error getting top voted reviews:', error);
      throw error;
    }
  }

  // Obtener votos de múltiples reseñas para un usuario
  static async getUserVotesForReviews(userId: string, reviewIds: string[]) {
    try {
      const votes = await Vote.find({
        userId,
        reviewId: { $in: reviewIds }
      }).lean();

      // Convertir a un mapa para facilitar el acceso
      const voteMap: { [reviewId: string]: boolean } = {};
      votes.forEach(vote => {
        voteMap[vote.reviewId.toString()] = true; // Solo marcamos si votó útil
      });

      return voteMap;
    } catch (error) {
      console.error('Error getting user votes for reviews:', error);
      throw error;
    }
  }

  // Obtener conteo de votos útiles para múltiples reseñas
  static async getVoteCountsForReviews(reviewIds: string[]) {
    try {
      const voteCounts = await Vote.aggregate([
        { $match: { reviewId: { $in: reviewIds.map(id => new (Vote as any).Types.ObjectId(id)) } } },
        {
          $group: {
            _id: '$reviewId',
            helpful: { $sum: 1 } // Solo contamos votos útiles
          }
        }
      ]);

      // Convertir a un mapa para facilitar el acceso
      const countsMap: { [reviewId: string]: { helpful: number } } = {};
      voteCounts.forEach(count => {
        const reviewId = count._id.toString();
        countsMap[reviewId] = {
          helpful: count.helpful
        };
      });

      return countsMap;
    } catch (error) {
      console.error('Error getting vote counts for reviews:', error);
      throw error;
    }
  }
}