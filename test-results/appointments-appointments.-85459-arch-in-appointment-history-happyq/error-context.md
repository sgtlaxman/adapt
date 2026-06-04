# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: appointments\appointments.e2e.ts >> Appointments — History >> APT-E2E-007: Search in appointment history
- Location: projects\happyq\tests\appointments\appointments.e2e.ts:64:7

# Error details

```
Error: locator.fill: Error: strict mode violation: getByPlaceholder(/search/i) resolved to 2 elements:
    1) <input value="" type="search" placeholder="Search... (Ctrl+K)" class="flex border px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-8 w-full pl-8 text-xs rounded-full bg-gray-50 border-gray-100 focus:bg-white focus:ring-1 focus:ring-primary/2…/> aka getByRole('searchbox', { name: 'Search... (Ctrl+K)' })
    2) <input value="" placeholder="Search by patient name, phone, or token..." class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 border-gray-200 focus:ring-primary/20"/> aka getByRole('textbox', { name: 'Search by patient name, phone' })

Call log:
  - waiting for getByPlaceholder(/search/i)

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
      - list [ref=e101]:
        - listitem [ref=e102]:
          - separator [ref=e103]
          - button "J Julie Receptionist" [ref=e104] [cursor=pointer]:
            - generic [ref=e106]: J
            - generic [ref=e107]:
              - generic [ref=e108]: Julie
              - generic [ref=e109]: Receptionist
            - img [ref=e110]
      - button "Toggle Sidebar" [ref=e113]
    - main [ref=e114]:
      - generic [ref=e115]:
        - generic [ref=e116]:
          - generic [ref=e117]:
            - button "Toggle Sidebar" [ref=e118] [cursor=pointer]:
              - img
              - generic [ref=e119]: Toggle Sidebar
            - navigation "breadcrumb" [ref=e120]:
              - list [ref=e121]:
                - listitem [ref=e122]:
                  - link "The Fetal Clinic" [ref=e123] [cursor=pointer]:
                    - /url: /
                - listitem [ref=e124]:
                  - img [ref=e125]
                - listitem [ref=e128]:
                  - link "Appointment History" [disabled] [ref=e129]
          - generic [ref=e132]:
            - generic [ref=e135]:
              - img [ref=e136]
              - searchbox "Search... (Ctrl+K)" [ref=e139]
            - generic [ref=e140]:
              - button "City center" [ref=e141] [cursor=pointer]:
                - img
                - generic [ref=e142]: City center
              - generic [ref=e143]:
                - button "Patients" [ref=e144] [cursor=pointer]:
                  - img
                - button "Appointments" [ref=e145] [cursor=pointer]:
                  - img
                - button "Reception" [ref=e146] [cursor=pointer]:
                  - img
                - button "Consultant" [ref=e147] [cursor=pointer]:
                  - img
                - button "Display" [ref=e148] [cursor=pointer]:
                  - img
              - button [ref=e150] [cursor=pointer]:
                - img
              - button "Sign Out" [ref=e151] [cursor=pointer]:
                - img
        - main [ref=e152]:
          - generic [ref=e153]:
            - generic [ref=e154]:
              - generic [ref=e155]:
                - heading "Search Appointment" [level=1] [ref=e156]
                - paragraph [ref=e157]: Search and manage all appointments across your clinic
              - generic [ref=e158]:
                - img [ref=e159]
                - generic [ref=e162]: Current Location
            - generic [ref=e163]:
              - heading "Search Filters" [level=3] [ref=e165]:
                - img [ref=e166]
                - text: Search Filters
              - generic [ref=e168]:
                - generic [ref=e169]:
                  - generic [ref=e170]:
                    - img [ref=e171]
                    - textbox "Search by patient name, phone, or token..." [ref=e174]
                  - generic [ref=e175]:
                    - generic [ref=e176]: From
                    - button "May 5, 2026" [ref=e178] [cursor=pointer]:
                      - img
                      - text: May 5, 2026
                  - generic [ref=e179]:
                    - generic [ref=e180]: To
                    - button "Jun 4, 2026" [ref=e182] [cursor=pointer]:
                      - img
                      - text: Jun 4, 2026
                - button "Clear All Filters" [ref=e184] [cursor=pointer]:
                  - img
                  - text: Clear All Filters
            - table [ref=e188]:
              - rowgroup [ref=e189]:
                - row "Date Token Patient Queue / Location Status Actions" [ref=e190]:
                  - columnheader "Date" [ref=e191]
                  - columnheader "Token" [ref=e192]
                  - columnheader "Patient" [ref=e193]
                  - columnheader "Queue / Location" [ref=e194]
                  - columnheader "Status" [ref=e195]
                  - columnheader "Actions" [ref=e196]
              - rowgroup [ref=e197]:
                - row [ref=e198]:
                  - cell [ref=e199]
                  - cell [ref=e201]
                  - cell [ref=e203]
                  - cell [ref=e207]
                  - cell [ref=e211]
                  - cell [ref=e213]
                - row [ref=e215]:
                  - cell [ref=e216]
                  - cell [ref=e218]
                  - cell [ref=e220]
                  - cell [ref=e224]
                  - cell [ref=e228]
                  - cell [ref=e230]
                - row [ref=e232]:
                  - cell [ref=e233]
                  - cell [ref=e235]
                  - cell [ref=e237]
                  - cell [ref=e241]
                  - cell [ref=e245]
                  - cell [ref=e247]
                - row [ref=e249]:
                  - cell [ref=e250]
                  - cell [ref=e252]
                  - cell [ref=e254]
                  - cell [ref=e258]
                  - cell [ref=e262]
                  - cell [ref=e264]
                - row [ref=e266]:
                  - cell [ref=e267]
                  - cell [ref=e269]
                  - cell [ref=e271]
                  - cell [ref=e275]
                  - cell [ref=e279]
                  - cell [ref=e281]
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { BasePage } from '../BasePage';
  3  | 
  4  | export class AppointmentHistoryPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/appointment-history'); }
  8  | 
  9  |   async expectLoaded() {
  10 |     await expect(this.page.getByRole('heading', { name: /appointment/i })).toBeVisible();
  11 |   }
  12 | 
  13 |   async search(query: string) {
> 14 |     await this.page.getByPlaceholder(/search/i).fill(query);
     |                                                 ^ Error: locator.fill: Error: strict mode violation: getByPlaceholder(/search/i) resolved to 2 elements:
  15 |   }
  16 | 
  17 |   async filterByStatus(status: string) {
  18 |     await this.page.getByRole('combobox', { name: /status/i }).click();
  19 |     await this.page.getByText(status).click();
  20 |   }
  21 | 
  22 |   async expectResultsVisible() {
  23 |     await expect(this.page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
  24 |   }
  25 | }
  26 | 
```