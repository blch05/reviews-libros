import { describe, it, expect } from 'vitest'
import { getTopReviewedBooks } from './client-utils'

describe('client-utils', () => {
  it('should return array of top reviewed books', async () => {
    const topBooks = await getTopReviewedBooks()
    
    expect(Array.isArray(topBooks)).toBe(true)
  })
})
