// Types for authentication system
export interface User {
  _id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Request types with user attached
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Review types
export interface Review {
  _id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string[];
  bookThumbnail?: string;
  rating: number;
  title: string;
  content: string;
  helpfulVotes: number;
  totalVotes: number;
  isVerified: boolean;
  status: 'active' | 'flagged' | 'hidden' | 'deleted';
  editedAt?: Date;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  helpfulPercentage: number; // virtual
}

export interface CreateReviewRequest {
  bookId: string;
  bookTitle: string;
  bookAuthor: string[];
  bookThumbnail?: string;
  rating: number;
  title: string;
  content: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
}

export interface BookStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Vote types
export interface Vote {
  _id: string;
  userId: string;
  reviewId: string;
  voteType: 'helpful'; // Solo votos útiles
  reviewAuthorId: string;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVoteRequest {
  reviewId: string;
  voteType: 'helpful'; // Solo votos útiles
  reviewAuthorId: string;
  bookId: string;
}

export interface UserVoteStats {
  totalVotes: number;
  helpfulVotes: number;
}

// Favorite types
export interface Favorite {
  _id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string[];
  bookThumbnail?: string;
  bookPublishedDate?: string;
  bookPageCount?: number;
  bookCategories: string[];
  readingStatus: 'want_to_read' | 'currently_reading' | 'read' | 'did_not_finish';
  dateAdded: Date;
  dateStarted?: Date;
  dateFinished?: Date;
  currentPage: number;
  totalPages?: number;
  progressPercentage: number;
  personalNotes: string;
  personalRating?: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  isPrivate: boolean;
  source: 'manual' | 'recommendation' | 'review' | 'search';
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  readingProgress: number; // virtual
  readingDuration?: number; // virtual
}

export interface CreateFavoriteRequest {
  bookId: string;
  bookTitle: string;
  bookAuthor: string[];
  bookThumbnail?: string;
  bookPublishedDate?: string;
  bookPageCount?: number;
  bookCategories?: string[];
  readingStatus?: 'want_to_read' | 'currently_reading' | 'read' | 'did_not_finish';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  isPrivate?: boolean;
  source?: 'manual' | 'recommendation' | 'review' | 'search';
}

export interface UpdateFavoriteRequest {
  readingStatus?: 'want_to_read' | 'currently_reading' | 'read' | 'did_not_finish';
  currentPage?: number;
  totalPages?: number;
  personalNotes?: string;
  personalRating?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  isPrivate?: boolean;
  isArchived?: boolean;
}

export interface ReadingStats {
  want_to_read: number;
  currently_reading: number;
  read: number;
  did_not_finish: number;
  total: number;
}

export interface RecommendationData {
  preferredCategories: string[];
  preferredAuthors: string[];
}

export interface YearlyReadingStats {
  _id: number; // month
  count: number;
  totalPages: number;
}

// Google Books API types
export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    averageRating?: number;
    ratingsCount?: number;
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

export interface GoogleBooksResponse {
  totalItems: number;
  items: GoogleBook[];
}

// Enhanced types for components
export interface BookWithStats extends GoogleBook {
  stats?: BookStats;
  userReview?: Review;
  userFavorite?: Favorite;
  userVote?: Vote;
}

export interface ReviewWithVotes extends Review {
  userVote?: Vote;
  author: {
    _id: string;
    name: string;
  };
}
