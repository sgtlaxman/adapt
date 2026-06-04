# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings\settings.e2e.ts >> Settings — Users >> SET-E2E-003: New User dialog opens
- Location: projects\happyq\tests\settings\settings.e2e.ts:27:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /users/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /users/i })

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
  4  | export class SettingsUsersPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/settings/users'); }
  8  | 
  9  |   async expectLoaded() {
> 10 |     await expect(this.page.getByRole('heading', { name: /users/i })).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  11 |   }
  12 | 
  13 |   async clickNewUser() {
  14 |     await this.page.getByRole('button', { name: /new user/i }).click();
  15 |   }
  16 | 
  17 |   async fillUserForm(data: { name: string; email: string; role: string }) {
  18 |     await this.page.getByLabel(/name/i).fill(data.name);
  19 |     await this.page.getByLabel(/email/i).fill(data.email);
  20 |     await this.page.getByRole('combobox', { name: /role/i }).click();
  21 |     await this.page.getByText(data.role).click();
  22 |   }
  23 | 
  24 |   async save() {
  25 |     await this.page.getByRole('button', { name: /save/i }).click();
  26 |     await this.waitForToast();
  27 |   }
  28 | 
  29 |   async expectUserInList(name: string) {
  30 |     await expect(this.page.getByText(name)).toBeVisible();
  31 |   }
  32 | 
  33 |   async expectAccessDenied() {
  34 |     await expect(this.page.getByText(/not authorized|access denied|permission/i).first()).toBeVisible({ timeout: 8000 });
  35 |   }
  36 | }
  37 | 
```