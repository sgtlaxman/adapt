import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// ENV_FILE defaults to .env.local — override to target other environments later
// e.g. ENV_FILE=.env.dev npm run test:happyq
const envFile = process.env.ENV_FILE ?? '.env.local';
dotenv.config({ path: path.resolve(__dirname, envFile) });

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  use: {
    baseURL: BASE_URL,
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
  },
  timeout: 60000,
  retries: 0,
  reporter: [
    ['html',  { outputFolder: 'playwright-report', open: 'never' }],
    ['json',  { outputFile:   'test-results.json' }],
    ['list'],
  ],
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
      use: { baseURL: BASE_URL },
    },
    {
      name: 'happyq',
      testMatch: '**/*.e2e.ts',
      use: { baseURL: BASE_URL },
      dependencies: ['setup'],
    },
  ],
});
