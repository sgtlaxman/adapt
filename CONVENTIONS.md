# ADAPT — Conventions Guide

A human-readable reference for structuring any project in the ADAPT framework.
For AI-enforced rules, see `CLAUDE.md`.

---

## Folder Structure at a Glance

```
projects/<name>/
├── playwright.config.ts
├── .env.example
├── data/
│   └── <ProjectName>_Tests.xlsx
├── pages/
│   ├── BasePage.ts
│   └── <module>/
│       ├── <Screen>Page.ts
│       └── dialogs/
│           └── <Dialog>Dialog.ts
└── tests/
    └── <module>/
        └── <module>.e2e.ts
```

---

## Page Objects

| Rule | Example |
|------|---------|
| Extend `BasePage` | `class PatientListPage extends BasePage` |
| Always have `goto()` | `async goto() { await this.page.goto('/patients'); }` |
| Always have `expectLoaded()` | Asserts heading or key landmark |
| Have `expectAccessDenied()` if role-restricted | Asserts error/redirect |
| Use semantic selectors | `getByRole`, `getByLabel`, `getByPlaceholder` |
| Typed form data interfaces | `PatientFormData`, `BillingData` — no raw `any` |
| File/class naming | `PatientListPage.ts` → `class PatientListPage` |

---

## Dialog Classes

| Rule | Example |
|------|---------|
| Do NOT extend `BasePage` | `constructor(private page: Page) {}` |
| Live in `pages/<module>/dialogs/` | `patients/dialogs/PatientDialog.ts` |
| Always have `expectOpen()` | `expect(dialog).toBeVisible()` |
| Typed data interfaces | `PatientFormData` passed to `fill()` |
| Named action method | `submit()`, `save()`, `confirm()`, `schedule()` |
| Always have `cancel()` | Dismisses without action |
| Scope to dialog element | `this.page.getByRole('dialog').getByLabel(...)` |

---

## Test Files

| Rule | Example |
|------|---------|
| One file per module | `billing/billing.e2e.ts` |
| Set storageState at top | `test.use({ storageState: '.auth/billing.json' })` |
| Auth tests: no storageState | Real login every time |
| Use page objects — no raw Playwright calls | `billingPage.goto()` not `page.goto('/billing')` |
| Test IDs match Excel | `BIL-E2E-001` in both code and Excel |
| Group with `test.describe` | `test.describe('Billing — Dashboard', ...)` |

---

## Test ID Format

```
<MODULE_PREFIX>-E2E-<3-digit-number>
```

| Module | Prefix | Example |
|--------|--------|---------|
| Auth | `AUTH` | `AUTH-E2E-001` |
| Dashboard | `DASH` | `DASH-E2E-001` |
| Patients | `PAT` | `PAT-E2E-003` |
| Appointments | `APT` | `APT-E2E-002` |
| Reception | `REC` | `REC-E2E-001` |
| Consultant | `CON` | `CON-E2E-001` |
| Display | `DIS` | `DIS-E2E-001` |
| Billing | `BIL` | `BIL-E2E-007` |
| Follow-ups | `FOL` | `FOL-E2E-002` |
| Tasks | `TSK` | `TSK-E2E-001` |
| Documents | `DOC` | `DOC-E2E-003` |
| Settings | `SET` | `SET-E2E-001` |
| RBA checks | `RBA` | `RBA-BIL-001` |

---

## Excel Workbook

### Sheet Names (exact, case-sensitive)
- `TEST_CONTROL`
- `E2E_TESTS`
- `TEST_USERS`
- `RESULTS`

### Key Rules
- `RUN` column is `YES` or `NO` — controls whether a test executes
- `TEST_DATA` column is a JSON string: `{"firstName": "John", "phone": "9999999999"}`
- `USER_ROLE` must match a `ROLE` value in `TEST_USERS`
- `TEST_ID` in Excel must match the test ID string in the test file exactly
- Never pre-fill the `RESULTS` sheet — the runner writes to it

---

## Credentials

| Where | What Goes There |
|-------|----------------|
| `TEST_USERS` Excel sheet | Env var key names only (e.g. `TEST_USER_ADMIN_EMAIL`) |
| `.env` (local, gitignored) | Actual email and password values |
| GitHub Secrets | Actual values for CI runs |
| `.env.example` (committed) | Placeholder values showing the required keys |

---

## Adding a New Project — Step by Step

| Step | Action |
|------|--------|
| 1 | `mkdir projects/<name>` with subfolders: `pages/`, `tests/`, `data/` |
| 2 | Copy `playwright.config.ts` from `happyq`, update `BASE_URL` default and project name |
| 3 | Copy `.env.example` from `happyq`, update role key names for the new app |
| 4 | Audit all app screens → create page objects in `pages/<module>/` |
| 5 | Audit all modals → create dialog classes in `pages/<module>/dialogs/` |
| 6 | Write tests in `tests/<module>/` using page objects |
| 7 | Create Excel workbook in `data/` using the standard 4-sheet schema |
| 8 | Add GitHub Actions workflow for the new project |

---

## Compliance Report

After creating or modifying any files in `projects/`, always produce a compliance report.
See `CLAUDE.md` Section 10 for the required table format.

The report covers:
- **Followed** — conventions correctly applied
- **Missed / Violations** — rules broken, with fix required flag
- **Assumptions** — selector choices or patterns that need verification against the real app

---

*ADAPT — Built by DeepTree*
