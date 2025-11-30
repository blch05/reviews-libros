import { AppError, ErrorInfo } from '../../types/strict'

// =============== ERROR CODES ===============
export const ERROR_CODES = {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  // Validation Errors
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PASSWORD: 'VALIDATION_INVALID_PASSWORD',
  VALIDATION_PASSWORDS_MISMATCH: 'VALIDATION_PASSWORDS_MISMATCH',
  VALIDATION_INVALID_RATING: 'VALIDATION_INVALID_RATING',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  
  // Resource Errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_FORBIDDEN: 'RESOURCE_FORBIDDEN',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Database Errors
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_VALIDATION_ERROR: 'DB_VALIDATION_ERROR',
  DB_DUPLICATE_KEY: 'DB_DUPLICATE_KEY',
  DB_OPERATION_FAILED: 'DB_OPERATION_FAILED',
  
  // External API Errors
  API_EXTERNAL_SERVICE_ERROR: 'API_EXTERNAL_SERVICE_ERROR',
  API_RATE_LIMIT_EXCEEDED: 'API_RATE_LIMIT_EXCEEDED',
  API_SERVICE_UNAVAILABLE: 'API_SERVICE_UNAVAILABLE',
  
  // General Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// =============== ERROR MESSAGES ===============
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Authentication
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Email o contraseña incorrectos',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Token de autenticación inválido',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'Usuario no encontrado',
  [ERROR_CODES.AUTH_EMAIL_EXISTS]: 'Ya existe una cuenta con este email',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'No tiene permisos para realizar esta acción',
  
  // Validation
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Este campo es requerido',
  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: 'Formato de email inválido',
  [ERROR_CODES.VALIDATION_INVALID_PASSWORD]: 'La contraseña debe tener al menos 8 caracteres',
  [ERROR_CODES.VALIDATION_PASSWORDS_MISMATCH]: 'Las contraseñas no coinciden',
  [ERROR_CODES.VALIDATION_INVALID_RATING]: 'La calificación debe estar entre 1 y 5',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Formato de datos inválido',
  
  // Resources
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Recurso no encontrado',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'El recurso ya existe',
  [ERROR_CODES.RESOURCE_FORBIDDEN]: 'Acceso denegado al recurso',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'Conflicto con el estado actual del recurso',
  
  // Database
  [ERROR_CODES.DB_CONNECTION_ERROR]: 'Error de conexión a la base de datos',
  [ERROR_CODES.DB_VALIDATION_ERROR]: 'Error de validación en la base de datos',
  [ERROR_CODES.DB_DUPLICATE_KEY]: 'Ya existe un registro con estos datos',
  [ERROR_CODES.DB_OPERATION_FAILED]: 'Error en la operación de base de datos',
  
  // External APIs
  [ERROR_CODES.API_EXTERNAL_SERVICE_ERROR]: 'Error en servicio externo',
  [ERROR_CODES.API_RATE_LIMIT_EXCEEDED]: 'Límite de peticiones excedido. Intente más tarde',
  [ERROR_CODES.API_SERVICE_UNAVAILABLE]: 'Servicio temporalmente no disponible',
  
  // General
  [ERROR_CODES.NETWORK_ERROR]: 'Error de conexión de red',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Error desconocido',
  [ERROR_CODES.SERVER_ERROR]: 'Error interno del servidor',
  [ERROR_CODES.CLIENT_ERROR]: 'Error en la solicitud del cliente'
}

// =============== ERROR FACTORY ===============
export class ErrorFactory {
  static auth = {
    invalidCredentials: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS],
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      401
    ),
    
    tokenExpired: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.AUTH_TOKEN_EXPIRED],
      ERROR_CODES.AUTH_TOKEN_EXPIRED,
      401
    ),
    
    tokenInvalid: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.AUTH_TOKEN_INVALID],
      ERROR_CODES.AUTH_TOKEN_INVALID,
      401
    ),
    
    userNotFound: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.AUTH_USER_NOT_FOUND],
      ERROR_CODES.AUTH_USER_NOT_FOUND,
      404
    ),
    
    emailExists: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.AUTH_EMAIL_EXISTS],
      ERROR_CODES.AUTH_EMAIL_EXISTS,
      409
    ),
    
    unauthorized: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.AUTH_UNAUTHORIZED],
      ERROR_CODES.AUTH_UNAUTHORIZED,
      403
    )
  }

  static validation = {
    requiredField: (fieldName: string) => new AppError(
      `${fieldName} ${ERROR_MESSAGES[ERROR_CODES.VALIDATION_REQUIRED_FIELD]}`,
      ERROR_CODES.VALIDATION_REQUIRED_FIELD,
      400
    ),
    
    invalidEmail: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_EMAIL],
      ERROR_CODES.VALIDATION_INVALID_EMAIL,
      400
    ),
    
    invalidPassword: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_PASSWORD],
      ERROR_CODES.VALIDATION_INVALID_PASSWORD,
      400
    ),
    
    passwordsMismatch: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.VALIDATION_PASSWORDS_MISMATCH],
      ERROR_CODES.VALIDATION_PASSWORDS_MISMATCH,
      400
    ),
    
    invalidRating: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_RATING],
      ERROR_CODES.VALIDATION_INVALID_RATING,
      400
    ),
    
    invalidFormat: (details?: string) => new AppError(
      `${ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_FORMAT]}${details ? `: ${details}` : ''}`,
      ERROR_CODES.VALIDATION_INVALID_FORMAT,
      400
    )
  }

  static resource = {
    notFound: (resourceType?: string) => new AppError(
      resourceType ? `${resourceType} no encontrado` : ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND],
      ERROR_CODES.RESOURCE_NOT_FOUND,
      404
    ),
    
    alreadyExists: (resourceType?: string) => new AppError(
      resourceType ? `${resourceType} ya existe` : ERROR_MESSAGES[ERROR_CODES.RESOURCE_ALREADY_EXISTS],
      ERROR_CODES.RESOURCE_ALREADY_EXISTS,
      409
    ),
    
    forbidden: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.RESOURCE_FORBIDDEN],
      ERROR_CODES.RESOURCE_FORBIDDEN,
      403
    ),
    
    conflict: (details?: string) => new AppError(
      `${ERROR_MESSAGES[ERROR_CODES.RESOURCE_CONFLICT]}${details ? `: ${details}` : ''}`,
      ERROR_CODES.RESOURCE_CONFLICT,
      409
    )
  }

  static database = {
    connectionError: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.DB_CONNECTION_ERROR],
      ERROR_CODES.DB_CONNECTION_ERROR,
      500
    ),
    
    validationError: (details?: string) => new AppError(
      `${ERROR_MESSAGES[ERROR_CODES.DB_VALIDATION_ERROR]}${details ? `: ${details}` : ''}`,
      ERROR_CODES.DB_VALIDATION_ERROR,
      400
    ),
    
    duplicateKey: (field?: string) => new AppError(
      field ? `Ya existe un registro con este ${field}` : ERROR_MESSAGES[ERROR_CODES.DB_DUPLICATE_KEY],
      ERROR_CODES.DB_DUPLICATE_KEY,
      409
    ),
    
    operationFailed: (operation?: string) => new AppError(
      operation ? `Error en ${operation}` : ERROR_MESSAGES[ERROR_CODES.DB_OPERATION_FAILED],
      ERROR_CODES.DB_OPERATION_FAILED,
      500
    )
  }

  static api = {
    externalServiceError: (serviceName?: string) => new AppError(
      serviceName ? `Error en ${serviceName}` : ERROR_MESSAGES[ERROR_CODES.API_EXTERNAL_SERVICE_ERROR],
      ERROR_CODES.API_EXTERNAL_SERVICE_ERROR,
      502
    ),
    
    rateLimitExceeded: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.API_RATE_LIMIT_EXCEEDED],
      ERROR_CODES.API_RATE_LIMIT_EXCEEDED,
      429
    ),
    
    serviceUnavailable: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.API_SERVICE_UNAVAILABLE],
      ERROR_CODES.API_SERVICE_UNAVAILABLE,
      503
    )
  }

  static general = {
    networkError: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      ERROR_CODES.NETWORK_ERROR,
      0 // Network errors don't have HTTP status codes
    ),
    
    unknownError: () => new AppError(
      ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      ERROR_CODES.UNKNOWN_ERROR,
      500
    ),
    
    serverError: (details?: string) => new AppError(
      `${ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR]}${details ? `: ${details}` : ''}`,
      ERROR_CODES.SERVER_ERROR,
      500
    ),
    
    clientError: (details?: string) => new AppError(
      `${ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]}${details ? `: ${details}` : ''}`,
      ERROR_CODES.CLIENT_ERROR,
      400
    )
  }
}

// =============== ERROR HANDLER ===============
export class ErrorHandler {
  private static errorLog: ErrorInfo[] = []
  private static maxLogSize = 100

  /**
   * Logs an error with context information
   */
  static logError(error: Error, context?: Record<string, unknown>): ErrorInfo {
    const errorInfo: ErrorInfo = {
      code: error instanceof AppError ? error.code : ERROR_CODES.UNKNOWN_ERROR,
      message: error.message,
      statusCode: error instanceof AppError ? error.statusCode : 500,
      timestamp: new Date(),
      context: {
        stack: error.stack,
        name: error.name,
        ...context
      }
    }

    // Add to log (with size limit)
    this.errorLog.unshift(errorInfo)
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo)
    }

    return errorInfo
  }

  /**
   * Gets recent errors for debugging
   */
  static getRecentErrors(limit: number = 10): ErrorInfo[] {
    return this.errorLog.slice(0, limit)
  }

  /**
   * Clears the error log
   */
  static clearLog(): void {
    this.errorLog = []
  }

  /**
   * Converts unknown errors to AppError instances
   */
  static normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof Error) {
      return new AppError(
        error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
        ERROR_CODES.UNKNOWN_ERROR,
        500
      )
    }

    if (typeof error === 'string') {
      return new AppError(error, ERROR_CODES.UNKNOWN_ERROR, 500)
    }

    return ErrorFactory.general.unknownError()
  }

  /**
   * Handles errors in async operations
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<{ data: T | null; error: AppError | null }> {
    try {
      const data = await operation()
      return { data, error: null }
    } catch (error) {
      const normalizedError = this.normalizeError(error)
      this.logError(normalizedError, context)
      return { data: null, error: normalizedError }
    }
  }

  /**
   * Creates an error response for API endpoints
   */
  static createErrorResponse(error: AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    }
  }
}

// =============== RECOVERY STRATEGIES ===============
export class ErrorRecovery {
  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          throw ErrorHandler.normalizeError(lastError)
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw ErrorHandler.normalizeError(lastError!)
  }

  /**
   * Retry operation with custom retry logic
   */
  static async retryWithCondition<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: Error, attempt: number) => boolean,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries || !shouldRetry(lastError, attempt)) {
          throw ErrorHandler.normalizeError(lastError)
        }

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw ErrorHandler.normalizeError(lastError!)
  }

  /**
   * Fallback to default value on error
   */
  static async withFallback<T>(
    operation: () => Promise<T>,
    fallbackValue: T
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      ErrorHandler.logError(error as Error, { fallback: true })
      return fallbackValue
    }
  }

  /**
   * Circuit breaker pattern
   */
  static createCircuitBreaker<T>(
    operation: () => Promise<T>,
    failureThreshold: number = 5,
    resetTimeout: number = 60000
  ) {
    let failures = 0
    let lastFailureTime = 0
    let state: 'closed' | 'open' | 'half-open' = 'closed'

    return async (): Promise<T> => {
      if (state === 'open') {
        if (Date.now() - lastFailureTime > resetTimeout) {
          state = 'half-open'
        } else {
          throw ErrorFactory.api.serviceUnavailable()
        }
      }

      try {
        const result = await operation()
        failures = 0
        state = 'closed'
        return result
      } catch (error) {
        failures++
        lastFailureTime = Date.now()

        if (failures >= failureThreshold) {
          state = 'open'
        }

        throw ErrorHandler.normalizeError(error)
      }
    }
  }
}