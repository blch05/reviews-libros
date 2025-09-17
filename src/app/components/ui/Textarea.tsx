import React, { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const baseStyles = `
  w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
  transition-colors duration-200 focus:outline-none focus:ring-2 
  focus:ring-[#616f55] focus:border-transparent
  disabled:bg-gray-50 disabled:cursor-not-allowed
`

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  resize = 'vertical',
  className = '',
  rows = 4,
  ...props
}, ref) => {
  const textareaClasses = `
    ${baseStyles}
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    resize-${resize}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'