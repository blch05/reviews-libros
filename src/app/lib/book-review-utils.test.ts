import { describe, it, expect, vi } from 'vitest'
import { BookReviewUtils } from './book-review-utils'

// Mock del fetch global
global.fetch = vi.fn()

describe('BookReviewUtils', () => {
  it('should format book cover URL correctly', () => {
    const mockBook = {
      volumeInfo: {
        imageLinks: {
          thumbnail: 'http://example.com/image.jpg'
        }
      }
    }
    
    const result = BookReviewUtils.getBookCoverUrl(mockBook)
    
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
