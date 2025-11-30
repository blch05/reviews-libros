import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TruncatedText from './TruncatedText'

describe('TruncatedText', () => {
  it('should render text with correct truncation', () => {
    const shortText = 'This is a short text'
    
    render(<TruncatedText text={shortText} maxLength={50} />)
    
    expect(screen.getByText(shortText)).toBeInTheDocument()
  })
})
