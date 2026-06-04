# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings\settings.e2e.ts >> Settings — Services >> SET-E2E-005: Services settings page loads
- Location: projects\happyq\tests\settings\settings.e2e.ts:47:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /services/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /services/i })

```

```yaml
- img
- strong: LOCAL ENVIRONMENT
- text: "- Data entered here may be cleared periodically and should not contain real PHI."
- alert:
  - text: You don't have permission to access this page. Please contact your administrator if you believe this is an error.
  - button "Back to login"
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { BasePage } from '../BasePage';
  3  | 
  4  | export class SettingsServicesPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/settings/services'); }
  8  | 
  9  |   async expectLoaded() {
> 10 |     await expect(this.page.getByRole('heading', { name: /services/i })).toBeVisible();
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
  11 |   }
  12 | 
  13 |   async clickNewService() {
  14 |     await this.page.getByRole('button', { name: /new service/i }).click();
  15 |   }
  16 | 
  17 |   async fillServiceForm(data: { name: string; price?: string }) {
  18 |     await this.page.getByLabel(/service name|name/i).fill(data.name);
  19 |     if (data.price) await this.page.getByLabel(/price/i).fill(data.price);
  20 |   }
  21 | 
  22 |   async save() {
  23 |     await this.page.getByRole('button', { name: /save/i }).click();
  24 |     await this.waitForToast();
  25 |   }
  26 | }
  27 | 
```