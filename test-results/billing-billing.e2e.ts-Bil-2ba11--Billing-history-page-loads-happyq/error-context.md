# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billing\billing.e2e.ts >> Billing — Dashboard >> BIL-E2E-002: Billing history page loads
- Location: projects\happyq\tests\billing\billing.e2e.ts:18:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /billing/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /billing/i })

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
  4  | export class BillingPage extends BasePage {
  5  |   constructor(page: Page) {
  6  |     super(page);
  7  |   }
  8  | 
  9  |   async goto() {
  10 |     await this.page.goto('/billing');
  11 |   }
  12 | 
  13 |   async expectLoaded() {
> 14 |     await expect(this.page.getByRole('heading', { name: /billing/i })).toBeVisible();
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  15 |   }
  16 | 
  17 |   async gotoHistory() {
  18 |     await this.page.goto('/billing/history');
  19 |   }
  20 | 
  21 |   async gotoOutstanding() {
  22 |     await this.page.goto('/billing/outstanding');
  23 |   }
  24 | 
  25 |   async expectAccessDenied() {
  26 |     await expect(
  27 |       this.page.getByText(/not authorized|access denied|permission/i).first()
  28 |     ).toBeVisible({ timeout: 8000 });
  29 |   }
  30 | }
  31 | 
```