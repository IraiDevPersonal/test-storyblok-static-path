import { defineConfig, devices } from '@playwright/test'
import { envsConfig } from './envs.config';

const { port, isPreview } = envsConfig
const baseURL = `${isPreview ? "https" : "http"}://localhost:${port}`;

export default defineConfig({
  testDir: './src/test/e2e',
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