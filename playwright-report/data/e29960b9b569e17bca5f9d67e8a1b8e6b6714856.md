# Test info

- Name: Deal CRUD Operations >> should allow editing an existing deal's specific probability
- Location: /Users/tomaskovarik/059_PIPECD/PIPECD/e2e/deal-crud.spec.ts:129:7

# Error details

```
Error: locator.selectOption: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('dialog', { name: 'Create New Deal' }).getByLabel('Stage')
    - locator resolved to <select required="" id="field-:rr:" aria-required="true" class="chakra-select css-161pkch">…</select>
  - attempting select option action
    2 × waiting for element to be visible and enabled
      - did not find some options
    - retrying select option action
    - waiting 20ms
    2 × waiting for element to be visible and enabled
      - did not find some options
    - retrying select option action
      - waiting 100ms
    57 × waiting for element to be visible and enabled
       - did not find some options
     - retrying select option action
       - waiting 500ms

    at createDealViaUI (/Users/tomaskovarik/059_PIPECD/PIPECD/e2e/deal-crud.spec.ts:65:21)
    at /Users/tomaskovarik/059_PIPECD/PIPECD/e2e/deal-crud.spec.ts:131:5
```

# Page snapshot

```yaml
- region "Notifications-top"
- region "Notifications-top-left"
- region "Notifications-top-right"
- region "Notifications-bottom-left"
- region "Notifications-bottom"
- region "Notifications-bottom-right"
- dialog "Create New Deal":
  - banner: Create New Deal
  - button "Close"
  - group:
    - text: Deal Name
    - textbox "Deal Name": Test Deal Edit Prob Initial 1746975555118
  - group:
    - text: Pipeline
    - combobox "Pipeline":
      - option "Select pipeline"
      - option "Lead Pipeline 2025 Q3" [selected]
      - option "Sales Pipeline 2025 Q3"
  - group:
    - text: Stage
    - combobox "Stage":
      - option "Select stage" [selected]
      - 'option "Early Lead (Order: 0)"'
      - 'option "Confirmed Lead (Order: 1)"'
  - group:
    - text: Amount
    - spinbutton "Amount"
  - group:
    - text: Deal Specific Probability (%)
    - spinbutton "Deal Specific Probability (%)"
  - group:
    - text: Link to Person (Optional)
    - combobox "Link to Person (Optional)":
      - option "Select person" [selected]
      - option "area are"
      - option "herec dobry"
      - option "Jyn Ymr"
      - option "Jun Umr"
      - option "Jen Emr"
      - option "Jon Omr"
      - option "Jan Amr"
  - contentinfo:
    - button "Save Deal"
    - button "Cancel"
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test';
   2 |
   3 | // --- Test Configuration ---
   4 | // These names must match existing data in your test environment
   5 | const TEST_PIPELINE_NAME = 'Lead Pipeline 2025 Q3'; // Replace with your actual pipeline name
   6 | const TEST_STAGE_NAME_INITIAL = 'Early Lead'; // Replace with an actual stage in the above pipeline
   7 | const TEST_STAGE_NAME_UPDATED = 'Confirmed Lead'; // Replace with another actual stage in the above pipeline
   8 | const TEST_PERSON_NAME = 'Jyn Ymr'; // Replace with an existing person's name (or part of it for selection)
   9 | const TEST_DEAL_AMOUNT_INITIAL = 1000;
   10 | const TEST_DEAL_SPECIFIC_PROB_INITIAL_PERCENT = 75; // 75%
   11 | const TEST_DEAL_SPECIFIC_PROB_UPDATED_PERCENT = 50; // 50%
   12 |
   13 | // Helper function for login (copied from organization-crud.spec.ts, consider refactoring to a shared util)
   14 | async function login(page: Page) {
   15 |   const userEmail = process.env.ADMIN_TEST_USER_EMAIL;
   16 |   const userPassword = process.env.ADMIN_TEST_USER_PASSWORD;
   17 |
   18 |   if (!userEmail || !userPassword) {
   19 |     throw new Error('ADMIN_TEST_USER_EMAIL or ADMIN_TEST_USER_PASSWORD environment variables not set.');
   20 |   }
   21 |
   22 |   await page.goto('/');
   23 |   await page.getByLabel('Email address').fill(userEmail);
   24 |   await page.getByLabel('Password').fill(userPassword);
   25 |   await page.getByRole('button', { name: 'Sign in', exact: true }).click();
   26 |   await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible({ timeout: 10000 });
   27 | }
   28 |
   29 | // Helper to create a deal via UI
   30 | interface CreateDealOptions {
   31 |   dealName: string;
   32 |   pipelineName: string;
   33 |   stageName: string;
   34 |   amount?: string;
   35 |   personName?: string;
   36 |   specificProbabilityPercent?: string;
   37 | }
   38 | async function createDealViaUI(page: Page, options: CreateDealOptions) {
   39 |   const { 
   40 |     dealName, 
   41 |     pipelineName, 
   42 |     stageName, 
   43 |     amount, 
   44 |     personName, 
   45 |     specificProbabilityPercent 
   46 |   } = options;
   47 |
   48 |   await page.getByRole('button', { name: 'New Deal' }).click();
   49 |
   50 |   const createModal = page.getByRole('dialog', { name: 'Create New Deal' });
   51 |   await expect(createModal).toBeVisible({ timeout: 5000 });
   52 |
   53 |   await createModal.getByLabel('Deal Name').fill(dealName);
   54 |
   55 |   // Select Pipeline
   56 |   const pipelineSelect = createModal.getByLabel('Pipeline');
   57 |   await expect(pipelineSelect).toBeEnabled({ timeout: 10000 }); // Wait for the select to be enabled
   58 |   await pipelineSelect.selectOption({ label: pipelineName });
   59 |   
   60 |   // Wait for the specific stage option to be available after pipeline selection
   61 |   const stageSelect = createModal.getByLabel('Stage');
   62 |   // Wait for the target stage option to be attached to the DOM within the select element
   63 |   await expect(stageSelect.locator(`option:has-text("${stageName}")`)).toBeAttached({ timeout: 10000 });
   64 |   await expect(stageSelect).toBeEnabled({ timeout: 10000 }); // Ensure it's still enabled
>  65 |   await stageSelect.selectOption({ label: stageName }); 
      |                     ^ Error: locator.selectOption: Target page, context or browser has been closed
   66 |
   67 |   if (amount) {
   68 |     await createModal.getByLabel('Amount').fill(amount);
   69 |   }
   70 |   if (specificProbabilityPercent) {
   71 |     await createModal.getByLabel('Deal Specific Probability (%)').fill(specificProbabilityPercent);
   72 |   }
   73 |   if (personName) {
   74 |     await createModal.getByLabel('Link to Person (Optional)').selectOption({ label: personName }); // Use string label
   75 |   }
   76 |
   77 |   await createModal.getByRole('button', { name: 'Save Deal' }).click();
   78 |   await expect(page.getByText('Deal Created')).toBeVisible({ timeout: 10000 });
   79 |   await expect(createModal).not.toBeVisible({ timeout: 5000 });
   80 | }
   81 |
   82 | // Helper to format currency for assertions
   83 | function formatCurrency(amount: number | null | undefined, currency = 'USD', locale = 'en-US') {
   84 |   if (amount == null) return '-';
   85 |   return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
   86 | }
   87 |
   88 |
   89 | test.describe('Deal CRUD Operations', () => {
   90 |   let page: Page;
   91 |
   92 |   test.beforeAll(async ({ browser }) => {
   93 |     page = await browser.newPage();
   94 |     await login(page);
   95 |   });
   96 |
   97 |   test.beforeEach(async () => {
   98 |     await page.goto('/deals');
   99 |     await expect(page.getByRole('heading', { name: /Deals/i })).toBeVisible({ timeout: 10000 });
  100 |   });
  101 |
  102 |   test.afterAll(async () => {
  103 |     await page.close();
  104 |   });
  105 |
  106 |   test('should allow creating a new deal with specific probability', async () => {
  107 |     const dealName = `Test Deal Create ${Date.now()}`;
  108 |     const amountStr = String(TEST_DEAL_AMOUNT_INITIAL);
  109 |     const probStr = String(TEST_DEAL_SPECIFIC_PROB_INITIAL_PERCENT);
  110 |     const weightedAmountExpected = TEST_DEAL_AMOUNT_INITIAL * (TEST_DEAL_SPECIFIC_PROB_INITIAL_PERCENT / 100);
  111 |
  112 |     await createDealViaUI(page, {
  113 |       dealName,
  114 |       pipelineName: TEST_PIPELINE_NAME,
  115 |       stageName: TEST_STAGE_NAME_INITIAL,
  116 |       amount: amountStr,
  117 |       personName: TEST_PERSON_NAME,
  118 |       specificProbabilityPercent: probStr,
  119 |     });
  120 |
  121 |     const row = page.locator('tr', { has: page.getByRole('cell', { name: dealName, exact: true }) });
  122 |     await expect(row).toBeVisible({ timeout: 10000 });
  123 |     await expect(row.getByRole('cell', { name: TEST_STAGE_NAME_INITIAL, exact: true })).toBeVisible();
  124 |     await expect(row.getByRole('cell', { name: formatCurrency(TEST_DEAL_AMOUNT_INITIAL), exact: true })).toBeVisible();
  125 |     await expect(row.getByRole('cell', { name: `${TEST_DEAL_SPECIFIC_PROB_INITIAL_PERCENT}%`, exact: true })).toBeVisible();
  126 |     await expect(row.getByRole('cell', { name: formatCurrency(weightedAmountExpected), exact: true })).toBeVisible();
  127 |   });
  128 |
  129 |   test(`should allow editing an existing deal's specific probability`, async () => {
  130 |     const initialDealName = `Test Deal Edit Prob Initial ${Date.now()}`;
  131 |     await createDealViaUI(page, {
  132 |       dealName: initialDealName,
  133 |       pipelineName: TEST_PIPELINE_NAME,
  134 |       stageName: TEST_STAGE_NAME_INITIAL,
  135 |       amount: String(TEST_DEAL_AMOUNT_INITIAL),
  136 |       specificProbabilityPercent: String(TEST_DEAL_SPECIFIC_PROB_INITIAL_PERCENT),
  137 |     });
  138 |     await expect(page.getByText('Deal Created')).not.toBeVisible({ timeout: 5000 }); // Wait for toast to clear
  139 |
  140 |     const row = page.locator('tr', { has: page.getByRole('cell', { name: initialDealName, exact: true }) });
  141 |     await row.getByLabel('Edit deal').click();
  142 |
  143 |     const editModal = page.getByRole('dialog', { name: new RegExp(`Edit Deal: ${initialDealName}`) });
  144 |     await expect(editModal).toBeVisible();
  145 |     
  146 |     const probInput = editModal.getByLabel('Deal Specific Probability (%)');
  147 |     await expect(probInput).toHaveValue(String(TEST_DEAL_SPECIFIC_PROB_INITIAL_PERCENT));
  148 |     await probInput.fill(String(TEST_DEAL_SPECIFIC_PROB_UPDATED_PERCENT));
  149 |     
  150 |     // Optionally update stage or other fields if desired for a more comprehensive edit test
  151 |     // await editModal.getByLabel('Stage').selectOption({ label: TEST_STAGE_NAME_UPDATED });
  152 |
  153 |     await editModal.getByRole('button', { name: 'Save Changes' }).click();
  154 |     await expect(page.getByText('Deal Updated')).toBeVisible({ timeout: 10000 });
  155 |     await expect(editModal).not.toBeVisible({ timeout: 5000 });
  156 |
  157 |     const weightedAmountUpdated = TEST_DEAL_AMOUNT_INITIAL * (TEST_DEAL_SPECIFIC_PROB_UPDATED_PERCENT / 100);
  158 |     await expect(row.getByRole('cell', { name: `${TEST_DEAL_SPECIFIC_PROB_UPDATED_PERCENT}%`, exact: true })).toBeVisible();
  159 |     await expect(row.getByRole('cell', { name: formatCurrency(weightedAmountUpdated), exact: true })).toBeVisible();
  160 |   });
  161 |
  162 |   test(`should allow clearing a deal's specific probability and fallback to stage probability`, async () => {
  163 |     const dealName = `Test Deal Clear Prob ${Date.now()}`;
  164 |     await createDealViaUI(page, {
  165 |       dealName,
```