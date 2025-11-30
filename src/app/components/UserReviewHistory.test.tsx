import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserReviewHistory from './UserReviewHistory'
import { useAuthStore } from '../store/useAuthStore'

// Mock del store de autenticaci�n
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn()
}))

// Mock del router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock del fetch global
global.fetch = vi.fn()

describe('UserReviewHistory', () => {
  it('should render user review history', () => {
    const mockUseAuthStore = vi.mocked(useAuthStore)
    mockUseAuthStore.mockReturnValue({
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      setUser: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true
    })

    render(<UserReviewHistory />)
    
    expect(screen.getByText(/Mis Reseñas/)).toBeInTheDocument()
  })
})
