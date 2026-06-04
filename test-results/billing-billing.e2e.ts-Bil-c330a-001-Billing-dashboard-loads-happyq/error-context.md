# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billing\billing.e2e.ts >> Billing — Dashboard >> BIL-E2E-001: Billing dashboard loads
- Location: projects\happyq\tests\billing\billing.e2e.ts:12:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /billing/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /billing/i })

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
        - link "Billing" [disabled]
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
    - heading "Search Bills" [level=3]:
      - img
      - text: Search Bills
    - text: Date
    - button "Jun 4, 2026":
      - img
      - text: Jun 4, 2026
    - text: Queue
    - combobox: All Queues
    - text: Search Patient
    - img
    - textbox "Name, phone, or token..."
    - img
    - text: Thursday, June 4, 2026 |
    - img
    - text: "City center Sort:"
    - combobox: Patient Name (A-Z)
    - text: "Active: 5"
    - button "Refresh":
      - img
      - text: Refresh
    - table:
      - rowgroup:
        - row "Token Patient Phone Time Status Total Amount Total Balance Actions":
          - columnheader
          - columnheader "Token":
            - text: Token
            - img
          - columnheader "Patient":
            - text: Patient
            - img
          - columnheader "Phone"
          - columnheader "Time":
            - text: Time
            - img
          - columnheader "Status"
          - columnheader "Total Amount"
          - columnheader "Total Balance"
          - columnheader "Actions"
      - rowgroup:
        - 'row "#1 Ishwarya ID: #26PDY16303 SH • Booked 919365 10:00 AM No Invoice ₹0.00 ₹0.00 New Bill Manage"':
          - cell:
            - button:
              - img
          - cell "#1"
          - 'cell "Ishwarya ID: #26PDY16303 SH • Booked"'
          - cell "919365"
          - cell "10:00 AM":
            - img
            - text: 10:00 AM
          - cell "No Invoice"
          - cell "₹0.00"
          - cell "₹0.00"
          - cell "New Bill Manage":
            - button "New Bill":
              - img
              - text: New Bill
            - button "Manage":
              - img
              - text: Manage
        - 'row "#1 Jayapiya ID: #26PDY16275 IS • Booked 919799 8:00 AM No Invoice ₹0.00 ₹0.00 New Bill Manage"':
          - cell:
            - button:
              - img
          - cell "#1"
          - 'cell "Jayapiya ID: #26PDY16275 IS • Booked"'
          - cell "919799"
          - cell "8:00 AM":
            - img
            - text: 8:00 AM
          - cell "No Invoice"
          - cell "₹0.00"
          - cell "₹0.00"
          - cell "New Bill Manage":
            - button "New Bill":
              - img
              - text: New Bill
            - button "Manage":
              - img
              - text: Manage
        - 'row "#1 Mahesh ID: #26PDY15783 KHN • Booked 918682 10:00 AM No Invoice ₹0.00 ₹0.00 New Bill Manage"':
          - cell:
            - button:
              - img
          - cell "#1"
          - 'cell "Mahesh ID: #26PDY15783 KHN • Booked"'
          - cell "918682"
          - cell "10:00 AM":
            - img
            - text: 10:00 AM
          - cell "No Invoice"
          - cell "₹0.00"
          - cell "₹0.00"
          - cell "New Bill Manage":
            - button "New Bill":
              - img
              - text: New Bill
            - button "Manage":
              - img
              - text: Manage
        - 'row "#1 Ramya ID: #26PDY16111 RL • Booked 919741 10:00 AM No Invoice ₹0.00 ₹0.00 New Bill Manage"':
          - cell:
            - button:
              - img
          - cell "#1"
          - 'cell "Ramya ID: #26PDY16111 RL • Booked"'
          - cell "919741"
          - cell "10:00 AM":
            - img
            - text: 10:00 AM
          - cell "No Invoice"
          - cell "₹0.00"
          - cell "₹0.00"
          - cell "New Bill Manage":
            - button "New Bill":
              - img
              - text: New Bill
            - button "Manage":
              - img
              - text: Manage
        - 'row "#2 Vidhya ID: #26PDY16128 RL • Booked 917434 8:00 AM No Invoice ₹0.00 ₹0.00 New Bill Manage"':
          - cell:
            - button:
              - img
          - cell "#2"
          - 'cell "Vidhya ID: #26PDY16128 RL • Booked"'
          - cell "917434"
          - cell "8:00 AM":
            - img
            - text: 8:00 AM
          - cell "No Invoice"
          - cell "₹0.00"
          - cell "₹0.00"
          - cell "New Bill Manage":
            - button "New Bill":
              - img
              - text: New Bill
            - button "Manage":
              - img
              - text: Manage
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { BasePage } from '../BasePage';
  3  | 
  4  | export class BillingPage extends BasePage {
  5  |   constructor(page: Page) {
  6  |     super(page);
  7  |   }
  8  | 
  9  |   async goto() {
  10 |     await this.page.goto('/billing');
  11 |   }
  12 | 
  13 |   async expectLoaded() {
> 14 |     await expect(this.page.getByRole('heading', { name: /billing/i })).toBeVisible();
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  15 |   }
  16 | 
  17 |   async gotoHistory() {
  18 |     await this.page.goto('/billing/history');
  19 |   }
  20 | 
  21 |   async gotoOutstanding() {
  22 |     await this.page.goto('/billing/outstanding');
  23 |   }
  24 | 
  25 |   async expectAccessDenied() {
  26 |     await expect(
  27 |       this.page.getByText(/not authorized|access denied|permission/i).first()
  28 |     ).toBeVisible({ timeout: 8000 });
  29 |   }
  30 | }
  31 | 
```