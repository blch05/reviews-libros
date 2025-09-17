import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SearchSection } from './SearchSection'

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock de server-actions
vi.mock('../lib/server-actions', () => ({
  buscarLibros: vi.fn()
}))

describe('SearchSection', () => {
  it('should render search form', () => {
    render(<SearchSection />)

    expect(screen.getByText('Rate asd& Mate')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar libro...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
  })
})
