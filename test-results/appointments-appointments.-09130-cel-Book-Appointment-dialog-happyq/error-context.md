# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: appointments\appointments.e2e.ts >> Appointments — Book Appointment >> APT-E2E-005: Cancel Book Appointment dialog
- Location: projects\happyq\tests\appointments\appointments.e2e.ts:45:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: /close/i }) resolved to 3 elements:
    1) <button data-disabled="false" aria-label="Close toast" data-close-button="true" class="group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:hover:bg-muted">…</button> aka getByRole('button', { name: 'Close toast' })
    2) <button type="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Close</button> aka locator('form').getByRole('button', { name: 'Close' })
    3) <button type="button" class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">…</button> aka getByRole('button', { name: 'Close' }).nth(2)

Call log:
  - waiting for getByRole('button', { name: /close/i })

```

# Page snapshot

```yaml
- generic:
  - generic:
    - region "Notifications alt+T":
      - list:
        - status:
          - button "Close toast":
            - img
          - generic:
            - img
          - generic:
            - generic: Signed in successfully
    - generic:
      - img
      - generic:
        - strong: LOCAL ENVIRONMENT
        - text: "- Data entered here may be cleared periodically and should not contain real PHI."
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - generic:
                - list:
                  - listitem:
                    - link:
                      - /url: /
                      - generic:
                        - img
                      - generic: The Fetal Clinic
              - generic:
                - generic:
                  - generic: System
                  - generic:
                    - list:
                      - listitem:
                        - link:
                          - /url: /
                          - img
                          - generic: Dashboard
                - generic:
                  - generic: Patient Management
                  - generic:
                    - list:
                      - listitem:
                        - link:
                          - /url: /patients
                          - img
                          - generic: Patients
                      - listitem:
                        - link:
                          - /url: /appointments
                          - img
                          - generic: Appointments
                      - listitem:
                        - link:
                          - /url: /appointment-history
                          - img
                          - generic: Appointment History
                      - listitem:
                        - link:
                          - /url: /patient-history
                          - img
                          - generic: Patient History
                - generic:
                  - generic: Clinic Operations
                  - generic:
                    - list:
                      - listitem:
                        - link:
                          - /url: /reception
                          - img
                          - generic: Reception
                      - listitem:
                        - link:
                          - /url: /consultant
                          - img
                          - generic: Consultant
                      - listitem:
                        - link:
                          - /url: /display
                          - img
                          - generic: Display
                      - listitem:
                        - link:
                          - /url: /status-logs
                          - img
                          - generic: Status Logs
              - generic:
                - list:
                  - listitem:
                    - separator
                    - button:
                      - generic:
                        - generic: J
                      - generic:
                        - generic: Julie
                        - generic: Receptionist
                      - img
              - button
        - main:
          - generic:
            - generic:
              - generic:
                - button:
                  - img
                  - generic: Toggle Sidebar
                - navigation:
                  - list:
                    - listitem:
                      - link:
                        - /url: /
                        - text: The Fetal Clinic
                    - listitem:
                      - img
                    - generic:
                      - listitem:
                        - link [disabled]: Appointments
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic:
                          - img
                          - searchbox
                    - generic:
                      - button:
                        - img
                        - generic: City center
                      - generic:
                        - button:
                          - img
                        - button:
                          - img
                        - button:
                          - img
                        - button:
                          - img
                        - button:
                          - img
                      - generic:
                        - button:
                          - img
                      - button:
                        - img
            - main:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic:
                          - button:
                            - img
                            - text: Jun 4, 2026
                        - generic:
                          - button:
                            - img
                          - button: Today
                          - button:
                            - img
                      - generic:
                        - button:
                          - img
                          - generic: Book Appointment
                        - generic:
                          - generic: "Active: 5"
                    - generic:
                      - generic:
                        - img
                        - textbox:
                          - /placeholder: Search by name or phone...
                      - generic:
                        - generic:
                          - combobox:
                            - generic: All Queues
                            - img
                        - generic:
                          - combobox:
                            - generic: All Statuses
                            - img
                - generic:
                  - generic:
                    - generic:
                      - generic: Time
                      - generic:
                        - generic: IS
                      - generic:
                        - generic: KHN
                      - generic:
                        - generic: RL
                      - generic:
                        - generic: SH
                      - generic:
                        - generic: SR
                      - generic:
                        - generic: SS
                      - generic:
                        - generic: 8:00 AM
                        - generic:
                          - generic:
                            - generic:
                              - generic: "#1"
                              - generic: Jayapiya
                              - generic: 8:00 AM
                            - generic:
                              - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - generic:
                              - generic: "#2"
                              - generic: Vidhya
                              - generic: 8:00 AM
                            - generic:
                              - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 8:30 AM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 9:00 AM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 9:30 AM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 10:00 AM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - generic:
                              - generic: "#1"
                              - generic: Mahesh
                              - generic: 10:00 AM
                            - generic:
                              - img
                        - generic:
                          - generic:
                            - generic:
                              - generic: "#1"
                              - generic: Ramya
                              - generic: 10:00 AM
                            - generic:
                              - img
                        - generic:
                          - generic:
                            - generic:
                              - generic: "#1"
                              - generic: Ishwarya
                              - generic: 10:00 AM
                            - generic:
                              - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 10:30 AM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 11:00 AM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 11:30 AM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 12:00 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 12:30 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 1:00 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 1:30 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 2:00 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 2:30 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 3:00 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 3:30 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 4:00 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 4:30 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 5:00 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 5:30 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                      - generic:
                        - generic: 6:00 PM
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
                        - generic:
                          - generic:
                            - img
  - dialog "Book Appointment" [ref=e2]:
    - heading "Book Appointment" [level=2] [ref=e4]
    - generic [ref=e5]:
      - generic [ref=e6]:
        - text: Date & Time
        - generic [ref=e7]:
          - generic [ref=e8]:
            - generic [ref=e9]: Date
            - generic [ref=e10]:
              - button "Jun 4, 2026" [disabled]:
                - img
                - text: Jun 4, 2026
            - paragraph [ref=e11]: Date can be changed in the previous screen
          - generic [ref=e12]:
            - generic [ref=e13]: Time
            - combobox [active] [ref=e14] [cursor=pointer]:
              - generic [ref=e15]: 9:00 AM
              - img
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: Patient
          - button "New Patient" [ref=e19] [cursor=pointer]:
            - img
            - text: New Patient
        - combobox [ref=e20] [cursor=pointer]:
          - generic [ref=e21]: Select patient
          - img
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]: Queue
          - combobox [ref=e25] [cursor=pointer]:
            - generic: Select queue
            - img [ref=e26]
          - combobox [ref=e28]
        - generic [ref=e29]:
          - generic [ref=e30]: Visit Purpose
          - combobox [ref=e31] [cursor=pointer]:
            - generic [ref=e32]: Select visit purpose
            - img
      - generic [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35]: Status
          - combobox [ref=e36] [cursor=pointer]:
            - generic: Booked
            - img [ref=e37]
          - combobox [ref=e39]
        - generic [ref=e40]:
          - generic [ref=e41]: Notification Method
          - radiogroup [ref=e42]:
            - generic [ref=e43] [cursor=pointer]:
              - radio "None" [ref=e44]
              - radio
              - generic [ref=e45]: None
            - generic [ref=e46] [cursor=pointer]:
              - radio "SMS" [checked] [ref=e47]:
                - img [ref=e49]
              - radio [checked]
              - generic [ref=e51]:
                - img [ref=e52]
                - text: SMS
            - generic [ref=e54] [cursor=pointer]:
              - radio "WhatsApp" [ref=e55]
              - radio
              - generic [ref=e56]:
                - img [ref=e57]
                - text: WhatsApp
      - generic [ref=e59]:
        - text: Remarks (Optional)
        - textbox "Remarks (Optional)" [ref=e60]:
          - /placeholder: Referring doctor, Any additional notes
      - generic [ref=e61]:
        - button "Close" [ref=e62] [cursor=pointer]
        - button "Book Appointment" [disabled]
    - button "Close" [ref=e63] [cursor=pointer]:
      - img [ref=e64]
      - generic [ref=e67]: Close
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | export interface BookAppointmentData {
  4  |   patientName?: string;       // search existing patient
  5  |   queue: string;
  6  |   visitPurpose?: string;
  7  |   time?: string;
  8  |   status?: string;
  9  |   remarks?: string;
  10 |   notificationMethod?: 'None' | 'SMS' | 'WhatsApp';
  11 |   // New patient fields (if not selecting existing)
  12 |   newPatientName?: string;
  13 |   newPatientPhone?: string;
  14 |   newPatientAge?: string;
  15 |   newPatientGender?: 'Male' | 'Female' | 'Other';
  16 | }
  17 | 
  18 | /**
  19 |  * Handles the Book Appointment / Edit Appointment modal dialog.
  20 |  * Used from: Appointments page, Calendar view.
  21 |  */
  22 | export class BookAppointmentDialog {
  23 |   constructor(private page: Page) {}
  24 | 
  25 |   async expectOpen() {
  26 |     await expect(this.page.getByRole('dialog').getByRole('heading', { name: /book appointment|update appointment/i })).toBeVisible();
  27 |   }
  28 | 
  29 |   async selectExistingPatient(name: string) {
  30 |     await this.page.getByRole('combobox', { name: /patient/i }).fill(name);
  31 |     await this.page.getByRole('option', { name: new RegExp(name, 'i') }).first().click();
  32 |   }
  33 | 
  34 |   async selectQueue(queue: string) {
  35 |     await this.page.getByRole('combobox', { name: /queue/i }).click();
  36 |     await this.page.getByRole('option', { name: queue }).click();
  37 |   }
  38 | 
  39 |   async selectVisitPurpose(purpose: string) {
  40 |     await this.page.getByRole('combobox', { name: /visit purpose/i }).fill(purpose);
  41 |     await this.page.getByRole('option', { name: new RegExp(purpose, 'i') }).first().click();
  42 |   }
  43 | 
  44 |   async setTime(time: string) {
  45 |     await this.page.getByRole('combobox', { name: /time/i }).fill(time);
  46 |   }
  47 | 
  48 |   async setRemarks(remarks: string) {
  49 |     await this.page.getByLabel(/remarks/i).fill(remarks);
  50 |   }
  51 | 
  52 |   async setNotificationMethod(method: 'None' | 'SMS' | 'WhatsApp') {
  53 |     await this.page.getByRole('radio', { name: method }).click();
  54 |   }
  55 | 
  56 |   async submit() {
  57 |     await this.page.getByRole('button', { name: /book appointment|update appointment/i }).click();
  58 |   }
  59 | 
  60 |   async cancel() {
> 61 |     await this.page.getByRole('button', { name: /close/i }).click();
     |                                                             ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: /close/i }) resolved to 3 elements:
  62 |   }
  63 | 
  64 |   async expectClosed() {
  65 |     await expect(this.page.getByRole('dialog')).not.toBeVisible();
  66 |   }
  67 | }
  68 | 
```