import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CarouselButton from './CarouselButton'

describe('CarouselButton', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar botón "anterior" correctamente', () => {
    render(<CarouselButton direction="prev" onClick={mockOnClick} />)

    const button = screen.getByRole('button', { name: 'Anterior' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('←')
    expect(button).toHaveClass('left-4')
  })

  it('debería renderizar botón "siguiente" correctamente', () => {
    render(<CarouselButton direction="next" onClick={mockOnClick} />)

    const button = screen.getByRole('button', { name: 'Siguiente' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('→')
    expect(button).toHaveClass('right-4')
  })

  it('debería llamar onClick cuando se hace click', () => {
    render(<CarouselButton direction="next" onClick={mockOnClick} />)

    const button = screen.getByRole('button', { name: 'Siguiente' })
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('debería aplicar className personalizado', () => {
    render(<CarouselButton direction="prev" onClick={mockOnClick} className="custom-class" />)

    const button = screen.getByRole('button', { name: 'Anterior' })
    expect(button).toHaveClass('custom-class')
  })

  it('debería tener las clases CSS base correctas', () => {
    render(<CarouselButton direction="next" onClick={mockOnClick} />)

    const button = screen.getByRole('button', { name: 'Siguiente' })
    expect(button).toHaveClass('absolute', 'top-1/2', '-translate-y-1/2', 'bg-[#4b2e22]', 'text-white', 'rounded-full', 'w-10', 'h-10', 'flex', 'items-center', 'justify-center', 'text-2xl', 'hover:bg-gray-600')
  })

  it('debería tener atributos de accesibilidad correctos', () => {
    render(<CarouselButton direction="prev" onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Anterior')
  })
})
