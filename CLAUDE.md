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

### 5.4 HappyQ Role Names & storageState Files

| Role | storageState File | Access Scope |
|------|------------------|-------------|
| `STANDARD` | `.auth/standard.json` | General access |
| `RECEPTIONIST` | `.auth/receptionist.json` | Reception, appointments, patients |
| `DOCTOR` | `.auth/doctor.json` | Consultant room, patient history |
| `ACCOUNTANT` | `.auth/accountant.json` | Billing module only |

These role names are specific to HappyQ. Other projects define their own roles in `TEST_USERS` Excel sheet and `.env.example`. The storageState filename is always the role name lowercased.

---

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

## 9. Test Data Tagging Convention

Every record created by a test MUST be tagged with the current Run ID so cleanup can find it.

### How to Tag
```typescript
import { getRunId, tagWithRunId } from '../../../../core/lib/run-id';

const runId = getRunId(__dirname);  // reads .current-run-id
const name = tagWithRunId('John Doe', runId);  // → 'John Doe [ADAPT-20260603-1430]'
```

### What Gets Tagged
| Data Type | Field Tagged | Example Value |
|-----------|-------------|---------------|
| Patient | `name` | `John Doe [ADAPT-20260603-1430]` |
| Task | `title` | `Test Task [ADAPT-20260603-1430]` |
| Document | `title` | `Test Document [ADAPT-20260603-1430]` |
| Appointment | via patient cascade | — |
| Bill / Invoice | via patient cascade | — |

### Cleanup
- Run with `CLEANUP=true` to delete all `ADAPT-*` tagged records before the suite starts
- Cleanup uses the Supabase service role key — ONLY point at test/staging, never production
- Cleanup runs in `global-setup.ts` before auth setup and before any tests

---

## 10. Scenario A — Adding a New Project to ADAPT

**Trigger phrases:** "add a new project", "onboard a new app", "set up testing for <app>"

Follow this exact sequence every time:

| Step | Action | File / Location |
|------|--------|----------------|
| 1 | Create folder structure | `projects/<name>/pages/`, `tests/`, `data/`, `.auth/`, `screenshots/` |
| 2 | Copy `playwright.config.ts` from `happyq`, update `BASE_URL` default and project name | `projects/<name>/playwright.config.ts` |
| 3 | Copy `global-setup.ts` from `happyq`, update import paths | `projects/<name>/global-setup.ts` |
| 4 | Create `.env.example` — document `BASE_URL`, `SLACK_WEBHOOK_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLEANUP`, `ENV`, and one `EMAIL_ENV_KEY` + `PASSWORD_ENV_KEY` per role | `projects/<name>/.env.example` |
| 5 | Copy `pages/BasePage.ts` from `happyq` | `projects/<name>/pages/BasePage.ts` |
| 6 | Audit every screen in the app — route, heading, buttons, forms, dialogs | App source code |
| 7 | Create all page objects | `projects/<name>/pages/<module>/<Screen>Page.ts` |
| 8 | Create all dialog classes | `projects/<name>/pages/<module>/dialogs/<Dialog>Dialog.ts` |
| 9 | Write all test files | `projects/<name>/tests/<module>/<module>.e2e.ts` |
| 10 | Create test data definition file | `scripts/testdata/<name>.mjs` |
| 11 | Run testbook generator | `npm run update:testbook -- --project <name>` |
| 12 | Add GitHub Actions workflows | `.github/workflows/e2e-on-push.yml`, `e2e-nightly.yml` |
| 13 | Add npm test script to `package.json` | `"test:<name>": "playwright test --config=projects/<name>/playwright.config.ts"` |

**Commands to run:**
```bash
npm run update:testbook -- --project <name>   # generates Excel testbook
npm run install:browsers                       # installs Chromium if not already done
```

---

## 11. Scenario B — Adding a New Module to an Existing Project

**Trigger phrases:** "add a new module", "there is a new screen", "we built a new feature", "add tests for <module>"

Follow this exact sequence every time:

| Step | Action | File / Location |
|------|--------|----------------|
| 1 | Audit the new screen in the app — route, heading, buttons, inputs, dialogs | App source code |
| 2 | Create page object | `projects/<name>/pages/<module>/<Screen>Page.ts` |
| 3 | Create dialog classes for every modal on that screen | `projects/<name>/pages/<module>/dialogs/<Dialog>Dialog.ts` |
| 4 | Write test file with journeys and RBA checks if role-restricted | `projects/<name>/tests/<module>/<module>.e2e.ts` |
| 5 | Add new rows to the test data definition file — both `testControl` and `e2eTests` arrays | `scripts/testdata/<name>.mjs` |
| 6 | Run testbook updater | `npm run update:testbook -- --project <name>` |
| 7 | Verify Excel — confirm new rows added, existing `TEST_DATA` / `RUN` / `NOTES` untouched | Excel workbook |

**Command to run:**
```bash
npm run update:testbook -- --project <name>
```

**Never delete and recreate the Excel — always use `update:testbook`.**
The merge engine preserves all user edits and flags removed tests as `[OBSOLETE]`.

---

## 12. update-testbook.mjs — Merge Rules

The `update-testbook.mjs` script is the ONLY way to update an Excel testbook.

| Scenario | Behaviour |
|----------|-----------|
| TEST_ID in script only (new) | Row added to Excel |
| TEST_ID in both script and Excel | Structural columns updated from script; `TEST_DATA`, `RUN`, `NOTES` preserved from Excel |
| TEST_ID in Excel only (removed from script) | Row kept, `NOTES` flagged `[OBSOLETE]` — never silently deleted |
| `TEST_USERS` sheet | Always replaced — no user edits expected here |
| `RESULTS` sheet | Never touched — test runner owns this |

### User-Owned Columns (never overwritten)
| Column | Purpose |
|--------|---------|
| `TEST_DATA` | User fills with meaningful real-looking test values |
| `RUN` | User sets `YES`/`NO` to control which tests execute |
| `NOTES` | User adds context, skip reasons, or observations |

### Script-Owned Columns (always updated from script)
`TEST_ID`, `MODULE`, `SCREEN`, `LAYER`, `PRIORITY`, `TEST_NAME`, `DESCRIPTION`, `PRECONDITIONS`, `EXPECTED_RESULT`, `USER_ROLE`

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
