import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Configurações globais para testes
global.console = {
  ...console,
  error: () => {},
  warn: () => {}
}

// Limpar mocks após cada teste
afterEach(() => {
  cleanup();
})
