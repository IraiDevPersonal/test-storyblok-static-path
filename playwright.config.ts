import { defineConfig, devices } from '@playwright/test'
import { envsConfig } from './envs.config';

const { port, isPreview } = envsConfig
const baseURL = `${isPreview ? "https" : "http"}://localhost:${port}`;

export default defineConfig({
  testDir: './src',
  // Solo ejecuta tests e2e de Playwright. Esto evita que Playwright intente cargar
  // tests unitarios de Vitest (*.test.ts) y choque con los matchers.
  testMatch: '**/*.spec.ts',
  testIgnore: '**/*.test.ts',
  use: {
    baseURL: baseURL,
  },
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})