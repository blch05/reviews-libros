import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileInfo from './ProfileInfo'
import { useAuthStore } from '../store/useAuthStore'

// Mock del store de autenticación
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn()
}))

// Mock del fetch global
global.fetch = vi.fn()

describe('ProfileInfo', () => {
  it('should render user profile information', () => {
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com'
    }

    const mockUseAuthStore = vi.mocked(useAuthStore)
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      setUser: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true
    })

    render(<ProfileInfo user={mockUser} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
})
