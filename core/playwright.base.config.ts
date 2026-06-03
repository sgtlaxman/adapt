import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

export function createBaseConfig(overrides: Partial<PlaywrightTestConfig> = {}): PlaywrightTestConfig {
  return defineConfig({
    use: {
      browserName: 'chromium',
      headless: true,
      screenshot: 'only-on-failure',
      video: 'off',
      trace: 'off',
    },
    retries: 0,
    reporter: [
      ['html', { outputFolder: 'playwright-report', open: 'never' }],
      ['list'],
    ],
    ...overrides,
  });
}
