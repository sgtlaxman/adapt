# ADAPT — Automated Data-driven Playwright Testing

> A plug-and-play, Excel-controlled, multi-project E2E test automation framework by DeepTree.

---

## What Is ADAPT?

ADAPT is a scalable test automation platform designed to test any number of web applications from a single framework repository. It is:

- **Data-driven** — all test cases, run control, users, and test data live in Excel
- **Plug-and-play** — adding a new project requires only a new folder, a config file, and an Excel workbook
- **Role-aware** — supports multiple user roles (RBA testing) with session-per-role auth
- **Screenshot-on-failure** — automatically captures screenshots when tests fail
- **CI-ready** — GitHub Actions workflows for PR checks and nightly scheduled runs

---

## Framework Name

| Component | Meaning |
|-----------|---------|
| **A** | Automated |
| **D** | Data-driven |
| **A** | And |
| **P** | Playwright |
| **T** | Testing |
| Creator | DeepTree |

---

## Repository Structure

```
adapt/                                   ← Root framework repo
│
├── core/                                ← Shared, project-agnostic layer
│   ├── lib/
│   │   ├── spreadsheet-reader.ts        ← Reads test cases from Excel
│   │   ├── results-writer.ts            ← Appends results + history to Excel
│   │   └── slack-reporter.ts            ← Posts run summary to Slack
│   ├── fixtures/
│   │   └── auth.setup.ts                ← Generic login fixture (role-aware)
│   └── playwright.base.config.ts        ← Base Playwright config (extended per project)
│
├── projects/
│   ├── happyq/                          ← HappyQ project
│   │   ├── playwright.config.ts         ← Extends base config
│   │   ├── .env.example
│   │   ├── data/
│   │   │   └── HappyQ_Tests.xlsx
│   │   ├── pages/                       ← HappyQ Page Object Model
│   │   │   ├── auth/LoginPage.ts
│   │   │   ├── patients/PatientListPage.ts
│   │   │   ├── patients/PatientFormPage.ts
│   │   │   ├── appointments/AppointmentsPage.ts
│   │   │   ├── reception/ReceptionPage.ts
│   │   │   ├── billing/BillingPage.ts
│   │   │   ├── tasks/TasksPage.ts
│   │   │   ├── documents/DocumentsPage.ts
│   │   │   └── settings/UsersPage.ts
│   │   └── tests/                       ← HappyQ E2E tests
│   │       ├── auth/login.e2e.ts
│   │       ├── patients/patients.e2e.ts
│   │       ├── appointments/appointments.e2e.ts
│   │       ├── reception/reception.e2e.ts
│   │       ├── billing/billing.e2e.ts
│   │       ├── tasks/tasks.e2e.ts
│   │       ├── documents/documents.e2e.ts
│   │       └── settings/settings.e2e.ts
│   │
│   └── onlinebooking/                   ← Next project — just add a folder
│       ├── playwright.config.ts
│       ├── data/OnlineBooking_Tests.xlsx
│       ├── pages/
│       └── tests/
│
├── package.json
├── tsconfig.json
└── .github/
    └── workflows/
        ├── e2e-on-push.yml              ← Auto-run on PR/push (per project)
        └── e2e-nightly.yml              ← Full suite nightly (all projects or one)
```

---

## Core vs. Project-Specific

| Layer | Lives In | Shared? |
|-------|----------|---------|
| Spreadsheet reader | `core/lib/` | Yes — all projects |
| Results writer | `core/lib/` | Yes — all projects |
| Slack reporter | `core/lib/` | Yes — all projects |
| Auth fixture | `core/fixtures/` | Yes — override per project if auth differs |
| Base Playwright config | `core/` | Yes — each project extends it |
| Page Object Model | `projects/<name>/pages/` | No — per project |
| E2E test files | `projects/<name>/tests/` | No — per project |
| Excel workbook | `projects/<name>/data/` | No — per project |
| `.env` / credentials | `projects/<name>/` | No — per project |

---

## Understanding the Three Project Folders

### The Simple Analogy

Think of it like a **restaurant**:

| Folder | Restaurant Analogy | In ADAPT |
|--------|-------------------|----------|
| **`data/`** (Excel) | The **menu + order form** — lists what to make, ingredients, who ordered it | Test cases, input data, run flags, expected results |
| **`pages/`** | The **kitchen** — knows how to make each dish | How to interact with each screen — click, fill, navigate |
| **`tests/`** | The **waiter** — takes the order, goes to kitchen, serves the result | Calls page actions in sequence, checks the outcome |

### One Line Each

- `data/` — **what** to test
- `pages/` — **how** to interact with the app
- `tests/` — **when** to do it and **whether** it passed

### Same Idea, One Example

**Scenario:** Test that a patient can be added successfully.

| Folder | Its Role | Example |
|--------|---------|---------|
| `data/HappyQ_Tests.xlsx` | Says *what* to test and *with what data* | `TEST_ID: PAT-E2E-003`, `firstName: John`, `lastName: Doe`, `RUN: YES` |
| `pages/patients/PatientFormPage.ts` | Knows *how* to fill the form | `fillForm()`, `submit()`, `expectSuccessToast()` |
| `tests/patients/patients.e2e.ts` | Orchestrates the *journey* | Load data → call `fillForm()` → call `submit()` → assert toast appears |

### How They Relate at Runtime

```
tests/patients/patients.e2e.ts        pages/patients/PatientFormPage.ts     Browser
───────────────────────────────────────────────────────────────────────────────────
data loaded from Excel
  patientForm.fillForm(data)    →      fillForm()                    →    page.fill(...)
  patientForm.submit()          →      submit()                      →    page.click(...)
  patientForm
  .expectSuccessToast()         →      expectSuccessToast()          →    expect(toast).toBeVisible()
```

---

## Adding a New Project (Plug-and-Play Steps)

| Step | Action |
|------|--------|
| 1 | Create folder: `projects/<new-project-name>/` |
| 2 | Add `playwright.config.ts` — extend `../../core/playwright.base.config.ts`, set `BASE_URL` |
| 3 | Copy Excel template → `data/<ProjectName>_Tests.xlsx`, fill in test cases |
| 4 | Create Page Objects in `pages/` for each screen |
| 5 | Write E2E tests in `tests/` referencing those Page Objects |
| 6 | Add `.env` with `BASE_URL`, role credentials, and Slack webhook |
| Done | All shared infra (reader, writer, reporter, CI) works automatically |

---

## Excel Workbook Schema (Standard Across All Projects)

### `TEST_CONTROL` Sheet — Run Control

| Column | Type | Description |
|--------|------|-------------|
| TEST_ID | string | Matches row in E2E_TESTS |
| MODULE | string | e.g. `Patients`, `Billing` |
| SCREEN | string | e.g. `Patient List`, `Add Patient` |
| LAYER | string | `E2E` |
| PRIORITY | string | `P1` / `P2` / `P3` |
| RUN | `YES`/`NO` | Toggle this row on or off |
| NOTES | string | Reason for skip (optional) |

### `E2E_TESTS` Sheet — Test Case Definitions

| Column | Description |
|--------|-------------|
| TEST_ID | Unique ID e.g. `AUTH-E2E-001` |
| MODULE | Module name |
| SCREEN | Screen name |
| TEST_NAME | Short descriptive name |
| DESCRIPTION | What this test validates |
| USER_ROLE | Role to log in as |
| PRECONDITIONS | State required before test |
| TEST_DATA | JSON string of input values |
| EXPECTED_RESULT | What success looks like |

### `TEST_USERS` Sheet — Role Credentials

| Column | Description |
|--------|-------------|
| ROLE | Role name e.g. `FRONT_DESK` |
| EMAIL_ENV_KEY | Env var name holding the email |
| PASSWORD_ENV_KEY | Env var name holding the password |

> Credentials are never stored in Excel. Excel holds the env var key names only. Actual values live in `.env` (local) or GitHub Secrets (CI).

### `RESULTS` Sheet — Auto-Written After Every Run

| Column | Description |
|--------|-------------|
| TEST_ID | Test identifier |
| TEST_NAME | Test name |
| MODULE | Module |
| SCREEN | Screen |
| USER_ROLE | Role used |
| STATUS | `PASS` / `FAIL` / `SKIP` |
| ERROR_MESSAGE | Failure detail |
| SCREENSHOT_PATH | Path to failure screenshot |
| RUN_DURATION_MS | Duration in milliseconds |
| RUN_AT | ISO timestamp |
| RUN_BY | `Local Dev` or `CI/CD Runner` |
| ENV | `local` / `staging` / `production` |

---

## Playwright Configuration

| Setting | Value |
|---------|-------|
| Browser | Chromium (Chrome) only |
| Screenshot | On failure only |
| Video | Off |
| Retries | 0 — fail immediately, no retries |
| Auth | Login once per role → save `storageState` |
| Base URL | Set per project via `BASE_URL` env var |
| Reporter | HTML report + Slack custom reporter |

---

## Auth Strategy

| Test Type | Strategy |
|-----------|----------|
| Auth tests (login screen) | Real login each time — tests the UI |
| All other tests | Reuse saved `storageState` per role — fast |

The auth setup fixture (`core/fixtures/auth.setup.ts`) logs in once per role before the test suite starts and saves the session. All subsequent tests inherit the correct role session.

---

## Target Environments

| Environment | How to Use |
|-------------|-----------|
| Local | Default — `http://localhost:<port>` |
| Staging | `BASE_URL=https://staging.app.com npm run test:e2e` |
| Production | `BASE_URL=https://app.com npm run test:e2e` |

---

## Test Run Triggers

| Trigger | When | Scope |
|---------|------|-------|
| Manual (CLI) | On demand by developer | Any project, any filter |
| CI on PR/push | Every push or PR | Project under change |
| Nightly schedule | 1am daily (cron) | Full suite, all `RUN=YES` |

---

## CLI Run Options

```bash
# Run all active tests for a project
npm run test:e2e --project=happyq

# Run only a specific module
npm run test:e2e --project=happyq -- --grep "Billing"

# Run against staging
BASE_URL=https://staging.happyq.com npm run test:e2e --project=happyq

# Run with data cleanup after
CLEANUP=true npm run test:e2e --project=happyq

# Run a specific priority only
npm run test:e2e --project=happyq -- --grep "@P1"
```

---

## HappyQ Module Coverage

| Module | Key Screens | Roles Tested |
|--------|------------|-------------|
| Auth | Login | All roles |
| Patients | List, Add, Edit, View | Standard, Front Desk |
| Appointments | List, Book, History | Front Desk, Clinician |
| Reception | Queue view | Front Desk |
| Consultant | Room view | Clinician |
| Billing | Dashboard, Manage, History, Outstanding | Billing |
| Tasks | Dashboard | Standard |
| Documents | List, Expiry, Reports | Standard |
| Settings | Users, Permissions | Admin |
| RBA | Out-of-scope routes | Front Desk / Clinician / Billing |

---

## Roles Tested (HappyQ)

| Role Key | Role Name | Access Scope |
|----------|-----------|-------------|
| `STANDARD` | Standard User | General app access |
| `FRONT_DESK` | Front Desk / Receptionist | Reception, appointments, patients |
| `CLINICIAN` | Clinician / Doctor | Consultant room, patient history |
| `BILLING` | Billing / Finance | Billing module only |

---

## Reporting

| Output | Description |
|--------|-------------|
| HTML Report | `playwright-report/index.html` — full test details with screenshots |
| Slack Notification | Pass/fail summary posted to configured channel after every run |
| Excel History | Every run appended to `RESULTS` sheet — trend tracking over time |
| CI Artifact | HTML report uploaded as GitHub Actions artifact on every CI run |

---

## Decisions Log

| # | Topic | Decision | Rationale |
|---|-------|----------|-----------|
| 1 | Framework | Playwright (TypeScript) | Industry standard 2024–2026, native TS, best parallelism |
| 2 | Pattern | Page Object Model + Data-Driven | POM for maintainability; Excel for non-dev test control |
| 3 | Repo structure | Monorepo (`adapt/`) | Share core infra; add projects as folders |
| 4 | Project location | Separate repo from app repos | Clean separation; framework lives independently |
| 5 | Run control | Test case level (each Excel row) | Maximum granularity |
| 6 | Credentials | Env var keys in Excel, values in `.env` / GitHub Secrets | Security — no plaintext passwords in Excel |
| 7 | Browser | Chromium only | Speed; covers majority of real users |
| 8 | Retries | None — fail immediately | Strict; no flaky test masking |
| 9 | Auth | Real login for auth tests; saved session for all others | Tests auth UI + keeps suite fast |
| 10 | Data cleanup | Configurable via `CLEANUP=true` CLI flag | Flexibility — keep data for debugging or clean up |
| 11 | Run history | Appended to Excel `RESULTS` sheet | Keeps all data in one place (Excel-centric workflow) |
| 12 | Reporting | HTML local + Slack notification | Immediate visual report + team-wide awareness |
| 13 | Environments | local / staging / prod via `BASE_URL` env var | Same test suite runs anywhere |
| 14 | Triggers | Manual + CI on PR + nightly cron | Full coverage of dev, review, and regression cycles |
| 15 | RBA testing | Dedicated test cases per role asserting denied access | Verifies permission boundaries, not just happy paths |

---

## Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| 1 | Repo scaffold — `package.json`, `tsconfig.json`, `playwright.base.config.ts`, `.env.example` |
| 2 | Core library — `spreadsheet-reader.ts`, `results-writer.ts`, `slack-reporter.ts` |
| 3 | Auth fixture — real login + `storageState` saved per role |
| 4 | HappyQ: Page Objects for Auth, Patients, Appointments |
| 5 | HappyQ: E2E tests + Excel rows for Auth, Patients, Appointments (10–15 cases) |
| 6 | HappyQ: Billing, Tasks, Documents modules |
| 7 | HappyQ: RBA denial tests for all roles |
| 8 | GitHub Actions — on-push and nightly workflows |
| 9 | HappyQ: Settings module tests |
| 10 | Second project onboarding — validate plug-and-play with `onlinebooking` |

---

*ADAPT — Built by DeepTree*
