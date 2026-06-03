# ADAPT — Claude Code Instructions

These instructions are read automatically by Claude Code every time this repo is opened.
They enforce consistent conventions across all projects in the ADAPT framework.

---

## 1. What Is ADAPT

ADAPT (Automated Data-driven Playwright Testing) is a multi-project E2E test automation
framework by DeepTree. Every application under test lives in `projects/<name>/` and shares
the core infrastructure in `core/`.

---

## 2. Folder Structure — Mandatory Pattern

Every project under `projects/<name>/` MUST follow this exact structure:

```
projects/<name>/
├── playwright.config.ts          ← extends core/playwright.base.config.ts
├── .env.example                  ← documents all required env vars
├── data/
│   └── <ProjectName>_Tests.xlsx  ← Excel workbook (standard schema)
├── pages/
│   ├── BasePage.ts               ← copied from happyq — do not modify per project
│   ├── <module>/
│   │   ├── <ScreenName>Page.ts   ← one file per screen
│   │   └── dialogs/
│   │       └── <DialogName>Dialog.ts  ← one file per modal/dialog
└── tests/
    └── <module>/
        └── <module>.e2e.ts       ← one test file per module
```

---

## 3. Page Object Conventions

### 3.1 Every Page Object MUST:
- Import and extend `BasePage`
- Have a `goto()` method with the correct route
- Have an `expectLoaded()` method that asserts the page heading or a key landmark
- Have `expectAccessDenied()` if the page is role-restricted
- Use `getByRole`, `getByLabel`, `getByPlaceholder` — NEVER hardcode CSS selectors or data-testid unless unavoidable
- Accept typed interfaces for form data (e.g. `PatientFormData`) — no plain `any` objects

### 3.2 Naming
- File name: `<ScreenName>Page.ts` — PascalCase, suffix `Page`
- Class name: matches file name exactly
- Method names: camelCase verbs — `goto()`, `search()`, `clickAdd()`, `expectLoaded()`

### 3.3 Example Structure
```typescript
import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ExamplePage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto('/example'); }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /example/i })).toBeVisible();
  }

  async expectAccessDenied() {
    await expect(this.page.getByText(/not authorized|access denied|permission/i).first()).toBeVisible({ timeout: 8000 });
  }
}
```

---

## 4. Dialog/Modal Conventions

### 4.1 Every Dialog Class MUST:
- Live in `pages/<module>/dialogs/<DialogName>Dialog.ts`
- NOT extend BasePage — take `page: Page` directly in constructor
- Have `expectOpen()` — asserts the dialog is visible
- Have a typed data interface for any form inputs
- Have a primary action method named after the action: `submit()`, `save()`, `confirm()`, `schedule()`
- Have `cancel()` for dismissing without action
- Interact only with elements INSIDE `getByRole('dialog')` scope where possible to avoid selector ambiguity

### 4.2 Naming
- File name: `<DialogName>Dialog.ts` — PascalCase, suffix `Dialog`
- Class name: matches file name exactly
- Method names: camelCase verbs

### 4.3 Example Structure
```typescript
import { Page, expect } from '@playwright/test';

export interface ExampleFormData {
  name: string;
  value?: string;
}

export class ExampleDialog {
  constructor(private page: Page) {}

  async expectOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fill(data: ExampleFormData) {
    await this.page.getByLabel(/name/i).fill(data.name);
    if (data.value) await this.page.getByLabel(/value/i).fill(data.value);
  }

  async submit() {
    await this.page.getByRole('button', { name: /save|submit/i }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }
}
```

---

## 5. Test File Conventions

### 5.1 Every Test File MUST:
- Live at `tests/<module>/<module>.e2e.ts`
- Import page objects and dialog classes — never call `page.goto()` or `page.click()` directly in tests
- Use `test.use({ storageState: ... })` at the top to set the correct role session
- Use auth tests (`tests/auth/`) without storageState — always real login
- Group tests with `test.describe('<Module> — <Screen>', ...)`
- Use test IDs matching Excel `TEST_ID` column: `MODULE-E2E-001` format

### 5.2 Test ID Format
```
<MODULE_PREFIX>-E2E-<3-digit-number>
```
Examples: `AUTH-E2E-001`, `PAT-E2E-003`, `BIL-E2E-007`, `RBA-BIL-001`

### 5.3 Module Prefixes
| Module | Prefix |
|--------|--------|
| Auth | `AUTH` |
| Dashboard | `DASH` |
| Patients | `PAT` |
| Appointments | `APT` |
| Reception | `REC` |
| Consultant | `CON` |
| Display | `DIS` |
| Billing | `BIL` |
| Follow-ups | `FOL` |
| Tasks | `TSK` |
| Documents | `DOC` |
| Settings | `SET` |
| RBA (access denial) | `RBA` |

---

## 6. Excel Workbook Conventions

Every project's Excel file MUST have exactly these 4 sheets with these column names:

### `TEST_CONTROL` columns:
`TEST_ID`, `MODULE`, `SCREEN`, `LAYER`, `PRIORITY`, `RUN`, `NOTES`

### `E2E_TESTS` columns:
`TEST_ID`, `MODULE`, `SCREEN`, `TEST_NAME`, `DESCRIPTION`, `USER_ROLE`, `PRECONDITIONS`, `TEST_DATA`, `EXPECTED_RESULT`

### `TEST_USERS` columns:
`ROLE`, `EMAIL_ENV_KEY`, `PASSWORD_ENV_KEY`

### `RESULTS` columns (auto-written, do not pre-fill):
`TEST_ID`, `TEST_NAME`, `MODULE`, `SCREEN`, `USER_ROLE`, `STATUS`, `ACTUAL_RESULT`, `ERROR_MESSAGE`, `SCREENSHOT_PATH`, `RUN_DURATION_MS`, `RUN_AT`, `RUN_BY`, `ENV`

---

## 7. Credentials & Security Conventions

- NEVER store plaintext passwords in Excel or committed files
- Excel `TEST_USERS` stores env var KEY NAMES only (e.g. `TEST_USER_ADMIN_EMAIL`)
- Actual values live in `.env` (local, gitignored) or GitHub Secrets (CI)
- `.env.example` MUST document every required env var with a placeholder value

---

## 8. Playwright Config Conventions

Every `projects/<name>/playwright.config.ts` MUST:
- Load `.env` via `dotenv.config()` at the top
- Use `process.env.BASE_URL` with a sensible local default
- Set `browserName: 'chromium'`
- Set `retries: 0`
- Set `screenshot: 'only-on-failure'`
- Define a `setup` project that runs `auth.setup.ts` before the main tests

---

## 9. Adding a New Project — Checklist

When asked to add a new project to ADAPT, always follow this order:

1. Create `projects/<name>/` folder structure
2. Copy and adapt `playwright.config.ts` from `happyq`
3. Create `.env.example` with all required vars
4. Audit the app's screens → create all `pages/<module>/<Screen>Page.ts`
5. Audit all modals/dialogs → create `pages/<module>/dialogs/<Dialog>Dialog.ts`
6. Write `tests/<module>/<module>.e2e.ts` using the page objects
7. Create `data/<ProjectName>_Tests.xlsx` with correct sheet schema
8. Add GitHub Actions workflow referencing the new project

---

## 10. Compliance Report — Required After Every Creation Task

After completing ANY of the following tasks:
- Creating a new project
- Adding page objects for a module
- Adding dialog classes
- Writing test files

You MUST produce a **Conventions Compliance Report** using this exact table format:

```
## Conventions Compliance Report

### ✅ Followed
| Convention | Files |
|-----------|-------|
| Extends BasePage | PatientListPage.ts, BillingPage.ts |
| ... | ... |

### ❌ Missed / Violations
| Convention | File | What's Missing | Fix Required |
|-----------|------|---------------|-------------|
| Missing expectAccessDenied() | TasksPage.ts | Not a role-restricted page — N/A | No |
| ... | ... | ... | ... |

### ⚠️ Assumptions Made
| Assumption | File | Impact |
|-----------|------|--------|
| Used getByText() instead of getByRole() for toast | BillingPage.ts | May need refinement after real app testing |
| ... | ... | ... |

### Summary
| Metric | Count |
|--------|-------|
| Files created | X |
| Conventions followed | X / Y |
| Violations requiring fix | X |
| Assumptions to verify | X |
```

This report MUST appear at the end of your response whenever code is created or modified in `projects/`.
