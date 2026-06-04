# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings\settings.e2e.ts >> Settings — Permissions >> SET-E2E-004: Permissions page loads with matrix
- Location: projects\happyq\tests\settings\settings.e2e.ts:38:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /permissions/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /permissions/i })

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
  4  | export class SettingsPermissionsPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/settings/permissions'); }
  8  | 
  9  |   async expectLoaded() {
> 10 |     await expect(this.page.getByRole('heading', { name: /permissions/i })).toBeVisible();
     |                                                                            ^ Error: expect(locator).toBeVisible() failed
  11 |   }
  12 | 
  13 |   async expectPermissionsMatrixVisible() {
  14 |     await expect(this.page.locator('table').first()).toBeVisible({ timeout: 10000 });
  15 |   }
  16 | 
  17 |   async save() {
  18 |     await this.page.getByRole('button', { name: /save/i }).click();
  19 |     await this.waitForToast();
  20 |   }
  21 | }
  22 | 
```