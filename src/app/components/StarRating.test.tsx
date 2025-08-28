import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StarRating from './StarRating'

describe('StarRating', () => {
  it('debería renderizar las estrellas correctamente con rating completo', () => {
    render(<StarRating rating={5} />)
    
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5)
    
    // Todas las estrellas deberían tener color amarillo
    stars.forEach(star => {
      expect(star).toHaveClass('text-yellow-400')
    })
  })

  it('debería renderizar parcialmente las estrellas según el rating', () => {
    render(<StarRating rating={3} />)
    
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5)
    
    // Las primeras 3 estrellas deberían ser amarillas
    stars.slice(0, 3).forEach(star => {
      expect(star).toHaveClass('text-yellow-400')
    })
    
    // Las últimas 2 estrellas deberían ser grises
    stars.slice(3).forEach(star => {
      expect(star).toHaveClass('text-gray-300')
    })
  })

  it('debería mostrar el valor del rating por defecto', () => {
    render(<StarRating rating={4.2} />)
    
    expect(screen.getByText('4.2/5.0')).toBeInTheDocument()
  })

  it('debería ocultar el valor cuando showValue es false', () => {
    render(<StarRating rating={4.2} showValue={false} />)
    
    expect(screen.queryByText('4.2/5.0')).not.toBeInTheDocument()
    expect(screen.getAllByText('★')).toHaveLength(5)
  })

  it('debería usar maxStars personalizado', () => {
    render(<StarRating rating={8} maxStars={10} />)
    
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(10)
    expect(screen.getByText('8.0/10.0')).toBeInTheDocument()
  })

  it('debería aplicar tamaño small correctamente', () => {
    render(<StarRating rating={5} size="sm" />)
    
    const stars = screen.getAllByText('★')
    stars.forEach(star => {
      expect(star).toHaveClass('text-sm')
    })
    
    const valueText = screen.getByText('5.0/5.0')
    expect(valueText).toHaveClass('text-sm')
  })

  it('debería aplicar tamaño medium por defecto', () => {
    render(<StarRating rating={5} />)
    
    const stars = screen.getAllByText('★')
    stars.forEach(star => {
      expect(star).toHaveClass('text-lg')
    })
  })

  it('debería aplicar tamaño large correctamente', () => {
    render(<StarRating rating={5} size="lg" />)
    
    const stars = screen.getAllByText('★')
    stars.forEach(star => {
      expect(star).toHaveClass('text-xl')
    })
  })

  it('debería aplicar color personalizado', () => {
    render(<StarRating rating={3} color="text-red-500" />)
    
    const stars = screen.getAllByText('★')
    
    // Las primeras 3 estrellas deberían tener color personalizado
    stars.slice(0, 3).forEach(star => {
      expect(star).toHaveClass('text-red-500')
    })
    
    // Las restantes deberían ser grises
    stars.slice(3).forEach(star => {
      expect(star).toHaveClass('text-gray-300')
    })
  })

  it('debería aplicar className personalizado', () => {
    render(<StarRating rating={5} className="custom-class" />)
    
    // El className se aplica al contenedor principal, no al div de las estrellas
    const mainContainer = screen.getAllByText('★')[0].closest('div')?.parentElement
    expect(mainContainer).toHaveClass('custom-class')
    expect(mainContainer).toHaveClass('flex') // También debe incluir las clases por defecto
  })

  it('debería manejar rating decimal correctamente', () => {
    render(<StarRating rating={3.7} />)
    
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5)
    expect(screen.getByText('3.7/5.0')).toBeInTheDocument()
  })

  it('debería no renderizar nada cuando rating es 0', () => {
    const { container } = render(<StarRating rating={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('debería no renderizar nada cuando rating es negativo', () => {
    const { container } = render(<StarRating rating={-1} />)
    expect(container.firstChild).toBeNull()
  })

  it('debería manejar rating mayor al máximo', () => {
    render(<StarRating rating={8} maxStars={5} />)
    
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5)
    
    // Todas las estrellas deberían ser amarillas (se considera como 5)
    stars.forEach(star => {
      expect(star).toHaveClass('text-yellow-400')
    })
    
    expect(screen.getByText('8.0/5.0')).toBeInTheDocument()
  })

  it('debería formatear decimales correctamente en el valor mostrado', () => {
    render(<StarRating rating={4} />)
    expect(screen.getByText('4.0/5.0')).toBeInTheDocument()
    
    const { rerender } = render(<StarRating rating={4.123456} />)
    expect(screen.getByText('4.1/5.0')).toBeInTheDocument()
  })

  it('debería manejar maxStars = 1', () => {
    render(<StarRating rating={1} maxStars={1} />)
    
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(1)
    expect(stars[0]).toHaveClass('text-yellow-400')
    expect(screen.getByText('1.0/1.0')).toBeInTheDocument()
  })

  it('debería manejar maxStars = 0', () => {
    render(<StarRating rating={5} maxStars={0} />)
    
    const stars = screen.queryAllByText('★')
    expect(stars).toHaveLength(0)
    expect(screen.getByText('5.0/0.0')).toBeInTheDocument()
  })

  it('debería aplicar estilos de texto blanco por defecto en el valor', () => {
    render(<StarRating rating={5} />)
    
    const valueText = screen.getByText('5.0/5.0')
    expect(valueText).toHaveClass('text-white')
    expect(valueText).toHaveClass('font-semibold')
    expect(valueText).toHaveClass('font-serif')
  })
})
