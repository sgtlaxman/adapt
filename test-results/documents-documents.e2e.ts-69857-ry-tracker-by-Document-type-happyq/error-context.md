# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: documents\documents.e2e.ts >> Documents — Expiry Tracker >> DOC-E2E-003: Filter expiry tracker by Document type
- Location: projects\happyq\tests\documents\documents.e2e.ts:24:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /expiry tracker/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /expiry tracker/i })

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
  4  | export class ExpiryTrackerPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/documents/expiry'); }
  8  | 
  9  |   async expectLoaded() {
> 10 |     await expect(this.page.getByRole('heading', { name: /expiry tracker/i })).toBeVisible();
     |                                                                               ^ Error: expect(locator).toBeVisible() failed
  11 |   }
  12 | 
  13 |   async filterByType(type: 'All' | 'Document' | 'Equipment') {
  14 |     await this.page.getByRole('button', { name: type }).click();
  15 |   }
  16 | 
  17 |   async search(query: string) {
  18 |     await this.page.getByPlaceholder(/search/i).fill(query);
  19 |   }
  20 | 
  21 |   async expectExpiredSection() {
  22 |     await expect(this.page.getByText(/expired/i).first()).toBeVisible();
  23 |   }
  24 | }
  25 | 
```