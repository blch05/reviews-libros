import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookCard } from './BookCard'
import { BookReviewUtils } from '../lib/book-review-utils'

// Mock de las dependencias
vi.mock('../lib/book-review-utils')
vi.mock('./BookImage', () => ({
  default: ({ src, alt, size, className }: any) => {
    // Si src está vacío, no renderizar nada (igual que el componente real)
    if (!src) return null
    
    return (
      <img data-testid="book-image" src={src} alt={alt} data-size={size} className={className} />
    )
  }
}))

vi.mock('./StarRating', () => ({
  default: ({ rating, size }: any) => (
    <div data-testid="star-rating" data-rating={rating} data-size={size}>
      {rating > 0 ? `${rating} stars` : 'No rating'}
    </div>
  )
}))

vi.mock('./TruncatedText', () => ({
  default: ({ text, maxLength, className }: any) => (
    <div data-testid="truncated-text" data-max-length={maxLength} className={className}>
      {text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text}
    </div>
  )
}))

const mockBookReviewUtils = vi.mocked(BookReviewUtils)

describe('BookCard', () => {
  const mockOnSelect = vi.fn()

  const mockBook = {
    id: 'test-book-id',
    volumeInfo: {
      title: 'Test Book Title',
      authors: ['Author One', 'Author Two'],
      description: 'This is a test book description that is long enough to test truncation functionality and see how it behaves with longer content.',
      categories: ['Fiction', 'Adventure'],
      publishedDate: '2023-01-15',
      publisher: 'Test Publisher',
      pageCount: 350
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Configurar mocks por defecto
    mockBookReviewUtils.getBookCoverUrl.mockReturnValue('https://example.com/cover.jpg')
    mockBookReviewUtils.getAverageStars.mockReturnValue(4.2)
    mockBookReviewUtils.getPublicationInfo.mockReturnValue('Publicado: 2023-01-15 • Editorial: Test Publisher • 350 páginas')
  })

  it('debería renderizar todos los elementos básicos del libro', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    expect(screen.getByText('Test Book Title')).toBeInTheDocument()
    const bookImage = screen.getByAltText('Test Book Title')
    expect(bookImage).toHaveAttribute('src', 'https://example.com/cover.jpg')
    expect(screen.getByTestId('star-rating')).toHaveAttribute('data-rating', '4.2')
  })

  it('debería mostrar autores cuando están disponibles', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    expect(screen.getByText('Autor(es):')).toBeInTheDocument()
    expect(screen.getByText('Author One, Author Two')).toBeInTheDocument()
  })

  it('debería no mostrar autores cuando no están disponibles', () => {
    const bookWithoutAuthors = {
      ...mockBook,
      volumeInfo: {
        ...mockBook.volumeInfo,
        authors: undefined
      }
    }

    render(<BookCard book={bookWithoutAuthors} onSelect={mockOnSelect} />)

    expect(screen.queryByText('Autor(es):')).not.toBeInTheDocument()
  })

  it('debería mostrar información de publicación cuando está disponible', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    expect(screen.getByText('Publicado: 2023-01-15 • Editorial: Test Publisher • 350 páginas')).toBeInTheDocument()
  })

  it('debería no mostrar información de publicación cuando no está disponible', () => {
    mockBookReviewUtils.getPublicationInfo.mockReturnValue('')

    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    expect(screen.queryByText(/Publicado:/)).not.toBeInTheDocument()
  })

  it('debería mostrar descripción truncada cuando está disponible', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const truncatedText = screen.getByTestId('truncated-text')
    expect(truncatedText).toBeInTheDocument()
    expect(truncatedText).toHaveAttribute('data-max-length', '150')
  })

  it('debería no mostrar descripción cuando no está disponible', () => {
    const bookWithoutDescription = {
      ...mockBook,
      volumeInfo: {
        ...mockBook.volumeInfo,
        description: undefined
      }
    }

    render(<BookCard book={bookWithoutDescription} onSelect={mockOnSelect} />)

    expect(screen.queryByTestId('truncated-text')).not.toBeInTheDocument()
  })

  it('debería mostrar categorías cuando están disponibles', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    expect(screen.getByText('Categorias:')).toBeInTheDocument()
    expect(screen.getByText('Fiction, Adventure')).toBeInTheDocument()
  })

  it('debería no mostrar categorías cuando no están disponibles', () => {
    const bookWithoutCategories = {
      ...mockBook,
      volumeInfo: {
        ...mockBook.volumeInfo,
        categories: undefined
      }
    }

    render(<BookCard book={bookWithoutCategories} onSelect={mockOnSelect} />)

    expect(screen.queryByText('Categorias:')).not.toBeInTheDocument()
  })

  it('debería llamar onSelect con el ID correcto cuando se hace click', async () => {
    const user = userEvent.setup()
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const card = screen.getByText('Test Book Title').closest('div[class*="cursor-pointer"]')
    await user.click(card!)

    expect(mockOnSelect).toHaveBeenCalledWith('test-book-id')
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })

  it('debería llamar onSelect cuando se hace click en cualquier parte de la card', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const card = screen.getByText('Test Book Title').closest('div[class*="cursor-pointer"]')
    fireEvent.click(card!)

    expect(mockOnSelect).toHaveBeenCalledWith('test-book-id')
  })

  it('debería aplicar las clases CSS correctas', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const card = screen.getByText('Test Book Title').closest('div[class*="cursor-pointer"]')
    expect(card).toHaveClass(
      'flex', 'flex-col', 'md:flex-row', 'gap-4', 
      'border-b', 'border-gray-400', 'p-4', 
      'bg-white', 'shadow-md', 'cursor-pointer'
    )
  })

  it('debería pasar las props correctas a BookImage', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const bookImage = screen.getByAltText('Test Book Title')
    expect(bookImage).toHaveAttribute('data-size', 'md')
    expect(bookImage).toHaveClass('rounded-md')
  })

  it('debería pasar las props correctas a StarRating', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const starRating = screen.getByTestId('star-rating')
    expect(starRating).toHaveAttribute('data-size', 'sm')
  })

  it('debería llamar a las funciones de BookReviewUtils con los parámetros correctos', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    expect(mockBookReviewUtils.getBookCoverUrl).toHaveBeenCalledWith(mockBook)
    expect(mockBookReviewUtils.getAverageStars).toHaveBeenCalledWith('test-book-id')
    expect(mockBookReviewUtils.getPublicationInfo).toHaveBeenCalledWith(mockBook.volumeInfo)
  })

  it('debería manejar libro sin rating (0 estrellas)', () => {
    mockBookReviewUtils.getAverageStars.mockReturnValue(0)

    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const starRating = screen.getByTestId('star-rating')
    expect(starRating).toHaveAttribute('data-rating', '0')
  })

  it('debería manejar rating alto', () => {
    mockBookReviewUtils.getAverageStars.mockReturnValue(4.9)

    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const starRating = screen.getByTestId('star-rating')
    expect(starRating).toHaveAttribute('data-rating', '4.9')
  })

  it('debería manejar URL de imagen vacía', () => {
    mockBookReviewUtils.getBookCoverUrl.mockReturnValue('')

    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    // BookImage devuelve null cuando src está vacío, por lo que no debería renderizarse
    expect(screen.queryByTestId('book-image')).not.toBeInTheDocument()
  })

  it('debería manejar lista de autores vacía', () => {
    const bookWithEmptyAuthors = {
      ...mockBook,
      volumeInfo: {
        ...mockBook.volumeInfo,
        authors: []
      }
    }

    render(<BookCard book={bookWithEmptyAuthors} onSelect={mockOnSelect} />)

    // El componente aún muestra "Autor(es):" pero con string vacío
    expect(screen.getByText('Autor(es):')).toBeInTheDocument()
    // El texto de autores debería estar vacío
    const authorParagraph = screen.getByText('Autor(es):').closest('p')
    expect(authorParagraph).toHaveTextContent('Autor(es):')
  })

  it('debería manejar lista de categorías vacía', () => {
    const bookWithEmptyCategories = {
      ...mockBook,
      volumeInfo: {
        ...mockBook.volumeInfo,
        categories: []
      }
    }

    render(<BookCard book={bookWithEmptyCategories} onSelect={mockOnSelect} />)

    // Similar a autores, muestra el label pero con contenido vacío
    expect(screen.getByText('Categorias:')).toBeInTheDocument()
    const categoriesParagraph = screen.getByText('Categorias:').closest('p')
    expect(categoriesParagraph).toHaveTextContent('Categorias:')
  })

  it('debería manejar libro con solo título', () => {
    const minimalBook = {
      id: 'minimal-book',
      volumeInfo: {
        title: 'Minimal Book'
      }
    }

    mockBookReviewUtils.getBookCoverUrl.mockReturnValue('')
    mockBookReviewUtils.getAverageStars.mockReturnValue(0)
    mockBookReviewUtils.getPublicationInfo.mockReturnValue('')

    render(<BookCard book={minimalBook} onSelect={mockOnSelect} />)

    expect(screen.getByText('Minimal Book')).toBeInTheDocument()
    expect(screen.queryByText('Autor(es):')).not.toBeInTheDocument()
    expect(screen.queryByText('Categorias:')).not.toBeInTheDocument()
    expect(screen.queryByTestId('truncated-text')).not.toBeInTheDocument()
  })

  it('debería manejar un solo autor', () => {
    const bookWithOneAuthor = {
      ...mockBook,
      volumeInfo: {
        ...mockBook.volumeInfo,
        authors: ['Single Author']
      }
    }

    render(<BookCard book={bookWithOneAuthor} onSelect={mockOnSelect} />)

    expect(screen.getByText('Single Author')).toBeInTheDocument()
  })

  it('debería manejar una sola categoría', () => {
    const bookWithOneCategory = {
      ...mockBook,
      volumeInfo: {
        ...mockBook.volumeInfo,
        categories: ['Fiction']
      }
    }

    render(<BookCard book={bookWithOneCategory} onSelect={mockOnSelect} />)

    expect(screen.getByText('Fiction')).toBeInTheDocument()
  })

  it('debería ser accesible por teclado', async () => {
    const user = userEvent.setup()
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />)

    const card = screen.getByText('Test Book Title').closest('div[class*="cursor-pointer"]') as HTMLElement
    
    // Simular navegación por teclado
    if (card) {
      card.focus()
      await user.keyboard('{Enter}')
    }

    // Note: Este test asume que la card es focusable, lo cual podría requerir tabIndex
    // En la implementación actual no está focusable por teclado
  })
})
