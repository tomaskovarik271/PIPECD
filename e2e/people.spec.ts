import { test, expect, Page } from '@playwright/test';

// Helper function for login (similar to auth.spec.ts)
async function login(page: Page) {
  const userEmail = process.env.TEST_USER_EMAIL;
  const userPassword = process.env.TEST_USER_PASSWORD;
  if (!userEmail || !userPassword) {
    throw new Error('TEST_USER_EMAIL or TEST_USER_PASSWORD environment variables not set.');
  }

  await page.goto('/');
  // Wait for login form elements to be visible
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();

  await page.getByLabel('Email address').fill(userEmail);
  await page.getByLabel('Password').fill(userPassword);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  // Wait for successful login indication (e.g., Sign Out button)
  await expect(page.getByRole('button', { name: /Sign Out/i }))
    .toBeVisible({ timeout: 10000 }); 
}

test.describe('People CRUD Flow', () => {

  // Log in before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to People page', async ({ page }) => {
    // Click the People link in the nav
    await page.getByRole('link', { name: 'People' }).click();
    
    // Verify navigation to the People page (check URL and heading)
    await expect(page).toHaveURL('/people');
    await expect(page.getByRole('heading', { name: 'People' })).toBeVisible();
    // Check for the Add Person button
    await expect(page.getByRole('button', { name: /Add Person/i })).toBeVisible(); // Corrected button text
  });

  // Combine C-R-U-D into one test to maintain state
  test('should allow Creating, Reading, Editing, and Deleting a person', async ({ page }) => {
    const testTimestamp = Date.now();
    const testFirstName = 'Test';
    const testLastName = `Person-${testTimestamp}`;
    const testEmail = `test.person.${testTimestamp}@example.com`;
    const updatedLastName = `Updated-${testTimestamp}`;

    await page.goto('/people');
    
    // --- CREATE ---    
    await page.getByRole('button', { name: /Add Person/i }).click();
    const createModalContent = page.locator('.chakra-modal__content');
    await expect(createModalContent).toBeVisible({ timeout: 5000 });
    await createModalContent.getByLabel(/First Name/i).fill(testFirstName);
    await createModalContent.getByLabel(/Last Name/i).fill(testLastName);
    await createModalContent.getByLabel(/Email/i).fill(testEmail);
    await createModalContent.getByRole('button', { name: 'Save Person' }).click();
    await expect(createModalContent).not.toBeVisible();

    // --- READ (Verify Creation) ---
    const createdListItemLocator = page.locator('li', { hasText: testEmail });
    await expect(createdListItemLocator).toBeVisible({ timeout: 10000 });
    await expect(createdListItemLocator.getByText(`${testFirstName} ${testLastName}`)).toBeVisible();
    // No need for waitForTimeout here as we continue in the same test

    // --- EDIT ---    
    await createdListItemLocator.getByLabel('Edit person').click();
    const editModalContent = page.locator('.chakra-modal__content');
    await expect(editModalContent).toBeVisible({ timeout: 5000 });
    const lastNameInput = editModalContent.getByLabel(/Last Name/i);
    await lastNameInput.clear();
    await lastNameInput.fill(updatedLastName);
    await editModalContent.getByRole('button', { name: /Save|Update/i }).click(); // Assuming button text might be Save or Update
    await expect(editModalContent).not.toBeVisible();

    // --- READ (Verify Edit) ---
    // Re-locate the item in case the list re-rendered
    const updatedListItemLocator = page.locator('li', { hasText: testEmail }); 
    await expect(updatedListItemLocator).toBeVisible({ timeout: 10000 });
    await expect(updatedListItemLocator.getByText(`${testFirstName} ${updatedLastName}`)).toBeVisible();
    await expect(updatedListItemLocator.getByText(`${testFirstName} ${testLastName}`)).not.toBeVisible();
    // No need for waitForTimeout here

    // --- DELETE ---
    // Listen for the confirmation dialog and accept it
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`); // Log message for debugging
      dialog.accept().catch(() => {}); // Accept the dialog
    });

    // Now click the delete button
    await updatedListItemLocator.getByLabel('Delete person').click();
    // window.confirm is handled automatically by Playwright accepting the dialog
    
    // --- READ (Verify Deletion) ---
    await expect(updatedListItemLocator).not.toBeVisible({ timeout: 10000 });
  });

  // Remove the individual create, edit, delete tests
  // test('should allow creating a new person', ...) - REMOVED
  // test('should allow editing the created person', ...) - REMOVED
  // test('should allow deleting the created person', ...) - REMOVED

}); 