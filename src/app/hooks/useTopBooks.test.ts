import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTopBooks } from './useTopBooks'
import * as clientUtils from '../lib/client-utils'

// Mock de las dependencias
vi.mock('../lib/client-utils')
vi.mock('../lib/server-actions')

describe('useTopBooks', () => {
  it('should return empty array when no books with reviews', () => {
    const mockClientUtils = vi.mocked(clientUtils)
    mockClientUtils.getTopReviewedBooks.mockResolvedValue([])
    
    const { result } = renderHook(() => useTopBooks())
    
    expect(result.current.topBooks).toEqual([])
    expect(result.current.loading).toBe(true)
  })
})
