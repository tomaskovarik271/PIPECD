import { test, expect, Page } from '@playwright/test';

// Helper function for login - can be moved to a shared file later if needed
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
  // Wait for login to complete - check for a reliable element that indicates logged-in state
  await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible({ timeout: 10000 });
}

// Helper function to create a pipeline via UI
async function createPipelineViaUI(page: Page, pipelineName: string) {
  // 1. Click "Create Pipeline" button on the Pipelines page
  await page.getByRole('button', { name: 'New Pipeline' }).click();

  // 2. Fill in pipeline name in modal
  const nameInput = page.getByLabel('Pipeline Name');
  await expect(nameInput).toBeVisible({ timeout: 5000 });
  await nameInput.fill(pipelineName);

  // 3. Click "Create Pipeline" button in the modal
  await page.getByRole('button', { name: 'Create Pipeline' }).click();

  // 4. Verify modal closes
  await expect(page.getByLabel('Pipeline Name')).not.toBeVisible({ timeout: 5000 });
}

test.describe('Pipeline CRUD Operations', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page);
  });

  test.beforeEach(async () => {
    // Navigate to the pipelines page before each test in this suite
    await page.goto('/pipelines');
    // Wait for a known element on the pipelines page to ensure it's loaded
    // Example: expecting a heading or the "Create Pipeline" button
    await expect(page.getByRole('heading', { name: /Pipelines/i })).toBeVisible({ timeout: 10000 });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should allow creating a new pipeline', async () => {
    const newPipelineName = `Test Pipeline Create ${Date.now()}`;
    await createPipelineViaUI(page, newPipelineName);

    // Verify new pipeline appears in the list on the PipelinesPage
    await expect(page.getByText(newPipelineName, { exact: true })).toBeVisible({ timeout: 10000 });

    // Verify success toast
    await expect(page.getByText('Pipeline created successfully.')).toBeVisible({ timeout: 5000 });
  });

  test('should allow viewing and selecting a pipeline', async () => {
    const pipelineName = `Test Pipeline View ${Date.now()}`;
    await createPipelineViaUI(page, pipelineName);
    await expect(page.getByText('Pipeline created successfully.')).toBeVisible(); // Ensure it's created

    // Find the created pipeline in the list and click its "View Stages" button
    // This locates the list item containing the pipeline name, then finds the button within that item.
    const pipelineListItem = page.locator('li', { has: page.getByRole('heading', { name: pipelineName, exact: true }) });
    await pipelineListItem.getByRole('button', { name: 'View Stages' }).click();

    // Verify navigation to the stages page for this pipeline
    await expect(page).toHaveURL(new RegExp(`/pipelines/.+/stages`)); // CORRECTED URL pattern
    await expect(page.getByRole('heading', { name: `Stages for Pipeline: ${pipelineName}` })).toBeVisible({ timeout: 10000 });
  });

  test('should allow editing an existing pipeline', async () => {
    const initialPipelineName = `Test Pipeline Edit Old ${Date.now()}`;
    const updatedPipelineName = `Test Pipeline Edit New ${Date.now()}`;

    await createPipelineViaUI(page, initialPipelineName);
    await expect(page.getByText('Pipeline created successfully.')).toBeVisible();

    // Find the pipeline and click its "Edit pipeline" button
    const pipelineListItem = page.locator('li', { has: page.getByRole('heading', { name: initialPipelineName, exact: true }) });
    await pipelineListItem.getByRole('button', { name: 'Edit pipeline' }).click();

    // In the modal, change the name and save
    const nameInput = page.getByLabel('Pipeline Name');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await expect(nameInput).toHaveValue(initialPipelineName); // Verify initial name is populated
    await nameInput.fill(updatedPipelineName);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify modal closes
    await expect(page.getByLabel('Pipeline Name')).not.toBeVisible({ timeout: 5000 });

    // Verify updated name appears in the list
    await expect(page.getByText(updatedPipelineName, { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(initialPipelineName, { exact: true })).not.toBeVisible(); // Old name should be gone

    // Verify success toast
    await expect(page.getByText('Pipeline updated successfully.')).toBeVisible({ timeout: 5000 });
  });

  test('should allow deleting a pipeline', async () => {
    const pipelineName = `Test Pipeline Delete ${Date.now()}`;
    await createPipelineViaUI(page, pipelineName);
    await expect(page.getByText('Pipeline created successfully.')).toBeVisible();

    // Find the pipeline and click its "Delete pipeline" button
    const pipelineListItem = page.locator('li', { has: page.getByRole('heading', { name: pipelineName, exact: true }) });
    await pipelineListItem.getByRole('button', { name: 'Delete pipeline' }).click();

    // Confirm deletion in the dialog
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // Try finding the header text directly, instead of by role, to be more resilient
    await expect(dialog.getByText('Delete Pipeline', { exact: true })).toBeVisible(); 
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

    // Verify pipeline is removed from the list
    await expect(page.getByText(pipelineName, { exact: true })).not.toBeVisible({ timeout: 10000 });

    // Verify success toast
    await expect(page.getByText('Pipeline deleted.')).toBeVisible({ timeout: 5000 });
  });

}); 