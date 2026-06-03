# ADAPT — Developer Guide

Everything a developer needs to work with the ADAPT framework.
New to ADAPT? Start at [Quick Start](#quick-start) then read [Scripts Reference](#scripts-reference).

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Scripts Reference](#scripts-reference)
3. [Adding a New Project](#adding-a-new-project)
4. [Adding a New Module](#adding-a-new-module)
5. [Verifying Selectors](#verifying-selectors)
6. [Running Tests](#running-tests)
7. [Debugging Failing Tests](#debugging-failing-tests)
8. [Working with the Excel Workbook](#working-with-the-excel-workbook)
9. [Understanding the TODO Report](#understanding-the-todo-report)
10. [CI / GitHub Actions](#ci--github-actions)

---

## Quick Start

```bash
# 1. Clone the repo
git clone <adapt-repo-url>
cd adapt

# 2. Install dependencies
npm install

# 3. Install Playwright browser (one-time per machine)
npm run install:browsers

# 4. Copy and fill in credentials for the project you want to test
cp projects/happyq/.env.example projects/happyq/.env
# Edit .env and fill in BASE_URL and test user credentials

# 5. Run tests
npm run test:happyq
```

---

## Scripts Reference

### `npm run new:project`

**What it does:** Scaffolds a complete new project under `projects/<name>/`.

```bash
# Scaffold only — creates folder structure, config files, blank testdata, empty Excel
npm run new:project -- --name onlinebooking

# Scaffold + scan source + generate page objects, dialogs, tests, TODO report
npm run new:project -- --name onlinebooking --src D:\onlinebooking
```

**What gets created automatically:**

| Asset | Created By |
|-------|-----------|
| `projects/<name>/` folder structure | ✅ Always |
| `playwright.config.ts` | ✅ Always |
| `global-setup.ts` | ✅ Always |
| `.env.example` | ✅ Always |
| `pages/BasePage.ts` | ✅ Always |
| `tests/auth/auth.setup.ts` | ✅ Always |
| `scripts/testdata/<name>.mjs` | ✅ Always |
| `data/<Name>_Tests.xlsx` | ✅ Always |
| `package.json` test scripts | ✅ Always |
| Page objects `pages/<module>/<Screen>Page.ts` | ✅ With `--src` only |
| Dialog classes `pages/<module>/dialogs/<x>Dialog.ts` | ✅ With `--src` only |
| Test stubs `tests/<module>/<module>.e2e.ts` | ✅ With `--src` only |
| `TODO_REPORT.md` | ✅ With `--src` only |

**What still needs manual work:**

| Asset | Why Manual |
|-------|-----------|
| Selector verification | Must run against the live app — see [Verifying Selectors](#verifying-selectors) |
| Full test journeys | Page loads are generated; add flows, RBA checks manually |
| `.env` credentials | Project-specific, never committed |
| GitHub Actions workflows | Copy from `happyq` and adapt |

**How it auto-detects the project type:**

| Detected From | Framework |
|--------------|-----------|
| `package.json` has `next` | Next.js |
| `package.json` has `react-router-dom` | React Router |
| `package.json` has `@tanstack/react-router` | TanStack Router |
| `package.json` has `vue-router` | Vue |
| `app/page.tsx` exists | Next.js App Router |

---

### `npm run update:testbook`

**What it does:** Smart-merges test case definitions into the project's Excel workbook.
Preserves all user edits — never overwrites `TEST_DATA`, `RUN`, or `NOTES` columns.

```bash
npm run update:testbook -- --project happyq
npm run update:testbook -- --project onlinebooking
```

**When to run it:**
- After adding a new module (you added rows to `scripts/testdata/<name>.mjs`)
- After removing a test case (script flags old rows `[OBSOLETE]` in Excel)
- First time setting up a project (creates the Excel from scratch)

**Merge behaviour:**

| Scenario | What Happens |
|----------|-------------|
| New `TEST_ID` in script | Row added to Excel |
| `TEST_ID` in both | Structural columns updated; `TEST_DATA`, `RUN`, `NOTES` preserved |
| `TEST_ID` in Excel only | Kept, `NOTES` flagged `[OBSOLETE]` |
| `TEST_USERS` sheet | Always replaced |
| `RESULTS` sheet | Never touched |

---

### `npm run test:<project>`

**What it does:** Runs the full active test suite (all `RUN=YES` rows) for the project.

```bash
# Run all active tests
npm run test:happyq

# Run in headed mode (see the browser)
npm run test:happyq:headed

# Run against staging
BASE_URL=https://staging.happyq.com npm run test:happyq

# Run with cleanup (deletes ADAPT-tagged data from previous run first)
CLEANUP=true npm run test:happyq

# Run a specific module only
npm run test:happyq -- --grep "Billing"

# Run a specific priority only
npm run test:happyq -- --grep "@P1"

# Run a single test by ID
npm run test:happyq -- --grep "BIL-E2E-001"
```

---

### `npm run test:<project>:report`

**What it does:** Opens the last HTML test report in your browser.

```bash
npm run test:happyq:report
```

The report shows:
- Pass / fail / skip per test
- Screenshots on failure (automatically captured)
- Duration per test
- Error messages with stack traces

---

### `npm run install:browsers`

**What it does:** Downloads the Playwright Chromium browser binary.

```bash
npm run install:browsers
```

**When to run it:**
- ✅ First time setting up ADAPT on a new machine
- ✅ After upgrading `@playwright/test` in `package.json`
- ❌ NOT needed when adding a new project
- ❌ NOT needed for day-to-day usage

The browser is installed once into a shared cache (`~/.cache/ms-playwright/`) and reused by all projects.

---

## Adding a New Project

```bash
# Step 1 — Scaffold + generate from source
npm run new:project -- --name <name> --src <path-to-app-source>

# Step 2 — Open TODO_REPORT.md and verify selectors
# (see Verifying Selectors section below)

# Step 3 — Add missing test journeys to test files
# projects/<name>/tests/<module>/<module>.e2e.ts

# Step 4 — Fill credentials
cp projects/<name>/.env.example projects/<name>/.env
# Edit .env

# Step 5 — Run tests
npm run test:<name>
```

---

## Adding a New Module

```bash
# Step 1 — Create page object
# projects/<name>/pages/<module>/<Screen>Page.ts

# Step 2 — Create dialog classes (if module has modals)
# projects/<name>/pages/<module>/dialogs/<Dialog>Dialog.ts

# Step 3 — Write test file
# projects/<name>/tests/<module>/<module>.e2e.ts

# Step 4 — Add rows to testdata definition
# scripts/testdata/<name>.mjs — add to testControl + e2eTests arrays

# Step 5 — Update Excel
npm run update:testbook -- --project <name>

# Step 6 — Verify Excel
# Open data/<Name>_Tests.xlsx — confirm new rows added, existing data untouched
```

---

## Verifying Selectors

This is the most important developer task after generating page objects.
Generated selectors are **educated guesses from source code** — they need
verification against the running app before tests are reliable.

### The Tool — `playwright codegen`

Playwright's codegen opens a browser and records every interaction as
Playwright code in real time. No guessing needed.

```bash
# Start the app first (inside the project being tested)
cd D:\happyq
npm run dev

# In a separate terminal, run codegen against the route you want to verify
npx playwright codegen http://localhost:5173/patients
npx playwright codegen http://localhost:5173/billing
npx playwright codegen http://localhost:5173/settings/users
```

### Step-by-Step Verification Workflow

```
1. Open TODO_REPORT.md in projects/<name>/
         ↓
2. Find the first ⚠️ or ❌ item
   e.g. PatientListPage.expectLoaded() — confidence: MEDIUM
         ↓
3. Run codegen for that screen:
   npx playwright codegen http://localhost:5173/patients
         ↓
4. In the browser, look at the element you want to select
   (e.g. the page heading "Patients")
         ↓
5. Click it — Playwright writes the selector automatically:
   page.getByRole('heading', { name: 'Patients' })
         ↓
6. Copy the selector into the page object:
   // Before (generated guess):
   await expect(this.page.getByRole('heading', { name: /patients/i })).toBeVisible();

   // After (verified):
   await expect(this.page.getByRole('heading', { name: 'Patients' })).toBeVisible();
         ↓
7. Run just that test to confirm:
   npm run test:happyq -- --grep "PAT-E2E-001"
         ↓
8. Pass ✅ → tick the item in TODO_REPORT.md → move to next
   Fail ❌ → adjust selector, re-run
```

### Common Selector Patterns

| Element | Selector | When to Use |
|---------|----------|-------------|
| Page heading | `getByRole('heading', { name: /text/i })` | Most pages |
| Button by label | `getByRole('button', { name: /Save/i })` | Standard buttons |
| Input with label | `getByLabel('Email')` | Properly labelled inputs |
| Input with placeholder | `getByPlaceholder('Search...')` | Search boxes, unlabelled inputs |
| Dropdown (Radix/shadcn) | `getByRole('combobox')` | Select components |
| Dialog | `getByRole('dialog')` | Any modal |
| Table row | `locator('table tbody tr').first()` | Data tables |
| Toast notification | `locator('[data-sonner-toast]')` | Sonner toast library |

### When Selectors Differ From Generated Guesses

| Situation | Generated Guess | Reality | Fix |
|-----------|----------------|---------|-----|
| Radix Select | `getByLabel('Queue')` | `getByRole('combobox')` | Use combobox role |
| Dynamic heading | `/patients/i` | `'Patients for Clinic A'` | Use contains: `/patients/i` (usually fine) |
| Icon-only button | `getByRole('button', { name: /add/i })` | No accessible name | Add `aria-label` or use `.first()` |
| Placeholder not label | `getByLabel('Search')` | `getByPlaceholder('Search patients...')` | Switch to `getByPlaceholder` |
| shadcn DatePicker | `getByLabel('Date')` | Custom component — use `getByRole('button')` near label | Inspect DOM with codegen |

---

## Running Tests

### Basic Runs

```bash
# Full suite — all RUN=YES tests
npm run test:happyq

# Headed — watch the browser
npm run test:happyq:headed

# Specific module
npm run test:happyq -- --grep "Billing"

# Specific test ID
npm run test:happyq -- --grep "BIL-E2E-001"

# P1 tests only
npm run test:happyq -- --grep "@P1"

# View report after run
npm run test:happyq:report
```

### Environment Targeting

```bash
# Local (default)
npm run test:happyq

# Staging
BASE_URL=https://staging.happyq.com npm run test:happyq

# Production (smoke only — run P1 tests)
BASE_URL=https://app.happyq.com npm run test:happyq -- --grep "@P1"
```

### With Cleanup

```bash
# Delete all ADAPT-tagged test data from previous run, then run fresh
CLEANUP=true npm run test:happyq

# Cleanup requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
# ONLY point at test/staging — never production
```

### Controlling Which Tests Run

Open `projects/happyq/data/HappyQ_Tests.xlsx` → `TEST_CONTROL` sheet:
- Set `RUN` column to `YES` to include a test
- Set `RUN` column to `NO` to skip a test
- The runner reads this sheet before every run

---

## Debugging Failing Tests

### Method 1 — PWDEBUG (step through test)

```bash
PWDEBUG=1 npm run test:happyq -- --grep "BIL-E2E-001"
```

Opens Playwright Inspector — step through each action, see what's on screen at each step.

### Method 2 — Headed mode (watch it run)

```bash
npm run test:happyq:headed -- --grep "BIL-E2E-001"
```

### Method 3 — Add `page.pause()` to the test

```typescript
test('BIL-E2E-001: Billing dashboard loads', async ({ page }) => {
  const billingPage = new BillingPage(page);
  await billingPage.goto();
  await page.pause();  // ← browser pauses here, open Inspector
  await billingPage.expectLoaded();
});
```

### Method 4 — Check the HTML report

```bash
npm run test:happyq:report
```

Every failed test includes:
- Screenshot at point of failure
- Error message + stack trace
- Which selector wasn't found

### Common Failure Reasons

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `getByRole('heading') not found` | Heading text doesn't match | Run codegen to get real text |
| `getByLabel('Name') not found` | Input has no associated label | Switch to `getByPlaceholder()` |
| `storageState not found` | Auth setup didn't run or role file missing | Run auth setup: check `.auth/` folder |
| `Timeout waiting for navigation` | Login redirect not happening | Check credentials in `.env` |
| `dialog not visible` | Modal not opened | Check the button that opens it |
| `Element not visible` | Element inside inactive tab | Click the tab first in the test |

---

## Working with the Excel Workbook

The Excel file at `projects/<name>/data/<Name>_Tests.xlsx` has 4 sheets:

### `TEST_CONTROL` — You control this

| Column | Who Owns It | What To Do |
|--------|------------|-----------|
| `TEST_ID` | Script | Don't edit |
| `MODULE` | Script | Don't edit |
| `SCREEN` | Script | Don't edit |
| `LAYER` | Script | Don't edit |
| `PRIORITY` | Script | Don't edit |
| `RUN` | **You** | Set `YES` or `NO` to control which tests run |
| `NOTES` | **You** | Add skip reasons, context |

### `E2E_TESTS` — You control TEST_DATA

| Column | Who Owns It | What To Do |
|--------|------------|-----------|
| Most columns | Script | Don't edit |
| `TEST_DATA` | **You** | Edit with meaningful values — e.g. `{"firstName": "Krishnan", "phone": "9876543210"}` |
| `RUN` | **You** | Set `YES` or `NO` |
| `NOTES` | **You** | Add context |

### `TEST_USERS` — Reference only

Shows which env var keys map to which roles. Don't edit — it's replaced by `update:testbook`.

### `RESULTS` — Auto-written, don't edit

Appended after every run. Shows pass/fail history over time.

### Adding Test Data

1. Open `E2E_TESTS` sheet
2. Find the row by `TEST_ID`
3. Edit the `TEST_DATA` column — it's a JSON string:
   ```json
   {"firstName": "Krishnan", "lastName": "Deeptree", "phone": "9876543210", "gender": "Male"}
   ```
4. Save the file — it takes effect on the next run

### Safe to Edit / Not Safe to Edit

```
✅ Edit:  TEST_DATA, RUN, NOTES  — these are yours
❌ Don't: TEST_ID, MODULE, SCREEN, TEST_NAME, DESCRIPTION — script overwrites on next update:testbook
```

---

## Understanding the TODO Report

When you run `new:project --src`, a `TODO_REPORT.md` is created in the project folder.
It lists every generated selector with a confidence level:

| Icon | Confidence | What It Means | Action |
|------|-----------|---------------|--------|
| ✅ | HIGH | Route path, standard patterns — confirmed correct | None |
| ⚠️ | MEDIUM | Guessed from source code — probably correct | Verify with codegen |
| ❌ | LOW | No source found — placeholder only | Must implement manually |

### Working Through the Report

```
Open TODO_REPORT.md
      ↓
Find first ⚠️ or ❌
      ↓
Run: npx playwright codegen <BASE_URL>/<route>
      ↓
Click the element → copy the selector
      ↓
Replace in page object file
      ↓
Run: npm run test:<name> -- --grep "<test name>"
      ↓
Pass ✅ → check off in TODO_REPORT.md
Fail ❌ → adjust selector, re-run
      ↓
Repeat until all ⚠️ and ❌ items are resolved
```

---

## CI / GitHub Actions

Two workflows are pre-configured for each project:

### `e2e-on-push.yml` — Runs on every PR

Triggers on: `push` to any branch, `pull_request` to `main`

```bash
# Manually trigger from GitHub UI
# Go to: Actions → ADAPT — HappyQ E2E (On Push) → Run workflow
```

### `e2e-nightly.yml` — Full suite nightly

Triggers on: `cron: '0 1 * * *'` (1am UTC daily) and manual dispatch

### Required GitHub Secrets

Set these in: `Settings → Secrets → Actions`

```
HAPPYQ_STAGING_URL
SLACK_WEBHOOK_URL
TEST_USER_STANDARD_EMAIL
TEST_USER_STANDARD_PASSWORD
TEST_USER_RECEPTIONIST_EMAIL
TEST_USER_RECEPTIONIST_PASSWORD
TEST_USER_DOCTOR_EMAIL
TEST_USER_DOCTOR_PASSWORD
TEST_USER_ACCOUNTANT_EMAIL
TEST_USER_ACCOUNTANT_PASSWORD
```

### Viewing CI Results

1. Go to GitHub → Actions tab
2. Find the workflow run
3. Download the `playwright-report` artifact
4. Open `index.html` locally

Or check Slack — a pass/fail summary is posted after every run.

---

## Reference — All npm Scripts

| Script | What It Does |
|--------|-------------|
| `npm run new:project -- --name <n>` | Scaffold a new project (folders + config) |
| `npm run new:project -- --name <n> --src <path>` | Scaffold + scan source + generate pages/dialogs/tests |
| `npm run update:testbook -- --project <n>` | Smart-merge test definitions into Excel |
| `npm run install:browsers` | Download Playwright Chromium (one-time per machine) |
| `npm run test:<name>` | Run all active tests for project |
| `npm run test:<name>:headed` | Run tests with browser visible |
| `npm run test:<name>:report` | Open last HTML test report |
| `CLEANUP=true npm run test:<name>` | Delete previous run data, then run tests |
| `BASE_URL=<url> npm run test:<name>` | Run against a specific environment |
| `npm run test:<name> -- --grep "<text>"` | Run tests matching a name/ID pattern |
| `PWDEBUG=1 npm run test:<name> -- --grep "<id>"` | Step through a test in Playwright Inspector |

---

*ADAPT — Built by DeepTree*
