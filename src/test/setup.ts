import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Storage para simular localStorage
const storage: Record<string, string> = {}

// Mock localStorage con implementación completa
const localStorageMock = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => {
    storage[key] = value
  },
  removeItem: (key: string) => {
    delete storage[key]
  },
  clear: () => {
    Object.keys(storage).forEach(key => delete storage[key])
  },
  length: 0,
  key: vi.fn(),
}

// Definir localStorage en window
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock fetch globally
global.fetch = vi.fn()

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

// Reset storage y mocks antes de cada test
beforeEach(() => {
  vi.clearAllMocks()
  Object.keys(storage).forEach(key => delete storage[key])
})
