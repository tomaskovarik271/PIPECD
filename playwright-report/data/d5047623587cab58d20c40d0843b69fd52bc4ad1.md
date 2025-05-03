# Test info

- Name: CRM Functionality >> should allow creating, viewing, updating, and deleting an organization
- Location: /Users/tomaskovarik/059_PIPECD/PIPECD/e2e/crm.spec.ts:34:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('.chakra-modal__content-container section.chakra-modal__content') to be visible

    at /Users/tomaskovarik/059_PIPECD/PIPECD/e2e/crm.spec.ts:52:16
```

# Page snapshot

```yaml
- region "Notifications-top"
- region "Notifications-top-left"
- region "Notifications-top-right"
- region "Notifications-bottom-left"
- region "Notifications-bottom"
- region "Notifications-bottom-right"
- dialog "Create New Organization":
  - banner: Create New Organization
  - button "Close"
  - group:
    - text: Organization Name
    - textbox "Organization Name"
  - group:
    - text: Address
    - textbox "Address"
  - group:
    - text: Notes
    - textbox "Notes"
  - contentinfo:
    - button "Save Organization"
    - button "Cancel"
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test';
   2 |
   3 | // Helper function to log in
   4 | async function login(page: Page) {
   5 |   const userEmail = 'test-e2e@example.com'; // Use the existing test user
   6 |   const userPassword = 'password123'; // Use the existing test user password
   7 |
   8 |   await page.goto('/');
   9 |   await page.getByLabel('Email address').fill(userEmail);
   10 |   await page.getByLabel('Password').fill(userPassword);
   11 |   await page.getByRole('button', { name: 'Sign in', exact: true }).click();
   12 |   // Wait for main content to load, indicating successful login
   13 |   await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible();
   14 | }
   15 |
   16 | test.describe('CRM Functionality', () => {
   17 |   let page: Page;
   18 |   const orgName = `TestOrg_${Date.now()}`;
   19 |   const orgAddress = '123 Test St';
   20 |   const orgNotes = 'Initial org notes.';
   21 |   const updatedOrgName = `${orgName}_Updated`;
   22 |   const updatedOrgAddress = '456 Updated Ave';
   23 |   const updatedOrgNotes = 'Updated org notes.';
   24 |
   25 |   test.beforeEach(async ({ page: newPage }) => {
   26 |     page = newPage;
   27 |     await login(page);
   28 |   });
   29 |
   30 |   test.afterEach(async () => {
   31 |     // No explicit page.close() needed here, Playwright handles it per test
   32 |   });
   33 |
   34 |   test('should allow creating, viewing, updating, and deleting an organization', async () => {
   35 |     // --- Create Organization ---
   36 |     await page.goto('/organizations');
   37 |     await expect(page).toHaveURL('/organizations');
   38 |     await expect(page.getByRole('heading', { name: 'Organizations' })).toBeVisible({ timeout: 10000 });
   39 |
   40 |     // Click "Create Organization" button - Adjusted Locator Strategy
   41 |     const createButton = page.getByRole('button', { name: /Create New Organization/i }); // Use regex, case-insensitive
   42 |     await expect(createButton).toBeVisible({ timeout: 10000 }); // Wait for VISIBILITY first
   43 |     await expect(createButton).toBeEnabled({ timeout: 5000 }); // Then check if enabled (shorter timeout is fine here)
   44 |     await createButton.click();
   45 |
   46 |     // Add a small pause after clicking
   47 |     await page.waitForTimeout(500); // 500ms pause
   48 |
   49 |     // Fill the form in the modal - Try CSS selector for content
   50 |     const modalContentSelector = '.chakra-modal__content-container section.chakra-modal__content';
   51 |     // const modalSelector = 'div[role="dialog"]'; // Reverted
>  52 |     await page.waitForSelector(modalContentSelector, { state: 'visible', timeout: 15000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
   53 |     
   54 |     // Now that selector is visible, create the locator
   55 |     const modalDialog = page.locator(modalContentSelector);
   56 |
   57 |     // Find heading *within* the dialog
   58 |     const modalHeading = modalDialog.locator('.chakra-modal__header'); // Use class selector for header
   59 |     await expect(modalHeading).toBeVisible({ timeout: 5000 }); 
   60 |     await expect(modalHeading).toHaveText('Create New Organization'); // Verify text content too
   61 |
   62 |     // Now interact with elements inside the modal, also scoped if possible
   63 |     await modalDialog.getByLabel('Name').fill(orgName);
   64 |     await modalDialog.getByLabel('Address').fill(orgAddress);
   65 |     await modalDialog.getByLabel('Notes').fill(orgNotes);
   66 |     await modalDialog.getByRole('button', { name: 'Save Organization' }).click(); // Correct button text from modal component
   67 |
   68 |     // Verify the organization appears in the table
   69 |     await expect(modalDialog).not.toBeVisible(); // Wait for modal to close
   70 |     const row = page.locator(`tr:has-text("${orgName}")`);
   71 |     await expect(row).toBeVisible();
   72 |     await expect(row.getByText(orgAddress)).toBeVisible();
   73 |
   74 |     // --- Update Organization ---
   75 |     await row.getByRole('button', { name: 'Edit' }).click();
   76 |
   77 |     // Locate edit modal dialog using CSS Selector
   78 |     const editModalContentSelector = '.chakra-modal__content-container section.chakra-modal__content';
   79 |     // const editModalSelector = 'div[role="dialog"]'; // Reverted
   80 |     await page.waitForSelector(editModalContentSelector, { state: 'visible', timeout: 10000 });
   81 |     const editModalDialog = page.locator(editModalContentSelector);
   82 |
   83 |     // Fill the form in the modal
   84 |     const editModalHeading = editModalDialog.locator('.chakra-modal__header');
   85 |     await expect(editModalHeading).toBeVisible({ timeout: 5000 });
   86 |     await expect(editModalHeading).toHaveText('Edit Organization');
   87 |
   88 |     await editModalDialog.getByLabel('Name').fill(updatedOrgName);
   89 |     await editModalDialog.getByLabel('Address').fill(updatedOrgAddress);
   90 |     await editModalDialog.getByLabel('Notes').fill(updatedOrgNotes); // Assume notes are editable in the modal too
   91 |     await editModalDialog.getByRole('button', { name: 'Save Changes' }).click();
   92 |
   93 |     // Verify the updated organization appears in the table
   94 |     await expect(editModalDialog).not.toBeVisible(); // Wait for modal to close
   95 |     const updatedRow = page.locator(`tr:has-text("${updatedOrgName}")`);
   96 |     await expect(updatedRow).toBeVisible();
   97 |     await expect(updatedRow.getByText(updatedOrgAddress)).toBeVisible();
   98 |     await expect(page.locator(`tr:has-text("${orgName}")`)).not.toBeVisible(); // Old name gone
   99 |
  100 |     // --- Delete Organization ---
  101 |     // Need to handle confirmation dialog
  102 |     page.once('dialog', dialog => {
  103 |         console.log(`Dialog message: ${dialog.message()}`);
  104 |         expect(dialog.message()).toContain('Are you sure you want to delete');
  105 |         dialog.accept().catch(() => {}); // Accept the dialog
  106 |     });
  107 |
  108 |     await updatedRow.getByRole('button', { name: 'Delete' }).click();
  109 |
  110 |     // Verify the organization is removed from the table
  111 |     await expect(page.locator(`tr:has-text("${updatedOrgName}")`)).not.toBeVisible();
  112 |     // Add a small wait or check for an element that indicates loading is done if needed
  113 |     await page.waitForTimeout(500); // Small delay to ensure DOM updates
  114 |   });
  115 |
  116 |   // --- Placeholder for Person tests ---
  117 |   // test.todo('should allow creating, viewing, updating, and deleting a person');
  118 |   // test.todo('should allow linking a person to an organization');
  119 |
  120 |   // --- Placeholder for Deal tests ---
  121 |   // test.todo('should allow creating, viewing, updating, and deleting a deal');
  122 |   // test.todo('should link a deal to a person');
  123 |
  124 | }); 
```