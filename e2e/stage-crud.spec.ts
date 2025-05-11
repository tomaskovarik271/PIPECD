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

// Helper function to create a pipeline via UI
async function createPipelineViaUI(page: Page, pipelineName: string) {
  await page.goto('/pipelines');
  await expect(page.getByRole('heading', { name: /Pipelines/i })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'New Pipeline' }).click();
  const nameInput = page.getByLabel('Pipeline Name');
  await expect(nameInput).toBeVisible({ timeout: 5000 });
  await nameInput.fill(pipelineName);
  await page.getByRole('button', { name: 'Create Pipeline' }).click();
  await expect(page.getByText('Pipeline created successfully.')).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel('Pipeline Name')).not.toBeVisible({ timeout: 5000 });
}

// Helper function to create a stage via UI
async function createStageViaUI(page: Page, stageName: string, stageOrder: number, dealProbability?: number) {
  await page.getByRole('button', { name: 'New Stage' }).click();
  const nameInput = page.getByLabel('Stage Name');
  await expect(nameInput).toBeVisible({ timeout: 5000 });
  await nameInput.fill(stageName);
  const orderInput = page.getByLabel('Order');
  await orderInput.fill(stageOrder.toString());
  if (dealProbability !== undefined) {
    const probabilityInput = page.getByLabel('Deal Probability (%)');
    await probabilityInput.fill(dealProbability.toString());
  }
  await page.getByRole('button', { name: 'Create Stage' }).click();
  await expect(page.getByText('Stage created successfully.')).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel('Stage Name')).not.toBeVisible({ timeout: 5000 });
}

test.describe('Stage CRUD Operations', () => {
  let page: Page;
  // Removed suite-level testPipelineName

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page);
    // Pipeline creation and navigation moved into individual tests / helper
  });

  // Removed beforeEach that checked pipeline-specific heading

  test.afterAll(async () => {
    await page.close();
  });
  
  // Helper function to setup pipeline and navigate to its stages page for a test
  async function setupPipelineAndNavigateToStages(testPage: Page, pipelineName: string) {
    await createPipelineViaUI(testPage, pipelineName);
    // Ensure we are on the pipelines page to find the new pipeline
    if (!testPage.url().includes('/pipelines')) {
        await testPage.goto('/pipelines');
        await expect(testPage.getByRole('heading', { name: /Pipelines/i })).toBeVisible({ timeout: 10000 });
    }
    const pipelineListItem = testPage.locator('li', { has: testPage.getByRole('heading', { name: pipelineName, exact: true }) });
    await expect(pipelineListItem).toBeVisible({ timeout: 10000 }); // Make sure item is there before clicking
    await pipelineListItem.getByRole('button', { name: 'View Stages' }).click();
    await expect(testPage).toHaveURL(new RegExp(`/pipelines/.+/stages`));
    await expect(testPage.getByRole('heading', { name: `Stages for Pipeline: ${pipelineName}` })).toBeVisible({ timeout: 10000 });
  }

  test('should allow creating a new stage', async () => {
    const testPipelineName = `PipelineForCreateStage ${Date.now()}`;
    await setupPipelineAndNavigateToStages(page, testPipelineName);

    const newStageName = `Test Stage Create ${Date.now()}`;
    const newStageOrder = 10;
    const newStageProbability = 50;
    await createStageViaUI(page, newStageName, newStageOrder, newStageProbability);
    
    const stageListItem = page.locator('li', { has: page.getByRole('heading', { name: newStageName, exact: true }) });
    await expect(stageListItem).toBeVisible({ timeout: 10000 });
    await expect(stageListItem.getByText(`Order: ${newStageOrder}`)).toBeVisible();
    await expect(stageListItem.getByText(`Probability: ${newStageProbability}%`)).toBeVisible();
  });

  test('should allow editing an existing stage', async () => {
    const testPipelineName = `PipelineForEditStage ${Date.now()}`;
    await setupPipelineAndNavigateToStages(page, testPipelineName);

    const initialStageName = `Test Stage Edit Old ${Date.now()}`;
    const initialOrder = 20;
    await createStageViaUI(page, initialStageName, initialOrder);
    await expect(page.getByText('Stage created successfully.')).not.toBeVisible({ timeout: 5000 });

    const updatedStageName = `Test Stage Edit New ${Date.now()}`;
    const updatedOrder = 25;
    const updatedProbability = 75;

    const stageListItem = page.locator('li', { has: page.getByRole('heading', { name: initialStageName, exact: true }) });
    await expect(stageListItem).toBeVisible(); // Make sure item is there before clicking
    await stageListItem.getByRole('button', { name: 'Edit stage' }).click();

    const nameInput = page.getByLabel('Stage Name');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await expect(nameInput).toHaveValue(initialStageName);
    await nameInput.fill(updatedStageName);
    const orderInput = page.getByLabel('Order');
    await orderInput.fill(updatedOrder.toString());
    const probabilityInput = page.getByLabel('Deal Probability (%)');
    await probabilityInput.fill(updatedProbability.toString());
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Stage updated successfully.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Stage Name')).not.toBeVisible({ timeout: 5000 });

    const updatedStageListItem = page.locator('li', { has: page.getByRole('heading', { name: updatedStageName, exact: true }) });
    await expect(updatedStageListItem).toBeVisible({ timeout: 10000 });
    await expect(updatedStageListItem.getByText(`Order: ${updatedOrder}`)).toBeVisible();
    await expect(updatedStageListItem.getByText(`Probability: ${updatedProbability}%`)).toBeVisible();
    await expect(page.locator('li', { has: page.getByRole('heading', { name: initialStageName, exact: true }) })).not.toBeVisible();
  });

  test('should allow deleting a stage', async () => {
    const testPipelineName = `PipelineForDeleteStage ${Date.now()}`;
    await setupPipelineAndNavigateToStages(page, testPipelineName);

    const stageName = `Test Stage Delete ${Date.now()}`;
    const stageOrder = 30;
    await createStageViaUI(page, stageName, stageOrder);
    await expect(page.getByText('Stage created successfully.')).not.toBeVisible({ timeout: 5000 });

    const stageListItem = page.locator('li', { has: page.getByRole('heading', { name: stageName, exact: true }) });
    await expect(stageListItem).toBeVisible(); 
    await stageListItem.getByRole('button', { name: 'Delete stage' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Delete Stage', { exact: true })).toBeVisible(); 
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Stage deleted.')).toBeVisible({ timeout: 10000 }); 
    await expect(page.locator('li', { has: page.getByRole('heading', { name: stageName, exact: true }) })).not.toBeVisible({ timeout: 10000 });
  });
}); 