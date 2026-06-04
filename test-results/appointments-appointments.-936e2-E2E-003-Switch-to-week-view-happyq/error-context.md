# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: appointments\appointments.e2e.ts >> Appointments — Calendar >> APT-E2E-003: Switch to week view
- Location: projects\happyq\tests\appointments\appointments.e2e.ts:27:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /week/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - img [ref=e4]
    - generic [ref=e6]:
      - strong [ref=e7]: LOCAL ENVIRONMENT
      - text: "- Data entered here may be cleared periodically and should not contain real PHI."
  - generic [ref=e9]:
    - generic [ref=e13]:
      - list [ref=e15]:
        - listitem [ref=e16]:
          - link "The Fetal Clinic The Fetal Clinic" [ref=e17] [cursor=pointer]:
            - /url: /
            - img "The Fetal Clinic" [ref=e19]
            - generic [ref=e20]: The Fetal Clinic
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: System
          - list [ref=e25]:
            - listitem [ref=e26]:
              - link "Dashboard" [ref=e27] [cursor=pointer]:
                - /url: /
                - img [ref=e28]
                - generic [ref=e31]: Dashboard
        - generic [ref=e32]:
          - generic [ref=e33]: Patient Management
          - list [ref=e35]:
            - listitem [ref=e36]:
              - link "Patients" [ref=e37] [cursor=pointer]:
                - /url: /patients
                - img [ref=e38]
                - generic [ref=e43]: Patients
            - listitem [ref=e44]:
              - link "Appointments" [ref=e45] [cursor=pointer]:
                - /url: /appointments
                - img [ref=e46]
                - generic [ref=e48]: Appointments
            - listitem [ref=e49]:
              - link "Appointment History" [ref=e50] [cursor=pointer]:
                - /url: /appointment-history
                - img [ref=e51]
                - generic [ref=e54]: Appointment History
            - listitem [ref=e55]:
              - link "Patient History" [ref=e56] [cursor=pointer]:
                - /url: /patient-history
                - img [ref=e57]
                - generic [ref=e60]: Patient History
        - generic [ref=e61]:
          - generic [ref=e62]: Clinic Operations
          - list [ref=e64]:
            - listitem [ref=e65]:
              - link "Reception" [ref=e66] [cursor=pointer]:
                - /url: /reception
                - img [ref=e67]
                - generic [ref=e71]: Reception
            - listitem [ref=e72]:
              - link "Consultant" [ref=e73] [cursor=pointer]:
                - /url: /consultant
                - img [ref=e74]
                - generic [ref=e78]: Consultant
            - listitem [ref=e79]:
              - link "Display" [ref=e80] [cursor=pointer]:
                - /url: /display
                - img [ref=e81]
                - generic [ref=e83]: Display
            - listitem [ref=e84]:
              - link "Status Logs" [ref=e85] [cursor=pointer]:
                - /url: /status-logs
                - img [ref=e86]
                - generic [ref=e89]: Status Logs
      - list [ref=e91]:
        - listitem [ref=e92]:
          - separator [ref=e93]
          - button "J Julie Receptionist" [ref=e94] [cursor=pointer]:
            - generic [ref=e96]: J
            - generic [ref=e97]:
              - generic [ref=e98]: Julie
              - generic [ref=e99]: Receptionist
            - img [ref=e100]
      - button "Toggle Sidebar" [ref=e103]
    - main [ref=e104]:
      - generic [ref=e105]:
        - generic [ref=e106]:
          - generic [ref=e107]:
            - button "Toggle Sidebar" [ref=e108] [cursor=pointer]:
              - img
              - generic [ref=e109]: Toggle Sidebar
            - navigation "breadcrumb" [ref=e110]:
              - list [ref=e111]:
                - listitem [ref=e112]:
                  - link "The Fetal Clinic" [ref=e113] [cursor=pointer]:
                    - /url: /
                - listitem [ref=e114]:
                  - img [ref=e115]
                - listitem [ref=e118]:
                  - link "Appointments" [disabled] [ref=e119]
          - generic [ref=e122]:
            - generic [ref=e125]:
              - img [ref=e126]
              - searchbox "Search... (Ctrl+K)" [ref=e129]
            - generic [ref=e130]:
              - button "City center" [ref=e131] [cursor=pointer]:
                - img
                - generic [ref=e132]: City center
              - generic [ref=e133]:
                - button "Patients" [ref=e134] [cursor=pointer]:
                  - img
                - button "Appointments" [ref=e135] [cursor=pointer]:
                  - img
                - button "Reception" [ref=e136] [cursor=pointer]:
                  - img
                - button "Consultant" [ref=e137] [cursor=pointer]:
                  - img
                - button "Display" [ref=e138] [cursor=pointer]:
                  - img
              - button [ref=e140] [cursor=pointer]:
                - img
              - button "Sign Out" [ref=e141] [cursor=pointer]:
                - img
        - main [ref=e142]:
          - generic [ref=e143]:
            - generic [ref=e145]:
              - generic [ref=e146]:
                - generic [ref=e147]:
                  - button "Jun 4, 2026" [ref=e149] [cursor=pointer]:
                    - img
                    - text: Jun 4, 2026
                  - generic [ref=e150]:
                    - button [ref=e151] [cursor=pointer]:
                      - img
                    - button "Today" [ref=e152] [cursor=pointer]
                    - button [ref=e153] [cursor=pointer]:
                      - img
                - generic [ref=e154]:
                  - button "Book Appointment" [ref=e155] [cursor=pointer]:
                    - img
                    - generic [ref=e156]: Book Appointment
                  - generic [ref=e161] [cursor=pointer]: "Active: 5"
              - generic [ref=e162]:
                - generic [ref=e163]:
                  - img [ref=e164]
                  - textbox "Search by name or phone..." [ref=e167]
                - generic [ref=e168]:
                  - combobox [ref=e170] [cursor=pointer]:
                    - generic: All Queues
                    - img [ref=e171]
                  - combobox [ref=e174] [cursor=pointer]:
                    - generic: All Statuses
                    - img [ref=e175]
            - generic [ref=e179]:
              - generic [ref=e180]: Time
              - generic [ref=e182]: IS
              - generic [ref=e185]: KHN
              - generic [ref=e188]: RL
              - generic [ref=e191]: SH
              - generic [ref=e194]: SR
              - generic [ref=e197]: SS
              - generic [ref=e199]:
                - generic [ref=e200]: 8:00 AM
                - generic [ref=e203] [cursor=pointer]:
                  - generic [ref=e204]:
                    - generic [ref=e205]: "#1"
                    - generic [ref=e206]: Jayapiya
                    - generic [ref=e207]: 8:00 AM
                  - img [ref=e209]
                - img [ref=e213] [cursor=pointer]
                - generic [ref=e216] [cursor=pointer]:
                  - generic [ref=e217]:
                    - generic [ref=e218]: "#2"
                    - generic [ref=e219]: Vidhya
                    - generic [ref=e220]: 8:00 AM
                  - img [ref=e222]
                - img [ref=e226] [cursor=pointer]
                - img [ref=e230] [cursor=pointer]
                - img [ref=e234] [cursor=pointer]
              - generic [ref=e235]:
                - generic [ref=e236]: 8:30 AM
                - img [ref=e240] [cursor=pointer]
                - img [ref=e244] [cursor=pointer]
                - img [ref=e248] [cursor=pointer]
                - img [ref=e252] [cursor=pointer]
                - img [ref=e256] [cursor=pointer]
                - img [ref=e260] [cursor=pointer]
              - generic [ref=e261]:
                - generic [ref=e262]: 9:00 AM
                - img [ref=e266] [cursor=pointer]
                - img [ref=e270] [cursor=pointer]
                - img [ref=e274] [cursor=pointer]
                - img [ref=e278] [cursor=pointer]
                - img [ref=e282] [cursor=pointer]
                - img [ref=e286] [cursor=pointer]
              - generic [ref=e287]:
                - generic [ref=e288]: 9:30 AM
                - img [ref=e292] [cursor=pointer]
                - img [ref=e296] [cursor=pointer]
                - img [ref=e300] [cursor=pointer]
                - img [ref=e304] [cursor=pointer]
                - img [ref=e308] [cursor=pointer]
                - img [ref=e312] [cursor=pointer]
              - generic [ref=e313]:
                - generic [ref=e314]: 10:00 AM
                - img [ref=e318] [cursor=pointer]
                - generic [ref=e321] [cursor=pointer]:
                  - generic [ref=e322]:
                    - generic [ref=e323]: "#1"
                    - generic [ref=e324]: Mahesh
                    - generic [ref=e325]: 10:00 AM
                  - img [ref=e327]
                - generic [ref=e330] [cursor=pointer]:
                  - generic [ref=e331]:
                    - generic [ref=e332]: "#1"
                    - generic [ref=e333]: Ramya
                    - generic [ref=e334]: 10:00 AM
                  - img [ref=e336]
                - generic [ref=e339] [cursor=pointer]:
                  - generic [ref=e340]:
                    - generic [ref=e341]: "#1"
                    - generic [ref=e342]: Ishwarya
                    - generic [ref=e343]: 10:00 AM
                  - img [ref=e345]
                - img [ref=e349] [cursor=pointer]
                - img [ref=e353] [cursor=pointer]
              - generic [ref=e354]:
                - generic [ref=e355]: 10:30 AM
                - img [ref=e359] [cursor=pointer]
                - img [ref=e363] [cursor=pointer]
                - img [ref=e367] [cursor=pointer]
                - img [ref=e371] [cursor=pointer]
                - img [ref=e375] [cursor=pointer]
                - img [ref=e379] [cursor=pointer]
              - generic [ref=e380]:
                - generic [ref=e381]: 11:00 AM
                - img [ref=e385] [cursor=pointer]
                - img [ref=e389] [cursor=pointer]
                - img [ref=e393] [cursor=pointer]
                - img [ref=e397] [cursor=pointer]
                - img [ref=e401] [cursor=pointer]
                - img [ref=e405] [cursor=pointer]
              - generic [ref=e406]:
                - generic [ref=e407]: 11:30 AM
                - img [ref=e411] [cursor=pointer]
                - img [ref=e415] [cursor=pointer]
                - img [ref=e419] [cursor=pointer]
                - img [ref=e423] [cursor=pointer]
                - img [ref=e427] [cursor=pointer]
                - img [ref=e431] [cursor=pointer]
              - generic [ref=e432]:
                - generic [ref=e433]: 12:00 PM
                - img [ref=e437] [cursor=pointer]
                - img [ref=e441] [cursor=pointer]
                - img [ref=e445] [cursor=pointer]
                - img [ref=e449] [cursor=pointer]
                - img [ref=e453] [cursor=pointer]
                - img [ref=e457] [cursor=pointer]
              - generic [ref=e458]:
                - generic [ref=e459]: 12:30 PM
                - img [ref=e463] [cursor=pointer]
                - img [ref=e467] [cursor=pointer]
                - img [ref=e471] [cursor=pointer]
                - img [ref=e475] [cursor=pointer]
                - img [ref=e479] [cursor=pointer]
                - img [ref=e483] [cursor=pointer]
              - generic [ref=e484]:
                - generic [ref=e485]: 1:00 PM
                - img [ref=e489] [cursor=pointer]
                - img [ref=e493] [cursor=pointer]
                - img [ref=e497] [cursor=pointer]
                - img [ref=e501] [cursor=pointer]
                - img [ref=e505] [cursor=pointer]
                - img [ref=e509] [cursor=pointer]
              - generic [ref=e510]:
                - generic [ref=e511]: 1:30 PM
                - img [ref=e515] [cursor=pointer]
                - img [ref=e519] [cursor=pointer]
                - img [ref=e523] [cursor=pointer]
                - img [ref=e527] [cursor=pointer]
                - img [ref=e531] [cursor=pointer]
                - img [ref=e535] [cursor=pointer]
              - generic [ref=e536]:
                - generic [ref=e537]: 2:00 PM
                - img [ref=e541] [cursor=pointer]
                - img [ref=e545] [cursor=pointer]
                - img [ref=e549] [cursor=pointer]
                - img [ref=e553] [cursor=pointer]
                - img [ref=e557] [cursor=pointer]
                - img [ref=e561] [cursor=pointer]
              - generic [ref=e562]:
                - generic [ref=e563]: 2:30 PM
                - img [ref=e567] [cursor=pointer]
                - img [ref=e571] [cursor=pointer]
                - img [ref=e575] [cursor=pointer]
                - img [ref=e579] [cursor=pointer]
                - img [ref=e583] [cursor=pointer]
                - img [ref=e587] [cursor=pointer]
              - generic [ref=e588]:
                - generic [ref=e589]: 3:00 PM
                - img [ref=e593] [cursor=pointer]
                - img [ref=e597] [cursor=pointer]
                - img [ref=e601] [cursor=pointer]
                - img [ref=e605] [cursor=pointer]
                - img [ref=e609] [cursor=pointer]
                - img [ref=e613] [cursor=pointer]
              - generic [ref=e614]:
                - generic [ref=e615]: 3:30 PM
                - img [ref=e619] [cursor=pointer]
                - img [ref=e623] [cursor=pointer]
                - img [ref=e627] [cursor=pointer]
                - img [ref=e631] [cursor=pointer]
                - img [ref=e635] [cursor=pointer]
                - img [ref=e639] [cursor=pointer]
              - generic [ref=e640]:
                - generic [ref=e641]: 4:00 PM
                - img [ref=e645] [cursor=pointer]
                - img [ref=e649] [cursor=pointer]
                - img [ref=e653] [cursor=pointer]
                - img [ref=e657] [cursor=pointer]
                - img [ref=e661] [cursor=pointer]
                - img [ref=e665] [cursor=pointer]
              - generic [ref=e666]:
                - generic [ref=e667]: 4:30 PM
                - img [ref=e671] [cursor=pointer]
                - img [ref=e675] [cursor=pointer]
                - img [ref=e679] [cursor=pointer]
                - img [ref=e683] [cursor=pointer]
                - img [ref=e687] [cursor=pointer]
                - img [ref=e691] [cursor=pointer]
              - generic [ref=e692]:
                - generic [ref=e693]: 5:00 PM
                - img [ref=e697] [cursor=pointer]
                - img [ref=e701] [cursor=pointer]
                - img [ref=e705] [cursor=pointer]
                - img [ref=e709] [cursor=pointer]
                - img [ref=e713] [cursor=pointer]
                - img [ref=e717] [cursor=pointer]
              - generic [ref=e718]:
                - generic [ref=e719]: 5:30 PM
                - img [ref=e723] [cursor=pointer]
                - img [ref=e727] [cursor=pointer]
                - img [ref=e731] [cursor=pointer]
                - img [ref=e735] [cursor=pointer]
                - img [ref=e739] [cursor=pointer]
                - img [ref=e743] [cursor=pointer]
              - generic [ref=e744]:
                - generic [ref=e745]: 6:00 PM
                - img [ref=e749] [cursor=pointer]
                - img [ref=e753] [cursor=pointer]
                - img [ref=e757] [cursor=pointer]
                - img [ref=e761] [cursor=pointer]
                - img [ref=e765] [cursor=pointer]
                - img [ref=e769] [cursor=pointer]
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { BasePage } from '../BasePage';
  3  | 
  4  | export class AppointmentsPage extends BasePage {
  5  |   constructor(page: Page) { super(page); }
  6  | 
  7  |   async goto() { await this.page.goto('/appointments'); }
  8  | 
  9  |   async expectLoaded() {
  10 |     await expect(this.page.locator('[data-testid="calendar"], .calendar-grid, [class*="calendar"]').first()).toBeVisible({ timeout: 10000 });
  11 |   }
  12 | 
  13 |   async selectView(view: 'day' | 'week' | 'compact') {
> 14 |     await this.page.getByRole('button', { name: new RegExp(view, 'i') }).click();
     |                                                                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  15 |   }
  16 | 
  17 |   async clickToday() {
  18 |     await this.page.getByRole('button', { name: /today/i }).click();
  19 |   }
  20 | 
  21 |   async filterByQueue(queueName: string) {
  22 |     await this.page.getByRole('combobox').first().click();
  23 |     await this.page.getByText(queueName).click();
  24 |   }
  25 | 
  26 |   async search(query: string) {
  27 |     await this.page.getByPlaceholder(/search/i).fill(query);
  28 |   }
  29 | 
  30 |   async clickBookAppointment() {
  31 |     await this.page.getByRole('button', { name: /book appointment/i }).click();
  32 |   }
  33 | }
  34 | 
```