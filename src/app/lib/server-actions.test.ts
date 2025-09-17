import { describe, it, expect, vi } from 'vitest'
import { buscarLibros } from './server-actions'

// Mock fetch global
global.fetch = vi.fn()

describe('server-actions', () => {
  it('should search for books and return results', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ items: [] })
    } as Response)

    const result = await buscarLibros('test query')
    
    expect(Array.isArray(result)).toBe(true)
  })
})
