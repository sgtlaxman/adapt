# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: followups\followups.e2e.ts >> Follow-Ups — Dashboard >> FOL-E2E-002: Stat cards are visible
- Location: projects\happyq\tests\followups\followups.e2e.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /follow.up/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /follow.up/i })

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
  4  | export class FollowUpsPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/follow-ups'); }
  8  | 
  9  |   async expectLoaded() {
> 10 |     await expect(this.page.getByRole('heading', { name: /follow.up/i })).toBeVisible();
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  11 |   }
  12 | 
  13 |   async expectStatCard(title: string) {
  14 |     await expect(this.page.getByText(title)).toBeVisible();
  15 |   }
  16 | 
  17 |   async filterByTab(tab: 'All' | 'Scheduled' | 'Rescheduled' | 'Completed') {
  18 |     await this.page.getByRole('tab', { name: tab }).click();
  19 |   }
  20 | 
  21 |   async expectTableVisible() {
  22 |     await expect(this.page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
  23 |   }
  24 | }
  25 | 
```