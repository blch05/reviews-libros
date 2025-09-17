import React, { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  hover?: boolean
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
}

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false
}) => {
  const cardClasses = `
    bg-white rounded-lg
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${border ? 'border border-gray-200' : ''}
    ${hover ? 'transition-shadow duration-200 hover:shadow-lg' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={cardClasses}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  as: Component = 'h3',
  className = ''
}) => {
  const titleClasses = `
    text-lg font-semibold text-gray-900 font-serif
    ${className}
  `.trim()

  return <Component className={titleClasses}>{children}</Component>
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  )
}