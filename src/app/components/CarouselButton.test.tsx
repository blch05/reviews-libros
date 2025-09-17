import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CarouselButton from './CarouselButton'

describe('CarouselButton', () => {
  it('should render button with correct direction', () => {
    const mockOnClick = vi.fn()
    
    render(<CarouselButton direction="prev" onClick={mockOnClick} />)

    const button = screen.getByRole('button', { name: 'Anterior' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('←')
  })
})
