import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTopBooks } from './useTopBooks'
import * as clientUtils from '../lib/client-utils'
import * as serverActions from '../lib/server-actions'

// Mock de las dependencias
vi.mock('../lib/client-utils')
vi.mock('../lib/server-actions')

const mockClientUtils = vi.mocked(clientUtils)
const mockServerActions = vi.mocked(serverActions)

describe('useTopBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Configurar mocks por defecto
    mockClientUtils.getTopReviewedBooks.mockReturnValue([])
    mockClientUtils.getCachedBook.mockReturnValue(null)
    mockClientUtils.setCachedBook.mockImplementation(() => {})
    mockServerActions.obtenerLibro.mockResolvedValue({})
  })

  it('debería inicializar con estado de carga', () => {
    const { result } = renderHook(() => useTopBooks())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.topBooks).toEqual([])
  })

  it('debería retornar array vacío cuando no hay libros con reseñas', async () => {
    mockClientUtils.getTopReviewedBooks.mockReturnValue([])
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual([])
    expect(mockClientUtils.getTopReviewedBooks).toHaveBeenCalledWith(10)
  })

  it('debería cargar libros desde caché cuando están disponibles', async () => {
    const mockBooks = [
      { id: 'book1', volumeInfo: { title: 'Book 1' } },
      { id: 'book2', volumeInfo: { title: 'Book 2' } }
    ]
    
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1', 'book2'])
    mockClientUtils.getCachedBook
      .mockReturnValueOnce(mockBooks[0])
      .mockReturnValueOnce(mockBooks[1])
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual(mockBooks)
    expect(mockClientUtils.getCachedBook).toHaveBeenCalledWith('book1')
    expect(mockClientUtils.getCachedBook).toHaveBeenCalledWith('book2')
    expect(mockServerActions.obtenerLibro).not.toHaveBeenCalled()
  })

  it('debería buscar libros desde API cuando no están en caché', async () => {
    const mockBook = { id: 'book1', volumeInfo: { title: 'Book 1' } }
    
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1'])
    mockClientUtils.getCachedBook.mockReturnValue(null)
    mockServerActions.obtenerLibro.mockResolvedValue(mockBook)
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual([mockBook])
    expect(mockServerActions.obtenerLibro).toHaveBeenCalledWith('book1')
    expect(mockClientUtils.setCachedBook).toHaveBeenCalledWith('book1', mockBook)
  })

  it('debería manejar mezcla de libros cacheados y no cacheados', async () => {
    const cachedBook = { id: 'book1', volumeInfo: { title: 'Cached Book' } }
    const apiBook = { id: 'book2', volumeInfo: { title: 'API Book' } }
    
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1', 'book2'])
    mockClientUtils.getCachedBook
      .mockReturnValueOnce(cachedBook)
      .mockReturnValueOnce(null)
    mockServerActions.obtenerLibro.mockResolvedValue(apiBook)
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual([cachedBook, apiBook])
    expect(mockServerActions.obtenerLibro).toHaveBeenCalledWith('book2')
    expect(mockServerActions.obtenerLibro).toHaveBeenCalledTimes(1)
    expect(mockClientUtils.setCachedBook).toHaveBeenCalledWith('book2', apiBook)
  })

  it('debería filtrar libros que fallan al cargar desde API', async () => {
    const successBook = { id: 'book1', volumeInfo: { title: 'Success Book' } }
    
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1', 'book2'])
    mockClientUtils.getCachedBook.mockReturnValue(null)
    mockServerActions.obtenerLibro
      .mockResolvedValueOnce(successBook)
      .mockRejectedValueOnce(new Error('API Error'))
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual([successBook])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching book book2:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('debería manejar todos los libros fallando', async () => {
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1', 'book2'])
    mockClientUtils.getCachedBook.mockReturnValue(null)
    mockServerActions.obtenerLibro.mockRejectedValue(new Error('API Error'))
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual([])
    expect(consoleSpy).toHaveBeenCalledTimes(2)
    
    consoleSpy.mockRestore()
  })

  it('debería manejar error en getTopReviewedBooks', async () => {
    mockClientUtils.getTopReviewedBooks.mockImplementation(() => {
      throw new Error('LocalStorage error')
    })
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error loading top books:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('debería manejar error en getCachedBook', async () => {
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1'])
    mockClientUtils.getCachedBook.mockImplementation(() => {
      throw new Error('Cache error')
    })
    
    const mockBook = { id: 'book1', volumeInfo: { title: 'Book 1' } }
    mockServerActions.obtenerLibro.mockResolvedValue(mockBook)
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Debería fallar silenciosamente y proceder con la API
    expect(result.current.topBooks).toEqual([mockBook])
    expect(mockServerActions.obtenerLibro).toHaveBeenCalledWith('book1')
  })

  it('debería llamar getTopReviewedBooks con límite de 10', async () => {
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(mockClientUtils.getTopReviewedBooks).toHaveBeenCalledWith(10)
  })

  it('debería manejar respuesta vacía de la API', async () => {
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1'])
    mockClientUtils.getCachedBook.mockReturnValue(null)
    mockServerActions.obtenerLibro.mockResolvedValue(null)
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual([])
  })

  it('debería establecer loading false incluso si hay errores', async () => {
    mockClientUtils.getTopReviewedBooks.mockImplementation(() => {
      throw new Error('Test error')
    })
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useTopBooks())
    
    // Inicialmente debería ser true
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    consoleSpy.mockRestore()
  })

  it('debería manejar un solo libro correctamente', async () => {
    const singleBook = { id: 'book1', volumeInfo: { title: 'Single Book' } }
    
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1'])
    mockClientUtils.getCachedBook.mockReturnValue(singleBook)
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual([singleBook])
  })

  it('debería manejar Promise.all correctamente con múltiples libros', async () => {
    const books = [
      { id: 'book1', volumeInfo: { title: 'Book 1' } },
      { id: 'book2', volumeInfo: { title: 'Book 2' } },
      { id: 'book3', volumeInfo: { title: 'Book 3' } }
    ]
    
    mockClientUtils.getTopReviewedBooks.mockReturnValue(['book1', 'book2', 'book3'])
    mockClientUtils.getCachedBook.mockReturnValue(null)
    
    // Simular diferentes tiempos de respuesta
    mockServerActions.obtenerLibro
      .mockResolvedValueOnce(books[0])
      .mockResolvedValueOnce(books[1])
      .mockResolvedValueOnce(books[2])
    
    const { result } = renderHook(() => useTopBooks())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.topBooks).toEqual(books)
    expect(mockServerActions.obtenerLibro).toHaveBeenCalledTimes(3)
  })
})
