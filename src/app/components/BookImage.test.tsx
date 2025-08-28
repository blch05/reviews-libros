import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BookImage from './BookImage'

describe('BookImage', () => {
  const validSrc = 'https://example.com/book-cover.jpg'
  const altText = 'Book Cover'

  it('debería renderizar imagen con src y alt correctos', () => {
    render(<BookImage src={validSrc} alt={altText} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', validSrc)
    expect(image).toHaveAttribute('alt', altText)
  })

  it('debería aplicar tamaño medium por defecto', () => {
    render(<BookImage src={validSrc} alt={altText} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('w-32', 'h-auto')
  })

  it('debería aplicar tamaño small correctamente', () => {
    render(<BookImage src={validSrc} alt={altText} size="sm" />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('w-20', 'h-28')
  })

  it('debería aplicar tamaño large correctamente', () => {
    render(<BookImage src={validSrc} alt={altText} size="lg" />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('w-40', 'h-60')
  })

  it('debería aplicar tamaño extra large correctamente', () => {
    render(<BookImage src={validSrc} alt={altText} size="xl" />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('w-48', 'h-72')
  })

  it('debería aplicar clases base por defecto', () => {
    render(<BookImage src={validSrc} alt={altText} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('object-cover', 'rounded', 'shadow-lg')
  })

  it('debería aplicar className personalizado', () => {
    render(<BookImage src={validSrc} alt={altText} className="custom-class border-2" />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('custom-class', 'border-2')
    // También debería mantener las clases base
    expect(image).toHaveClass('object-cover', 'rounded', 'shadow-lg')
  })

  it('debería no renderizar cuando src está vacío', () => {
    const { container } = render(<BookImage src="" alt={altText} />)
    expect(container.firstChild).toBeNull()
  })

  it('debería no renderizar cuando src es null/undefined', () => {
    // @ts-ignore - testing edge case
    const { container } = render(<BookImage src={null} alt={altText} />)
    expect(container.firstChild).toBeNull()
  })

  it('debería combinar todas las clases correctamente', () => {
    render(
      <BookImage 
        src={validSrc} 
        alt={altText} 
        size="lg" 
        className="additional-class"
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass(
      'w-40', 'h-60', // size lg
      'object-cover', 'rounded', 'shadow-lg', // base classes
      'additional-class' // custom class
    )
  })

  it('debería manejar src con espacios', () => {
    const srcWithSpaces = '  https://example.com/image.jpg  '
    render(<BookImage src={srcWithSpaces} alt={altText} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', srcWithSpaces)
  })

  it('debería manejar alt con caracteres especiales', () => {
    const specialAlt = 'Libro: "El Quijote" - Miguel de Cervantes & Co.'
    render(<BookImage src={validSrc} alt={specialAlt} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', specialAlt)
  })

  it('debería manejar múltiples clases en className', () => {
    render(
      <BookImage 
        src={validSrc} 
        alt={altText} 
        className="class1 class2 class3"
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('class1', 'class2', 'class3')
  })

  it('debería ser accesible con screen reader', () => {
    render(<BookImage src={validSrc} alt="Portada del libro 1984 de George Orwell" />)
    
    const image = screen.getByAltText('Portada del libro 1984 de George Orwell')
    expect(image).toBeInTheDocument()
  })

  it('debería manejar src con diferentes protocolos', () => {
    const httpsSrc = 'https://example.com/image.jpg'
    const httpSrc = 'http://example.com/image.jpg'
    const dataSrc = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD'
    
    const { rerender } = render(<BookImage src={httpsSrc} alt={altText} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', httpsSrc)
    
    rerender(<BookImage src={httpSrc} alt={altText} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', httpSrc)
    
    rerender(<BookImage src={dataSrc} alt={altText} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', dataSrc)
  })

  it('debería aplicar todas las combinaciones de tamaño', () => {
    const sizes = [
      { size: 'sm' as const, classes: ['w-20', 'h-28'] },
      { size: 'md' as const, classes: ['w-32', 'h-auto'] },
      { size: 'lg' as const, classes: ['w-40', 'h-60'] },
      { size: 'xl' as const, classes: ['w-48', 'h-72'] }
    ]
    
    sizes.forEach(({ size, classes }) => {
      const { unmount } = render(<BookImage src={validSrc} alt={altText} size={size} />)
      
      const image = screen.getByRole('img')
      classes.forEach(className => {
        expect(image).toHaveClass(className)
      })
      
      unmount()
    })
  })

  it('debería manejar className vacío', () => {
    render(<BookImage src={validSrc} alt={altText} className="" />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('object-cover', 'rounded', 'shadow-lg')
  })

  it('debería ser img tag y no Next.js Image component', () => {
    render(<BookImage src={validSrc} alt={altText} />)
    
    const image = screen.getByRole('img')
    expect(image.tagName).toBe('IMG')
  })
})
