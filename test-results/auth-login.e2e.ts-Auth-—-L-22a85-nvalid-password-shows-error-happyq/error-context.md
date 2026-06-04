# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\login.e2e.ts >> Auth — Login >> AUTH-E2E-002: Invalid password shows error
- Location: projects\happyq\tests\auth\login.e2e.ts:20:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[role="alert"], .text-destructive').first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('[role="alert"], .text-destructive').first()

```

```yaml
- img
- strong: LOCAL ENVIRONMENT
- text: "- Data entered here may be cleared periodically and should not contain real PHI."
- link "HappyQ":
  - /url: /
- heading "Streamline your clinic management" [level=1]
- paragraph: Efficiently manage appointments, patient queues, and billing with our all-in-one clinic management solution.
- tablist:
  - tab "Phone"
  - tab "Email" [selected]
  - tab "Register"
- tabpanel "Email":
  - heading "Welcome back" [level=1]
  - paragraph: Enter your credentials to sign in
  - text: Email
  - img
  - textbox "example@email.com": pons@fetalclinic.in
  - text: Password
  - img
  - textbox "••••••••": wrong-password
  - button "Sign In"
- paragraph: © 2026 HappyQ. All rights reserved.
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { BasePage } from '../BasePage';
  3  | 
  4  | export class LoginPage extends BasePage {
  5  |   constructor(page: Page) {
  6  |     super(page);
  7  |   }
  8  | 
  9  |   async goto() {
  10 |     await this.page.goto('/auth');
  11 |   }
  12 | 
  13 |   async login(email: string, password: string) {
  14 |     // Login page defaults to Phone tab — click Email tab first
  15 |     await this.page.getByRole('tab', { name: /email/i }).click();
  16 |     // Fill email — getByPlaceholder works (getByLabel conflicts with tab panel aria-label)
  17 |     await this.page.getByPlaceholder('example@email.com').fill(email);
  18 |     // Tab to password field and type — most reliable for shadcn/react-hook-form
  19 |     await this.page.keyboard.press('Tab');
  20 |     await this.page.keyboard.type(password);
  21 |     await this.page.getByRole('button', { name: /sign in|log in/i }).click();
  22 |   }
  23 | 
  24 |   async expectRedirectAfterLogin() {
  25 |     await this.page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });
  26 |   }
  27 | 
  28 |   async expectErrorMessage() {
  29 |     const error = this.page.locator('[role="alert"], .text-destructive').first();
> 30 |     await expect(error).toBeVisible({ timeout: 8000 });
     |                         ^ Error: expect(locator).toBeVisible() failed
  31 |   }
  32 | 
  33 |   async expectLoginPageVisible() {
  34 |     // Check the Email tab is present — page defaults to Phone tab on load
  35 |     await expect(this.page.getByRole('tab', { name: /email/i })).toBeVisible();
  36 |   }
  37 | }
  38 | 
```