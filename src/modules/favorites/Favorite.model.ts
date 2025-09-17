import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  // Usuario propietario
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
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
  bookPublishedDate: {
    type: String,
    default: null
  },
  bookPageCount: {
    type: Number,
    default: null
  },
  bookCategories: {
    type: [String],
    default: []
  },
  
  // Estado de lectura
  readingStatus: {
    type: String,
    enum: ['want_to_read', 'currently_reading', 'read', 'did_not_finish'],
    default: 'want_to_read',
    required: true
  },
  
  // Fechas de seguimiento
  dateAdded: {
    type: Date,
    default: Date.now
  },
  dateStarted: {
    type: Date,
    default: null
  },
  dateFinished: {
    type: Date,
    default: null
  },
  
  // Progreso de lectura
  currentPage: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPages: {
    type: Number,
    default: null,
    min: 0
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Notas y calificación personal
  personalNotes: {
    type: String,
    maxlength: [1000, 'Personal notes cannot exceed 1000 characters'],
    default: ''
  },
  personalRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Prioridad en la lista
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Etiquetas personalizadas
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  
  // Configuración de privacidad
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  // Metadatos adicionales
  source: {
    type: String,
    enum: ['manual', 'recommendation', 'review', 'search'],
    default: 'manual'
  },
  isArchived: {
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
favoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true }); // Un libro por usuario
favoriteSchema.index({ userId: 1, readingStatus: 1, dateAdded: -1 }); // Listas por estado
favoriteSchema.index({ userId: 1, isArchived: 1, dateAdded: -1 }); // Libros activos/archivados
favoriteSchema.index({ userId: 1, priority: 1, dateAdded: -1 }); // Por prioridad
favoriteSchema.index({ userId: 1, tags: 1 }); // Por etiquetas

// Virtual para calcular el porcentaje de progreso automáticamente
favoriteSchema.virtual('readingProgress').get(function() {
  if (!this.totalPages || this.totalPages === 0) return 0;
  return Math.round((this.currentPage / this.totalPages) * 100);
});

// Virtual para duración de lectura
favoriteSchema.virtual('readingDuration').get(function() {
  if (!this.dateStarted) return null;
  const endDate = this.dateFinished || new Date();
  const diffTime = Math.abs(endDate.getTime() - this.dateStarted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Middleware para actualizar progreso automáticamente
favoriteSchema.pre('save', function(next) {
  // Actualizar porcentaje de progreso si se proporciona página actual y total
  if (this.currentPage && this.totalPages && this.totalPages > 0) {
    this.progressPercentage = Math.round((this.currentPage / this.totalPages) * 100);
  }
  
  // Actualizar fecha de inicio cuando cambia a "currently_reading"
  if (this.isModified('readingStatus')) {
    if (this.readingStatus === 'currently_reading' && !this.dateStarted) {
      this.dateStarted = new Date();
    }
    
    // Actualizar fecha de finalización cuando cambia a "read"
    if (this.readingStatus === 'read' && !this.dateFinished) {
      this.dateFinished = new Date();
      this.currentPage = this.totalPages || this.currentPage;
      this.progressPercentage = 100;
    }
  }
  
  next();
});

// Método estático para obtener estadísticas de lectura del usuario
favoriteSchema.statics.getUserReadingStats = async function(userId: string) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: false } },
    {
      $group: {
        _id: '$readingStatus',
        count: { $sum: 1 },
        books: { $push: '$$ROOT' }
      }
    }
  ]);
  
  const result = {
    want_to_read: 0,
    currently_reading: 0,
    read: 0,
    did_not_finish: 0,
    total: 0
  };
  
  let totalBooks = 0;
  stats.forEach(stat => {
    result[stat._id as keyof typeof result] = stat.count;
    totalBooks += stat.count;
  });
  
  result.total = totalBooks;
  return result;
};

// Método estático para obtener progreso actual de lectura
favoriteSchema.statics.getCurrentReading = async function(userId: string) {
  return this.find({
    userId,
    readingStatus: 'currently_reading',
    isArchived: false
  }).sort({ dateStarted: -1 });
};

// Método estático para obtener recomendaciones basadas en favoritos
favoriteSchema.statics.getRecommendationData = async function(userId: string) {
  const favoriteBooks = await this.find({
    userId,
    readingStatus: { $in: ['read', 'currently_reading'] },
    isArchived: false
  });
  
  // Extraer categorías y autores más frecuentes
  const categories = new Map();
  const authors = new Map();
  
  favoriteBooks.forEach((book: any) => {
    book.bookCategories?.forEach((category: string) => {
      categories.set(category, (categories.get(category) || 0) + 1);
    });
    
    book.bookAuthor?.forEach((author: string) => {
      authors.set(author, (authors.get(author) || 0) + 1);
    });
  });
  
  return {
    preferredCategories: Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category),
    preferredAuthors: Array.from(authors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([author]) => author)
  };
};

// Método para verificar si un libro está en favoritos
favoriteSchema.statics.isBookFavorited = async function(userId: string, bookId: string) {
  const favorite = await this.findOne({ userId, bookId, isArchived: false });
  return favorite ? favorite.readingStatus : null;
};

// Método para obtener libros por etiqueta
favoriteSchema.statics.getBooksByTag = async function(userId: string, tag: string) {
  return this.find({
    userId,
    tags: tag,
    isArchived: false
  }).sort({ dateAdded: -1 });
};

// Método para obtener estadísticas de lectura por año
favoriteSchema.statics.getYearlyStats = async function(userId: string, year?: number) {
  const targetYear = year || new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear + 1, 0, 1);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        readingStatus: 'read',
        dateFinished: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: { $month: '$dateFinished' },
        count: { $sum: 1 },
        totalPages: { $sum: '$totalPages' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);

export default Favorite;