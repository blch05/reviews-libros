import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Información del usuario
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  
  // Información del libro (Google Books API)
  bookId: {
    type: String,
    required: [true, 'Book ID is required'],
    index: true
  },
  bookTitle: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  bookAuthor: {
    type: [String],
    default: []
  },
  bookThumbnail: {
    type: String,
    default: null
  },
  
  // Contenido de la reseña
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    trim: true,
    minlength: [20, 'Review must be at least 20 characters long'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  
  // Estadísticas y engagement
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Estado de la reseña
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'flagged', 'hidden', 'deleted'],
    default: 'active'
  },
  
  // Metadatos
  editedAt: {
    type: Date,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
    // Comentado temporalmente para evitar errores de TypeScript
    // transform: function(doc, ret) {
    //   ret.id = ret._id;
    //   delete ret._id;
    //   delete ret.__v;
    //   return ret;
    // }
  }
});

// Índices compuestos para optimizar consultas
// NOTA: Removimos el índice único userId+bookId para permitir recrear reseñas después de eliminación
reviewSchema.index({ userId: 1, bookId: 1 }); // Optimizar búsquedas de reseñas por usuario y libro
reviewSchema.index({ bookId: 1, createdAt: -1 }); // Reseñas de un libro ordenadas por fecha
reviewSchema.index({ rating: -1, createdAt: -1 }); // Reseñas por calificación
reviewSchema.index({ helpfulVotes: -1, totalVotes: -1 }); // Reseñas más útiles

// Virtual para calcular el porcentaje de votos útiles
reviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

// Middleware para validar una reseña activa por usuario/libro y actualizar isEdited
reviewSchema.pre('save', async function(next) {
  try {
    // Solo validar si es un documento nuevo
    if (this.isNew) {
      // Verificar si ya existe una reseña activa para este usuario y libro
      const existingReview = await (this.constructor as any).findOne({ 
        userId: this.userId, 
        bookId: this.bookId, 
        status: 'active' 
      });
      
      if (existingReview) {
        const error = new Error('Ya existe una reseña activa para este libro');
        error.name = 'ValidationError';
        return next(error);
      }
    }
    
    // Actualizar isEdited si se modifica un documento existente
    if (this.isModified() && !this.isNew) {
      this.isEdited = true;
      this.editedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método estático para obtener estadísticas de un libro
reviewSchema.statics.getBookStats = async function(bookId: string) {
  const stats = await this.aggregate([
    { $match: { bookId, status: 'active' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const result = stats[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach((rating: number) => {
    distribution[rating as keyof typeof distribution]++;
  });
  
  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: distribution
  };
};

// Método para verificar si un usuario ya reseñó un libro
reviewSchema.statics.hasUserReviewed = async function(userId: string, bookId: string) {
  const review = await this.findOne({ userId, bookId, status: 'active' });
  return !!review;
};

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;