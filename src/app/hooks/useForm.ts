import { useState, useCallback, ChangeEvent } from 'react'

// Tipos para validación
type ValidationRule<T> = (value: T) => string | null
type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

interface FormConfig<T> {
  initialValues: T
  validationRules?: ValidationRules<T>
  onSubmit?: (values: T) => Promise<void> | void
}

interface FormHookReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isSubmitting: boolean
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
  setError: <K extends keyof T>(field: K, error: string | null) => void
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void
  handleChange: <K extends keyof T>(field: K) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  reset: () => void
  validate: () => boolean
  validateField: <K extends keyof T>(field: K) => string | null
}

// Validadores comunes
export const validators = {
  required: <T>(value: T): string | null => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Este campo es requerido'
    }
    return null
  },

  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      return 'Email inválido'
    }
    return null
  },

  minLength: (min: number) => (value: string): string | null => {
    if (value && value.length < min) {
      return `Mínimo ${min} caracteres`
    }
    return null
  },

  maxLength: (max: number) => (value: string): string | null => {
    if (value && value.length > max) {
      return `Máximo ${max} caracteres`
    }
    return null
  },

  password: (value: string): string | null => {
    if (value && value.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    return null
  },

  match: <T>(otherField: keyof T, otherValue: any, fieldName: string) => (value: any): string | null => {
    if (value !== otherValue) {
      return `Este campo debe coincidir con ${fieldName}`
    }
    return null
  }
}

// Hook principal para formularios
export function useForm<T extends Record<string, any>>(config: FormConfig<T>): FormHookReturn<T> {
  const [values, setValues] = useState<T>(config.initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validar un campo específico
  const validateField = useCallback(<K extends keyof T>(field: K): string | null => {
    const rules = config.validationRules?.[field]
    if (!rules) return null

    for (const rule of rules) {
      const error = rule(values[field])
      if (error) return error
    }
    return null
  }, [values, config.validationRules])

  // Validar todo el formulario
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let hasErrors = false

    for (const field in values) {
      const error = validateField(field)
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    }

    setErrors(newErrors)
    return !hasErrors
  }, [values, validateField])

  // Establecer valor de un campo
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error si el campo se corrige
    if (errors[field]) {
      const error = validateField(field)
      if (!error) {
        setErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }
  }, [errors, validateField])

  // Establecer error de un campo
  const setError = useCallback(<K extends keyof T>(field: K, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }))
  }, [])

  // Marcar campo como tocado
  const setTouched = useCallback(<K extends keyof T>(field: K, touchedValue: boolean) => {
    setTouchedState(prev => ({ ...prev, [field]: touchedValue }))
  }, [])

  // Manejador de cambios para inputs
  const handleChange = useCallback(<K extends keyof T>(field: K) => 
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value
      
      setValue(field, value as T[K])
      setTouched(field, true)
    }, [setValue, setTouched])

  // Manejador de envío del formulario
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Marcar todos los campos como tocados
    const allTouched: Partial<Record<keyof T, boolean>> = {}
    for (const field in values) {
      allTouched[field] = true
    }
    setTouchedState(allTouched)

    // Validar
    if (!validate()) {
      return
    }

    // Ejecutar onSubmit si está definido
    if (config.onSubmit) {
      try {
        setIsSubmitting(true)
        await config.onSubmit(values)
      } catch (error) {
        console.error('Error en submit:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values, validate, config.onSubmit])

  // Resetear formulario
  const reset = useCallback(() => {
    setValues(config.initialValues)
    setErrors({})
    setTouchedState({})
    setIsSubmitting(false)
  }, [config.initialValues])

  // Verificar si el formulario es válido
  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setError,
    setTouched,
    handleChange,
    handleSubmit,
    reset,
    validate,
    validateField
  }
}

// Hook especializado para login
export function useLoginForm() {
  return useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validationRules: {
      email: [validators.required, validators.email],
      password: [validators.required]
    }
  })
}

// Hook especializado para registro
export function useRegisterForm() {
  return useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationRules: {
      name: [validators.required],
      email: [validators.required, validators.email],
      password: [validators.required, validators.password],
      confirmPassword: [validators.required]
    }
  })
}

// Hook especializado para perfil
export function useProfileForm(initialData: { name: string; email: string; bio?: string }) {
  return useForm({
    initialValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      bio: initialData.bio || ''
    },
    validationRules: {
      name: [validators.required],
      email: [validators.required, validators.email],
      bio: [validators.maxLength(500)]
    }
  })
}

// Hook especializado para reseñas
export function useReviewForm(initialData?: { rating: number; text: string }) {
  return useForm({
    initialValues: {
      rating: initialData?.rating || 0,
      text: initialData?.text || ''
    },
    validationRules: {
      rating: [(rating: number) => rating === 0 ? 'Selecciona una calificación' : null],
      text: [validators.required, validators.minLength(10), validators.maxLength(1000)]
    }
  })
}