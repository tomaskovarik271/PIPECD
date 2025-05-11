import { test, expect, Page } from '@playwright/test';

// Helper function for login
async function login(page: Page) {
  const userEmail = process.env.ADMIN_TEST_USER_EMAIL;
  const userPassword = process.env.ADMIN_TEST_USER_PASSWORD;

  if (!userEmail || !userPassword) {
    throw new Error('ADMIN_TEST_USER_EMAIL or ADMIN_TEST_USER_PASSWORD environment variables not set.');
  }

  await page.goto('/');
  await page.getByLabel('Email address').fill(userEmail);
  await page.getByLabel('Password').fill(userPassword);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible({ timeout: 10000 });
}

// Placeholder for createOrganizationViaUI - to be implemented after analyzing modal
async function createOrganizationViaUI(page: Page, orgName: string, address?: string, notes?: string) {
  await page.getByRole('button', { name: 'New Organization' }).click();

  const nameInput = page.getByLabel('Organization Name');
  await expect(nameInput).toBeVisible({ timeout: 5000 });
  await nameInput.fill(orgName);

  if (address) {
    await page.getByLabel('Address').fill(address);
  }
  if (notes) {
    await page.getByLabel('Notes').fill(notes);
  }

  await page.getByRole('button', { name: 'Save Organization' }).click();
  // Wait for success toast then check modal closure
  await expect(page.getByText('Organization Created')).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel('Organization Name')).not.toBeVisible({ timeout: 5000 }); // Modal closes
}

test.describe('Organization CRUD Operations', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page);
  });

  test.beforeEach(async () => {
    // Navigate to organizations page before each test
    await page.goto('/organizations');
    await expect(page.getByRole('heading', { name: /Organizations/i })).toBeVisible({ timeout: 10000 });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should allow creating a new organization', async () => {
    const orgName = `Test Org Create ${Date.now()}`;
    const orgAddress = '123 Create St';
    const orgNotes = 'Org for creation test.';
    await createOrganizationViaUI(page, orgName, orgAddress, orgNotes);
    await expect(page.getByRole('cell', { name: orgName, exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('should display created organization in the list', async () => {
    const orgName = `Test Org View ${Date.now()}`;
    const orgAddress = '456 View Ave';
    const orgNotes = 'Org for view test.';
    await createOrganizationViaUI(page, orgName, orgAddress, orgNotes);

    // Verify the organization is visible in the table with its details
    // This relies on the SortableTable rendering cells with the text content.
    // A more robust way would be to locate the row containing orgName, then check other cells in that row.
    const row = page.locator('tr', { has: page.getByRole('cell', { name: orgName, exact: true })});
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: orgAddress, exact: true })).toBeVisible();
    // Notes are truncated, so we check for its presence, not exact match if long.
    // Assuming notes column will contain the text if notes are short, or part of it.
    await expect(row.getByText(orgNotes)).toBeVisible(); 
  });

  test('should allow editing an existing organization', async () => {
    const initialOrgName = `Test Org Edit Old ${Date.now()}`;
    const initialAddress = '789 Old St';
    await createOrganizationViaUI(page, initialOrgName, initialAddress);
    // Ensure creation toast is gone
    await expect(page.getByText('Organization Created')).not.toBeVisible({ timeout: 5000 }); 

    const updatedOrgName = `Test Org Edit New ${Date.now()}`;
    const updatedAddress = '101 New Ave';
    const updatedNotes = 'Updated notes.';

    // Find the row and click edit
    const row = page.locator('tr', { has: page.getByRole('cell', { name: initialOrgName, exact: true })});
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Edit organization' }).click();

    // Wait for the dialog to appear, then check its heading
    const editDialog = page.getByRole('dialog', { name: new RegExp(`Edit Organization: ${initialOrgName}`) });
    await expect(editDialog).toBeVisible({ timeout: 10000 }); // Increased timeout
    // No need to check heading separately if it's part of the dialog selector by name
    
    const nameInput = editDialog.getByLabel('Organization Name');
    await expect(nameInput).toHaveValue(initialOrgName);
    await nameInput.fill(updatedOrgName);

    const addressInput = editDialog.getByLabel('Address');
    await expect(addressInput).toHaveValue(initialAddress);
    await addressInput.fill(updatedAddress);

    await editDialog.getByLabel('Notes').fill(updatedNotes);
    await editDialog.getByRole('button', { name: 'Save Changes' }).click();
        
    await expect(editDialog).not.toBeVisible({ timeout: 5000 }); // Check modal closes

    // Verify updated details in the table
    const updatedRow = page.locator('tr', { has: page.getByRole('cell', { name: updatedOrgName, exact: true })});
    await expect(updatedRow).toBeVisible({ timeout: 10000 });
    await expect(updatedRow.getByRole('cell', { name: updatedAddress, exact: true })).toBeVisible();
    await expect(updatedRow.getByText(updatedNotes)).toBeVisible();
    await expect(page.getByRole('cell', { name: initialOrgName, exact: true })).not.toBeVisible();
  });

  test('should allow deleting an organization', async () => {
    const orgName = `Test Org Delete ${Date.now()}`;
    await createOrganizationViaUI(page, orgName);
    await expect(page.getByText('Organization Created')).not.toBeVisible({ timeout: 5000 }); 

    // Find the row and click delete
    const row = page.locator('tr', { has: page.getByRole('cell', { name: orgName, exact: true })});
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Delete organization' }).click();

    // Confirm in dialog
    const deleteDialog = page.getByRole('alertdialog'); // For delete, it's an alertdialog
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });
    await expect(deleteDialog.getByText('Delete Organization', { exact: true })).toBeVisible(); 
    await deleteDialog.getByRole('button', { name: 'Delete', exact: true }).click();

    // Verify toast and removal from list
    await expect(page.getByText('Organization deleted.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('cell', { name: orgName, exact: true })).not.toBeVisible({ timeout: 10000 });
  });
}); 