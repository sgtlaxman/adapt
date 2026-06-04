# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks\tasks.e2e.ts >> Tasks — Dashboard >> TSK-E2E-001: Tasks dashboard loads
- Location: projects\happyq\tests\tasks\tasks.e2e.ts:8:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /tasks/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /tasks/i })

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
  4  | export class TasksPage extends BasePage {
  5  |   constructor(page: Page) {
  6  |     super(page);
  7  |   }
  8  | 
  9  |   async goto() {
  10 |     await this.page.goto('/tasks');
  11 |   }
  12 | 
  13 |   async expectLoaded() {
> 14 |     await expect(this.page.getByRole('heading', { name: /tasks/i })).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  15 |   }
  16 | }
  17 | 
```