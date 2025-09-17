// Tipos específicos para mejorar la type safety y eliminar 'any'

// =============== BOOK TYPES ===============
export interface GoogleBooksVolumeInfo {
  title: string
  authors?: string[]
  description?: string
  categories?: string[]
  pageCount?: number
  publishedDate?: string
  publisher?: string
  imageLinks?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    extraLarge?: string
  }
  language?: string
  averageRating?: number
  ratingsCount?: number
  industryIdentifiers?: Array<{
    type: string
    identifier: string
  }>
}

export interface GoogleBooksItem {
  id: string
  volumeInfo: GoogleBooksVolumeInfo
  saleInfo?: {
    country?: string
    isEbook?: boolean
    listPrice?: {
      amount: number
      currencyCode: string
    }
  }
}

export interface GoogleBooksResponse {
  totalItems: number
  items?: GoogleBooksItem[]
}

export interface BookInfo {
  id: string
  title: string
  authors: string[]
  description: string
  categories: string[]
  pageCount: number
  publishedDate: string
  publisher: string
  coverUrl: string
  thumbnail: string
  language: string
  averageRating: number
  ratingsCount: number
  isbn: string
}

// =============== USER TYPES ===============
export interface UserBase {
  _id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  isEmailVerified: boolean
  preferences: {
    language: string
    notifications: {
      email: boolean
      push: boolean
      reviews: boolean
      favorites: boolean
    }
    privacy: {
      showProfile: boolean
      showReviews: boolean
      showFavorites: boolean
    }
  }
}

export interface User extends UserBase {
  password?: never // Ensure password is never exposed in client types
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  _id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  isEmailVerified: boolean
}

export interface UserProfile extends UserBase {
  stats: {
    totalReviews: number
    totalFavorites: number
    totalVotes: number
    averageRating: number
    joinedDate: Date
  }
  recentActivity: Array<{
    type: 'review' | 'favorite' | 'vote'
    bookId: string
    bookTitle: string
    date: Date
  }>
}

// =============== REVIEW TYPES ===============
export interface ReviewBase {
  rating: number
  text: string
  bookId: string
  bookTitle: string
  bookAuthors: string[]
  bookCover: string
}

export interface Review extends ReviewBase {
  _id: string
  userId: string
  userName: string
  userAvatar?: string
  helpfulVotes: number
  unhelpfulVotes: number
  totalVotes: number
  helpfulPercentage: number
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'deleted' | 'reported'
}

export interface CreateReviewRequest extends ReviewBase {
  // Only the fields needed for creation
}

export interface UpdateReviewRequest {
  rating?: number
  text?: string
}

export interface ReviewFilters {
  bookId?: string
  userId?: string
  minRating?: number
  maxRating?: number
  sortBy?: 'date' | 'rating' | 'helpful'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  topReviews: Review[]
}

// =============== FAVORITE TYPES ===============
export interface FavoriteStatus {
  reading: 'to-read' | 'reading' | 'read'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  notes: string
  isPrivate: boolean
  isArchived: boolean
  progress: {
    currentPage: number
    totalPages: number
    percentage: number
  }
  startedAt?: Date
  finishedAt?: Date
}

export interface Favorite extends FavoriteStatus {
  _id: string
  userId: string
  bookId: string
  bookTitle: string
  bookAuthors: string[]
  bookCover: string
  bookDescription: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateFavoriteRequest {
  bookId: string
  bookTitle: string
  bookAuthors: string[]
  bookCover: string
  bookDescription: string
  reading?: FavoriteStatus['reading']
  priority?: FavoriteStatus['priority']
  tags?: string[]
  notes?: string
  isPrivate?: boolean
}

export interface UpdateFavoriteRequest {
  reading?: FavoriteStatus['reading']
  priority?: FavoriteStatus['priority']
  tags?: string[]
  notes?: string
  isPrivate?: boolean
  progress?: Partial<FavoriteStatus['progress']>
}

export interface FavoriteFilters {
  reading?: FavoriteStatus['reading']
  priority?: FavoriteStatus['priority']
  tags?: string[]
  isArchived?: boolean
  sortBy?: 'date' | 'title' | 'progress'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ReadingStats {
  totalBooks: number
  booksRead: number
  booksReading: number
  booksToRead: number
  averageRating: number
  totalPages: number
  currentStreak: number
  longestStreak: number
  favoriteGenres: Array<{
    genre: string
    count: number
  }>
  monthlyProgress: Array<{
    month: string
    booksRead: number
    pagesRead: number
  }>
}

// =============== VOTE TYPES ===============
export interface Vote {
  _id: string
  userId: string
  reviewId: string
  reviewAuthorId: string
  bookId: string
  createdAt: Date
}

export interface VoteRequest {
  reviewId: string
  reviewAuthorId: string
  bookId: string
}

export interface VoteStats {
  totalVotesGiven: number
  totalVotesReceived: number
  helpfulVotesReceived: number
  votingAccuracy: number
}

// =============== API TYPES ===============
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  success: false
  error: string
  details?: string
  code?: string
  statusCode?: number
}

export interface PaginationQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// =============== AUTH TYPES ===============
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface AuthResponse {
  user: AuthUser
  token: string
  expiresIn: number
}

// =============== FORM TYPES ===============
export interface FormField<T = string> {
  value: T
  error?: string
  touched: boolean
  required?: boolean
}

export interface FormState<T extends Record<string, unknown>> {
  fields: { [K in keyof T]: FormField<T[K]> }
  isValid: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  submitCount: number
}

export interface ValidationRule<T = unknown> {
  message: string
  validate: (value: T, formData?: Record<string, unknown>) => boolean
}

export interface FormConfig<T extends Record<string, unknown>> {
  initialValues: T
  validationRules?: { [K in keyof T]?: ValidationRule<T[K]>[] }
  onSubmit: (values: T) => Promise<void> | void
}

// =============== COMPONENT TYPES ===============
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  'data-testid'?: string
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
  lastUpdated?: Date
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// =============== ERROR TYPES ===============
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export interface ErrorInfo {
  code: string
  message: string
  statusCode: number
  timestamp: Date
  context?: Record<string, unknown>
}

// =============== UTILITY TYPES ===============
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type NonEmptyArray<T> = [T, ...T[]]

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

// =============== DATABASE TYPES ===============
export interface MongoDocument {
  _id: string
  createdAt: Date
  updatedAt: Date
}

export interface QueryOptions {
  page?: number
  limit?: number
  sort?: Record<string, 1 | -1>
  populate?: string[]
  select?: string[]
}

export interface AggregationResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

// =============== NOTIFICATION TYPES ===============
export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  action?: {
    label: string
    onClick: () => void
  }
}

export interface NotificationState {
  id: string
  config: NotificationConfig
  isVisible: boolean
  timestamp: Date
}