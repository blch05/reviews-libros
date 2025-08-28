import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buscarLibros, obtenerLibro, obtenerLibrosPorIds } from './server-actions'

// Mock fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('server-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('buscarLibros', () => {
    it('debería buscar libros con query y retornar items', async () => {
      const mockResponse = {
        items: [
          {
            id: 'book1',
            volumeInfo: { title: 'Test Book 1' }
          },
          {
            id: 'book2',
            volumeInfo: { title: 'Test Book 2' }
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      const result = await buscarLibros('javascript programming')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=javascript%20programming'
      )
      expect(result).toEqual(mockResponse.items)
    })

    it('debería retornar array vacío cuando no hay items', async () => {
      const mockResponse = {}

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      const result = await buscarLibros('nonexistent book')

      expect(result).toEqual([])
    })

    it('debería codificar correctamente caracteres especiales en query', async () => {
      const mockResponse = { items: [] }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      await buscarLibros('libro en español & símbolos #especiales')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('libro%20en%20espa%C3%B1ol%20%26%20s%C3%ADmbolos%20%23especiales')
      )
    })

    it('debería manejar query vacío', async () => {
      const mockResponse = { items: [] }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      const result = await buscarLibros('')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q='
      )
      expect(result).toEqual([])
    })

    it('debería manejar respuesta con items null', async () => {
      const mockResponse = { items: null }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      const result = await buscarLibros('test')

      expect(result).toEqual([])
    })

    it('debería propagar errores de red', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(buscarLibros('test')).rejects.toThrow('Network error')
    })

    it('debería manejar respuesta JSON inválida', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(buscarLibros('test')).rejects.toThrow('Invalid JSON')
    })
  })

  describe('obtenerLibro', () => {
    it('debería obtener un libro específico por ID', async () => {
      const mockBook = {
        id: 'book123',
        volumeInfo: {
          title: 'Specific Book',
          authors: ['Author Name']
        }
      }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockBook)
      })

      const result = await obtenerLibro('book123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes/book123'
      )
      expect(result).toEqual(mockBook)
    })

    it('debería manejar ID con caracteres especiales', async () => {
      const mockBook = { id: 'special-id' }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockBook)
      })

      await obtenerLibro('book_id-123.test')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes/book_id-123.test'
      )
    })

    it('debería propagar errores de la API', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Book not found'))

      await expect(obtenerLibro('nonexistent')).rejects.toThrow('Book not found')
    })

    it('debería manejar respuesta de error 404', async () => {
      const errorResponse = {
        error: {
          code: 404,
          message: 'The volume ID could not be found.'
        }
      }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(errorResponse)
      })

      const result = await obtenerLibro('invalid-id')
      expect(result).toEqual(errorResponse)
    })

    it('debería manejar respuesta JSON inválida', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(obtenerLibro('test')).rejects.toThrow('Invalid JSON')
    })
  })

  describe('obtenerLibrosPorIds', () => {
    it('debería obtener múltiples libros por sus IDs', async () => {
      const mockBooks = [
        { id: 'book1', volumeInfo: { title: 'Book 1' } },
        { id: 'book2', volumeInfo: { title: 'Book 2' } },
        { id: 'book3', volumeInfo: { title: 'Book 3' } }
      ]

      mockBooks.forEach((book, index) => {
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve(book)
        })
      })

      const result = await obtenerLibrosPorIds(['book1', 'book2', 'book3'])

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://www.googleapis.com/books/v1/volumes/book1')
      expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://www.googleapis.com/books/v1/volumes/book2')
      expect(mockFetch).toHaveBeenNthCalledWith(3, 'https://www.googleapis.com/books/v1/volumes/book3')
      expect(result).toEqual(mockBooks)
    })

    it('debería filtrar libros que fallan al cargar', async () => {
      const successBook = { id: 'book1', volumeInfo: { title: 'Book 1' } }

      mockFetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(successBook)
        })
        .mockRejectedValueOnce(new Error('Book not found'))
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ id: 'book3', volumeInfo: { title: 'Book 3' } })
        })

      const result = await obtenerLibrosPorIds(['book1', 'book2', 'book3'])

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        successBook,
        { id: 'book3', volumeInfo: { title: 'Book 3' } }
      ])
    })

    it('debería manejar array vacío de IDs', async () => {
      const result = await obtenerLibrosPorIds([])

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('debería manejar todos los libros fallando', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))

      const result = await obtenerLibrosPorIds(['book1', 'book2'])

      expect(result).toEqual([])
    })

    it('debería loggear errores individuales', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockFetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ id: 'book1', volumeInfo: { title: 'Book 1' } })
        })
        .mockRejectedValueOnce(new Error('Network error for book2'))

      await obtenerLibrosPorIds(['book1', 'book2'])

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching book book2:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('debería manejar un solo ID', async () => {
      const mockBook = { id: 'single-book', volumeInfo: { title: 'Single Book' } }

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockBook)
      })

      const result = await obtenerLibrosPorIds(['single-book'])

      expect(result).toEqual([mockBook])
    })

    it('debería manejar IDs duplicados', async () => {
      const mockBook = { id: 'duplicate-book', volumeInfo: { title: 'Duplicate Book' } }

      mockFetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockBook)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockBook)
        })

      const result = await obtenerLibrosPorIds(['duplicate-book', 'duplicate-book'])

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual([mockBook, mockBook])
    })
  })
})
