# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings\settings.e2e.ts >> Settings — Locations >> SET-E2E-001: Locations settings page loads
- Location: projects\happyq\tests\settings\settings.e2e.ts:13:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /locations/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /locations/i })

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
  4  | export class SettingsLocationsPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/settings/locations'); }
  8  | 
  9  |   async expectLoaded() {
> 10 |     await expect(this.page.getByRole('heading', { name: /locations/i })).toBeVisible();
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  11 |   }
  12 | 
  13 |   async clickNewLocation() {
  14 |     await this.page.getByRole('button', { name: /new location/i }).click();
  15 |   }
  16 | 
  17 |   async fillLocationForm(data: { name: string; code?: string; phone?: string }) {
  18 |     await this.page.getByLabel(/location name/i).fill(data.name);
  19 |     if (data.code) await this.page.getByLabel(/code/i).fill(data.code);
  20 |     if (data.phone) await this.page.getByLabel(/phone/i).fill(data.phone);
  21 |   }
  22 | 
  23 |   async save() {
  24 |     await this.page.getByRole('button', { name: /save/i }).click();
  25 |     await this.waitForToast();
  26 |   }
  27 | 
  28 |   async searchLocation(query: string) {
  29 |     await this.page.getByPlaceholder(/search/i).fill(query);
  30 |   }
  31 | 
  32 |   async expectLocationInList(name: string) {
  33 |     await expect(this.page.getByText(name)).toBeVisible();
  34 |   }
  35 | }
  36 | 
```