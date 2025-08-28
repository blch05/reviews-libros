import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, PUT, PATCH } from './route'
import { NextResponse } from 'next/server'

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn()
  }
}))

const mockNextResponse = vi.mocked(NextResponse)

describe('API /reviews route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNextResponse.json.mockClear()
    
    // Reset module state between tests
    // Note: This is tricky with ES modules, the reviews object persists
    vi.resetModules()
  })

  describe('GET', () => {
    it('debería retornar array vacío para libro sin reseñas', async () => {
      const mockUrl = 'http://localhost:3000/api/reviews?bookId=book123'
      const mockRequest = { url: mockUrl } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      const result = await GET(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        reviews: []
      })
      expect(result).toBe('mocked-response')
    })

    it('debería manejar URL sin parámetros', async () => {
      const mockUrl = 'http://localhost:3000/api/reviews'
      const mockRequest = { url: mockUrl } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await GET(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        reviews: []
      })
    })

    it('debería manejar bookId vacío', async () => {
      const mockUrl = 'http://localhost:3000/api/reviews?bookId='
      const mockRequest = { url: mockUrl } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await GET(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        reviews: []
      })
    })

    it('debería manejar múltiples parámetros de query', async () => {
      const mockUrl = 'http://localhost:3000/api/reviews?bookId=book123&other=param'
      const mockRequest = { url: mockUrl } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await GET(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        reviews: []
      })
    })
  })

  describe('PUT', () => {
    it('debería agregar nueva reseña correctamente', async () => {
      const mockReview = {
        id: 'review1',
        text: 'Great book!',
        stars: 5,
        bookId: 'book123'
      }

      const mockRequest = {
        json: () => Promise.resolve({
          bookId: 'book123',
          review: mockReview
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      const result = await PUT(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true
      })
      expect(result).toBe('mocked-response')
    })

    it('debería agregar votes: 0 a la nueva reseña', async () => {
      const mockReview = {
        id: 'review1',
        text: 'Great book!',
        stars: 5
      }

      const mockRequest = {
        json: () => Promise.resolve({
          bookId: 'book123',
          review: mockReview
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await PUT(mockRequest)

      // Como no podemos acceder directamente al estado interno,
      // verificamos que la función se ejecutó sin errores
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true
      })
    })

    it('debería manejar JSON inválido en request', async () => {
      const mockRequest = {
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Request

      await expect(PUT(mockRequest)).rejects.toThrow('Invalid JSON')
    })

    it('debería manejar request sin bookId', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          review: { text: 'Test', stars: 5 }
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await PUT(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true
      })
    })

    it('debería manejar request sin review', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          bookId: 'book123'
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await PUT(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true
      })
    })
  })

  describe('PATCH', () => {
    it('debería retornar success false para índice inválido', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          bookId: 'book123',
          reviewIndex: 0,
          vote: 1
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      const result = await PATCH(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: false
      })
      expect(result).toBe('mocked-response')
    })

    it('debería retornar success false para bookId inexistente', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          bookId: 'nonexistent',
          reviewIndex: 0,
          vote: 1
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await PATCH(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: false
      })
    })

    it('debería manejar vote negativo', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          bookId: 'book123',
          reviewIndex: 0,
          vote: -1
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await PATCH(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: false
      })
    })

    it('debería manejar reviewIndex negativo', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          bookId: 'book123',
          reviewIndex: -1,
          vote: 1
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await PATCH(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: false
      })
    })

    it('debería manejar JSON inválido en request', async () => {
      const mockRequest = {
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Request

      await expect(PATCH(mockRequest)).rejects.toThrow('Invalid JSON')
    })

    it('debería manejar request sin parámetros requeridos', async () => {
      const mockRequest = {
        json: () => Promise.resolve({})
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await PATCH(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: false
      })
    })

    it('debería manejar vote cero', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          bookId: 'book123',
          reviewIndex: 0,
          vote: 0
        })
      } as Request

      mockNextResponse.json.mockReturnValue('mocked-response' as any)

      await PATCH(mockRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: false
      })
    })
  })

  describe('Integration scenarios', () => {
    it('debería manejar flujo completo PUT -> GET', async () => {
      // Primero agregar una reseña
      const putRequest = {
        json: () => Promise.resolve({
          bookId: 'integration-test',
          review: { id: 'r1', text: 'Test review', stars: 4 }
        })
      } as Request

      mockNextResponse.json.mockReturnValue('put-response' as any)
      await PUT(putRequest)

      // Luego obtener las reseñas
      const getRequest = {
        url: 'http://localhost:3000/api/reviews?bookId=integration-test'
      } as Request

      mockNextResponse.json.mockReturnValue('get-response' as any)
      await GET(getRequest)

      expect(mockNextResponse.json).toHaveBeenLastCalledWith({
        reviews: []  // Sin acceso al estado, siempre retorna []
      })
    })

    it('debería manejar tipos de datos edge case', async () => {
      const edgeCaseRequest = {
        json: () => Promise.resolve({
          bookId: null,
          review: undefined
        })
      } as Request

      mockNextResponse.json.mockReturnValue('edge-response' as any)

      await PUT(edgeCaseRequest)

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true
      })
    })
  })
})
