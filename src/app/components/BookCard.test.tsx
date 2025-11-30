import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BookCard } from './BookCard'

// Mock de las dependencias
vi.mock('./BookImage', () => ({
  default: ({ src, alt }: any) => (
    <img data-testid="book-image" src={src} alt={alt} />
  )
}))

vi.mock('./StarRating', () => ({
  default: ({ rating }: any) => (
    <div data-testid="star-rating">{rating} stars</div>
  )
}))

vi.mock('./TruncatedText', () => ({
  default: ({ text }: any) => (
    <div data-testid="truncated-text">{text}</div>
  )
}))

describe('BookCard', () => {
  it('should render book information', () => {
    const mockBook = {
      id: 'test-book-id',
      volumeInfo: {
        title: 'Test Book Title',
        authors: ['Author One'],
        description: 'Test description'
      }
    }

    render(<BookCard book={mockBook} onSelect={vi.fn()} />)
    
    expect(screen.getByText('Test Book Title')).toBeInTheDocument()
    expect(screen.getByText('Author One')).toBeInTheDocument()
  })
})
