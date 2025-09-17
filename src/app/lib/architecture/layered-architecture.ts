// =============== DOMAIN LAYER ===============
// Pure business logic, no dependencies on external systems

export class BookDomain {
  static validateSearchQuery(query: string): void {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required')
    }
    
    if (query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters')
    }
  }

  static calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating, 0)
    return Math.round((sum / ratings.length) * 10) / 10
  }

  static formatBookTitle(title: string): string {
    return title.trim().replace(/\s+/g, ' ')
  }
}

export class ReviewDomain {
  static validateReviewContent(content: string): void {
    if (!content || typeof content !== 'string') {
      throw new Error('Review content is required')
    }
    
    const trimmed = content.trim()
    if (trimmed.length < 10) {
      throw new Error('Review content must be at least 10 characters')
    }
    
    if (trimmed.length > 2000) {
      throw new Error('Review content cannot exceed 2000 characters')
    }
  }

  static validateRating(rating: number): void {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }
  }

  static calculateHelpfulnessScore(helpful: number, total: number): number {
    if (total === 0) return 0
    return Math.round((helpful / total) * 100)
  }
}

export class UserDomain {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required')
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
  }

  static sanitizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
  }
}

// =============== APPLICATION LAYER ===============
// Orchestrates use cases and coordinates between layers

export class BookApplicationService {
  constructor(
    private bookRepository: any,
    private cacheService: any,
    private logger: any
  ) {}

  async searchBooks(query: string, filters?: any) {
    try {
      // Domain validation
      BookDomain.validateSearchQuery(query)
      
      // Check cache
      const cacheKey = `search:${query}:${JSON.stringify(filters || {})}`
      const cached = await this.cacheService.get(cacheKey)
      
      if (cached) {
        this.logger.info('Cache hit for book search', { query })
        return { success: true, data: cached, cached: true }
      }

      // Repository call
      const result = await this.bookRepository.search({
        q: query.trim(),
        ...filters
      })

      // Cache result
      await this.cacheService.set(cacheKey, result, 300) // 5 minutes
      
      this.logger.info('Book search completed', { query, count: result.totalItems })
      return { success: true, data: result, cached: false }
      
    } catch (error) {
      this.logger.error('Book search failed', { query, error })
      return { 
        success: false, 
        error: { 
          message: (error as Error).message,
          code: 'SEARCH_FAILED'
        }
      }
    }
  }

  async getBookDetails(id: string) {
    try {
      if (!id?.trim()) {
        throw new Error('Book ID is required')
      }

      const cacheKey = `book:${id}`
      const cached = await this.cacheService.get(cacheKey)
      
      if (cached) {
        return { success: true, data: cached, cached: true }
      }

      const book = await this.bookRepository.findById(id)
      
      if (!book) {
        throw new Error('Book not found')
      }

      // Get additional data (reviews, ratings, etc.)
      const enrichedBook = await this.enrichBookData(book)
      
      await this.cacheService.set(cacheKey, enrichedBook, 600) // 10 minutes
      
      return { success: true, data: enrichedBook, cached: false }
      
    } catch (error) {
      this.logger.error('Get book details failed', { id, error })
      return { 
        success: false, 
        error: { 
          message: (error as Error).message,
          code: 'BOOK_FETCH_FAILED'
        }
      }
    }
  }

  private async enrichBookData(book: any) {
    // This would call other services to get reviews, ratings, etc.
    // For now, return basic book data
    return {
      ...book,
      averageRating: 0,
      reviewCount: 0,
      reviews: []
    }
  }
}

export class ReviewApplicationService {
  constructor(
    private reviewRepository: any,
    private bookRepository: any,
    private userRepository: any,
    private cacheService: any,
    private logger: any
  ) {}

  async createReview(reviewData: any) {
    try {
      // Domain validation
      ReviewDomain.validateReviewContent(reviewData.content)
      ReviewDomain.validateRating(reviewData.rating)
      
      // Business rules
      await this.validateReviewCreation(reviewData)
      
      // Create review
      const review = await this.reviewRepository.create({
        ...reviewData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Invalidate related caches
      await this.invalidateBookCaches(reviewData.bookId)
      
      this.logger.info('Review created', { reviewId: review.id, bookId: reviewData.bookId })
      return { success: true, data: review }
      
    } catch (error) {
      this.logger.error('Review creation failed', { reviewData, error })
      return { 
        success: false, 
        error: { 
          message: (error as Error).message,
          code: 'REVIEW_CREATION_FAILED'
        }
      }
    }
  }

  async getBookReviews(bookId: string, pagination?: any) {
    try {
      if (!bookId?.trim()) {
        throw new Error('Book ID is required')
      }

      const page = pagination?.page || 1
      const limit = pagination?.limit || 10
      const cacheKey = `book_reviews:${bookId}:${page}:${limit}`

      const cached = await this.cacheService.get(cacheKey)
      if (cached) {
        return { success: true, data: cached, cached: true }
      }

      const allReviews = await this.reviewRepository.findByBookId(bookId)
      
      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const reviews = allReviews.slice(startIndex, endIndex)

      const result = {
        reviews,
        pagination: {
          page,
          limit,
          total: allReviews.length,
          hasNext: endIndex < allReviews.length,
          hasPrev: page > 1
        }
      }

      await this.cacheService.set(cacheKey, result, 300) // 5 minutes
      
      return { success: true, data: result, cached: false }
      
    } catch (error) {
      this.logger.error('Get book reviews failed', { bookId, error })
      return { 
        success: false, 
        error: { 
          message: (error as Error).message,
          code: 'REVIEWS_FETCH_FAILED'
        }
      }
    }
  }

  private async validateReviewCreation(reviewData: any): Promise<void> {
    // Check if user exists
    const user = await this.userRepository.findById(reviewData.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Check if book exists
    const book = await this.bookRepository.findById(reviewData.bookId)
    if (!book) {
      throw new Error('Book not found')
    }

    // Check for duplicate review
    const existingReviews = await this.reviewRepository.findByUserId(reviewData.userId)
    const duplicateReview = existingReviews.find((r: any) => r.bookId === reviewData.bookId)
    
    if (duplicateReview) {
      throw new Error('User has already reviewed this book')
    }
  }

  private async invalidateBookCaches(bookId: string): Promise<void> {
    const patterns = [
      `book:${bookId}`,
      `book_reviews:${bookId}:*`,
      `popular_books:*`
    ]
    
    for (const pattern of patterns) {
      await this.cacheService.delete(pattern)
    }
  }
}

export class UserApplicationService {
  constructor(
    private userRepository: any,
    private cacheService: any,
    private logger: any
  ) {}

  async registerUser(userData: any) {
    try {
      // Domain validation
      if (!UserDomain.validateEmail(userData.email)) {
        throw new Error('Invalid email format')
      }
      
      UserDomain.validatePassword(userData.password)
      
      // Business rules
      const existingUser = await this.userRepository.findByEmail(userData.email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Create user
      const user = await this.userRepository.create({
        ...userData,
        name: UserDomain.sanitizeName(userData.name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Remove password from response
      const { password, ...userWithoutPassword } = user
      
      this.logger.info('User registered', { userId: user.id, email: userData.email })
      return { success: true, data: userWithoutPassword }
      
    } catch (error) {
      this.logger.error('User registration failed', { email: userData.email, error })
      return { 
        success: false, 
        error: { 
          message: (error as Error).message,
          code: 'REGISTRATION_FAILED'
        }
      }
    }
  }

  async getUserProfile(userId: string) {
    try {
      if (!userId?.trim()) {
        throw new Error('User ID is required')
      }

      const cacheKey = `user_profile:${userId}`
      const cached = await this.cacheService.get(cacheKey)
      
      if (cached) {
        return { success: true, data: cached, cached: true }
      }

      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Build profile with additional stats
      const profile = await this.buildUserProfile(user)
      
      await this.cacheService.set(cacheKey, profile, 900) // 15 minutes
      
      return { success: true, data: profile, cached: false }
      
    } catch (error) {
      this.logger.error('Get user profile failed', { userId, error })
      return { 
        success: false, 
        error: { 
          message: (error as Error).message,
          code: 'PROFILE_FETCH_FAILED'
        }
      }
    }
  }

  private async buildUserProfile(user: any) {
    // Remove sensitive data
    const { password, ...safeUser } = user
    
    // Add computed fields
    return {
      ...safeUser,
      reviewCount: 0, // Would get from review service
      favoriteCount: 0, // Would get from favorite service
      joinedDate: user.createdAt,
      lastActive: user.updatedAt
    }
  }
}

// =============== INFRASTRUCTURE LAYER ===============
// Handles external concerns like databases, APIs, caching

export class InMemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>()

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    const expiry = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expiry })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export class ConsoleLogger {
  info(message: string, context?: any): void {
    console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : '')
  }

  warn(message: string, context?: any): void {
    console.warn(`[WARN] ${message}`, context ? JSON.stringify(context) : '')
  }

  error(message: string, context?: any): void {
    console.error(`[ERROR] ${message}`, context ? JSON.stringify(context) : '')
  }

  debug(message: string, context?: any): void {
    console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context) : '')
  }
}

// =============== DEPENDENCY INJECTION CONTAINER ===============
export class ServiceContainer {
  private services = new Map<string, any>()

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory)
  }

  get<T>(name: string): T {
    const factory = this.services.get(name)
    if (!factory) {
      throw new Error(`Service ${name} not found`)
    }
    return factory()
  }

  static createDefault(): ServiceContainer {
    const container = new ServiceContainer()
    
    // Infrastructure services
    container.register('cache', () => new InMemoryCache())
    container.register('logger', () => new ConsoleLogger())
    
    // Repository interfaces would be injected here
    // container.register('bookRepository', () => new BookRepository())
    // container.register('reviewRepository', () => new ReviewRepository())
    // container.register('userRepository', () => new UserRepository())
    
    // Application services
    container.register('bookService', () => new BookApplicationService(
      container.get('bookRepository'),
      container.get('cache'),
      container.get('logger')
    ))
    
    container.register('reviewService', () => new ReviewApplicationService(
      container.get('reviewRepository'),
      container.get('bookRepository'),
      container.get('userRepository'),
      container.get('cache'),
      container.get('logger')
    ))
    
    container.register('userService', () => new UserApplicationService(
      container.get('userRepository'),
      container.get('cache'),
      container.get('logger')
    ))
    
    return container
  }
}

// =============== USAGE EXAMPLE ===============
export function createServiceLayer() {
  const container = ServiceContainer.createDefault()
  
  return {
    bookService: container.get('bookService'),
    reviewService: container.get('reviewService'),
    userService: container.get('userService'),
    cache: container.get('cache'),
    logger: container.get('logger')
  }
}

export default {
  BookDomain,
  ReviewDomain,
  UserDomain,
  BookApplicationService,
  ReviewApplicationService,
  UserApplicationService,
  InMemoryCache,
  ConsoleLogger,
  ServiceContainer,
  createServiceLayer
}