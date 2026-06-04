# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billing\billing.e2e.ts >> Billing — Reports >> BIL-E2E-006: Invoice reports page loads
- Location: projects\happyq\tests\billing\billing.e2e.ts:48:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /invoice reports/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /invoice reports/i })

```

```yaml
- img
- strong: LOCAL ENVIRONMENT
- text: "- Data entered here may be cleared periodically and should not contain real PHI."
- list:
  - listitem:
    - link "The Fetal Clinic The Fetal Clinic":
      - /url: /
      - img "The Fetal Clinic"
      - text: The Fetal Clinic
- text: System
- list:
  - listitem:
    - link "Dashboard":
      - /url: /
      - img
      - text: Dashboard
- text: Patient Management
- list:
  - listitem:
    - link "Patients":
      - /url: /patients
      - img
      - text: Patients
  - listitem:
    - link "Appointments":
      - /url: /appointments
      - img
      - text: Appointments
  - listitem:
    - link "Appointment History":
      - /url: /appointment-history
      - img
      - text: Appointment History
  - listitem:
    - link "Patient History":
      - /url: /patient-history
      - img
      - text: Patient History
- text: Clinic Operations
- list:
  - listitem:
    - link "Reception":
      - /url: /reception
      - img
      - text: Reception
  - listitem:
    - link "Consultant":
      - /url: /consultant
      - img
      - text: Consultant
  - listitem:
    - link "Display":
      - /url: /display
      - img
      - text: Display
  - listitem:
    - link "Status Logs":
      - /url: /status-logs
      - img
      - text: Status Logs
- text: Billing & Accounts
- list:
  - listitem:
    - link "Bills":
      - /url: /billing
      - img
      - text: Bills
  - listitem:
    - link "Invoice Report":
      - /url: /billing/reports
      - img
      - text: Invoice Report
  - listitem:
    - link "Daily Cash":
      - /url: /billing/daily-cash
      - img
      - text: Daily Cash
- list:
  - listitem:
    - separator
    - button "I Ilavarasi Accountant":
      - text: I Ilavarasi Accountant
      - img
- button "Toggle Sidebar"
- main:
  - button "Toggle Sidebar":
    - img
    - text: Toggle Sidebar
  - navigation "breadcrumb":
    - list:
      - listitem:
        - link "The Fetal Clinic":
          - /url: /
      - listitem:
        - link "Billing":
          - /url: /billing
      - listitem:
        - link "Reports" [disabled]
  - img
  - searchbox "Search... (Ctrl+K)"
  - button "City center":
    - img
    - text: City center
  - button "Patients":
    - img
  - button "Appointments":
    - img
  - button "Reception":
    - img
  - button "Consultant":
    - img
  - button "Display":
    - img
  - button "Bills":
    - img
  - button:
    - img
  - button "Sign Out":
    - img
  - main:
    - img
    - heading "Invoice Report" [level=1]
    - paragraph: Detailed Billing & Collection Analysis
    - img
    - textbox "Search patient or invoice..."
    - text: "Appoint Period:"
    - button "Jun 4, 2026":
      - img
      - text: Jun 4, 2026
    - text: to
    - button "Jun 4, 2026":
      - img
      - text: Jun 4, 2026
    - tablist:
      - tab "Day Invoices" [selected]
      - tab "Day Summary"
      - tab "Settlement Report"
      - tab "Balances"
      - tab "Discounts"
      - tab "Dues Paid"
      - tab "Charges Mismatch"
    - tabpanel "Day Invoices":
      - button "Column Explanations & Reporting Logic":
        - img
        - text: Column Explanations & Reporting Logic
        - img
      - table:
        - rowgroup:
          - row "Invoice Date Appoint Date Invoice Id Patient Name Phone Location Staff Sub Total Disc Total Bill Amount Amount Paid Balance":
            - columnheader "Invoice Date"
            - columnheader "Appoint Date"
            - columnheader "Invoice Id"
            - columnheader "Patient Name"
            - columnheader "Phone"
            - columnheader "Location"
            - columnheader "Staff"
            - columnheader "Sub Total"
            - columnheader "Disc Total"
            - columnheader "Bill Amount"
            - columnheader "Amount Paid"
            - columnheader "Balance"
        - rowgroup:
          - row "No Invoices Found Adjust filters or date range":
            - cell "No Invoices Found Adjust filters or date range":
              - img
              - heading "No Invoices Found" [level=3]
              - paragraph: Adjust filters or date range
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { BasePage } from '../BasePage';
  3  | 
  4  | export class BillingReportsPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/billing/reports'); }
  8  | 
  9  |   async expectLoaded() {
> 10 |     await expect(this.page.getByRole('heading', { name: /invoice reports/i })).toBeVisible();
     |                                                                                ^ Error: expect(locator).toBeVisible() failed
  11 |   }
  12 | 
  13 |   async switchToDayInvoices() {
  14 |     await this.page.getByRole('tab', { name: /day invoices/i }).click();
  15 |   }
  16 | 
  17 |   async switchToAuditLog() {
  18 |     await this.page.getByRole('tab', { name: /audit log/i }).click();
  19 |   }
  20 | 
  21 |   async downloadCsv() {
  22 |     await this.page.getByRole('button', { name: /download csv/i }).click();
  23 |   }
  24 | }
  25 | 
```