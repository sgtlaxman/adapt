---
name: jira-story-testing
description: Custom senior QA test automation workflow to retrieve Jira tickets (e.g. HAP-122), analyze requirements, scaffold/create tests, execute them, and report results.
---

# Jira Story Testing Workflow

Use this workflow to test stories from Jira in a consistent and controlled manner.

## 1. Retrieve Ticket Info
- Use the `getJiraIssue` tool from `atlassian-rovo` to load issue details (summary, description, solutions, acceptance criteria) for the requested issue ID (e.g. `HAP-122`).
- Identify the target project: `HAP` maps to `happyq`, `OB` or `OBL` maps to `onlinebooking`.

## 2. Requirement & Impact Analysis
- Parse the description/solution to identify testing requirements:
  - User roles required (STANDARD, RECEPTIONIST, DOCTOR, ACCOUNTANT, etc.).
  - Target modules, screens, and dialogs.
- Audit the target app's repository to check if existing Page Objects and action methods cover the new changes.
- If new pages/modals are introduced, create them matching ADAPT conventions (extend `BasePage`, implement `expectLoaded`, typed inputs).

## 3. Test Case Creation
- Define new automated E2E test cases:
  - Identify unique test IDs following `<MODULE_PREFIX>-E2E-<3-digit-number>` format.
  - Implement test cases in `projects/<project>/tests/<module>/<module>.e2e.ts`.
- Update the test case definitions in `scripts/testdata/<project>.mjs` (append test control and E2E test details).
- Merge test cases into the project's Excel spreadsheet:
  ```bash
  npm run update:testbook -- --project <project>
  ```

## 4. Execution
- Ensure target application is running (e.g. locally or remote environment).
- Run setup auth project to ensure fresh role sessions:
  ```bash
  npx playwright test --config=projects/<project>/playwright.config.ts --project=setup
  ```
- Run the newly added test case(s) specifically:
  ```bash
  npx playwright test --config=projects/<project>/playwright.config.ts -g "<TEST_ID>"
  ```

## 5. Result Verification & Reporting
- Generate the HTML report and sync the results to the Excel workbook:
  ```bash
  npm run generate:report -- --project <project>
  ```
- Summarize the test execution result to the user:
  - Key KPIs (Total, Passed, Failed, Skipped).
  - Detailed results of the new test cases.
  - Path/link to the generated HTML report.
