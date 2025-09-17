import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  // Usuario que vota
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Reseña votada
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: [true, 'Review ID is required'],
    index: true
  },
  
  // Tipo de voto - solo útil
  voteType: {
    type: String,
    enum: ['helpful'],
    required: [true, 'Vote type is required'],
    default: 'helpful'
  },
  
  // Información adicional del contexto
  reviewAuthorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review author ID is required']
  },
  bookId: {
    type: String,
    required: [true, 'Book ID is required'],
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    // Comentado temporalmente para evitar errores de TypeScript
    // transform: function(doc, ret) {
    //   ret.id = ret._id;
    //   delete ret._id;
    //   delete ret.__v;
    //   return ret;
    // }
  }
});

// Índices compuestos para optimizar consultas y evitar votos duplicados
voteSchema.index({ userId: 1, reviewId: 1 }, { unique: true }); // Un usuario puede votar una vez por reseña
voteSchema.index({ reviewId: 1, voteType: 1 }); // Contar votos por tipo
voteSchema.index({ userId: 1, createdAt: -1 }); // Historial de votos del usuario
voteSchema.index({ reviewAuthorId: 1, voteType: 1 }); // Estadísticas del autor de reseñas

// Middleware para actualizar contadores en la reseña
voteSchema.post('save', async function() {
  await updateReviewVoteCounts(this.reviewId);
});

voteSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateReviewVoteCounts(doc.reviewId);
  }
});

voteSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    await updateReviewVoteCounts(doc.reviewId);
  }
});

// Función helper para actualizar contadores de votos en la reseña
async function updateReviewVoteCounts(reviewId: mongoose.Types.ObjectId) {
  try {
    const Review = mongoose.model('Review');
    
    // Solo contamos votos útiles
    const helpfulVotes = await mongoose.model('Vote').countDocuments({ 
      reviewId, 
      voteType: 'helpful' 
    });
    
    await Review.findByIdAndUpdate(reviewId, {
      helpfulVotes,
      totalVotes: helpfulVotes // Para este sistema simplificado, total = helpful
    });
  } catch (error) {
    console.error('Error updating review vote counts:', error);
  }
}

// Método estático para obtener el voto de un usuario en una reseña
voteSchema.statics.getUserVote = async function(userId: string, reviewId: string) {
  return this.findOne({ userId, reviewId });
};

// Método estático para cambiar o crear un voto (solo toggle para helpful)
voteSchema.statics.setVote = async function(userId: string, reviewId: string, reviewAuthorId: string, bookId: string) {
  const existingVote = await this.findOne({ userId, reviewId });
  
  if (existingVote) {
    // Si ya existe, eliminarlo (toggle off)
    await this.findByIdAndDelete(existingVote._id);
    return { action: 'removed', vote: null };
  } else {
    // Crear nuevo voto útil
    const newVote = new this({
      userId,
      reviewId,
      voteType: 'helpful',
      reviewAuthorId,
      bookId
    });
    await newVote.save();
    return { action: 'created', vote: newVote };
  }
};

// Método estático para obtener estadísticas de votos de un usuario
voteSchema.statics.getUserVoteStats = async function(userId: string) {
  const helpfulVotes = await this.countDocuments({ 
    userId: new mongoose.Types.ObjectId(userId),
    voteType: 'helpful'
  });
  
  return {
    totalVotes: helpfulVotes,
    helpfulVotes: helpfulVotes
  };
};

// Método estático para obtener las reseñas más votadas de un libro
voteSchema.statics.getTopVotedReviews = async function(bookId: string, limit: number = 10) {
  return this.aggregate([
    { $match: { bookId, voteType: 'helpful' } },
    {
      $group: {
        _id: '$reviewId',
        helpfulVotes: { $sum: 1 }
      }
    },
    { $sort: { helpfulVotes: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: '_id',
        as: 'review'
      }
    },
    { $unwind: '$review' },
    {
      $project: {
        review: 1,
        helpfulVotes: 1
      }
    }
  ]);
};

const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);

export default Vote;