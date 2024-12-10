import '@testing-library/jest-dom'

// Configurações globais para testes
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
}

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks()
})
