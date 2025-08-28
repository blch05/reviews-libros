import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

// Mock de BookCard
vi.mock('./BookCard', () => ({
  BookCard: ({ book, onSelect }: any) => (
    <div data-testid="book-card" data-book-id={book.id} onClick={() => onSelect(book.id)}>
      {book.volumeInfo.title}
    </div>
  )
}))

import * as serverActions from '../lib/server-actions'

describe('SearchSection', () => {
  const mockBuscarLibros = vi.mocked(serverActions.buscarLibros)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar el formulario de búsqueda', () => {
    render(<SearchSection />)

    expect(screen.getByText('Rate & Mate')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar libro...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
  })

  it('debería actualizar el input cuando se escribe', () => {
    render(<SearchSection />)

    const input = screen.getByPlaceholderText('Buscar libro...')
    fireEvent.change(input, { target: { value: 'Harry Potter' } })

    expect(input).toHaveValue('Harry Potter')
  })

  it('debería mostrar loading mientras busca', async () => {
    mockBuscarLibros.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<SearchSection />)

    const input = screen.getByPlaceholderText('Buscar libro...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)

    expect(screen.getByText('Buscando...')).toBeInTheDocument()
  })

  it('debería mostrar resultados de búsqueda', async () => {
    const mockBooks = [
      { id: '1', volumeInfo: { title: 'Book 1' } },
      { id: '2', volumeInfo: { title: 'Book 2' } }
    ]
    mockBuscarLibros.mockResolvedValue(mockBooks)

    render(<SearchSection />)

    const input = screen.getByPlaceholderText('Buscar libro...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument()
      expect(screen.getByText('Book 2')).toBeInTheDocument()
    })
  })

  it('debería mostrar mensaje de "No hay resultados" cuando no hay libros', async () => {
    mockBuscarLibros.mockResolvedValue([])

    render(<SearchSection />)

    const input = screen.getByPlaceholderText('Buscar libro...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText('No hay resultados.')).toBeInTheDocument()
    })
  })

  it('debería manejar errores en la búsqueda', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockBuscarLibros.mockRejectedValue(new Error('Error de búsqueda'))

    render(<SearchSection />)

    const input = screen.getByPlaceholderText('Buscar libro...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error buscando libros:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})
