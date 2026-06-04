# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reception\reception.e2e.ts >> Reception — Queue >> REC-E2E-001: Reception page loads
- Location: projects\happyq\tests\reception\reception.e2e.ts:8:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /reception/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /reception/i })

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
- list:
  - listitem:
    - separator
    - button "J Julie Receptionist":
      - text: J Julie Receptionist
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
        - link "Reception" [disabled]
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
  - button:
    - img
  - button "Sign Out":
    - img
  - main:
    - text: Date
    - button "Jun 4, 2026":
      - img
      - text: Jun 4, 2026
    - text: Queue
    - combobox: All Queues
    - text: Status
    - combobox: All Statuses
    - text: Search
    - img
    - textbox "Search by name, phone, or token..."
    - text: "View Mode:"
    - group:
      - radio "Card View" [checked]:
        - img
        - text: Card
      - radio "Table View":
        - img
        - text: Table
    - text: "Active: 5"
    - button "Refresh":
      - img
      - text: Refresh
    - heading "Patient Management" [level=2]
    - img
    - text: "Updated: 15:20"
    - 'button "jayapiya ID: #26PDY16275"':
      - img
      - text: "jayapiya ID: #26PDY16275"
    - button:
      - img
    - button:
      - img
    - text: 📞 919799
    - img
    - text: "8:00 AM • Token #1"
    - img
    - text: IS Booked
    - button "Arrive":
      - img
      - text: Arrive
    - button "No Show":
      - img
      - text: No Show
    - strong: "Note:"
    - text: JIPMER
    - 'button "vidhya ID: #26PDY16128"':
      - img
      - text: "vidhya ID: #26PDY16128"
    - button:
      - img
    - button:
      - img
    - text: 📞 917434
    - img
    - text: "8:00 AM • Token #2"
    - img
    - text: RL Booked
    - button "Arrive":
      - img
      - text: Arrive
    - button "No Show":
      - img
      - text: No Show
    - strong: "Note:"
    - text: Repeat TS & FE
    - 'button "mahesh ID: #26PDY15783"':
      - img
      - text: "mahesh ID: #26PDY15783"
    - button:
      - img
    - button:
      - img
    - text: 📞 918682
    - img
    - text: "10:00 AM • Token #1"
    - img
    - text: KHN Booked
    - button "Arrive":
      - img
      - text: Arrive
    - button "No Show":
      - img
      - text: No Show
    - strong: "Note:"
    - text: Repeat
    - 'button "ramya ID: #26PDY16111"':
      - img
      - text: "ramya ID: #26PDY16111"
    - button:
      - img
    - button:
      - img
    - text: 📞 919741
    - img
    - text: "10:00 AM • Token #1"
    - img
    - text: RL Booked
    - button "Arrive":
      - img
      - text: Arrive
    - button "No Show":
      - img
      - text: No Show
    - 'button "ishwarya ID: #26PDY16303"':
      - img
      - text: "ishwarya ID: #26PDY16303"
    - button:
      - img
    - button:
      - img
    - text: 📞 919365
    - img
    - text: "10:00 AM • Token #1"
    - img
    - text: SH Booked
    - button "Arrive":
      - img
      - text: Arrive
    - button "No Show":
      - img
      - text: No Show
    - complementary:
      - img
      - paragraph: Select a patient
      - paragraph: to view their full queue details here
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { BasePage } from '../BasePage';
  3  | 
  4  | export class ReceptionPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/reception'); }
  8  | 
  9  |   async expectLoaded() {
> 10 |     await expect(this.page.getByRole('heading', { name: /reception/i })).toBeVisible();
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  11 |   }
  12 | 
  13 |   async search(query: string) {
  14 |     await this.page.getByPlaceholder(/search/i).fill(query);
  15 |   }
  16 | 
  17 |   async switchToTableView() {
  18 |     await this.page.getByRole('button', { name: /table/i }).click();
  19 |   }
  20 | 
  21 |   async switchToCardView() {
  22 |     await this.page.getByRole('button', { name: /card/i }).click();
  23 |   }
  24 | 
  25 |   async filterByQueue(queueName: string) {
  26 |     await this.page.getByRole('combobox').first().click();
  27 |     await this.page.getByText(queueName).click();
  28 |   }
  29 | 
  30 |   async expectPatientsVisible() {
  31 |     await expect(this.page.locator('table tbody tr, [class*="patient-card"]').first()).toBeVisible({ timeout: 10000 });
  32 |   }
  33 | 
  34 |   async expectAccessDenied() {
  35 |     await expect(this.page.getByText(/not authorized|access denied|permission/i).first()).toBeVisible({ timeout: 8000 });
  36 |   }
  37 | }
  38 | 
```