# Test info

- Name: Activity CRUD Operations >> should allow creating a new activity linked to a person
- Location: /Users/tomaskovarik/059_PIPECD/PIPECD/e2e/activity-crud.spec.ts:134:7

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeEnabled()

Locator: getByRole('dialog', { name: 'Create New Activity' }).getByPlaceholder('Select Person')
Expected: enabled
Received: <element(s) not found>
Call log:
  - expect.toBeEnabled with timeout 10000ms
  - waiting for getByRole('dialog', { name: 'Create New Activity' }).getByPlaceholder('Select Person')

    at createActivityViaUI (/Users/tomaskovarik/059_PIPECD/PIPECD/e2e/activity-crud.spec.ts:86:39)
    at /Users/tomaskovarik/059_PIPECD/PIPECD/e2e/activity-crud.spec.ts:155:5
```

# Page snapshot

```yaml
- region "Notifications-top"
- region "Notifications-top-left"
- region "Notifications-top-right"
- region "Notifications-bottom-left"
- region "Notifications-bottom"
- region "Notifications-bottom-right"
- dialog "Create New Activity":
  - banner: Create New Activity
  - button "Close"
  - group:
    - text: Subject
    - textbox "Subject": Test Activity Subject 1746955783631
  - group:
    - text: Type
    - combobox "Type":
      - option "TASK" [selected]
      - option "MEETING"
      - option "CALL"
      - option "EMAIL"
      - option "DEADLINE"
  - group:
    - text: Due Date/Time
    - textbox "Due Date/Time": 2025-05-18T11:29
  - group:
    - text: Linked To
    - radiogroup:
      - radio "Deal"
      - text: Deal
      - radio "Person" [checked]
      - text: Person
      - radio "Organization"
      - text: Organization
      - radio "None" [disabled]
      - text: None
    - combobox:
      - option "Select Person" [selected]
      - option "TestPersonLink 1746955782528 User"
      - option "TestPersonLink 1746955517272 User"
      - option "TestPersonLink 1746955293207 User"
      - option "TestPersonLink 1746955112333 User"
      - option "TestPersonLink 1746954932005 User"
      - option "TestPersonLink 1746954822282 User"
      - option "TestPersonLink 1746954749722 User"
      - option "TestPersonLink 1746954647182 User"
      - option "TestPersonOrgFirst 1746953385084 TestPersonOrgLast 1746953385084"
      - option "TestPersonFirst 1746953383908 TestPersonLast 1746953383908"
      - option "TestEditFirstNew 1746953384895 TestEditLastNew 1746953384895"
      - option "TestPersonViewFirst 1746953383876 TestPersonViewLast 1746953383876"
      - option "TestPersonViewFirst 1746952305051 TestPersonViewLast 1746952305051"
      - option "TestPersonFirst 1746952305050 TestPersonLast 1746952305050"
      - option "TestDeleteFirst 1746952305051 TestDeleteLast 1746952305051"
      - option "TestEditFirstNew 1746952305987 TestEditLastNew 1746952305987"
      - option "TestPersonFirst 1746952207475 TestPersonLast 1746952207475"
      - option "TestPersonViewFirst 1746952207476 TestPersonViewLast 1746952207476"
      - option "TestEditFirstNew 1746952208464 TestEditLastNew 1746952208464"
      - option "TestDeleteFirst 1746952207245 TestDeleteLast 1746952207245"
      - option "TestPersonFirst 1746952179786 TestPersonLast 1746952179786"
      - option "TestPersonViewFirst 1746952179788 TestPersonViewLast 1746952179788"
      - option "TestEditFirstNew 1746952180345 TestEditLastNew 1746952180345"
      - option "TestPersonFirst 1746952153567 TestPersonLast 1746952153567"
      - option "TestPersonViewFirst 1746952153773 TestPersonViewLast 1746952153773"
      - option "TestPersonFirst 1746952128704 TestPersonLast 1746952128704"
      - option "area are"
      - option "herec dobry"
      - option "Jyn Ymr"
      - option "Jun Umr"
      - option "Jen Emr"
      - option "Jon Omr"
      - option "Jan Amr"
  - group:
    - text: Notes
    - textbox "Notes"
  - group:
    - checkbox "Mark as Done"
    - text: Mark as Done
  - button "Create Activity"
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test';
   2 |
   3 | // Helper function for login
   4 | async function login(page: Page) {
   5 |   const userEmail = process.env.ADMIN_TEST_USER_EMAIL;
   6 |   const userPassword = process.env.ADMIN_TEST_USER_PASSWORD;
   7 |
   8 |   if (!userEmail || !userPassword) {
   9 |     throw new Error('ADMIN_TEST_USER_EMAIL or ADMIN_TEST_USER_PASSWORD environment variables not set.');
   10 |   }
   11 |
   12 |   await page.goto('/');
   13 |   await page.getByLabel('Email address').fill(userEmail);
   14 |   await page.getByLabel('Password').fill(userPassword);
   15 |   await page.getByRole('button', { name: 'Sign in', exact: true }).click();
   16 |   await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible({ timeout: 10000 });
   17 | }
   18 |
   19 | // Helper function to create a person via UI (copied and adapted from people-crud.spec.ts)
   20 | async function createPersonForLinking(
   21 |   page: Page,
   22 |   personDetails: {
   23 |     firstName: string;
   24 |     lastName: string;
   25 |     email: string;
   26 |   },
   27 | ): Promise<{ fullName: string, email: string }> {
   28 |   await page.goto('/people'); // Navigate to people page
   29 |   await page.getByRole('button', { name: 'New Person' }).click();
   30 |
   31 |   const modal = page.getByRole('dialog', { name: 'Create New Person' });
   32 |   await expect(modal).toBeVisible({ timeout: 5000 });
   33 |
   34 |   await modal.getByLabel('First Name').fill(personDetails.firstName);
   35 |   await modal.getByLabel('Last Name').fill(personDetails.lastName);
   36 |   await modal.getByLabel('Email').fill(personDetails.email);
   37 |   
   38 |   await modal.getByRole('button', { name: 'Save Person' }).click();
   39 |
   40 |   await expect(page.getByText('Person Created')).toBeVisible({ timeout: 10000 });
   41 |   await expect(modal).not.toBeVisible({ timeout: 5000 });
   42 |   
   43 |   // Navigate back to activities page before returning
   44 |   await page.goto('/activities');
   45 |   await expect(page.getByRole('heading', { name: /Activities/i })).toBeVisible({ timeout: 10000 });
   46 |
   47 |   return { 
   48 |     fullName: `${personDetails.firstName} ${personDetails.lastName}`, 
   49 |     email: personDetails.email 
   50 |   };
   51 | }
   52 |
   53 | // Helper function to create an activity via UI
   54 | async function createActivityViaUI(
   55 |   page: Page,
   56 |   activityDetails: {
   57 |     type: 'TASK' | 'MEETING' | 'CALL' | 'EMAIL' | 'DEADLINE'; // Valid ActivityType values
   58 |     subject: string;
   59 |     dueDate?: string; // Format 'YYYY-MM-DDTHH:MM' for datetime-local
   60 |     notes?: string;
   61 |     linkedPersonName?: string; // Full name of the person to link
   62 |     // TODO: Add linkedDealName / linkedOrgName if needed
   63 |   },
   64 | ) {
   65 |   await page.getByRole('button', { name: 'New Activity' }).click();
   66 |
   67 |   const modal = page.getByRole('dialog', { name: 'Create New Activity' });
   68 |   await expect(modal).toBeVisible({ timeout: 5000 });
   69 |
   70 |   await modal.getByLabel('Type').selectOption({ label: activityDetails.type });
   71 |   await modal.getByLabel('Subject').fill(activityDetails.subject);
   72 |
   73 |   if (activityDetails.dueDate) {
   74 |     await modal.getByLabel('Due Date/Time').fill(activityDetails.dueDate);
   75 |   }
   76 |
   77 |   if (activityDetails.linkedPersonName) {
   78 |     // Click the visible label/text of the radio button
   79 |     await modal.getByText('Person', { exact: true }).click(); 
   80 |     
   81 |     const personSelectLocator = modal.getByPlaceholder('Select Person');
   82 |     
   83 |     // 1. Wait for the select element to be enabled.
   84 |     //    This ensures it's rendered due to selectedLinkType === 'person'
   85 |     //    and not disabled by isLoadingLinks.
>  86 |     await expect(personSelectLocator).toBeEnabled({ timeout: 10000 }); // Generous timeout
      |                                       ^ Error: Timed out 10000ms waiting for expect(locator).toBeEnabled()
   87 |
   88 |     // 2. Directly attempt to select the option.
   89 |     //    Playwright's selectOption action will wait for the option with the given label 
   90 |     //    to exist within the select and be interactable.
   91 |     await personSelectLocator.selectOption({ label: activityDetails.linkedPersonName });
   92 |   } else {
   93 |     // Default link or handle error - for now, assume a link is always provided by test
   94 |     // Based on CreateActivityForm, a link is required.
   95 |     console.warn('No linked person provided for activity creation in E2E test. This might fail.');
   96 |     // For a robust test, we should ensure one link type is always chosen.
   97 |     // For now, this test will rely on linkedPersonName being passed.
   98 |   }
   99 |
  100 |   if (activityDetails.notes) {
  101 |     await modal.getByLabel('Notes').fill(activityDetails.notes);
  102 |   }
  103 |
  104 |   await modal.getByRole('button', { name: 'Create Activity' }).click();
  105 |
  106 |   await expect(page.getByText('Activity created.')).toBeVisible({ timeout: 10000 }); // Note: lowercase 'created.'
  107 |   await expect(modal).not.toBeVisible({ timeout: 5000 });
  108 | }
  109 |
  110 | test.describe('Activity CRUD Operations', () => {
  111 |   let page: Page;
  112 |
  113 |   test.beforeAll(async ({ browser }) => {
  114 |     page = await browser.newPage();
  115 |     await login(page);
  116 |   });
  117 |
  118 |   test.beforeEach(async () => {
  119 |     // Navigation to /activities is handled by createPersonForLinking if used,
  120 |     // or needs to be here if a test doesn't start by creating a person.
  121 |     // For the first test, createPersonForLinking will navigate us back.
  122 |     // For subsequent tests (edit/delete), ensure we are on /activities.
  123 |     if (!page.url().includes('/activities')) { // Check if already on activities page
  124 |         await page.goto('/activities');
  125 |     }
  126 |     // Ensure the heading is visible as a sanity check for page load
  127 |     await expect(page.getByRole('heading', { name: /Activities/i })).toBeVisible({ timeout: 10000 });
  128 |   });
  129 |
  130 |   test.afterAll(async () => {
  131 |     await page.close();
  132 |   });
  133 |
  134 |   test('should allow creating a new activity linked to a person', async () => {
  135 |     const personFirstName = `TestPersonLink ${Date.now()}`;
  136 |     const personLastName = `User`;
  137 |     const personEmail = `test.person.link.${Date.now()}@example.com`;
  138 |
  139 |     // 1. Create a person to link to
  140 |     const linkedPerson = await createPersonForLinking(page, {
  141 |         firstName: personFirstName,
  142 |         lastName: personLastName,
  143 |         email: personEmail,
  144 |     });
  145 |     // createPersonForLinking will navigate back to /activities
  146 |
  147 |     const activitySubject = `Test Activity Subject ${Date.now()}`;
  148 |     const activityType = 'TASK'; 
  149 |     const activityDueDate = new Date(); // Current date and time
  150 |     activityDueDate.setDate(activityDueDate.getDate() + 7); // Set due date to 7 days from now
  151 |     // Format for datetime-local: YYYY-MM-DDTHH:MM
  152 |     const formattedDueDate = `${activityDueDate.getFullYear()}-${String(activityDueDate.getMonth() + 1).padStart(2, '0')}-${String(activityDueDate.getDate()).padStart(2, '0')}T${String(activityDueDate.getHours()).padStart(2, '0')}:${String(activityDueDate.getMinutes()).padStart(2, '0')}`;
  153 |
  154 |
  155 |     await createActivityViaUI(page, {
  156 |       type: activityType,
  157 |       subject: activitySubject,
  158 |       notes: 'This is a test activity linked to a person.',
  159 |       dueDate: formattedDueDate,
  160 |       linkedPersonName: linkedPerson.fullName,
  161 |     });
  162 |
  163 |     // Verify the activity is in the list
  164 |     // More robust: find row by subject, then check other cells in that row.
  165 |     const activityRow = page.locator('tr', { has: page.getByText(activitySubject) });
  166 |     await expect(activityRow).toBeVisible({ timeout: 10000 });
  167 |     await expect(activityRow.getByText(linkedPerson.fullName, { exact: false })).toBeVisible(); // Check if person name is in the row
  168 |     await expect(activityRow.getByText(activityType)).toBeVisible();
  169 |   });
  170 |
  171 |   // TODO: Add tests for displaying details, editing, and deleting activities
  172 | }); 
```