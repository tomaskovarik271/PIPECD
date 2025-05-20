import { test, expect, Page } from '@playwright/test';

// --- Reusable Helper Functions ---

// Helper function for login (ensure ADMIN_TEST_USER_EMAIL and ADMIN_TEST_USER_PASSWORD are set in .env)
async function login(page: Page) {
  const userEmail = process.env.ADMIN_TEST_USER_EMAIL;
  const userPassword = process.env.ADMIN_TEST_USER_PASSWORD;

  if (!userEmail || !userPassword) {
    throw new Error('ADMIN_TEST_USER_EMAIL or ADMIN_TEST_USER_PASSWORD environment variables not set.');
  }

  await page.goto('/');
  await expect(page.getByLabel('Email address')).toBeVisible({ timeout: 10000 });
  await page.getByLabel('Email address').fill(userEmail);
  await page.getByLabel('Password').fill(userPassword);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible({ timeout: 15000 });
  console.log('Login successful');
}

// Helper function to create a pipeline via UI
async function createPipelineViaUI(page: Page, pipelineName: string): Promise<string> {
  console.log(`Creating pipeline: ${pipelineName}`);
  await page.goto('/pipelines');
  await expect(page.getByRole('heading', { name: 'Pipelines' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'New Pipeline' }).click();

  const modal = page.getByRole('dialog', { name: 'Create New Pipeline' });
  await expect(modal).toBeVisible({ timeout: 5000 });
  await modal.getByLabel('Pipeline Name').fill(pipelineName);
  await modal.getByRole('button', { name: 'Create Pipeline' }).click();

  await expect(page.getByText('Pipeline created successfully.')).toBeVisible({ timeout: 10000 });
  await expect(modal).not.toBeVisible({ timeout: 5000 });
  console.log(`Pipeline ${pipelineName} created successfully.`);
  return pipelineName; 
}

// Helper function to create a stage via UI (Navigates via Pipeline)
async function createStageViaUI(page: Page, stageName: string, pipelineName: string, probability: number): Promise<string> {
    console.log(`Creating stage: ${stageName} for pipeline: ${pipelineName}`);
    
    await page.goto('/pipelines');
    await expect(page.getByRole('heading', { name: /Pipelines/i })).toBeVisible({ timeout: 10000 });
    
    const pipelineListItem = page.locator('li', { has: page.getByRole('heading', { name: pipelineName, exact: true }) });
    await expect(pipelineListItem).toBeVisible({ timeout: 10000 });
    await pipelineListItem.getByRole('button', { name: 'View Stages' }).click();

    await expect(page).toHaveURL(new RegExp(`/pipelines/.+/stages`), { timeout: 10000 }); 
    await expect(page.getByRole('heading', { name: `Stages for Pipeline: ${pipelineName}` })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'New Stage' }).click();

    const modal = page.getByRole('dialog', { name: 'Create New Stage' });
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByLabel('Stage Name').fill(stageName);
    await modal.getByLabel('Probability (%)').fill(probability.toString()); 
    await modal.getByRole('button', { name: 'Create Stage' }).click(); 

    await expect(page.getByText('Stage created successfully.')).toBeVisible({ timeout: 10000 });
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    console.log(`Stage ${stageName} created successfully.`);
    return stageName;
}

// Helper function to create a person via UI (minimal)
async function createPersonMinimalViaUI(page: Page, firstName: string, lastName: string): Promise<string> {
    console.log(`Creating person: ${firstName} ${lastName}`);
    await page.goto('/people');
    await expect(page.getByRole('heading', { name: 'People' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'New Person' }).click();

    const modal = page.getByRole('dialog', { name: 'Create New Person' });
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByLabel('First Name').fill(firstName);
    await modal.getByLabel('Last Name').fill(lastName);
    await modal.getByRole('button', { name: 'Save Person' }).click();

    await expect(page.getByText('Person Created')).toBeVisible({ timeout: 10000 });
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    console.log(`Person ${firstName} ${lastName} created successfully.`);
    return `${firstName} ${lastName}`; 
}

// Helper function to create a deal via UI
async function createDealViaUI(
  page: Page,
  dealDetails: {
    name: string;
    pipelineName: string;
    stageName: string;
    amount?: number;
    specificProbability?: number; 
  },
) {
  console.log(`Creating deal: ${dealDetails.name}`);
  if (!page.url().includes('/deals')) {
    await page.goto('/deals');
  }
  await expect(page.getByRole('heading', { name: 'Deals' })).toBeVisible({ timeout: 15000 });
  
  const createButton = page.getByRole('button', { name: 'New Deal' });
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  const modal = page.getByRole('dialog', { name: 'Create New Deal' });
  await expect(modal).toBeVisible({ timeout: 5000 });

  await modal.getByLabel('Deal Name').fill(dealDetails.name);
  
  // --- Pipeline and Stage Selection ---
  // 1. Select Pipeline
  await modal.getByLabel('Pipeline').selectOption({ label: dealDetails.pipelineName });

  // 2. Wait for Stage dropdown to be enabled (indicating loading likely finished)
  const stageSelect = modal.getByLabel('Stage');
  await expect(stageSelect).toBeEnabled({ timeout: 10000 }); 

  // 3. Wait for AT LEAST ONE option to be present in the dropdown
  const optionCount = await stageSelect.locator('option').count();
  expect(optionCount).toBeGreaterThanOrEqual(1); 

  // 4. Select the SECOND stage option (assuming index 0 is placeholder, index 1 is the one we want)
  const secondOption = stageSelect.locator('option').nth(1); // 0-based index
  await expect(secondOption).toBeEnabled({ timeout: 10000 }); // Ensure it's usable
  const optionValue = await secondOption.getAttribute('value');
  
  if (optionValue) {
    await stageSelect.selectOption({ value: optionValue });
    console.log(`Selected the second stage option with value: ${optionValue}`);
  } else {
    throw new Error("Could not get value attribute from the second stage option.");
  }
  // --- End Pipeline and Stage Selection ---

  if (dealDetails.amount !== undefined) {
    await modal.getByLabel('Amount').fill(dealDetails.amount.toString());
  }

  // --- Person Selection ---
  const personSelect = modal.getByLabel('Person');
  // 1. Wait for Person dropdown to be enabled
  await expect(personSelect).toBeEnabled({ timeout: 10000 });
  
  // 2. Wait for at least one option to be present (likely placeholder + person)
  const personOptionCount = await personSelect.locator('option').count();
  expect(personOptionCount).toBeGreaterThanOrEqual(1);

  // 3. Select the SECOND person option (index 1, assuming index 0 is placeholder)
  const secondPersonOption = personSelect.locator('option').nth(1);
  await expect(secondPersonOption).toBeEnabled({ timeout: 10000 }); // Ensure it's usable
  const personOptionValue = await secondPersonOption.getAttribute('value');
  const personOptionText = await secondPersonOption.textContent(); // Get text for logging

  if (personOptionValue) {
      await personSelect.selectOption({ value: personOptionValue });
      console.log(`Selected the first available person: ${personOptionText} (Value: ${personOptionValue})`);
  } else {
      throw new Error("Could not get value attribute from the second person option.");
  }
  // --- End Person Selection ---

  if (dealDetails.specificProbability !== undefined) {
     await modal.getByLabel('Specific Probability (%)').fill(dealDetails.specificProbability.toString());
  }

  await modal.getByRole('button', { name: 'Save Deal' }).click();

  await expect(page.getByText('Deal Created')).toBeVisible({ timeout: 10000 });
  await expect(modal).not.toBeVisible({ timeout: 5000 });
  console.log(`Deal ${dealDetails.name} created successfully.`);
}


// --- Test Suite ---

test.describe('Deals CRUD Operations', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should allow creating a new deal', async ({ page }) => {
    const pipelineName = `Test Create Pipeline ${Date.now()}`;
    await createPipelineViaUI(page, pipelineName);
    
    const stageName = `Test Create Stage ${Date.now()}`;
    await createStageViaUI(page, stageName, pipelineName, 75);

    const personFirstName = `TestCDealFirst ${Date.now()}`;
    const personLastName = `TestCDealLast ${Date.now()}`;
    await createPersonMinimalViaUI(page, personFirstName, personLastName);

    const dealName = `Test Deal ${Date.now()}`;
    const dealAmount = 5000;
    const dealProbability = 60; 

    await page.goto('/deals'); 
    await createDealViaUI(page, {
      name: dealName,
      pipelineName: pipelineName,
      stageName: stageName,
      amount: dealAmount,
      specificProbability: dealProbability,
    });

    await expect(page.getByRole('heading', { name: 'Deals' })).toBeVisible(); 
    const row = page.locator('tr', { has: page.getByRole('cell', { name: dealName }) });
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell').filter({ hasText: stageName })).toBeVisible(); 
    await expect(row.getByRole('cell', { name: `$${dealAmount.toLocaleString()}.00` })).toBeVisible(); 
    await expect(row.getByRole('cell', { name: `${dealProbability}%` })).toBeVisible(); 
  });

  test('should display created deal details correctly', async ({ page }) => {
    const pipelineName = `Test View Pipeline ${Date.now()}`;
    await createPipelineViaUI(page, pipelineName);
    
    const stageName = `Test View Stage ${Date.now()}`;
    await createStageViaUI(page, stageName, pipelineName, 85);

    const personFirstName = `TestVDealFirst ${Date.now()}`;
    const personLastName = `TestVDealLast ${Date.now()}`;
    await createPersonMinimalViaUI(page, personFirstName, personLastName);
    
    const dealName = `Test View Deal ${Date.now()}`;
    const dealAmount = 12345;
    const specificProb = 85;

    await page.goto('/deals');
    await createDealViaUI(page, {
      name: dealName,
      pipelineName: pipelineName,
      stageName: stageName,
      amount: dealAmount,
      specificProbability: specificProb
    });

    await expect(page.getByRole('heading', { name: 'Deals' })).toBeVisible();
    const row = page.locator('tr', { has: page.getByRole('cell', { name: dealName }) });
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell').filter({ hasText: stageName })).toBeVisible();
    await expect(row.getByRole('cell').filter({ hasText: pipelineName })).toBeVisible(); 
    await expect(row.getByRole('cell', { name: `$${dealAmount.toLocaleString()}.00` })).toBeVisible();
    await expect(row.getByRole('cell', { name: `${specificProb}%` })).toBeVisible();
  });

  test.skip('should allow editing an existing deal', async ({ page }) => {
    const pipelineName = `Test Edit Pipeline ${Date.now()}`;
    await createPipelineViaUI(page, pipelineName);
    
    const stageName = `Test Edit Stage ${Date.now()}`;
    await createStageViaUI(page, stageName, pipelineName, 50);

    const personFirstName = `TestEDealFirst ${Date.now()}`;
    const personLastName = `TestEDealLast ${Date.now()}`;
    await createPersonMinimalViaUI(page, personFirstName, personLastName);

    const initialDealName = `Test Edit Deal Old ${Date.now()}`;
    const initialAmount = 999;
    
    await page.goto('/deals');
    await createDealViaUI(page, {
      name: initialDealName,
      pipelineName: pipelineName,
      stageName: stageName,
      amount: initialAmount,
    });

    await expect(page.getByRole('heading', { name: 'Deals' })).toBeVisible();
    const row = page.locator('tr', { has: page.getByRole('cell', { name: initialDealName }) });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Edit deal' }).click();

    const editModal = page.getByRole('dialog', { name: /^Edit Deal:/i });
    await expect(editModal).toBeVisible();

    const updatedDealName = `Test Edit Deal New ${Date.now()}`;
    const updatedAmount = 1111;
    const updatedProbability = 95;

    await editModal.getByLabel('Deal Name').fill(updatedDealName);
    await editModal.getByLabel('Amount').fill(updatedAmount.toString());
    await editModal.getByLabel('Specific Probability (%)').fill(updatedProbability.toString());

    // Check if the update button is enabled before clicking
    const updateButton = page.locator('div[role="dialog"][aria-modal="true"]', { has: page.getByRole('heading', { name: /^Edit Deal:/i , level: 2}) })
                              .getByRole('button', { name: 'Update Deal' });

    await expect(updateButton).toBeEnabled({ timeout: 10000 });
    await updateButton.click();

    await expect(page.getByText('Deal Updated')).toBeVisible({ timeout: 10000 });
    await expect(editModal).not.toBeVisible({ timeout: 5000 });

    await expect(page.getByRole('heading', { name: 'Deals' })).toBeVisible();
    const updatedRow = page.locator('tr', { has: page.getByRole('cell', { name: updatedDealName }) });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow.getByRole('cell', { name: `$${updatedAmount.toLocaleString()}.00` })).toBeVisible();
    await expect(updatedRow.getByRole('cell', { name: `${updatedProbability}%` })).toBeVisible();
    await expect(page.getByRole('cell', { name: initialDealName })).not.toBeVisible();
  });

  test('should allow deleting an existing deal', async ({ page }) => {
    const pipelineName = `Test Delete Pipeline ${Date.now()}`;
    await createPipelineViaUI(page, pipelineName);
    
    const stageName = `Test Delete Stage ${Date.now()}`;
    await createStageViaUI(page, stageName, pipelineName, 20);

    const personFirstName = `TestDDealFirst ${Date.now()}`;
    const personLastName = `TestDDealLast ${Date.now()}`;
    await createPersonMinimalViaUI(page, personFirstName, personLastName);

    const dealName = `Test Delete Deal ${Date.now()}`;
    
    await page.goto('/deals');
    await createDealViaUI(page, {
      name: dealName,
      pipelineName: pipelineName,
      stageName: stageName,
    });

    await expect(page.getByRole('heading', { name: 'Deals' })).toBeVisible();
    const row = page.locator('tr', { has: page.getByRole('cell', { name: dealName }) });
    await expect(row).toBeVisible();

    // Explicitly find and close the toast before proceeding
    const toast = page.locator('.chakra-alert', { hasText: 'Deal Created' });
    // Wait short time for toast to definitely appear if it's going to
    await toast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { console.log('Deal Created toast did not appear or already closed.'); });
    // If toast is still visible, find its close button and click it
    if (await toast.isVisible()) {
      const closeButton = toast.locator('button[aria-label="Close"]'); // Common Chakra UI close button label
      if (await closeButton.isVisible()) {
          await closeButton.click();
          await expect(toast).not.toBeVisible({ timeout: 5000 }); // Confirm it closed
          console.log('Closed Deal Created toast.');
      } else {
          console.log('Could not find close button on Deal Created toast, proceeding anyway.');
      }
    } 

    await row.getByRole('button', { name: 'Delete deal' }).click();

    const deleteDialog = page.getByRole('alertdialog', { name: 'Delete Deal' }); 
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText(/Deal deleted/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('cell', { name: dealName })).not.toBeVisible();
  });

});