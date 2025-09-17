import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StarRating from './StarRating'

describe('StarRating', () => {
  it('should render stars correctly based on rating', () => {
    render(<StarRating rating={5} />)
    
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5)
    
    // All stars should have yellow color
    stars.forEach(star => {
      expect(star).toHaveClass('text-yellow-400')
    })
  })
})
