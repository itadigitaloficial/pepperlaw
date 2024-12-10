import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByTestId('app-container')).toBeInTheDocument()
  })

  it('has a title', () => {
    render(<App />)
    const titleElement = screen.getByText(/Legal Contract System/i)
    expect(titleElement).toBeInTheDocument()
  })
})
