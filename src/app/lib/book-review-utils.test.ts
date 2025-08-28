import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BookReviewUtils, type Review } from './book-review-utils'
      
      const result = BookReviewUtils.getBestAndWorstReviews('book-123')
      expect(result.best?.stars).toBe(5)
      expect(result.worst?.stars).toBe(1)
      // Cuando hay empate, debería devolver cualquiera de las opciones válidas
      expect(['First 5 star', 'Second 5 star']).toContain(result.best?.text)
      expect(['First 1 star', 'Second 1 star']).toContain(result.worst?.text)
    })
  })
})

describe('BookReviewUtils', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getBookReviews', () => {
    it('debería retornar un array vacío cuando no hay reseñas almacenadas', () => {
      const reviews = BookReviewUtils.getBookReviews('book-123')
      expect(reviews).toEqual([])
    })

    it('debería retornar reseñas cuando existen en localStorage', () => {
      const mockReviews: Review[] = [
        { id: '1', text: 'Great book!', stars: 5, bookId: 'book-123', timestamp: Date.now() },
        { id: '2', text: 'Not bad', stars: 3, bookId: 'book-123', timestamp: Date.now() }
      ]
      
      localStorage.setItem('reviews-book-123', JSON.stringify(mockReviews))
      
      const reviews = BookReviewUtils.getBookReviews('book-123')
      expect(reviews).toEqual(mockReviews)
    })

    it('debería manejar JSON inválido retornando array vacío', () => {
      localStorage.setItem('reviews-book-123', 'invalid-json')
      
      const reviews = BookReviewUtils.getBookReviews('book-123')
      expect(reviews).toEqual([])
    })

    it('debería retornar array vacío en entorno servidor (window undefined)', () => {
      // Simular entorno servidor
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const reviews = BookReviewUtils.getBookReviews('book-123')
      expect(reviews).toEqual([])
      
      // Restaurar window
      global.window = originalWindow
    })
  })

  describe('getAverageStars', () => {
    it('debería retornar 0 cuando no hay reseñas', () => {
      const average = BookReviewUtils.getAverageStars('book-123')
      expect(average).toBe(0)
    })

    it('debería calcular correctamente el promedio de estrellas', () => {
      const mockReviews: Review[] = [
        { id: '1', text: 'Great!', stars: 5, bookId: 'book-123' },
        { id: '2', text: 'Good', stars: 4, bookId: 'book-123' },
        { id: '3', text: 'Average', stars: 3, bookId: 'book-123' }
      ]
      
      localStorage.setItem('reviews-book-123', JSON.stringify(mockReviews))
      
      const average = BookReviewUtils.getAverageStars('book-123')
      expect(average).toBe(4) // (5 + 4 + 3) / 3 = 4
    })

    it('debería manejar una sola reseña', () => {
      const mockReviews: Review[] = [
        { id: '1', text: 'Excellent!', stars: 5, bookId: 'book-123' }
      ]
      
      localStorage.setItem('reviews-book-123', JSON.stringify(mockReviews))
      
      const average = BookReviewUtils.getAverageStars('book-123')
      expect(average).toBe(5)
    })

    it('debería manejar decimales correctamente', () => {
      const mockReviews: Review[] = [
        { id: '1', text: 'Great!', stars: 5, bookId: 'book-123' },
        { id: '2', text: 'Bad', stars: 1, bookId: 'book-123' }
      ]
      
      localStorage.setItem('reviews-book-123', JSON.stringify(mockReviews))
      
      const average = BookReviewUtils.getAverageStars('book-123')
      expect(average).toBe(3) // (5 + 1) / 2 = 3
    })
  })

  describe('getBestAndWorstReviews', () => {
    it('debería retornar null para ambos cuando no hay reseñas', () => {
      const result = BookReviewUtils.getBestAndWorstReviews('book-123')
      expect(result).toEqual({ best: null, worst: null })
    })

    it('debería retornar la misma reseña para best y worst cuando solo hay una', () => {
      const mockReviews: Review[] = [
        { id: '1', text: 'Only review', stars: 3, bookId: 'book-123' }
      ]
      
      localStorage.setItem('reviews-book-123', JSON.stringify(mockReviews))
      
      const result = BookReviewUtils.getBestAndWorstReviews('book-123')
      expect(result.best).toEqual(mockReviews[0])
      expect(result.worst).toEqual(mockReviews[0])
    })

    it('debería identificar correctamente la mejor y peor reseña', () => {
      const mockReviews: Review[] = [
        { id: '1', text: 'Average', stars: 3, bookId: 'book-123' },
        { id: '2', text: 'Best', stars: 5, bookId: 'book-123' },
        { id: '3', text: 'Worst', stars: 1, bookId: 'book-123' },
        { id: '4', text: 'Good', stars: 4, bookId: 'book-123' }
      ]
      
      localStorage.setItem('reviews-book-123', JSON.stringify(mockReviews))
      
      const result = BookReviewUtils.getBestAndWorstReviews('book-123')
      expect(result.best?.stars).toBe(5)
      expect(result.best?.text).toBe('Best')
      expect(result.worst?.stars).toBe(1)
      expect(result.worst?.text).toBe('Worst')
    })

    it('debería manejar múltiples reseñas con misma puntuación', () => {
      const mockReviews: Review[] = [
        { id: '1', text: 'First 5 star', stars: 5, bookId: 'book-123' },
        { id: '2', text: 'Second 5 star', stars: 5, bookId: 'book-123' },
        { id: '3', text: 'First 1 star', stars: 1, bookId: 'book-123' },
        { id: '4', text: 'Second 1 star', stars: 1, bookId: 'book-123' }
      ]
      
      localStorage.setItem('reviews-book-123', JSON.stringify(mockReviews))
      
      const result = BookReviewUtils.getBestAndWorstReviews('book-123')
      expect(result.best?.stars).toBe(5)
      expect(result.worst?.stars).toBe(1)
      // Debería retornar el primero en el orden ordenado
      expect(result.best?.text).toBe('First 5 star')
      expect(result.worst?.text).toBe('First 1 star')
    })
  })

  describe('getBookCoverUrl', () => {
    it('debería retornar string vacío cuando no hay imageLinks', () => {
      const book = { volumeInfo: {} }
      const url = BookReviewUtils.getBookCoverUrl(book)
      expect(url).toBe('')
    })

    it('debería retornar string vacío cuando volumeInfo es undefined', () => {
      const book = {}
      const url = BookReviewUtils.getBookCoverUrl(book)
      expect(url).toBe('')
    })

    it('debería priorizar extraLarge sobre otras opciones', () => {
      const book = {
        volumeInfo: {
          imageLinks: {
            thumbnail: 'http://example.com/thumbnail.jpg',
            medium: 'http://example.com/medium.jpg',
            large: 'http://example.com/large.jpg',
            extraLarge: 'http://example.com/extralarge.jpg'
          }
        }
      }
      
      const url = BookReviewUtils.getBookCoverUrl(book)
      expect(url).toBe('https://example.com/extralarge.jpg')
    })

    it('debería usar large cuando extraLarge no está disponible', () => {
      const book = {
        volumeInfo: {
          imageLinks: {
            thumbnail: 'http://example.com/thumbnail.jpg',
            medium: 'http://example.com/medium.jpg',
            large: 'http://example.com/large.jpg'
          }
        }
      }
      
      const url = BookReviewUtils.getBookCoverUrl(book)
      expect(url).toBe('https://example.com/large.jpg')
    })

    it('debería usar medium cuando large y extraLarge no están disponibles', () => {
      const book = {
        volumeInfo: {
          imageLinks: {
            thumbnail: 'http://example.com/thumbnail.jpg',
            medium: 'http://example.com/medium.jpg'
          }
        }
      }
      
      const url = BookReviewUtils.getBookCoverUrl(book)
      expect(url).toBe('https://example.com/medium.jpg')
    })

    it('debería usar thumbnail como última opción', () => {
      const book = {
        volumeInfo: {
          imageLinks: {
            thumbnail: 'http://example.com/thumbnail.jpg'
          }
        }
      }
      
      const url = BookReviewUtils.getBookCoverUrl(book)
      expect(url).toBe('https://example.com/thumbnail.jpg')
    })

    it('debería convertir HTTP a HTTPS', () => {
      const book = {
        volumeInfo: {
          imageLinks: {
            thumbnail: 'http://books.google.com/books/content?id=123&printsec=frontcover&img=1&zoom=1'
          }
        }
      }
      
      const url = BookReviewUtils.getBookCoverUrl(book)
      expect(url.startsWith('https://')).toBe(true)
      expect(url).toContain('books.google.com')
    })

    it('debería mantener HTTPS si ya está en HTTPS', () => {
      const book = {
        volumeInfo: {
          imageLinks: {
            thumbnail: 'https://books.google.com/books/content?id=123&printsec=frontcover&img=1&zoom=1'
          }
        }
      }
      
      const url = BookReviewUtils.getBookCoverUrl(book)
      expect(url.startsWith('https://')).toBe(true)
      expect(url).toContain('books.google.com')
    })
  })

  describe('getPublicationInfo', () => {
    it('debería retornar string vacío cuando no hay información', () => {
      const volumeInfo = {}
      const info = BookReviewUtils.getPublicationInfo(volumeInfo)
      expect(info).toBe('')
    })

    it('debería formatear solo la fecha de publicación', () => {
      const volumeInfo = { publishedDate: '2023-01-15' }
      const info = BookReviewUtils.getPublicationInfo(volumeInfo)
      expect(info).toBe('Publicado: 2023-01-15')
    })

    it('debería formatear solo la editorial', () => {
      const volumeInfo = { publisher: 'Penguin Books' }
      const info = BookReviewUtils.getPublicationInfo(volumeInfo)
      expect(info).toBe('Editorial: Penguin Books')
    })

    it('debería formatear solo el número de páginas', () => {
      const volumeInfo = { pageCount: 350 }
      const info = BookReviewUtils.getPublicationInfo(volumeInfo)
      expect(info).toBe('350 páginas')
    })

    it('debería combinar toda la información disponible', () => {
      const volumeInfo = {
        publishedDate: '2023-01-15',
        publisher: 'Penguin Books',
        pageCount: 350
      }
      const info = BookReviewUtils.getPublicationInfo(volumeInfo)
      expect(info).toBe('Publicado: 2023-01-15 • Editorial: Penguin Books • 350 páginas')
    })

    it('debería combinar información parcial', () => {
      const volumeInfo = {
        publishedDate: '2023-01-15',
        pageCount: 350
      }
      const info = BookReviewUtils.getPublicationInfo(volumeInfo)
      expect(info).toBe('Publicado: 2023-01-15 • 350 páginas')
    })

    it('debería manejar valores falsy correctamente', () => {
      const volumeInfo = {
        publishedDate: '',
        publisher: null,
        pageCount: 0
      }
      const info = BookReviewUtils.getPublicationInfo(volumeInfo)
      expect(info).toBe('')
    })
  })
})
