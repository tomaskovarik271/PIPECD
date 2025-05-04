import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('should navigate to login page and show auth form', async ({ page }) => {
    await page.goto('/');
    // Expect the initial title from index.html
    await expect(page).toHaveTitle(/Minimal Test/);
    // Check if email input is visible as a reliable indicator of form loading
    await expect(page.getByLabel('Email address')).toBeVisible();
  });

  test('should allow login with valid credentials', async ({ page }) => {
    // Load credentials from environment variables
    const userEmail = process.env.TEST_USER_EMAIL;
    const userPassword = process.env.TEST_USER_PASSWORD;

    // Basic check to ensure env vars are loaded
    if (!userEmail || !userPassword) {
      throw new Error('TEST_USER_EMAIL or TEST_USER_PASSWORD environment variables not set.');
    }

    // Start from the login page (or base URL, assuming it redirects to login if not authenticated)
    await page.goto('/');

    // Fill in the email
    await page.getByLabel('Email address').fill(userEmail);

    // Fill in the password
    await page.getByLabel('Password').fill(userPassword);

    // Click the sign in button (use exact match locator)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Wait for navigation to the home page or main app view
    // Option 1: Check URL (adjust if your home page is different)
    await expect(page).toHaveURL('/'); // Or maybe '/home' or '/dashboard'

    // Option 2: Check for a specific element indicating login
    // For example, check if the "Sign Out" button is now visible (updated text)
    // Give more time for the async auth flow and re-render to complete
    await expect(page.getByRole('button', { name: /Sign Out/i }))
      .toBeVisible({ timeout: 10000 }); // Increased timeout to 10 seconds

    // You could also check if the user's email is displayed somewhere
    // await expect(page.getByText(userEmail)).toBeVisible();
  });

  // Add more auth tests later (e.g., signup, invalid login, logout)

}); 