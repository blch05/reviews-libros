import { ErrorFactory } from './error-handling'
import { ValidationRule } from '../../types/strict'

// =============== VALIDATION SCHEMAS ===============
export type ValidationSchema<T extends Record<string, unknown>> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  firstError?: string
}

// =============== BUILT-IN VALIDATORS ===============
export class Validators {
  static required = <T>(message: string = 'Este campo es requerido'): ValidationRule<T> => ({
    message,
    validate: (value: T) => {
      if (typeof value === 'string') {
        return (value as string).trim().length > 0
      }
      return value !== null && value !== undefined && value !== ''
    }
  })

  static minLength = (min: number, message?: string): ValidationRule<string> => ({
    message: message || `Debe tener al menos ${min} caracteres`,
    validate: (value: string) => !value || value.length >= min
  })

  static maxLength = (max: number, message?: string): ValidationRule<string> => ({
    message: message || `No puede tener más de ${max} caracteres`,
    validate: (value: string) => !value || value.length <= max
  })

  static email = (message: string = 'Formato de email inválido'): ValidationRule<string> => ({
    message,
    validate: (value: string) => {
      if (!value) return true // Optional field, use required() for mandatory
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    }
  })

  static password = (message: string = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'): ValidationRule<string> => ({
    message,
    validate: (value: string) => {
      if (!value) return true
      const hasMinLength = value.length >= 8
      const hasUppercase = /[A-Z]/.test(value)
      const hasLowercase = /[a-z]/.test(value)
      const hasNumber = /\d/.test(value)
      return hasMinLength && hasUppercase && hasLowercase && hasNumber
    }
  })

  static confirmPassword = (passwordField: string, message: string = 'Las contraseñas no coinciden'): ValidationRule<string> => ({
    message,
    validate: (value: string, formData?: Record<string, unknown>) => {
      if (!value || !formData) return true
      return value === formData[passwordField]
    }
  })

  static rating = (min: number = 1, max: number = 5, message?: string): ValidationRule<number> => ({
    message: message || `La calificación debe estar entre ${min} y ${max}`,
    validate: (value: number) => {
      if (value === null || value === undefined) return false
      return value >= min && value <= max && Number.isInteger(value)
    }
  })

  static url = (message: string = 'URL inválida'): ValidationRule<string> => ({
    message,
    validate: (value: string) => {
      if (!value) return true
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }
  })

  static phoneNumber = (message: string = 'Número de teléfono inválido'): ValidationRule<string> => ({
    message,
    validate: (value: string) => {
      if (!value) return true
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      return phoneRegex.test(value.replace(/\s/g, ''))
    }
  })

  static custom = <T>(
    validateFn: (value: T, formData?: Record<string, unknown>) => boolean,
    message: string
  ): ValidationRule<T> => ({
    message,
    validate: validateFn
  })

  static oneOf = <T>(
    allowedValues: T[],
    message?: string
  ): ValidationRule<T> => ({
    message: message || `Debe ser uno de: ${allowedValues.join(', ')}`,
    validate: (value: T) => allowedValues.includes(value)
  })

  static arrayMinLength = <T>(
    min: number,
    message?: string
  ): ValidationRule<T[]> => ({
    message: message || `Debe seleccionar al menos ${min} elemento${min > 1 ? 's' : ''}`,
    validate: (value: T[]) => Array.isArray(value) && value.length >= min
  })

  static arrayMaxLength = <T>(
    max: number,
    message?: string
  ): ValidationRule<T[]> => ({
    message: message || `No puede seleccionar más de ${max} elemento${max > 1 ? 's' : ''}`,
    validate: (value: T[]) => !Array.isArray(value) || value.length <= max
  })
}

// =============== VALIDATION ENGINE ===============
export class ValidationEngine {
  /**
   * Validates a single field
   */
  static validateField<T>(
    value: T,
    rules: ValidationRule<T>[],
    formData?: Record<string, unknown>
  ): { isValid: boolean; error?: string } {
    for (const rule of rules) {
      if (!rule.validate(value, formData)) {
        return { isValid: false, error: rule.message }
      }
    }
    return { isValid: true }
  }

  /**
   * Validates an entire form
   */
  static validateForm<T extends Record<string, unknown>>(
    data: T,
    schema: ValidationSchema<T>
  ): ValidationResult {
    const errors: Record<string, string> = {}
    let firstError: string | undefined

    for (const [fieldName, rules] of Object.entries(schema)) {
      if (rules && Array.isArray(rules)) {
        const fieldValue = data[fieldName as keyof T]
        const fieldResult = this.validateField(fieldValue, rules, data)
        
        if (!fieldResult.isValid && fieldResult.error) {
          errors[fieldName] = fieldResult.error
          if (!firstError) {
            firstError = fieldResult.error
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstError
    }
  }

  /**
   * Validates specific fields only
   */
  static validateFields<T extends Record<string, unknown>>(
    data: T,
    schema: ValidationSchema<T>,
    fieldsToValidate: (keyof T)[]
  ): ValidationResult {
    const errors: Record<string, string> = {}
    let firstError: string | undefined

    for (const fieldName of fieldsToValidate) {
      const rules = schema[fieldName]
      if (rules && Array.isArray(rules)) {
        const fieldValue = data[fieldName]
        const fieldResult = this.validateField(fieldValue, rules, data)
        
        if (!fieldResult.isValid && fieldResult.error) {
          errors[fieldName as string] = fieldResult.error
          if (!firstError) {
            firstError = fieldResult.error
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstError
    }
  }
}

// =============== PREDEFINED SCHEMAS ===============
export const ValidationSchemas = {
  login: {
    email: [
      Validators.required('El email es requerido'),
      Validators.email()
    ],
    password: [
      Validators.required('La contraseña es requerida')
    ]
  },

  register: {
    name: [
      Validators.required('El nombre es requerido'),
      Validators.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
      Validators.maxLength(50, 'El nombre no puede tener más de 50 caracteres')
    ],
    email: [
      Validators.required('El email es requerido'),
      Validators.email()
    ],
    password: [
      Validators.required('La contraseña es requerida'),
      Validators.password()
    ],
    confirmPassword: [
      Validators.required('Confirme su contraseña'),
      Validators.confirmPassword('password')
    ]
  },

  profile: {
    name: [
      Validators.required('El nombre es requerido'),
      Validators.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
      Validators.maxLength(50, 'El nombre no puede tener más de 50 caracteres')
    ],
    email: [
      Validators.required('El email es requerido'),
      Validators.email()
    ],
    bio: [
      Validators.maxLength(500, 'La biografía no puede tener más de 500 caracteres')
    ]
  },

  review: {
    rating: [
      Validators.required('La calificación es requerida'),
      Validators.rating()
    ],
    text: [
      Validators.required('El comentario es requerido'),
      Validators.minLength(10, 'El comentario debe tener al menos 10 caracteres'),
      Validators.maxLength(2000, 'El comentario no puede tener más de 2000 caracteres')
    ]
  },

  favorite: {
    bookId: [
      Validators.required('El ID del libro es requerido')
    ],
    bookTitle: [
      Validators.required('El título del libro es requerido')
    ],
    reading: [
      Validators.oneOf(['to-read', 'reading', 'read'], 'Estado de lectura inválido')
    ],
    priority: [
      Validators.oneOf(['low', 'medium', 'high'], 'Prioridad inválida')
    ],
    notes: [
      Validators.maxLength(1000, 'Las notas no pueden tener más de 1000 caracteres')
    ]
  }
} as const

// =============== VALIDATION DECORATORS ===============
export function validate<T extends Record<string, unknown>>(
  schema: ValidationSchema<T>
) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = function (...args: unknown[]) {
      const data = args[0] as T
      const result = ValidationEngine.validateForm(data, schema)
      
      if (!result.isValid) {
        throw ErrorFactory.validation.invalidFormat(result.firstError)
      }
      
      return method.apply(this, args)
    }

    return descriptor
  }
}

// =============== SANITIZATION ===============
export class Sanitizer {
  static email(email: string): string {
    return email.toLowerCase().trim()
  }

  static text(text: string): string {
    return text.trim()
  }

  static html(html: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }

  static phoneNumber(phone: string): string {
    return phone.replace(/\D/g, '') // Remove all non-digits
  }

  static slug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }
}

// =============== VALIDATION UTILS ===============
export class ValidationUtils {
  /**
   * Creates a validation error with field-specific information
   */
  static createFieldError(field: string, message: string) {
    return ErrorFactory.validation.invalidFormat(`${field}: ${message}`)
  }

  /**
   * Validates and sanitizes form data
   */
  static processFormData<T extends Record<string, unknown>>(
    rawData: Record<string, unknown>,
    schema: ValidationSchema<T>,
    sanitizers?: Partial<Record<keyof T, (value: unknown) => unknown>>
  ): T {
    // First, sanitize the data
    const sanitizedData = { ...rawData } as T
    
    if (sanitizers) {
      for (const [field, sanitizer] of Object.entries(sanitizers)) {
        if (sanitizedData[field as keyof T] !== undefined && sanitizer) {
          sanitizedData[field as keyof T] = sanitizer(sanitizedData[field as keyof T]) as T[keyof T]
        }
      }
    }

    // Then validate
    const result = ValidationEngine.validateForm(sanitizedData, schema)
    
    if (!result.isValid) {
      throw ErrorFactory.validation.invalidFormat(result.firstError)
    }

    return sanitizedData
  }

  /**
   * Validates MongoDB ObjectId
   */
  static isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id)
  }

  /**
   * Validates file extension
   */
  static isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension ? allowedExtensions.includes(extension) : false
  }

  /**
   * Validates file size
   */
  static isValidFileSize(fileSize: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return fileSize <= maxSizeInBytes
  }
}