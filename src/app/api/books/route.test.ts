import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextResponse } from 'next/server'

// Mock fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn()
  }
}))

const mockNextResponse = vi.mocked(NextResponse)

describe('API /books route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    mockNextResponse.json.mockClear()
  })

  it('debería procesar solicitud POST con query válido', async () => {
    const mockApiResponse = {
      items: [
        { id: 'book1', volumeInfo: { title: 'Test Book 1' } },
        { id: 'book2', volumeInfo: { title: 'Test Book 2' } }
      ]
    }

    const mockRequest = {
      json: () => Promise.resolve({ query: 'javascript programming' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    const result = await POST(mockRequest)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/books/v1/volumes?q=javascript%20programming'
    )
    expect(mockNextResponse.json).toHaveBeenCalledWith({
      items: mockApiResponse.items
    })
    expect(result).toBe('mocked-response')
  })

  it('debería manejar respuesta sin items de la API', async () => {
    const mockApiResponse = {}

    const mockRequest = {
      json: () => Promise.resolve({ query: 'nonexistent book' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    await POST(mockRequest)

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      items: []
    })
  })

  it('debería codificar correctamente caracteres especiales en query', async () => {
    const mockRequest = {
      json: () => Promise.resolve({ query: 'libro en español & símbolos #especiales' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ items: [] })
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    await POST(mockRequest)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('libro%20en%20espa%C3%B1ol%20%26%20s%C3%ADmbolos%20%23especiales')
    )
  })

  it('debería manejar query vacío', async () => {
    const mockRequest = {
      json: () => Promise.resolve({ query: '' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ items: [] })
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    await POST(mockRequest)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/books/v1/volumes?q='
    )
    expect(mockNextResponse.json).toHaveBeenCalledWith({
      items: []
    })
  })

  it('debería manejar items null en respuesta de API', async () => {
    const mockApiResponse = { items: null }

    const mockRequest = {
      json: () => Promise.resolve({ query: 'test' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    await POST(mockRequest)

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      items: []
    })
  })

  it('debería propagar errores de la API de Google Books', async () => {
    const mockRequest = {
      json: () => Promise.resolve({ query: 'test' })
    } as Request

    mockFetch.mockRejectedValueOnce(new Error('Google Books API error'))

    await expect(POST(mockRequest)).rejects.toThrow('Google Books API error')
  })

  it('debería manejar JSON inválido en request', async () => {
    const mockRequest = {
      json: () => Promise.reject(new Error('Invalid JSON'))
    } as Request

    await expect(POST(mockRequest)).rejects.toThrow('Invalid JSON')
  })

  it('debería manejar respuesta JSON inválida de la API', async () => {
    const mockRequest = {
      json: () => Promise.resolve({ query: 'test' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.reject(new Error('Invalid JSON from API'))
    })

    await expect(POST(mockRequest)).rejects.toThrow('Invalid JSON from API')
  })

  it('debería manejar request sin query', async () => {
    const mockRequest = {
      json: () => Promise.resolve({})
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ items: [] })
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    await POST(mockRequest)

    // Sin query, debería usar undefined que se codifica como 'undefined'
    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/books/v1/volumes?q=undefined'
    )
  })

  it('debería usar la URL correcta de Google Books API', async () => {
    const mockRequest = {
      json: () => Promise.resolve({ query: 'test query' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ items: [] })
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    await POST(mockRequest)

    const expectedUrl = 'https://www.googleapis.com/books/v1/volumes?q=test%20query'
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('debería retornar exactamente la estructura esperada', async () => {
    const mockItems = [
      { id: 'book1', volumeInfo: { title: 'Book 1' } }
    ]

    const mockRequest = {
      json: () => Promise.resolve({ query: 'test' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ items: mockItems, totalItems: 1 })
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    await POST(mockRequest)

    // Debería extraer solo los items, no otros campos como totalItems
    expect(mockNextResponse.json).toHaveBeenCalledWith({
      items: mockItems
    })
  })

  it('debería manejar query con solo espacios', async () => {
    const mockRequest = {
      json: () => Promise.resolve({ query: '   ' })
    } as Request

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ items: [] })
    })

    mockNextResponse.json.mockReturnValue('mocked-response' as any)

    await POST(mockRequest)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/books/v1/volumes?q=%20%20%20'
    )
  })
})
