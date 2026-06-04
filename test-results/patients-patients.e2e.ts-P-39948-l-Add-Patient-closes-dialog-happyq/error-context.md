# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: patients\patients.e2e.ts >> Patients — Add Patient >> PAT-E2E-006: Cancel Add Patient closes dialog
- Location: projects\happyq\tests\patients\patients.e2e.ts:67:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /patients/i })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: /patients/i }) resolved to 2 elements:
    1) <h1 class="text-3xl font-bold text-gray-900">Patients</h1> aka getByRole('heading', { name: 'Patients', exact: true })
    2) <h3 class="tracking-tight text-sm font-medium">Total Patients</h3> aka getByRole('heading', { name: 'Total Patients' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /patients/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T":
    - list:
      - status [ref=e3]:
        - button "Close toast" [ref=e4] [cursor=pointer]:
          - img [ref=e5]
        - img [ref=e9]
        - generic [ref=e12]: Signed in successfully
  - generic [ref=e13]:
    - img [ref=e14]
    - generic [ref=e16]:
      - strong [ref=e17]: LOCAL ENVIRONMENT
      - text: "- Data entered here may be cleared periodically and should not contain real PHI."
  - generic [ref=e19]:
    - generic [ref=e23]:
      - list [ref=e25]:
        - listitem [ref=e26]:
          - link "The Fetal Clinic The Fetal Clinic" [ref=e27] [cursor=pointer]:
            - /url: /
            - img "The Fetal Clinic" [ref=e29]
            - generic [ref=e30]: The Fetal Clinic
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]: System
          - list [ref=e35]:
            - listitem [ref=e36]:
              - link "Dashboard" [ref=e37] [cursor=pointer]:
                - /url: /
                - img [ref=e38]
                - generic [ref=e41]: Dashboard
        - generic [ref=e42]:
          - generic [ref=e43]: Patient Management
          - list [ref=e45]:
            - listitem [ref=e46]:
              - link "Patients" [ref=e47] [cursor=pointer]:
                - /url: /patients
                - img [ref=e48]
                - generic [ref=e53]: Patients
            - listitem [ref=e54]:
              - link "Appointments" [ref=e55] [cursor=pointer]:
                - /url: /appointments
                - img [ref=e56]
                - generic [ref=e58]: Appointments
            - listitem [ref=e59]:
              - link "Appointment History" [ref=e60] [cursor=pointer]:
                - /url: /appointment-history
                - img [ref=e61]
                - generic [ref=e64]: Appointment History
            - listitem [ref=e65]:
              - link "Patient History" [ref=e66] [cursor=pointer]:
                - /url: /patient-history
                - img [ref=e67]
                - generic [ref=e70]: Patient History
        - generic [ref=e71]:
          - generic [ref=e72]: Clinic Operations
          - list [ref=e74]:
            - listitem [ref=e75]:
              - link "Reception" [ref=e76] [cursor=pointer]:
                - /url: /reception
                - img [ref=e77]
                - generic [ref=e81]: Reception
            - listitem [ref=e82]:
              - link "Consultant" [ref=e83] [cursor=pointer]:
                - /url: /consultant
                - img [ref=e84]
                - generic [ref=e88]: Consultant
            - listitem [ref=e89]:
              - link "Display" [ref=e90] [cursor=pointer]:
                - /url: /display
                - img [ref=e91]
                - generic [ref=e93]: Display
            - listitem [ref=e94]:
              - link "Status Logs" [ref=e95] [cursor=pointer]:
                - /url: /status-logs
                - img [ref=e96]
                - generic [ref=e99]: Status Logs
        - generic [ref=e100]:
          - generic [ref=e101]: Billing & Accounts
          - list [ref=e103]:
            - listitem [ref=e104]:
              - link "Bills" [ref=e105] [cursor=pointer]:
                - /url: /billing
                - img [ref=e106]
                - generic [ref=e109]: Bills
            - listitem [ref=e110]:
              - link "Billing History" [ref=e111] [cursor=pointer]:
                - /url: /billing/history
                - img [ref=e112]
                - generic [ref=e114]: Billing History
            - listitem [ref=e115]:
              - link "Invoice Report" [ref=e116] [cursor=pointer]:
                - /url: /billing/reports
                - img [ref=e117]
                - generic [ref=e120]: Invoice Report
            - listitem [ref=e121]:
              - link "Daily Cash" [ref=e122] [cursor=pointer]:
                - /url: /billing/daily-cash
                - img [ref=e123]
                - generic [ref=e126]: Daily Cash
      - list [ref=e128]:
        - listitem [ref=e129]:
          - separator [ref=e130]
          - button "DP Dr. Pons TFC Admin" [ref=e131] [cursor=pointer]:
            - generic [ref=e133]: DP
            - generic [ref=e134]:
              - generic [ref=e135]: Dr. Pons
              - generic [ref=e136]: TFC Admin
            - img [ref=e137]
      - button "Toggle Sidebar" [ref=e140]
    - main [ref=e141]:
      - generic [ref=e142]:
        - generic [ref=e143]:
          - generic [ref=e144]:
            - button "Toggle Sidebar" [ref=e145] [cursor=pointer]:
              - img
              - generic [ref=e146]: Toggle Sidebar
            - navigation "breadcrumb" [ref=e147]:
              - list [ref=e148]:
                - listitem [ref=e149]:
                  - link "The Fetal Clinic" [ref=e150] [cursor=pointer]:
                    - /url: /
                - listitem [ref=e151]:
                  - img [ref=e152]
                - listitem [ref=e155]:
                  - link "Patients" [disabled] [ref=e156]
          - generic [ref=e159]:
            - generic [ref=e162]:
              - img [ref=e163]
              - searchbox "Search... (Ctrl+K)" [ref=e166]
            - generic [ref=e167]:
              - button "City center" [ref=e168] [cursor=pointer]:
                - img
                - generic [ref=e169]: City center
              - generic [ref=e170]:
                - button "Patients" [ref=e171] [cursor=pointer]:
                  - img
                - button "Appointments" [ref=e172] [cursor=pointer]:
                  - img
                - button "Reception" [ref=e173] [cursor=pointer]:
                  - img
                - button "Consultant" [ref=e174] [cursor=pointer]:
                  - img
                - button "Display" [ref=e175] [cursor=pointer]:
                  - img
                - button "Bills" [ref=e176] [cursor=pointer]:
                  - img
              - button [ref=e178] [cursor=pointer]:
                - img
              - button "Sign Out" [ref=e179] [cursor=pointer]:
                - img
        - main [ref=e180]:
          - generic [ref=e181]:
            - generic [ref=e182]:
              - generic [ref=e183]:
                - heading "Patients" [level=1] [ref=e184]
                - paragraph [ref=e185]: Manage patient records and information
              - button "Add Patient" [ref=e186] [cursor=pointer]:
                - img
                - text: Add Patient
            - generic [ref=e187]:
              - generic [ref=e188]:
                - generic [ref=e189]:
                  - heading "Total Patients" [level=3] [ref=e190]
                  - img [ref=e191]
                - generic [ref=e196]:
                  - generic [ref=e197]: "0"
                  - paragraph [ref=e198]: Active patient records
              - generic [ref=e199]:
                - generic [ref=e200]:
                  - heading "New Today" [level=3] [ref=e201]
                  - img [ref=e202]
                - generic [ref=e204]:
                  - generic [ref=e205]: "0"
                  - paragraph [ref=e206]: Patients added today
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - heading "Contact Methods" [level=3] [ref=e209]
                  - img [ref=e210]
                - generic [ref=e213]:
                  - generic [ref=e214]:
                    - generic [ref=e215]: Phone
                    - generic [ref=e216]: "0"
                  - generic [ref=e217]:
                    - generic [ref=e218]: Email
                    - generic [ref=e219]: "0"
            - generic [ref=e220]:
              - generic [ref=e221]:
                - heading "Patient Directory" [level=3] [ref=e222]
                - paragraph [ref=e223]: Search patients by name, phone number, or email address
              - generic [ref=e225]:
                - generic [ref=e226]:
                  - img [ref=e227]
                  - textbox "Search by name, phone, or email..." [ref=e230]
                - button "New Patient" [ref=e231] [cursor=pointer]:
                  - img
                  - text: New Patient
            - generic [ref=e263]:
              - generic [ref=e264]: Showing 0 to 0 of 0
              - generic [ref=e265]:
                - button "Previous" [disabled]
                - button "Next" [disabled]
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { BasePage } from '../BasePage';
  3  | 
  4  | export class PatientListPage extends BasePage {
  5  |   constructor(page: Page) {
  6  |     super(page);
  7  |   }
  8  | 
  9  |   async goto() {
  10 |     await this.page.goto('/patients');
  11 |   }
  12 | 
  13 |   async expectLoaded() {
> 14 |     await expect(this.page.getByRole('heading', { name: /patients/i })).toBeVisible();
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
  15 |   }
  16 | 
  17 |   async search(query: string) {
  18 |     await this.page.getByPlaceholder(/search/i).fill(query);
  19 |   }
  20 | 
  21 |   async clickAddPatient() {
  22 |     await this.page.getByRole('button', { name: /add patient/i }).click();
  23 |   }
  24 | 
  25 |   async expectPatientInList(name: string) {
  26 |     await expect(this.page.getByText(name)).toBeVisible();
  27 |   }
  28 | }
  29 | 
```