import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BookImage from './BookImage'

describe('BookImage', () => {
  it('should render image with correct src and alt', () => {
    const validSrc = 'https://example.com/book-cover.jpg'
    const altText = 'Book Cover'
    
    render(<BookImage src={validSrc} alt={altText} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', validSrc)
    expect(image).toHaveAttribute('alt', altText)
  })
})
