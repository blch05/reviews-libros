import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTopReviewedBooks, getCachedBook, setCachedBook } from './client-utils'

describe('client-utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getTopReviewedBooks', () => {
    it('debería retornar array vacío cuando no hay reseñas', () => {
      const topBooks = getTopReviewedBooks()
      expect(topBooks).toEqual([])
    })

    it('debería retornar array vacío en entorno servidor', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const topBooks = getTopReviewedBooks()
      expect(topBooks).toEqual([])
      
      global.window = originalWindow
    })

    it('debería ordenar libros por número de reseñas descendente', () => {
      // Configurar datos de prueba
      localStorage.setItem('reviews-book1', JSON.stringify([
        { id: '1', text: 'review1', stars: 5, bookId: 'book1' },
        { id: '2', text: 'review2', stars: 4, bookId: 'book1' }
      ]))
      
      localStorage.setItem('reviews-book2', JSON.stringify([
        { id: '3', text: 'review3', stars: 5, bookId: 'book2' },
        { id: '4', text: 'review4', stars: 3, bookId: 'book2' },
        { id: '5', text: 'review5', stars: 4, bookId: 'book2' },
        { id: '6', text: 'review6', stars: 2, bookId: 'book2' }
      ]))
      
      localStorage.setItem('reviews-book3', JSON.stringify([
        { id: '7', text: 'review7', stars: 5, bookId: 'book3' }
      ]))
      
      const topBooks = getTopReviewedBooks()
      expect(topBooks).toEqual(['book2', 'book1', 'book3'])
    })

    it('debería respetar el límite especificado', () => {
      // Configurar datos de prueba con 5 libros
      for (let i = 1; i <= 5; i++) {
        const reviews = Array.from({ length: i }, (_, j) => ({
          id: `${i}-${j}`,
          text: `review ${i}-${j}`,
          stars: 5,
          bookId: `book${i}`
        }))
        localStorage.setItem(`reviews-book${i}`, JSON.stringify(reviews))
      }
      
      const topBooks = getTopReviewedBooks(3)
      expect(topBooks).toHaveLength(3)
      expect(topBooks).toEqual(['book5', 'book4', 'book3'])
    })

    it('debería usar límite por defecto de 10', () => {
      // Configurar datos de prueba con 15 libros
      for (let i = 1; i <= 15; i++) {
        const reviews = Array.from({ length: i }, (_, j) => ({
          id: `${i}-${j}`,
          text: `review ${i}-${j}`,
          stars: 5,
          bookId: `book${i}`
        }))
        localStorage.setItem(`reviews-book${i}`, JSON.stringify(reviews))
      }
      
      const topBooks = getTopReviewedBooks()
      expect(topBooks).toHaveLength(10)
      // Debería retornar los 10 libros con más reseñas (book15 a book6)
      expect(topBooks[0]).toBe('book15')
      expect(topBooks[9]).toBe('book6')
    })

    it('debería ignorar libros sin reseñas', () => {
      localStorage.setItem('reviews-book1', JSON.stringify([
        { id: '1', text: 'review1', stars: 5, bookId: 'book1' }
      ]))
      
      // Libro sin reseñas
      localStorage.setItem('reviews-book2', JSON.stringify([]))
      
      localStorage.setItem('reviews-book3', JSON.stringify([
        { id: '2', text: 'review2', stars: 4, bookId: 'book3' }
      ]))
      
      const topBooks = getTopReviewedBooks()
      expect(topBooks).toEqual(['book1', 'book3'])
      expect(topBooks).not.toContain('book2')
    })

    it('debería ignorar keys que no son de reseñas', () => {
      localStorage.setItem('reviews-book1', JSON.stringify([
        { id: '1', text: 'review1', stars: 5, bookId: 'book1' }
      ]))
      
      // Keys que no son de reseñas
      localStorage.setItem('bookdesc-book1', JSON.stringify({ title: 'Test Book' }))
      localStorage.setItem('some-other-key', 'some value')
      
      const topBooks = getTopReviewedBooks()
      expect(topBooks).toEqual(['book1'])
    })

    it('debería manejar JSON inválido en localStorage', () => {
      localStorage.setItem('reviews-book1', JSON.stringify([
        { id: '1', text: 'review1', stars: 5, bookId: 'book1' }
      ]))
      
      // JSON inválido
      localStorage.setItem('reviews-book2', 'invalid-json')
      
      const topBooks = getTopReviewedBooks()
      expect(topBooks).toEqual(['book1'])
    })

    it('debería manejar límite 0', () => {
      localStorage.setItem('reviews-book1', JSON.stringify([
        { id: '1', text: 'review1', stars: 5, bookId: 'book1' }
      ]))
      
      const topBooks = getTopReviewedBooks(0)
      expect(topBooks).toEqual([])
    })

    it('debería manejar límite negativo', () => {
      localStorage.setItem('reviews-book1', JSON.stringify([
        { id: '1', text: 'review1', stars: 5, bookId: 'book1' }
      ]))
      
      const topBooks = getTopReviewedBooks(-1)
      expect(topBooks).toEqual([])
    })
  })

  describe('getCachedBook', () => {
    it('debería retornar null cuando no hay libro cacheado', () => {
      const book = getCachedBook('book-123')
      expect(book).toBe(null)
    })

    it('debería retornar null en entorno servidor', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const book = getCachedBook('book-123')
      expect(book).toBe(null)
      
      global.window = originalWindow
    })

    it('debería retornar libro cacheado cuando existe', () => {
      const mockBook = {
        id: 'book-123',
        volumeInfo: {
          title: 'Test Book',
          authors: ['Author Name']
        }
      }
      
      localStorage.setItem('bookdesc-book-123', JSON.stringify(mockBook))
      
      const book = getCachedBook('book-123')
      expect(book).toEqual(mockBook)
    })

    it('debería manejar JSON inválido retornando null', () => {
      localStorage.setItem('bookdesc-book-123', 'invalid-json')
      
      const book = getCachedBook('book-123')
      expect(book).toBe(null)
    })

    it('debería usar el formato correcto de key', () => {
      const mockBook = { id: 'test-book' }
      localStorage.setItem('bookdesc-test-book', JSON.stringify(mockBook))
      
      const book = getCachedBook('test-book')
      expect(book).toEqual(mockBook)
      
      // Verificar que no confunde con otros formatos
      const nonExistent = getCachedBook('bookdesc-test-book')
      expect(nonExistent).toBe(null)
    })
  })

  describe('setCachedBook', () => {
    it('debería guardar libro en localStorage', () => {
      const mockBook = {
        id: 'book-123',
        volumeInfo: {
          title: 'Test Book',
          authors: ['Author Name']
        }
      }
      
      setCachedBook('book-123', mockBook)
      
      const stored = localStorage.getItem('bookdesc-book-123')
      expect(stored).not.toBe(null)
      expect(JSON.parse(stored!)).toEqual(mockBook)
    })

    it('debería no hacer nada en entorno servidor', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const mockBook = { id: 'test' }
      setCachedBook('book-123', mockBook)
      
      // Restaurar window para verificar
      global.window = originalWindow
      const stored = localStorage.getItem('bookdesc-book-123')
      expect(stored).toBe(null)
    })

    it('debería sobrescribir libro existente', () => {
      const originalBook = { title: 'Original' }
      const newBook = { title: 'Updated' }
      
      setCachedBook('book-123', originalBook)
      setCachedBook('book-123', newBook)
      
      const stored = getCachedBook('book-123')
      expect(stored).toEqual(newBook)
    })

    it('debería usar el formato correcto de key', () => {
      const mockBook = { id: 'test' }
      setCachedBook('my-book-id', mockBook)
      
      const stored = localStorage.getItem('bookdesc-my-book-id')
      expect(stored).not.toBe(null)
      expect(JSON.parse(stored!)).toEqual(mockBook)
    })

    it('debería manejar datos complejos', () => {
      const complexBook = {
        id: 'complex-book',
        volumeInfo: {
          title: 'Complex Book',
          authors: ['Author 1', 'Author 2'],
          description: 'A very long description with special characters: áéíóú, @#$%',
          imageLinks: {
            thumbnail: 'https://example.com/image.jpg'
          },
          categories: ['Fiction', 'Mystery'],
          publishedDate: '2023-01-15',
          pageCount: 350
        },
        nested: {
          array: [1, 2, 3],
          object: { a: 1, b: 2 }
        }
      }
      
      setCachedBook('complex-book', complexBook)
      
      const retrieved = getCachedBook('complex-book')
      expect(retrieved).toEqual(complexBook)
    })
  })
})
