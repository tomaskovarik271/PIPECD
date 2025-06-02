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

// Helper function to create an organization via UI
async function createOrganizationViaUI(
  page: Page,
  orgDetails: {
    name: string;
  },
) {
  await page.goto('/organizations');
  await page.getByRole('button', { name: 'New Organization' }).click();

  const modal = page.getByRole('dialog', { name: 'Create New Organization' });
  await expect(modal).toBeVisible({ timeout: 5000 });

  await modal.getByLabel('Organization Name').fill(orgDetails.name);
  await modal.getByRole('button', { name: 'Save Organization' }).click();

  await expect(page.getByText('Organization Created')).toBeVisible({ timeout: 10000 });
  await expect(modal).not.toBeVisible({ timeout: 5000 });
}

// Helper function to create a person via UI
async function createPersonViaUI(
  page: Page,
  personDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    organizationName?: string; // Assuming we select by name, will need an org created first if used
  },
) {
  await page.getByRole('button', { name: 'New Person' }).click();

  // Wait for the modal to appear, assuming it's a dialog role
  const modal = page.getByRole('dialog', { name: 'Create New Person' }); // Assuming this title
  await expect(modal).toBeVisible();

  if (personDetails.firstName) {
    await modal.getByLabel('First Name').fill(personDetails.firstName);
  }
  if (personDetails.lastName) {
    await modal.getByLabel('Last Name').fill(personDetails.lastName);
  }
  if (personDetails.email) {
    await modal.getByLabel('Email').fill(personDetails.email);
  }
  if (personDetails.phone) {
    await modal.getByLabel('Phone').fill(personDetails.phone);
  }
  if (personDetails.organizationName) {
    await modal.getByLabel('Organization').selectOption({ label: personDetails.organizationName });
  }
  if (personDetails.notes) {
    await modal.getByLabel('Notes').fill(personDetails.notes);
  }

  await modal.getByRole('button', { name: 'Save Person' }).click();

  // Wait for success toast
  await expect(page.getByText('Person Created')).toBeVisible();
  // Wait for modal to close
  await expect(modal).not.toBeVisible();
}

test.describe('People CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
    // Navigate to the people page
    await page.goto('/people');
  });

  test('should allow creating a new person', async ({ page }) => {
    const personFirstName = `TestPersonFirst ${Date.now()}`;
    const personLastName = `TestPersonLast ${Date.now()}`;
    const personEmail = `test.person.${Date.now()}@example.com`;

    await createPersonViaUI(page, {
      firstName: personFirstName,
      lastName: personLastName,
      email: personEmail,
      phone: '1234567890',
      notes: 'This is a test person created by Playwright.',
    });

    // Verify the person is in the list
    // PeoplePage uses a SortableTable, check for name and email
    await expect(page.getByRole('cell', { name: `${personFirstName} ${personLastName}`, exact: false })).toBeVisible();
    await expect(page.getByRole('cell', { name: personEmail, exact: false })).toBeVisible();
  });

  test('should display created person in the list', async ({ page }) => {
    const personFirstName = `TestPersonViewFirst ${Date.now()}`;
    const personLastName = `TestPersonViewLast ${Date.now()}`;
    const personEmail = `test.person.view.${Date.now()}@example.com`;
    const personPhone = '0987654321';
    const personNotes = 'This person is for the view test.';

    await createPersonViaUI(page, {
      firstName: personFirstName,
      lastName: personLastName,
      email: personEmail,
      phone: personPhone,
      notes: personNotes, // Notes are not directly visible in the main table view from PeoplePage.tsx
    });

    // Verify the person is visible in the table with their details
    const fullName = `${personFirstName} ${personLastName}`;
    // Locate the row containing the person's name
    const row = page.locator('tr', { has: page.getByRole('cell', { name: fullName, exact: false }) });
    await expect(row).toBeVisible();

    // Verify email and phone in the same row
    await expect(row.getByRole('cell', { name: personEmail, exact: false })).toBeVisible();
    await expect(row.getByRole('cell', { name: personPhone, exact: false })).toBeVisible();
    // Notes are not typically displayed in the main list, so we won't check for them here.
    // We also won't check for organization in this basic view test.
  });

  test('should allow editing an existing person', async ({ page }) => {
    const initialFirstName = `TestEditFirstOld ${Date.now()}`;
    const initialLastName = `TestEditLastOld ${Date.now()}`;
    const initialEmail = `test.edit.old.${Date.now()}@example.com`;
    const initialPhone = '1112223333';

    await createPersonViaUI(page, {
      firstName: initialFirstName,
      lastName: initialLastName,
      email: initialEmail,
      phone: initialPhone,
    });

    const initialFullName = `${initialFirstName} ${initialLastName}`;
    const row = page.locator('tr', { has: page.getByRole('cell', { name: initialFullName, exact: false }) });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Edit person' }).click();

    // Wait for the edit modal to appear
    // Assuming the modal title will contain "Edit Person"
    const editModal = page.getByRole('dialog', { name: /Edit Person/i });
    await expect(editModal).toBeVisible();

    const updatedFirstName = `TestEditFirstNew ${Date.now()}`;
    const updatedLastName = `TestEditLastNew ${Date.now()}`;
    const updatedPhone = '4445556666';

    await editModal.getByLabel('First Name').fill(updatedFirstName);
    await editModal.getByLabel('Last Name').fill(updatedLastName);
    await editModal.getByLabel('Phone').fill(updatedPhone);
    // Email is often used as an identifier, so we won't change it in this test

    await editModal.getByRole('button', { name: 'Update Person' }).click();

    // Wait for success toast and modal to close
    await expect(page.getByText('Person Updated')).toBeVisible();
    await expect(editModal).not.toBeVisible();

    // Verify updated details in the table
    const updatedFullName = `${updatedFirstName} ${updatedLastName}`;
    const updatedRow = page.locator('tr', { has: page.getByRole('cell', { name: updatedFullName, exact: false }) });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow.getByRole('cell', { name: updatedPhone, exact: false })).toBeVisible();

    // Verify old details are not present
    await expect(page.getByRole('cell', { name: initialFullName, exact: false })).not.toBeVisible();
  });

  test('should allow deleting an existing person', async ({ page }) => {
    const personFirstName = `TestDeleteFirst ${Date.now()}`;
    const personLastName = `TestDeleteLast ${Date.now()}`;
    const personEmail = `test.delete.${Date.now()}@example.com`;

    await createPersonViaUI(page, {
      firstName: personFirstName,
      lastName: personLastName,
      email: personEmail,
    });

    const fullName = `${personFirstName} ${personLastName}`;
    const row = page.locator('tr', { has: page.getByRole('cell', { name: fullName, exact: false }) });
    await expect(row).toBeVisible();
    // Wait for the creation toast to disappear to avoid interference
    await expect(page.getByText('Person Created')).not.toBeVisible({ timeout: 10000 });

    await row.getByRole('button', { name: 'Delete person' }).click();

    // Try to make the dialog selector more specific by looking for its unique header text
    const deleteDialog = page.getByRole('alertdialog', { name: 'Delete Person' });
    await expect(deleteDialog).toBeVisible();
    // The heading check is removed as the dialog itself is now located by its name.
    await deleteDialog.getByRole('button', { name: 'Delete', exact: true }).click();

    // Verify toast and removal from list
    await expect(page.getByText(/Person deleted/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: fullName, exact: false })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: personEmail, exact: false })).not.toBeVisible();
  });

  test('should allow creating a new person associated with an organization', async ({ page }) => {
    const orgName = `TestOrg ${Date.now()}`;
    await createOrganizationViaUI(page, { name: orgName });

    // Navigate to people page after creating org, as createOrganizationViaUI navigates to /organizations
    await page.goto('/people');

    const personFirstName = `TestPersonOrgFirst ${Date.now()}`;
    const personLastName = `TestPersonOrgLast ${Date.now()}`;
    const personEmail = `test.person.org.${Date.now()}@example.com`;

    await createPersonViaUI(page, {
      firstName: personFirstName,
      lastName: personLastName,
      email: personEmail,
      organizationName: orgName,
    });

    const fullName = `${personFirstName} ${personLastName}`;
    const row = page.locator('tr', { has: page.getByRole('cell', { name: fullName, exact: false }) });
    await expect(row).toBeVisible();

    // Verify the association by checking the edit form
    await row.getByRole('button', { name: 'Edit person' }).click();
    const editModal = page.getByRole('dialog', { name: /Edit Person/i });
    await expect(editModal).toBeVisible();

    // Assuming the organization is displayed in a select element or an input
    // Playwright's getByLabel should work if the select element is properly labeled "Organization"
    // For a standard select, .inputValue() or checking the selected option's text would work.
    // If it's a custom component, the selector might need adjustment.
    // We'll try to get the selected option's text content for a select.
    const orgSelect = editModal.getByLabel('Organization');
    await expect(orgSelect).toBeVisible();
    
    // For a standard select, to check the selected option's *text*:
    // This gets the <select> element, then evaluates in the browser to get the text of the selected <option>.
    const selectedOrgName = await orgSelect.evaluate((select: HTMLSelectElement) => {
      const selectedOption = select.options[select.selectedIndex];
      return selectedOption ? selectedOption.textContent : null;
    });
    expect(selectedOrgName).toBe(orgName);

    // Alternatively, if it's an input field with the organization name:
    // await expect(editModal.getByLabel('Organization')).toHaveValue(orgName);

    await editModal.getByRole('button', { name: 'Cancel' }).click(); // Close modal
    await expect(editModal).not.toBeVisible();
  });
});
