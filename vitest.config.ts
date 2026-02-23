import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/e2e/**',          // ← excluye cualquier carpeta e2e
      '**/*.spec.ts',       // ← excluye archivos .spec.ts (convención de Playwright)
    ],
  },
})