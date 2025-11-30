// =============== DOMAIN INTERFACES ===============
export interface IBookRepository {
  findById(id: string): Promise<any>
  search(query: any): Promise<any>
  getTopBooks(limit?: number): Promise<any[]>
  getBooksWithReviews(): Promise<any[]>
}

export interface IReviewRepository {
  create(review: any): Promise<Review>
  findByBookId(bookId: string): Promise<Review[]>
  findByUserId(userId: string): Promise<Review[]>
  update(id: string, data: Partial<Review>): Promise<Review>
  delete(id: string): Promise<void>
}

export interface IUserRepository {
  create(user: any): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, data: Partial<User>): Promise<User>
  delete(id: string): Promise<void>
}

export interface IFavoriteRepository {
  add(userId: string, bookId: string): Promise<Favorite>
  remove(userId: string, bookId: string): Promise<void>
  findByUserId(userId: string): Promise<Favorite[]>
  exists(userId: string, bookId: string): Promise<boolean>
}

export interface IVoteRepository {
  vote(data: any): Promise<Vote>
  findByReviewId(reviewId: string): Promise<any>
  findUserVote(userId: string, reviewId: string): Promise<Vote | null>
  updateVote(id: string, type: VoteType): Promise<Vote>
}

// =============== SERVICE INTERFACES ===============
export interface IBookService {
  searchBooks(query: string, filters?: SearchFilters): Promise<ServiceResult<any>>
  getBookDetails(id: string): Promise<ServiceResult<BookDetails>>
  getPopularBooks(limit?: number): Promise<ServiceResult<any[]>>
  getRecommendations(userId: string): Promise<ServiceResult<any[]>>
}

export interface IReviewService {
  createReview(data: any): Promise<ServiceResult<Review>>
  getBookReviews(bookId: string, pagination?: PaginationParams): Promise<ServiceResult<PaginatedReviews>>
  getUserReviews(userId: string): Promise<ServiceResult<Review[]>>
  updateReview(id: string, data: any): Promise<ServiceResult<Review>>
  deleteReview(id: string, userId: string): Promise<ServiceResult<void>>
}

export interface IUserService {
  register(data: any): Promise<ServiceResult<User>>
  login(credentials: any): Promise<ServiceResult<AuthResult>>
  updateProfile(userId: string, data: any): Promise<ServiceResult<User>>
  getProfile(userId: string): Promise<ServiceResult<UserProfile>>
  changePassword(userId: string, data: any): Promise<ServiceResult<void>>
}

export interface IFavoriteService {
  addToFavorites(userId: string, bookId: string): Promise<ServiceResult<void>>
  removeFromFavorites(userId: string, bookId: string): Promise<ServiceResult<void>>
  getUserFavorites(userId: string): Promise<ServiceResult<any[]>>
  isFavorite(userId: string, bookId: string): Promise<ServiceResult<boolean>>
}

export interface IVoteService {
  voteOnReview(data: any): Promise<ServiceResult<Vote>>
  getReviewVotes(reviewId: string): Promise<ServiceResult<any>>
  getUserVote(userId: string, reviewId: string): Promise<ServiceResult<Vote | null>>
}

// =============== USE CASE INTERFACES ===============
export interface IAuthUseCase {
  signUp(data: any): Promise<ServiceResult<AuthResult>>
  signIn(credentials: any): Promise<ServiceResult<AuthResult>>
  signOut(userId: string): Promise<ServiceResult<void>>
  refreshToken(token: string): Promise<ServiceResult<AuthResult>>
  resetPassword(email: string): Promise<ServiceResult<void>>
}

export interface IBookDiscoveryUseCase {
  discoverBooks(query: string, preferences?: UserPreferences): Promise<ServiceResult<DiscoveryResult>>
  getTrendingBooks(): Promise<ServiceResult<any[]>>
  getPersonalizedRecommendations(userId: string): Promise<ServiceResult<any[]>>
  searchWithFilters(params: Advancedany): Promise<ServiceResult<any>>
}

export interface IReviewManagementUseCase {
  writeReview(data: any): Promise<ServiceResult<Review>>
  editReview(id: string, data: any, userId: string): Promise<ServiceResult<Review>>
  removeReview(id: string, userId: string): Promise<ServiceResult<void>>
  moderateReview(id: string, action: ModerationAction): Promise<ServiceResult<void>>
}

export interface IUserEngagementUseCase {
  engageWithReview(userId: string, reviewId: string, type: EngagementType): Promise<ServiceResult<void>>
  manageWishlist(userId: string, bookId: string, action: WishlistAction): Promise<ServiceResult<void>>
  trackReadingProgress(userId: string, bookId: string, progress: ReadingProgress): Promise<ServiceResult<void>>
  getEngagementStats(userId: string): Promise<ServiceResult<EngagementStats>>
}

// =============== NOTIFICATION INTERFACES ===============
export interface INotificationService {
  send(notification: NotificationData): Promise<ServiceResult<void>>
  sendBatch(notifications: NotificationData[]): Promise<ServiceResult<void>>
  getDeliveryStatus(id: string): Promise<ServiceResult<DeliveryStatus>>
}

export interface IEmailService {
  sendWelcomeEmail(user: User): Promise<ServiceResult<void>>
  sendPasswordResetEmail(email: string, token: string): Promise<ServiceResult<void>>
  sendReviewNotification(review: Review, bookOwner: User): Promise<ServiceResult<void>>
}

// =============== CACHE INTERFACES ===============
export interface ICacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  exists(key: string): Promise<boolean>
}

export interface ICacheStrategy {
  generateKey(params: any): string
  getTTL(data: any): number
  shouldCache(data: any): boolean
  shouldInvalidate(event: CacheInvalidationEvent): boolean
}

// =============== VALIDATION INTERFACES ===============
export interface ValidationResult<T> {
  isValid: boolean
  data?: T
  errors?: string[]
}

export interface IValidationService {
  validateCreateReview(data: any): ValidationResult<any>
  validateUpdateReview(data: any): ValidationResult<any>
  validateUserRegistration(data: any): ValidationResult<any>
  validateUserLogin(data: any): ValidationResult<any>
  validateSearchQuery(data: any): ValidationResult<any>
}

// =============== LOGGING INTERFACES ===============
export interface ILogger {
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
  debug(message: string, context?: LogContext): void
}

export interface IMetricsService {
  recordMetric(name: string, value: number, tags?: Record<string, string>): void
  recordTiming(name: string, duration: number, tags?: Record<string, string>): void
  recordCounter(name: string, increment?: number, tags?: Record<string, string>): void
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void
}

// =============== COMMON TYPES ===============
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: ServiceError
  metadata?: ResultMetadata
}

export interface ServiceError {
  code: string
  message: string
  details?: any
  stack?: string
}

export interface ResultMetadata {
  timestamp: string
  requestId?: string
  duration?: number
  cached?: boolean
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchFilters {
  category?: string
  author?: string
  publishedAfter?: string
  publishedBefore?: string
  minRating?: number
  maxRating?: number
  language?: string
}

export interface Advancedany extends SearchFilters {
  query: string
  fuzzy?: boolean
  exact?: boolean
  facets?: string[]
}

export interface DiscoveryResult {
  books: any[]
  facets: SearchFacet[]
  suggestions: string[]
  totalCount: number
}

export interface SearchFacet {
  name: string
  values: Array<{
    value: string
    count: number
  }>
}

export interface UserPreferences {
  genres: string[]
  authors: string[]
  languages: string[]
  ratingThreshold: number
}

export interface BookDetails {
  reviews: Review[]
  averageRating: number
  reviewCount: number
  isFavorite?: boolean
  userReview?: Review
}

export interface PaginatedReviews {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AuthResult {
  user: User
  token: string
  refreshToken: string
  expiresAt: string
}

export interface UserProfile extends User {
  reviewCount: number
  favoriteCount: number
  joinedDate: string
  lastActive: string
}

export interface EngagementStats {
  reviewsWritten: number
  votesGiven: number
  favoritesAdded: number
  booksRead: number
  averageRating: number
}

export interface ReadingProgress {
  currentPage: number
  totalPages: number
  percentage: number
  lastUpdated: string
}

export interface NotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  channels: NotificationChannel[]
}

export interface DeliveryStatus {
  id: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt?: string
  deliveredAt?: string
  error?: string
}

export interface LogContext {
  userId?: string
  requestId?: string
  action?: string
  resource?: string
  metadata?: Record<string, any>
}

export interface CacheInvalidationEvent {
  type: 'create' | 'update' | 'delete'
  resource: string
  resourceId: string
  userId?: string
}

// =============== ENUM TYPES ===============
export type VoteType = 'helpful' | 'not_helpful'
export type EngagementType = 'vote' | 'comment' | 'share'
export type WishlistAction = 'add' | 'remove'
export type ModerationAction = 'approve' | 'reject' | 'flag'
export type NotificationType = 'review' | 'favorite' | 'system' | 'marketing'
export type NotificationChannel = 'email' | 'push' | 'in_app'

// Import types from our strict types file
import type {
  // any,
  Review,
  User,
  Favorite,
  Vote,
  // any,
  // any,
  // any,
  // any,
  // any,
  // any,
  // any,
  // any,
  // any,
  // any,
  // any
} from '../../../types'
